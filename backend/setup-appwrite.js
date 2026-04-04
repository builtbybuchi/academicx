/**
 * AcademicX - Idempotent Appwrite Setup Script
 *
 * Run:  node setup-appwrite.js
 *
 * Designed for unreliable / high-latency connections (e.g. mobile data in NG):
 *  - Unlimited-patience connectivity gate: waits as long as needed before starting
 *  - Before every collection, re-checks connectivity so a mid-run drop recovers
 *    automatically instead of burning retries on every single sub-operation
 *  - Per-collection errors are caught; one failure never aborts the whole run
 *  - Attributes are polled until "available" before indexes are attempted
 *  - withRetry uses exponential backoff capped at 30 s (10 attempts ≈ 5 min patience)
 */

require('dotenv').config();
const { Client, Databases, Storage, ID, Permission, Role } = require('node-appwrite');
const { DATABASE_ID, BUCKET_ID, COLLECTIONS } = require('./database/schema.js');

// ── Config ────────────────────────────────────────────────
const ENDPOINT   = process.env.APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const API_KEY    = process.env.APPWRITE_API_KEY;

if (!ENDPOINT || !PROJECT_ID || !API_KEY) {
    console.error('❌  Missing APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, or APPWRITE_API_KEY in environment.');
    process.exit(1);
}

const client = new Client();
client.setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);

const databases = new Databases(client);
const storage   = new Storage(client);

// ── Low-level helpers ─────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function getErrCode(err) {
    return (
        err?.code ||
        err?.cause?.code ||
        err?.cause?.errors?.[0]?.code ||
        ''
    );
}

function isNetworkError(err) {
    const code = String(getErrCode(err)).toUpperCase();
    const msg  = String(err?.message || '').toLowerCase();
    const networkCodes = ['ETIMEDOUT', 'UND_ERR_CONNECT_TIMEOUT', 'ECONNRESET', 'EAI_AGAIN', 'ENOTFOUND', 'ECONNREFUSED'];
    if (networkCodes.includes(code)) return true;
    if (msg.includes('fetch failed') || msg.includes('timeout') || msg.includes('socket hang up')) return true;
    return false;
}

function isRetryable(err) {
    const status = Number(err?.code);
    if ([429, 500, 502, 503, 504].includes(status)) return true;
    return isNetworkError(err);
}

/**
 * Retry wrapper with exponential back-off.
 * On network errors it pauses and re-probes connectivity (unlimited patience)
 * before retrying, so a flaky connection doesn't burn through all attempts.
 * maxRetries applies only to non-network retryable errors (429, 5xx).
 */
async function withRetry(label, fn, maxRetries = 10) {
    let attempt = 0;
    while (true) {
        try {
            return await fn();
        } catch (err) {
            attempt++;
            if (isNetworkError(err)) {
                // Don't count network failures against the retry budget —
                // wait until the connection is restored, then try again.
                console.warn(`    ↻ ${label} — network drop detected, waiting for reconnection…`);
                await waitForConnection(label);
                attempt--; // don't charge this as a retry attempt
                continue;
            }
            if (!isRetryable(err) || attempt > maxRetries) throw err;
            const wait = Math.min(30000, 1000 * Math.pow(2, attempt - 1));
            console.warn(`    ↻ ${label} failed (${getErrCode(err) || err.message}). Retry ${attempt}/${maxRetries} in ${wait}ms…`);
            await sleep(wait);
        }
    }
}

// ── Connectivity helpers ──────────────────────────────────

/**
 * Block until Appwrite responds to a lightweight probe.
 * Waits indefinitely with 10 s intervals — press Ctrl-C to abort.
 * Throws immediately for non-network errors (auth, bad project ID, etc.)
 */
async function waitForConnection(context = '') {
    const INTERVAL_MS = 10_000;
    let attempt = 0;
    while (true) {
        try {
            await databases.list();
            return; // connected
        } catch (err) {
            if (!isNetworkError(err)) throw err; // hard error, don't retry
            attempt++;
            const label = context ? ` (${context})` : '';
            console.warn(`    📡 No connection${label} — attempt ${attempt}. Waiting ${INTERVAL_MS / 1000}s… (Ctrl-C to abort)`);
            await sleep(INTERVAL_MS);
        }
    }
}

async function checkConnectivity() {
    console.log('── Pre-flight connectivity check ─────────');
    await waitForConnection('pre-flight');
    console.log('✅ Appwrite is reachable.\n');
}

// ── Database ──────────────────────────────────────────────

async function ensureDatabase() {
    try {
        await withRetry(`get database ${DATABASE_ID}`, () => databases.get(DATABASE_ID));
        console.log(`✅ Database "${DATABASE_ID}" already exists.`);
    } catch (e) {
        if (e.code === 404) {
            await withRetry(`create database ${DATABASE_ID}`, () => databases.create(DATABASE_ID, DATABASE_ID));
            console.log(`🆕 Database "${DATABASE_ID}" created.`);
        } else {
            throw e;
        }
    }
}

// ── Attributes ────────────────────────────────────────────

async function getExistingAttributes(collId) {
    try {
        const res = await withRetry(`list attributes ${collId}`, () =>
            databases.listAttributes(DATABASE_ID, collId)
        );
        return res.attributes || [];
    } catch (_) {
        return [];
    }
}

async function createAttribute(collId, attr) {
    const base = [DATABASE_ID, collId, attr.key];
    switch (attr.type) {
        case 'string':
            return databases.createStringAttribute(
                ...base, attr.size || 255, attr.required || false,
                attr.default ?? undefined, attr.array || false
            );
        case 'integer':
            return databases.createIntegerAttribute(
                ...base, attr.required || false,
                attr.min ?? undefined, attr.max ?? undefined,
                attr.default ?? undefined, attr.array || false
            );
        case 'float':
            return databases.createFloatAttribute(
                ...base, attr.required || false,
                attr.min ?? undefined, attr.max ?? undefined,
                attr.default ?? undefined, attr.array || false
            );
        case 'boolean':
            return databases.createBooleanAttribute(
                ...base, attr.required || false,
                attr.default ?? undefined, attr.array || false
            );
        case 'datetime':
            return databases.createDatetimeAttribute(
                ...base, attr.required || false,
                attr.default ?? undefined, attr.array || false
            );
        case 'enum':
            return databases.createEnumAttribute(
                ...base, attr.elements || [], attr.required || false,
                attr.default ?? undefined, attr.array || false
            );
        default:
            throw new Error(`Unknown attribute type: ${attr.type}`);
    }
}

/**
 * Poll until every attribute in `keys` is in "available" status.
 * Appwrite creates attributes asynchronously; indexes must wait for this.
 */
async function waitForAttributesAvailable(collId, keys, timeoutMs = 120_000) {
    if (!keys.length) return;
    const deadline = Date.now() + timeoutMs;
    const pending  = new Set(keys);

    while (pending.size > 0 && Date.now() < deadline) {
        await sleep(3000);
        let attrs = [];
        try {
            const res = await withRetry(`poll attributes ${collId}`, () =>
                databases.listAttributes(DATABASE_ID, collId)
            );
            attrs = res.attributes || [];
        } catch (_) {
            continue;
        }

        for (const a of attrs) {
            if (pending.has(a.key) && a.status === 'available') {
                pending.delete(a.key);
            }
        }

        if (pending.size > 0) {
            console.log(`    ⏳ Waiting for attributes to become available: ${[...pending].join(', ')}`);
        }
    }

    if (pending.size > 0) {
        console.warn(`    ⚠️  Timed out waiting for attributes: ${[...pending].join(', ')}. Indexes may fail.`);
    }
}

async function ensureAttributes(collId, attrs) {
    const existing    = await getExistingAttributes(collId);
    const existingSet = new Set(existing.map(a => a.key));
    const created     = [];

    for (const attr of attrs) {
        if (existingSet.has(attr.key)) continue;

        try {
            await withRetry(`create ${attr.type} attribute ${collId}.${attr.key}`, () =>
                createAttribute(collId, attr)
            );
            console.log(`    + Attribute "${attr.key}" (${attr.type}) created.`);
            created.push(attr.key);
        } catch (e) {
            if (Number(e.code) === 409) {
                // Already exists — race condition, fine
            } else {
                console.error(`    ✖ Failed to create attribute "${attr.key}": ${e.message}`);
            }
        }

        // Small breathing room between attribute creates
        await sleep(500);
    }

    return created;
}

// ── Indexes ───────────────────────────────────────────────

async function getExistingIndexes(collId) {
    try {
        const res = await withRetry(`list indexes ${collId}`, () =>
            databases.listIndexes(DATABASE_ID, collId)
        );
        return res.indexes || [];
    } catch (_) {
        return [];
    }
}

async function ensureIndexes(collId, indexes) {
    const existing    = await getExistingIndexes(collId);
    const existingSet = new Set(existing.map(i => i.key));

    for (const idx of indexes) {
        if (existingSet.has(idx.key)) continue;

        try {
            await withRetry(`create index ${collId}.${idx.key}`, () =>
                databases.createIndex(
                    DATABASE_ID, collId, idx.key,
                    idx.type || 'key',
                    idx.attributes,
                    idx.orders || idx.attributes.map(() => 'ASC')
                )
            );
            console.log(`    + Index "${idx.key}" created.`);
        } catch (e) {
            if (Number(e.code) === 409) {
                // Already exists
            } else {
                console.error(`    ✖ Failed to create index "${idx.key}": ${e.message}`);
            }
        }

        await sleep(500);
    }
}

// ── Collection orchestration ──────────────────────────────

async function ensureCollection(def) {
    const { id, name } = def;

    const permissions = [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
    ];

    // 1. Create collection if missing
    try {
        await withRetry(`get collection ${id}`, () => databases.getCollection(DATABASE_ID, id));
        console.log(`  ✅ Collection "${name}" exists.`);
    } catch (e) {
        if (e.code === 404) {
            await withRetry(`create collection ${id}`, () =>
                databases.createCollection(DATABASE_ID, id, name, permissions, true)
            );
            console.log(`  🆕 Collection "${name}" created.`);
        } else {
            throw e;
        }
    }

    // 2. Create missing attributes
    const attrDefs  = def.attributes || [];
    const created   = await ensureAttributes(id, attrDefs);

    // 3. Wait for ALL newly created attributes to become available before touching indexes
    if (created.length > 0) {
        console.log(`    ⏳ Waiting for ${created.length} new attribute(s) to become available…`);
        await waitForAttributesAvailable(id, created);
    }

    // 4. Create missing indexes
    await ensureIndexes(id, def.indexes || []);
}

// ── Storage bucket ────────────────────────────────────────

async function ensureBucket() {
    try {
        await withRetry(`get bucket ${BUCKET_ID}`, () => storage.getBucket(BUCKET_ID));
        console.log(`✅ Storage bucket "${BUCKET_ID}" already exists.`);
    } catch (e) {
        if (e.code === 404) {
            await withRetry(`create bucket ${BUCKET_ID}`, () =>
                storage.createBucket(
                    BUCKET_ID, 'School Media',
                    [
                        Permission.read(Role.any()),
                        Permission.create(Role.users()),
                        Permission.update(Role.users()),
                        Permission.delete(Role.users()),
                    ],
                    false,    // fileSecurity
                    true,     // enabled
                    50_000_000, // 50 MB
                    ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
                    'none',   // compression
                    false,    // encryption
                    false     // antivirus
                )
            );
            console.log(`🆕 Storage bucket "${BUCKET_ID}" created.`);
        } else {
            throw e;
        }
    }
}

// ── System config seed ────────────────────────────────────

async function ensureSystemConfigDocument() {
    try {
        const res = await withRetry('list system_config documents', () =>
            databases.listDocuments(DATABASE_ID, 'system_config', [])
        );
        if ((res.documents || []).length > 0) {
            console.log('✅ system_config row already exists.');
            return;
        }
        await withRetry('create system_config document', () =>
            databases.createDocument(
                DATABASE_ID, 'system_config', ID.unique(),
                { apkUrl: '', updatedAt: new Date().toISOString() },
                [Permission.read(Role.any()), Permission.update(Role.users())]
            )
        );
        console.log('🆕 system_config row created (apkUrl is empty by default).');
    } catch (e) {
        if (e.code === 404) {
            console.warn('⚠️  system_config collection not found yet; rerun setup after collection creation.');
        } else {
            throw e;
        }
    }
}

// ── Main ──────────────────────────────────────────────────

async function main() {
    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║   AcademicX — Appwrite Setup Script      ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log('');
    console.log(`Endpoint:   ${ENDPOINT}`);
    console.log(`Project ID: ${PROJECT_ID}`);
    console.log('');

    // 0. Wait for network before doing anything
    await checkConnectivity();

    // 1. Database
    console.log('── Database ──────────────────────────────');
    await ensureDatabase();

    // 2. Collections — errors per-collection are caught so one failure
    //    doesn't abort the rest
    console.log('');
    console.log('── Collections ───────────────────────────');
    const collKeys = Object.keys(COLLECTIONS);
    const failed   = [];

    for (let i = 0; i < collKeys.length; i++) {
        const key = collKeys[i];
        const def = COLLECTIONS[key];
        console.log(`\n[${i + 1}/${collKeys.length}] ${def.name}`);
        // Re-verify connectivity before each collection — if the network
        // dropped since the last one, pause here until it recovers.
        await waitForConnection(`before "${def.name}"`);
        try {
            await ensureCollection(def);
        } catch (err) {
            console.error(`  ✖ Collection "${def.name}" setup failed: ${err.message}`);
            failed.push(def.name);
        }
    }

    // 3. System config seed
    console.log('');
    console.log('── System Config Seed ───────────────────');
    try {
        await ensureSystemConfigDocument();
    } catch (err) {
        console.error(`  ✖ System config seed failed: ${err.message}`);
    }

    // 4. Storage
    console.log('');
    console.log('── Storage ───────────────────────────────');
    try {
        await ensureBucket();
    } catch (err) {
        console.error(`  ✖ Bucket setup failed: ${err.message}`);
    }

    // ── Summary
    console.log('');
    console.log('═══════════════════════════════════════════');
    if (failed.length === 0) {
        console.log('  ✅ Setup complete! All resources are ready.');
    } else {
        console.log('  ⚠️  Setup finished with errors in:');
        failed.forEach(n => console.log(`       • ${n}`));
        console.log('     Re-run the script to retry failed collections.');
    }
    console.log('═══════════════════════════════════════════');
    console.log('');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
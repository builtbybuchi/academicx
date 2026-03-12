/**
 * AcademicX - Idempotent Appwrite Setup Script
 *
 * Run:  node setup-appwrite.js
 *
 * This script:
 *  1. Checks if the database exists, creates it if not
 *  2. For each collection: creates if missing, then ensures all attributes & indexes exist
 *  3. Creates a storage bucket for school logos / student / staff images
 *
 * It is fully idempotent — safe to run multiple times.
 *
 * Required env vars (or .env file):
 *   APPWRITE_ENDPOINT   - e.g. https://cloud.appwrite.io/v1
 *   APPWRITE_PROJECT_ID - your project ID
 *   APPWRITE_API_KEY    - server-side API key with full permissions
 */

require('dotenv').config();
const { Client, Databases, Storage, ID, Permission, Role } = require('node-appwrite');
const { DATABASE_ID, BUCKET_ID, COLLECTIONS } = require('./database/schema.js');

// ── Config ────────────────────────────────────────────────
const ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || 'fullacademicx';
const API_KEY = process.env.APPWRITE_API_KEY || 'standard_d62e7a0852600700eb9b3010c954e10b4f69c9d210ad28ef5769dcacf9188adc1c6f9ac9a300be0e47dacc4c26dc64582b08f7683bc600fb9af97aeb84d0923322ddb50b969877b305b444f0e49162d2bce4a34820cc08ccdae7a02d357290bb85bbfabb9cf21bf07d40d3ea8209e52f269dad03da4e6d3c8974416ef260cb85';

if (!PROJECT_ID || !API_KEY) {
    console.error('❌ Missing APPWRITE_PROJECT_ID or APPWRITE_API_KEY in environment.');
    console.error('   Create a .env file in backend/ with those values.');
    process.exit(1);
}

const client = new Client();
client.setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

// ── Helpers ───────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function ensureDatabase() {
    try {
        await databases.get(DATABASE_ID);
        console.log(`✅ Database "${DATABASE_ID}" already exists.`);
    } catch (e) {
        if (e.code === 404) {
            await databases.create(DATABASE_ID, DATABASE_ID);
            console.log(`🆕 Database "${DATABASE_ID}" created.`);
        } else { throw e; }
    }
}

async function ensureCollection(def) {
    const { id, name } = def;

    // Default permissions: any authenticated user can read, only admins write
    const permissions = [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
    ];

    try {
        await databases.getCollection(DATABASE_ID, id);
        console.log(`  ✅ Collection "${name}" exists.`);
    } catch (e) {
        if (e.code === 404) {
            await databases.createCollection(DATABASE_ID, id, name, permissions, true);
            console.log(`  🆕 Collection "${name}" created.`);
        } else { throw e; }
    }

    // Ensure attributes
    await ensureAttributes(id, def.attributes || []);

    // Let Appwrite process attribute changes before indexes
    await sleep(2000);

    // Ensure indexes
    await ensureIndexes(id, def.indexes || []);
}

async function ensureAttributes(collId, attrs) {
    let existing = [];
    try {
        const res = await databases.listAttributes(DATABASE_ID, collId);
        existing = res.attributes || [];
    } catch (e) { /* empty collection */ }

    const existingKeys = new Set(existing.map(a => a.key));

    for (const attr of attrs) {
        if (existingKeys.has(attr.key)) continue;

        try {
            switch (attr.type) {
                case 'string':
                    await databases.createStringAttribute(
                        DATABASE_ID, collId, attr.key,
                        attr.size || 255,
                        attr.required || false,
                        attr.default ?? undefined,
                        attr.array || false
                    );
                    break;
                case 'integer':
                    await databases.createIntegerAttribute(
                        DATABASE_ID, collId, attr.key,
                        attr.required || false,
                        attr.min ?? undefined,
                        attr.max ?? undefined,
                        attr.default ?? undefined,
                        attr.array || false
                    );
                    break;
                case 'float':
                    await databases.createFloatAttribute(
                        DATABASE_ID, collId, attr.key,
                        attr.required || false,
                        attr.min ?? undefined,
                        attr.max ?? undefined,
                        attr.default ?? undefined,
                        attr.array || false
                    );
                    break;
                case 'boolean':
                    await databases.createBooleanAttribute(
                        DATABASE_ID, collId, attr.key,
                        attr.required || false,
                        attr.default ?? undefined,
                        attr.array || false
                    );
                    break;
                case 'datetime':
                    await databases.createDatetimeAttribute(
                        DATABASE_ID, collId, attr.key,
                        attr.required || false,
                        attr.default ?? undefined,
                        attr.array || false
                    );
                    break;
                case 'enum':
                    await databases.createEnumAttribute(
                        DATABASE_ID, collId, attr.key,
                        attr.elements || [],
                        attr.required || false,
                        attr.default ?? undefined,
                        attr.array || false
                    );
                    break;
                default:
                    console.warn(`    ⚠️  Unknown attribute type: ${attr.type} for ${attr.key}`);
            }
            console.log(`    + Attribute "${attr.key}" (${attr.type}) created.`);
        } catch (e) {
            if (e.code === 409) {
                // Already exists (race condition)
            } else {
                console.error(`    ✖ Failed to create attribute "${attr.key}": ${e.message}`);
            }
        }

        // Small delay to avoid rate limits
        await sleep(300);
    }
}

async function ensureIndexes(collId, indexes) {
    let existing = [];
    try {
        const res = await databases.listIndexes(DATABASE_ID, collId);
        existing = res.indexes || [];
    } catch (e) { /* empty */ }

    const existingKeys = new Set(existing.map(i => i.key));

    for (const idx of indexes) {
        if (existingKeys.has(idx.key)) continue;

        try {
            await databases.createIndex(
                DATABASE_ID, collId, idx.key,
                idx.type || 'key',
                idx.attributes,
                (idx.orders || idx.attributes.map(() => 'ASC'))
            );
            console.log(`    + Index "${idx.key}" created.`);
        } catch (e) {
            if (e.code === 409) {
                // Already exists
            } else {
                console.error(`    ✖ Failed to create index "${idx.key}": ${e.message}`);
            }
        }
        await sleep(500);
    }
}

async function ensureBucket() {
    try {
        await storage.getBucket(BUCKET_ID);
        console.log(`✅ Storage bucket "${BUCKET_ID}" already exists.`);
    } catch (e) {
        if (e.code === 404) {
            await storage.createBucket(
                BUCKET_ID,
                'School Media',
                [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users()),
                ],
                false,  // fileSecurity
                true,   // enabled
                50000000, // 50MB max file size
                ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], // allowed MIME types
                'none',  // compression
                false,   // encryption
                false    // antivirus
            );
            console.log(`🆕 Storage bucket "${BUCKET_ID}" created.`);
        } else { throw e; }
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

    // 1. Database
    console.log('── Database ──────────────────────────────');
    await ensureDatabase();

    // 2. Collections
    console.log('');
    console.log('── Collections ───────────────────────────');
    const collKeys = Object.keys(COLLECTIONS);
    for (let i = 0; i < collKeys.length; i++) {
        const key = collKeys[i];
        console.log(`\n[${i + 1}/${collKeys.length}] ${COLLECTIONS[key].name}`);
        await ensureCollection(COLLECTIONS[key]);
    }

    // 3. Storage bucket
    console.log('');
    console.log('── Storage ───────────────────────────────');
    await ensureBucket();

    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('  Setup complete! All resources are ready.');
    console.log('═══════════════════════════════════════════');
    console.log('');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});

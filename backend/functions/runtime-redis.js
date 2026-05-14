require('dotenv').config();
const crypto = require('crypto');
const { createClient } = require('redis');

const REDIS_URL = process.env.REDIS_URL || '';
const REDIS_TLS = String(process.env.REDIS_TLS || '').toLowerCase() === 'true' || REDIS_URL.startsWith('rediss://');
const REDIS_PREFIX = process.env.REDIS_PREFIX || 'academicx';
const REDIS_DISABLE_AFTER_ERROR_MS = Number(process.env.REDIS_DISABLE_AFTER_ERROR_MS || 15000);

let redisClient = null;
let redisConnectPromise = null;
let redisDisabledUntil = 0;

function stableStringify(value) {
    if (value === null || value === undefined) return '';
    if (typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) {
        return `[${value.map((item) => stableStringify(item)).join(',')}]`;
    }

    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

function stableHash(value) {
    return crypto.createHash('sha1').update(typeof value === 'string' ? value : stableStringify(value)).digest('hex');
}

function normalizeSegment(value) {
    const text = String(value ?? '').trim().toLowerCase();
    return text.replace(/[^a-z0-9:_-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'none';
}

function buildCacheKey(parts) {
    return [REDIS_PREFIX, ...parts.map(normalizeSegment)].join(':');
}

function buildCachePattern(parts) {
    return [REDIS_PREFIX, ...parts.map((part) => (part === '*' ? '*' : normalizeSegment(part)))].join(':');
}

function requestIp(req) {
    const forwarded = String(req?.headers?.['x-forwarded-for'] || '').split(',')[0].trim();
    const realIp = String(req?.headers?.['x-real-ip'] || '').trim();
    const socketIp = String(req?.ip || req?.socket?.remoteAddress || req?.connection?.remoteAddress || '').trim();
    return forwarded || realIp || socketIp || 'unknown';
}

function createRedisClient() {
    const client = createClient({
        url: REDIS_URL,
        socket: {
            tls: REDIS_TLS,
            reconnectStrategy: (retries) => Math.min(retries * 100, 2000),
        },
    });

    client.on('error', (error) => {
        console.error('Redis error:', error?.message || error);
    });

    client.on('reconnecting', () => {
        console.log('Redis reconnecting');
    });

    return client;
}

async function getRedisClient() {
    if (!REDIS_URL || Date.now() < redisDisabledUntil) {
        return null;
    }

    if (redisClient && redisClient.isOpen) {
        return redisClient;
    }

    if (!redisConnectPromise) {
        redisClient = createRedisClient();
        redisConnectPromise = redisClient.connect().then(() => redisClient).catch((error) => {
            console.error('Redis connection failed:', error?.message || error);
            redisDisabledUntil = Date.now() + REDIS_DISABLE_AFTER_ERROR_MS;
            redisConnectPromise = null;
            redisClient = null;
            return null;
        });
    }

    return redisConnectPromise;
}

async function withRedis(fn) {
    const client = await getRedisClient();
    if (!client) return null;

    try {
        return await fn(client);
    } catch (error) {
        redisDisabledUntil = Date.now() + REDIS_DISABLE_AFTER_ERROR_MS;
        console.error('Redis operation failed:', error?.message || error);
        return null;
    }
}

const NULL_MARKER = { __redisNull: true };

async function cacheGetJson(key) {
    return withRedis(async (client) => {
        const raw = await client.get(key);
        if (raw == null) return null;

        try {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.__redisNull) {
                return { hit: true, value: null };
            }
            return { hit: true, value: parsed };
        } catch {
            return null;
        }
    });
}

async function cacheSetJson(key, value, ttlSeconds) {
    return withRedis(async (client) => {
        const payload = JSON.stringify(value === null ? NULL_MARKER : value);
        if (ttlSeconds && ttlSeconds > 0) {
            await client.set(key, payload, { EX: ttlSeconds });
        } else {
            await client.set(key, payload);
        }
        return true;
    });
}

async function cacheGetOrSet(key, ttlSeconds, loader, { cacheNull = false } = {}) {
    const cached = await cacheGetJson(key);
    if (cached && cached.hit) {
        return cached.value;
    }

    const value = await loader();
    if (value !== undefined && (value !== null || cacheNull)) {
        await cacheSetJson(key, value, ttlSeconds);
    }
    return value;
}

async function deleteByPattern(pattern) {
    return withRedis(async (client) => {
        let deleted = 0;
        const keys = [];

        for await (const key of client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
            keys.push(key);
            if (keys.length >= 100) {
                await client.del(...keys);
                deleted += keys.length;
                keys.length = 0;
            }
        }

        if (keys.length > 0) {
            await client.del(...keys);
            deleted += keys.length;
        }

        return deleted;
    });
}

const RATE_LIMIT_LUA = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('TTL', KEYS[1])
return {current, ttl}
`;

async function incrementRateLimit(key, windowSeconds) {
    return withRedis(async (client) => {
        const [current, ttl] = await client.eval(RATE_LIMIT_LUA, {
            keys: [key],
            arguments: [String(windowSeconds)],
        });

        return {
            current: Number(current),
            ttl: Number(ttl),
        };
    });
}

async function acquireLock(key, ttlSeconds = 30, token = crypto.randomUUID()) {
    return withRedis(async (client) => {
        const ok = await client.set(key, token, { NX: true, EX: ttlSeconds });
        return ok ? token : null;
    });
}

async function releaseLock(key, token) {
    return withRedis(async (client) => {
        const current = await client.get(key);
        if (current === token) {
            await client.del(key);
            return true;
        }
        return false;
    });
}

module.exports = {
    acquireLock,
    buildCacheKey,
    buildCachePattern,
    cacheGetJson,
    cacheGetOrSet,
    cacheSetJson,
    deleteByPattern,
    incrementRateLimit,
    releaseLock,
    requestIp,
    stableHash,
    stableStringify,
};
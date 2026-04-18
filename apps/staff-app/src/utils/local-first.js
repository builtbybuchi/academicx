import React from 'react';

const APP_SCOPE = 'academicx.staff';

function buildKey(scope, schoolId = 'global', userId = 'anon') {
    return `${APP_SCOPE}.${scope}.${schoolId}.${userId}`;
}

function safeJsonParse(value, fallback) {
    if (!value) return fallback;
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

export function readLocal(scope, { schoolId, userId }, fallback = null) {
    const key = buildKey(scope, schoolId, userId);
    return safeJsonParse(localStorage.getItem(key), fallback);
}

export function writeLocal(scope, { schoolId, userId }, data) {
    const key = buildKey(scope, schoolId, userId);
    localStorage.setItem(key, JSON.stringify(data));
}

export async function loadPortalData({ schoolId, userId, fetcher }) {
    const cacheContext = { schoolId, userId };
    const cached = readLocal('portal-data', cacheContext, null);

    try {
        const remote = await fetcher();
        writeLocal('portal-data', cacheContext, {
            data: remote,
            fetchedAt: new Date().toISOString(),
        });
        return {
            data: remote,
            source: 'remote',
            fetchedAt: new Date().toISOString(),
        };
    } catch (error) {
        if (cached?.data) {
            return {
                data: cached.data,
                source: 'cache',
                fetchedAt: cached.fetchedAt || null,
                error,
            };
        }
        throw error;
    }
}

export function enqueueAction(queueName, context, payload) {
    const queue = readLocal(`queue.${queueName}`, context, []);
    const action = {
        id: `${queueName}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        payload,
    };
    const next = [...queue, action];
    writeLocal(`queue.${queueName}`, context, next);
    return action;
}

export function getQueue(queueName, context) {
    return readLocal(`queue.${queueName}`, context, []);
}

export function clearQueue(queueName, context) {
    writeLocal(`queue.${queueName}`, context, []);
}

export async function flushQueue(queueName, context, processor) {
    const queue = getQueue(queueName, context);
    if (queue.length === 0) {
        return { processed: 0, failed: 0, remaining: 0 };
    }

    const remaining = [];
    let processed = 0;

    for (const action of queue) {
        try {
            await processor(action.payload, action);
            processed += 1;
        } catch {
            remaining.push(action);
        }
    }

    writeLocal(`queue.${queueName}`, context, remaining);
    return {
        processed,
        failed: remaining.length,
        remaining: remaining.length,
    };
}

export function useOnlineStatus() {
    const [online, setOnline] = React.useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

    React.useEffect(() => {
        const toOnline = () => setOnline(true);
        const toOffline = () => setOnline(false);
        window.addEventListener('online', toOnline);
        window.addEventListener('offline', toOffline);
        return () => {
            window.removeEventListener('online', toOnline);
            window.removeEventListener('offline', toOffline);
        };
    }, []);

    return online;
}

export function upsertById(list, item) {
    const index = list.findIndex((row) => row.$id === item.$id);
    if (index === -1) return [...list, item];
    const next = [...list];
    next[index] = { ...next[index], ...item };
    return next;
}

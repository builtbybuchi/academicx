import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { initRxDB, getRxDB } from './rxdb.js';

const RxDBContext = createContext(null);

export function RxDBProvider({ children }) {
    const [db, setDb] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        
        async function init() {
            try {
                const database = await initRxDB();
                if (mounted) {
                    setDb(database);
                    setLoading(false);
                }
            } catch (err) {
                if (mounted) {
                    setError(err.message);
                    setLoading(false);
                }
            }
        }
        
        init();
        
        return () => {
            mounted = false;
        };
    }, []);

    const value = {
        db,
        loading,
        error,
        isReady: !!db && !loading,
    };

    return (
        <RxDBContext.Provider value={value}>
            {children}
        </RxDBContext.Provider>
    );
}

export function useRxDB() {
    const context = useContext(RxDBContext);
    if (!context) {
        throw new Error('useRxDB must be used within RxDBProvider');
    }
    return context;
}

export function useRxCollection(collectionName) {
    const { db, isReady } = useRxDB();
    const [docs, setDocs] = useState([]);

    useEffect(() => {
        if (!isReady || !db || !collectionName) return;

        const collection = db[collectionName];
        if (!collection) return;

        const subscription = collection.find().$.subscribe(results => {
            setDocs(results.map(d => d.toMutableJSON()));
        });

        return () => subscription.unsubscribe();
    }, [db, isReady, collectionName]);

    return { docs, collection: db?.[collectionName] };
}

export function useRxDocument(collectionName, id) {
    const { db, isReady } = useRxDB();
    const [doc, setDoc] = useState(null);

    useEffect(() => {
        if (!isReady || !db || !collectionName || !id) return;

        const collection = db[collectionName];
        if (!collection) return;

        const subscription = collection.findOne(id).$.subscribe(result => {
            setDoc(result ? result.toMutableJSON() : null);
        });

        return () => subscription.unsubscribe();
    }, [db, isReady, collectionName, id]);

    return doc;
}

export function useRxSync(collectionName, fetchFromServer, syncInterval = 30000) {
    const { db, isReady } = useRxDB();
    const [lastSync, setLastSync] = useState(null);
    const [syncing, setSyncing] = useState(false);

    const sync = useCallback(async () => {
        if (!isReady || !db || !collectionName) return;

        const collection = db[collectionName];
        if (!collection) return;

        setSyncing(true);
        try {
            const serverData = await fetchFromServer();
            if (serverData && Array.isArray(serverData)) {
                const docs = serverData.map(doc => ({
                    ...doc,
                    synced: true,
                }));
                await collection.bulkUpsert(docs);
                setLastSync(new Date());
            }
        } catch (err) {
            console.error('Sync failed:', err);
        } finally {
            setSyncing(false);
        }
    }, [db, isReady, collectionName, fetchFromServer]);

    useEffect(() => {
        if (!isReady) return;

        // Initial sync
        sync();

        // Periodic sync
        const interval = setInterval(sync, syncInterval);

        return () => clearInterval(interval);
    }, [isReady, sync, syncInterval]);

    return { sync, syncing, lastSync };
}

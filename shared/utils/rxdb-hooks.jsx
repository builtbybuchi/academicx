import React, { createContext, useContext, useState, useEffect } from 'react';
import { initRxDB, hydrateCollection, findBySchoolId } from './rxdb.js';
import { useAuth } from './auth.jsx';

const RxDBContext = createContext(null);

export function RxDBProvider({ children }) {
    const [db, setDb] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const { schoolId } = useAuth();

    useEffect(() => {
        let mounted = true;
        
        async function init() {
            try {
                const database = await initRxDB();
                if (mounted) {
                    setDb(database);
                    setIsReady(true);
                }
            } catch (error) {
                console.error('RxDB initialization error:', error);
            }
        }
        
        init();
        
        return () => {
            mounted = false;
        };
    }, []);

    const hydrate = async (collectionName, docs) => {
        if (!db) return;
        return hydrateCollection(collectionName, docs);
    };

    const findLocal = async (collectionName, selector = {}) => {
        if (!db) return [];
        const collection = db[collectionName];
        if (!collection) return [];
        
        const query = collection.find({ selector });
        const docs = await query.exec();
        return docs.map(d => d.toMutableJSON());
    };

    const value = {
        db,
        isReady,
        hydrate,
        findLocal
    };

    return (
        <RxDBContext.Provider value={value}>
            {children}
        </RxDBContext.Provider>
    );
}

export function useRxDB() {
    return useContext(RxDBContext);
}

// Hook for reactive collection subscription
export function useRxCollection(collectionName, schoolId, deps = []) {
    const { db, isReady } = useRxDB();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!db || !isReady || !schoolId) {
            setIsLoading(false);
            return;
        }

        const collection = db[collectionName];
        if (!collection) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        
        const query = collection.find({
            selector: { schoolId }
        });

        // Initial load
        query.exec().then(docs => {
            setData(docs.map(d => d.toMutableJSON()));
            setIsLoading(false);
        });

        // Subscribe to changes
        const subscription = query.$.subscribe(docs => {
            setData(docs.map(d => d.toMutableJSON()));
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [db, isReady, schoolId, collectionName, ...deps]);

    return { data, isLoading };
}

// Hook for single document
export function useRxDocument(collectionName, id) {
    const { db, isReady } = useRxDB();
    const [doc, setDoc] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!db || !isReady || !id) {
            setIsLoading(false);
            return;
        }

        const collection = db[collectionName];
        if (!collection) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        
        const query = collection.findOne(id);

        query.exec().then(d => {
            setDoc(d ? d.toMutableJSON() : null);
            setIsLoading(false);
        });

        const subscription = query.$.subscribe(d => {
            setDoc(d ? d.toMutableJSON() : null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [db, isReady, id, collectionName]);

    return { doc, isLoading };
}

// Hook for syncing with Appwrite
export function useRxSync(collectionName, fetchFn, schoolId, options = {}) {
    const { db, hydrate } = useRxDB();
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState(null);
    const [error, setError] = useState(null);

    const sync = async () => {
        if (!db || !schoolId) return;
        
        setIsSyncing(true);
        setError(null);
        
        try {
            const response = await fetchFn(schoolId);
            const docs = response.documents || [];
            
            await hydrate(collectionName, docs);
            setLastSync(new Date());
        } catch (err) {
            setError(err.message);
            console.error(`Sync error for ${collectionName}:`, err);
        } finally {
            setIsSyncing(false);
        }
    };

    // Auto-sync on mount and when deps change
    useEffect(() => {
        if (options.autoSync !== false) {
            sync();
        }
    }, [schoolId, collectionName, ...(options.deps || [])]);

    // Background sync interval
    useEffect(() => {
        if (!options.interval || !schoolId) return;
        
        const intervalId = setInterval(() => {
            sync();
        }, options.interval);

        return () => clearInterval(intervalId);
    }, [schoolId, options.interval]);

    return { sync, isSyncing, lastSync, error };
}

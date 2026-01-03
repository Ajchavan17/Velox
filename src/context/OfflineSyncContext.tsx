import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';

export interface MutationRequest {
    id: string;
    url: string;
    method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: any;
    label: string; // e.g. "Add Transaction"
    createdAt: number;
    status: 'pending' | 'syncing' | 'failed';
    retryCount: number;
}

interface OfflineSyncContextType {
    queue: MutationRequest[];
    addToQueue: (req: Omit<MutationRequest, 'id' | 'createdAt' | 'status' | 'retryCount'>) => void;
    processQueue: () => Promise<void>;
    isOnline: boolean;
    isSyncing: boolean;
    clearQueue: () => void;
}

const OfflineSyncContext = createContext<OfflineSyncContextType | undefined>(undefined);

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
    const [queue, setQueue] = useState<MutationRequest[]>([]);
    const [isOnline, setIsOnline] = useState(true); // Assume online initially
    const [isSyncing, setIsSyncing] = useState(false);
    const processingRef = useRef(false);

    // Load queue on mount
    useEffect(() => {
        setIsOnline(navigator.onLine);
        const savedQueue = localStorage.getItem('VELOX_SYNC_QUEUE');
        if (savedQueue) {
            try {
                setQueue(JSON.parse(savedQueue));
            } catch (e) {
                console.error("Failed to parse sync queue", e);
            }
        }

        const handleOnline = () => {
            setIsOnline(true);
            toast.success("Back Online! Syncing changes...");
            processQueue();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Persist queue
    useEffect(() => {
        localStorage.setItem('VELOX_SYNC_QUEUE', JSON.stringify(queue));
    }, [queue]);

    const addToQueue = (req: Omit<MutationRequest, 'id' | 'createdAt' | 'status' | 'retryCount'>) => {
        const newReq: MutationRequest = {
            ...req,
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            status: 'pending',
            retryCount: 0
        };
        setQueue(prev => [...prev, newReq]);
        toast.loading(`Saved offline: ${req.label}`, { duration: 3000 });

        // Try to process immediately if online (optimistic/race condition handling)
        if (navigator.onLine) {
            // We use setTimeout to let state update first, usually processQueue handles generic queue
            // processQueue();
        }
    };

    const processQueue = useCallback(async () => {
        if (processingRef.current || !navigator.onLine) return;

        // Get current queue from ref or state? State is tricky in async loop.
        // We will read from state updater to be safe or use a fresh copy.
        // Better: queue variable in scope is closure-bound. 
        // We need the LATEST queue.

        // Actually, let's use a functional update loop or just rely on the effect.
        // But `processQueue` needs access to the latest queue.
        // Let's rely on `queue` from state, but we need to re-trigger if queue changes.
        // Simplified approach: Process one by one, remove on success.

        // Wait, since `processQueue` is useCallback, it traps `queue`.
        // We need a ref for the queue or pass it in.

        // Let's assume we pull from localStorage or functional update.
        // Easier:
        setQueue(currentQueue => {
            if (currentQueue.length === 0) return currentQueue;

            // We can't do async inside setState.
            // So we just set Flag, and use useEffect?

            // Correct Pattern:
            // 1. Mark isSyncing true.
            // 2. Iterate a COPY of the queue.
            // 3. For eachItem, await fetch.
            // 4. Update Queue State (remove item).

            // But we need to do this OUTSIDE setQueue.
            // So we need access to the queue.
            return currentQueue;
        });

        // Trigger the async worker
        runSyncWorker();

    }, []);

    const runSyncWorker = async () => {
        if (processingRef.current) return;
        processingRef.current = true;
        setIsSyncing(true);

        try {
            // Loop until empty or offline
            while (navigator.onLine) {
                // Peek first item
                const savedRaw = localStorage.getItem('VELOX_SYNC_QUEUE');
                const currentQueue: MutationRequest[] = savedRaw ? JSON.parse(savedRaw) : [];

                if (currentQueue.length === 0) break;

                const item = currentQueue[0];

                try {
                    console.log(`[Sync] Processing: ${item.label}`);
                    const res = await fetch(item.url, {
                        method: item.method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(item.body)
                    });

                    if (res.ok) {
                        // Success: Remove from queue
                        const nextQueue = currentQueue.slice(1);
                        setQueue(nextQueue); // Update React state
                        localStorage.setItem('VELOX_SYNC_QUEUE', JSON.stringify(nextQueue)); // Update Store
                        toast.success(`Synced: ${item.label}`);
                    } else {
                        // Server Error (4xx, 5xx)
                        // Should we retry or discard?
                        // If 4xx (Client Error), we should probably discard or move to "Dead Letter Queue".
                        // If 5xx, keep it (but exponential backoff breaks loop).
                        console.error(`[Sync] Failed ${item.label}`, res.status);
                        if (res.status >= 400 && res.status < 500) {
                            // Validation error, discard to prevent blocking
                            const nextQueue = currentQueue.slice(1);
                            setQueue(nextQueue);
                            localStorage.setItem('VELOX_SYNC_QUEUE', JSON.stringify(nextQueue));
                            toast.error(`Sync Failed (discarded): ${item.label}`);
                        } else {
                            // 500 error, stop syncing for now
                            break;
                        }
                    }
                } catch (err) {
                    console.error("[Sync] Network Error", err);
                    break; // Stop syncing if network actually fails
                }
            }
        } finally {
            setIsSyncing(false);
            processingRef.current = false;
        }
    };

    // Auto-trigger sync when queue changes (and we are online)
    useEffect(() => {
        if (isOnline && queue.length > 0) {
            runSyncWorker();
        }
    }, [queue.length, isOnline]);

    const clearQueue = () => setQueue([]);

    return (
        <OfflineSyncContext.Provider value={{ queue, addToQueue, processQueue, isOnline, isSyncing, clearQueue }}>
            {children}
        </OfflineSyncContext.Provider>
    );
}

export function useOfflineSync() {
    const context = useContext(OfflineSyncContext);
    if (!context) throw new Error("useOfflineSync must be used within OfflineSyncProvider");
    return context;
}

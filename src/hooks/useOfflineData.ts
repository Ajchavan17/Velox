import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';

interface UseOfflineDataOptions<T> {
    key: string; // localStorage key
    fetcher: () => Promise<T>; // Async function to fetch fresh data
    initialData?: T;
    onSuccess?: (data: T) => void;
}

export function useOfflineData<T>({ key, fetcher, initialData, onSuccess }: UseOfflineDataOptions<T>) {
    const [data, setData] = useState<T | undefined>(initialData);
    const [isLoading, setIsLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);

    // Refs to stabilize dependencies and prevent loops
    const fetcherRef = useRef(fetcher);
    const onSuccessRef = useRef(onSuccess);

    useEffect(() => {
        fetcherRef.current = fetcher;
        onSuccessRef.current = onSuccess;
    }, [fetcher, onSuccess]);

    // 1. Load from LocalStorage on Mount
    useEffect(() => {
        try {
            const cached = localStorage.getItem(key);
            if (cached) {
                setData(JSON.parse(cached));
                setIsLoading(false); // Show cached data immediately
            }
        } catch (e) {
            console.error("Error reading from localStorage", e);
        }
    }, [key]);

    // 2. Fetch Fresh Data
    const refresh = useCallback(async () => {
        try {
            // Don't set loading to true if we already have data (stale-while-revalidate feel)
            // But if we have no data, we must show loading
            if (!data) setIsLoading(true);

            const freshData = await fetcherRef.current();

            setData(freshData);
            localStorage.setItem(key, JSON.stringify(freshData));
            setIsOffline(false);

            if (onSuccessRef.current) onSuccessRef.current(freshData);

        } catch (error) {
            console.error(`Fetch failed for ${key}:`, error);
            setIsOffline(true);

            // If we have no data at all (cache miss + fetch fail), we are in trouble
            if (!data) {
                toast.error("Offline: Could not load data");
            } else {
                // We have stale data, just notify unobtrusively if needed, or rely on global offline indicator
                // toast.error("Offline: Showing cached data");
            }
        } finally {
            setIsLoading(false);
        }
    }, [key, data]); // fetcher and onSuccess removed from deps

    // Initial Fetch
    useEffect(() => {
        refresh();
    }, [refresh]);

    return { data, isLoading, isOffline, refresh };
}

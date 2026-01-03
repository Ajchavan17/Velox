import { useOfflineSync } from "@/context/OfflineSyncContext";
import { useCallback } from "react";
import { toast } from "react-hot-toast";

interface OfflineMutationOptions {
    label: string; // User friendly label e.g. "Add Expense"
    onSuccess?: () => void;
}

export function useOfflineMutation() {
    const { addToQueue, isOnline } = useOfflineSync();

    const mutate = useCallback(async (url: string, method: 'POST' | 'PUT' | 'DELETE', body: any, options: OfflineMutationOptions) => {
        // 1. If Online, try direct fetch
        if (navigator.onLine) {
            try {
                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (!res.ok) throw new Error('Request failed');

                // Real Success
                if (options.onSuccess) options.onSuccess();
                return { success: true, offline: false };
            } catch (error) {
                console.warn("[Mutation] Online fetch failed, falling back to queue", error);
                // Fallthrough to Add Queue
            }
        }

        // 2. If Offline or Failed, Add to Queue
        addToQueue({
            url,
            method,
            body,
            label: options.label
        });

        // Offline "Optimistic" Success
        if (options.onSuccess) options.onSuccess();
        return { success: true, offline: true };

    }, [addToQueue]);

    return { mutate };
}

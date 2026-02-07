"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        // Initial check
        setIsOnline(navigator.onLine);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (isOnline) return null;

    return (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[150] bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs md:text-sm animate-in fade-in slide-in-from-bottom-2">
            <WifiOff className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">You are offline. using cached data.</span>
        </div>
    );
}

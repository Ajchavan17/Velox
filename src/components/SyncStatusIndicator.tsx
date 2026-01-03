import { useOfflineSync } from "@/context/OfflineSyncContext";
import { Loader2, WifiOff, CloudUpload } from "lucide-react";
import { Card } from "./ui/Card";

export function SyncStatusIndicator() {
    const { queue, isOnline, isSyncing } = useOfflineSync();

    if (queue.length === 0 && isOnline) return null;

    return (
        <div className="fixed bottom-20 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <Card className="p-3 shadow-lg border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center gap-3">
                    {!isOnline ? (
                        <div className="flex items-center gap-2 text-amber-500">
                            <WifiOff className="h-4 w-4" />
                            <span className="text-xs font-medium">Offline Mode</span>
                        </div>
                    ) : isSyncing ? (
                        <div className="flex items-center gap-2 text-primary">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-xs font-medium">Syncing...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-blue-500">
                            <CloudUpload className="h-4 w-4" />
                            <span className="text-xs font-medium">{queue.length} Pending</span>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}

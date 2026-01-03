import React from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Bell, BellOff, Loader2, Send } from 'lucide-react';

export function PushNotificationManager() {
    const { isSupported, subscription, isLoading, subscribe, unsubscribe, sendTestNotification } = usePushNotifications();

    if (!isSupported) {
        return (
            <Card className="opacity-70">
                <CardContent className="p-4 text-sm text-muted-foreground">
                    Push notifications are not supported on this browser/device.
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-muted/40 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Bell className="h-5 w-5 text-primary" /> Push Notifications
                </CardTitle>
                <CardDescription>
                    Stay updated with important alerts and transaction info.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <h3 className="text-base font-medium">Status</h3>
                        <p className={`text-sm ${subscription ? "text-emerald-500 font-medium" : "text-muted-foreground"}`}>
                            {subscription ? "Enabled (Subscribed)" : "Disabled"}
                        </p>
                    </div>
                    {subscription ? (
                        <Button variant="secondary" size="sm" onClick={unsubscribe} className="gap-2 text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/20">
                            <BellOff className="h-4 w-4" /> Disable
                        </Button>
                    ) : (
                        <Button variant="default" size="sm" onClick={subscribe} className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90">
                            <Bell className="h-4 w-4" /> Enable
                        </Button>
                    )}
                </div>

                {subscription && (
                    <div className="pt-4 border-t border-border">
                        <Button variant="outline" size="sm" onClick={sendTestNotification} className="w-full gap-2">
                            <Send className="h-4 w-4" /> Send Test Notification
                        </Button>
                        <p className="text-[10px] text-muted-foreground text-center mt-2">
                            Click to verify that your device receives alerts.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

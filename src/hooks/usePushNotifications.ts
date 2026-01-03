import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string | undefined) {
    if (!base64String) {
        throw new Error('VAPID Public Key is missing');
    }

    // Sanitize input: remove all whitespace/newlines
    const cleanBase64 = base64String.replace(/\s/g, '');

    const padding = '='.repeat((4 - cleanBase64.length % 4) % 4);
    const base64 = (cleanBase64 + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function usePushNotifications() {
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            registerServiceWorker();
        } else {
            setIsLoading(false);
        }
    }, []);

    const registerServiceWorker = async () => {
        try {
            // Wait for SW ready, but timeout after 3s to prevent infinite loading state
            // preventing the UI from hanging if SW fails to register (common in dev/insecure contexts)
            const registration = await Promise.race([
                navigator.serviceWorker.ready,
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('SW registration timed out')), 4000)
                )
            ]);

            const sub = await registration.pushManager.getSubscription();
            setSubscription(sub);
        } catch (error) {
            console.error('Service Worker registration failed or timed out:', error);
            // If we timed out, it likely means SW isn't loading (e.g. dev mode disabled or insecure context)
        } finally {
            setIsLoading(false);
        }
    };

    const subscribe = async () => {
        if (!VAPID_PUBLIC_KEY) {
            console.error("VAPID Key missing in env");
            toast.error("Push Configuration Error: Missing Key. Check logs.");
            return;
        }

        console.log(`[Push] key: ${VAPID_PUBLIC_KEY.substring(0, 5)}...`);

        setIsLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;

            // Validate and convert key
            let applicationServerKey: Uint8Array;
            try {
                applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
            } catch (e) {
                console.error("Values:", { VAPID_PUBLIC_KEY });
                throw new Error("Invalid VAPID Key format");
            }

            // P-256 public keys must be 65 bytes (0x04 + 32 bytes X + 32 bytes Y)
            if (applicationServerKey.byteLength !== 65) {
                console.error("Invalid key length:", applicationServerKey.byteLength);
                throw new Error(`Invalid Key Length. Expected 65 bytes, got ${applicationServerKey.byteLength}. check .env`);
            }

            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey as any
            });

            setSubscription(sub);

            // Send subscription to server
            const res = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscription: sub })
            });

            if (!res.ok) throw new Error('Failed to save subscription');
            toast.success("Notifications enabled!");
        } catch (error) {
            console.error('Failed to subscribe:', error);
            toast.error("Subscription failed: " + (error as any).message);
        } finally {
            setIsLoading(false);
        }
    };

    const unsubscribe = async () => {
        if (!subscription) return;
        setIsLoading(true);
        try {
            await subscription.unsubscribe();
            setSubscription(null);
            // Optionally notify server to delete, but server handles 410/404 on send
            toast.success("Notifications disabled");
        } catch (error) {
            console.error('Failed to unsubscribe:', error);
            toast.error("Error disabling notifications");
        } finally {
            setIsLoading(false);
        }
    };

    const sendTestNotification = async () => {
        try {
            const res = await fetch('/api/push/send-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: "Test Notification",
                    message: "It works! You will receive updates here."
                })
            });
            if (res.ok) {
                toast.success("Test notification sent!");
            } else {
                toast.error("Failed to send test");
            }
        } catch (error) {
            toast.error("Error calling send-test API");
        }
    };

    return {
        isSupported,
        subscription,
        isLoading,
        subscribe,
        unsubscribe,
        sendTestNotification
    };
}

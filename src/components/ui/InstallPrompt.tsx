"use client";

import { useState, useEffect } from "react";
import { X, Download, Share } from "lucide-react";
import { Button } from "./Button";

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

        if (isIosDevice && !isStandalone) {
            setIsIOS(true);
            // Show iOS prompt only if not already installed, maybe delayed?
            // For now, let's show it if not standalone.
            // But we probably don't want to annoy user every time. 
            // Logic: Check localStorage if dismissed recently.
            const dismissed = localStorage.getItem('velox_install_dismissed');
            if (!dismissed) {
                setIsVisible(true);
            }
        }

        const handleBeforeInstallPrompt = (e: any) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Check dismissal
            const dismissed = localStorage.getItem('velox_install_dismissed');
            if (!dismissed) {
                setIsVisible(true);
            }
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Hide the app provided install promotion
        setIsVisible(false);
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('velox_install_dismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-foreground text-background p-4 rounded-xl shadow-2xl flex flex-col gap-3 relative">
                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-lg">
                        <Download className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Install Velox Finance</h3>
                        <p className="text-xs text-background/80">Add to home screen for offline access</p>
                    </div>
                </div>

                {isIOS ? (
                    <div className="text-xs bg-white/10 p-3 rounded-lg space-y-2">
                        <p>To install on iOS:</p>
                        <div className="flex items-center gap-2">
                            <span>1. Tap</span>
                            <Share className="h-4 w-4" />
                            <span>Share button</span>
                        </div>
                        <div>2. Select "Add to Home Screen"</div>
                    </div>
                ) : (
                    <Button
                        onClick={handleInstallClick}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        size="sm"
                    >
                        Install App
                    </Button>
                )}
            </div>
        </div>
    );
}

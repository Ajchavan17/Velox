'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";
import { InstallPrompt } from "@/components/ui/InstallPrompt";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <CurrencyProvider>
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                    {children}
                    <InstallPrompt />
                    <OfflineIndicator />
                    <Toaster />
                </ThemeProvider>
            </CurrencyProvider>
        </SessionProvider>
    );
}

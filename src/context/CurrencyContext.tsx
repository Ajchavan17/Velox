"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface CurrencyContextType {
    currency: string;
    setCurrency: (currency: string) => void;
    symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_SYMBOLS: Record<string, string> = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const { data: session, update } = useSession();
    const [currency, setCurrencyState] = useState('INR');

    // Load initial currency from session or local storage
    useEffect(() => {
        if (session?.user?.currency) {
            setCurrencyState(session.user.currency);
        } else {
            const stored = localStorage.getItem('velox_currency');
            if (stored) {
                setCurrencyState(stored);
            }
        }
    }, [session]);

    const setCurrency = async (newCurrency: string) => {
        setCurrencyState(newCurrency);
        localStorage.setItem('velox_currency', newCurrency);

        // Update backend if user is logged in
        if (session?.user) {
            try {
                await fetch('/api/user/settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ currency: newCurrency }),
                });
                // Update session to reflect change
                await update({ currency: newCurrency });
            } catch (error) {
                console.error("Failed to update currency preference:", error);
            }
        }
    };

    const symbol = CURRENCY_SYMBOLS[currency] || currency;

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, symbol }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error("useCurrency must be used within a CurrencyProvider");
    }
    return context;
}

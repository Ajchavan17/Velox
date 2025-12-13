'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type AuthMode = 'login' | 'register' | 'forgot-password';

interface AuthUIContextType {
    isSidebarOpen: boolean;
    authMode: AuthMode;
    openLogin: () => void;
    openRegister: () => void;
    openForgotPassword: () => void;
    closeSidebar: () => void;
    toggleMode: () => void;
}

const AuthUIContext = createContext<AuthUIContextType | undefined>(undefined);

export const AuthUIProvider = ({ children }: { children: ReactNode }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [authMode, setAuthMode] = useState<AuthMode>('login');

    const openLogin = () => {
        setAuthMode('login');
        setIsSidebarOpen(true);
    };

    const openRegister = () => {
        setAuthMode('register');
        setIsSidebarOpen(true);
    };

    const openForgotPassword = () => {
        setAuthMode('forgot-password');
        setIsSidebarOpen(true);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    const toggleMode = () => {
        setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'));
    };

    return (
        <AuthUIContext.Provider
            value={{
                isSidebarOpen,
                authMode,
                openLogin,
                openRegister,
                openForgotPassword,
                closeSidebar,
                toggleMode,
            }}
        >
            {children}
        </AuthUIContext.Provider>
    );
};

export const useAuthUI = () => {
    const context = useContext(AuthUIContext);
    if (context === undefined) {
        throw new Error('useAuthUI must be used within an AuthUIProvider');
    }
    return context;
};

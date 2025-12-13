'use client';

import React, { useEffect } from 'react';
import { useAuthUI } from '@/context/AuthUIContext';
import { LoginForm, RegisterForm, ForgotPasswordForm } from './AuthForms';
import { X } from 'lucide-react';

export const AuthSidebar = () => {
    const { isSidebarOpen, authMode, closeSidebar } = useAuthUI();

    // Prevent scrolling when sidebar is open
    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isSidebarOpen]);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={closeSidebar}
            />

            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-[400px] md:w-[25vw] min-w-[320px] bg-background/80 backdrop-blur-xl border-l border-border shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Close Button */}
                <button
                    onClick={closeSidebar}
                    className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground hover:bg-muted/20 rounded-full transition-all"
                >
                    <X size={24} />
                </button>

                {/* Content */}
                <div className="h-full flex flex-col justify-center px-6 py-12 overflow-y-auto">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary rounded-full blur-[120px] opacity-5 pointer-events-none" />

                    {authMode === 'login' && <LoginForm />}
                    {authMode === 'register' && <RegisterForm />}
                    {authMode === 'forgot-password' && <ForgotPasswordForm />}
                </div>
            </div>
        </>
    );
};

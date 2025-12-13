'use client';

import React from 'react';
import AuthForm from '@/components/auth/AuthForm';

export const LoginForm = () => {
    return (
        <div className="flex flex-col gap-6 w-full max-w-sm mx-auto p-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back</h2>
                <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
            </div>
            <AuthForm variant="LOGIN" />
        </div>
    );
};

export const RegisterForm = () => {
    return (
        <div className="flex flex-col gap-6 w-full max-w-sm mx-auto p-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Get Started</h2>
                <p className="text-sm text-muted-foreground">Create your account to start tracking</p>
            </div>
            <AuthForm variant="REGISTER" />
        </div>
    );
};

export const ForgotPasswordForm = () => {
    return (
        <div className="flex flex-col gap-6 w-full max-w-sm mx-auto p-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Reset Password</h2>
                <p className="text-sm text-muted-foreground">Enter your email to receive a reset link</p>
            </div>
            <AuthForm variant="FORGOT_PASSWORD" />
        </div>
    );
};

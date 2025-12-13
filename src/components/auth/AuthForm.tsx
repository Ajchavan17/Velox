'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Mail, Lock, User } from 'lucide-react';
import Link from 'next/link';

import { useAuthUI } from '@/context/AuthUIContext';

interface AuthFormProps {
    variant: 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD';
}

export default function AuthForm({ variant }: AuthFormProps) {
    const router = useRouter();
    const { toggleMode, closeSidebar, openForgotPassword, openLogin } = useAuthUI();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [data, setData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const toggleVariant = () => {
        toggleMode();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            if (variant === 'REGISTER') {
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });

                const json = await res.json();

                if (!res.ok) {
                    throw new Error(json.message || 'Something went wrong');
                }

                // Show success message instead of auto-login
                setSuccess('Registration successful! Please check your email to verify your account.');
                // Clear form
                setData({ name: '', email: '', password: '' });
            } else if (variant === 'FORGOT_PASSWORD') {
                const res = await fetch('/api/auth/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: data.email }),
                });

                const json = await res.json();

                if (!res.ok) {
                    throw new Error(json.message || 'Something went wrong');
                }
                setSuccess('If an account exists, a reset link has been sent to your email.');
            } else {
                const res = await signIn('credentials', {
                    ...data,
                    redirect: false,
                });

                if (res?.error) {
                    throw new Error(res.error);
                }

                router.push('/');
                router.refresh();
                closeSidebar();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <div className="w-full">
            <div className="px-4 py-8 sm:px-10">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {variant === 'REGISTER' && (
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-foreground"
                            >
                                Name
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    disabled={isLoading}
                                    value={data.name}
                                    onChange={(e) => setData({ ...data, name: e.target.value })}
                                    className="appearance-none block w-full pl-10 px-3 py-2 border border-border rounded-lg shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-0 focus:border-primary sm:text-sm bg-muted/50 text-foreground transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-foreground"
                        >
                            Email address
                        </label>
                        <div className="mt-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                disabled={isLoading}
                                value={data.email}
                                onChange={(e) => setData({ ...data, email: e.target.value })}
                                className="appearance-none block w-full pl-10 px-3 py-2 border border-border rounded-lg shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-0 focus:border-primary sm:text-sm bg-muted/50 text-foreground transition-colors"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    {variant !== 'FORGOT_PASSWORD' && (
                        <div>
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-foreground"
                                >
                                    Password
                                </label>

                            </div>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    disabled={isLoading}
                                    value={data.password}
                                    onChange={(e) => setData({ ...data, password: e.target.value })}
                                    className="appearance-none block w-full pl-10 px-3 py-2 border border-border rounded-lg shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-0 focus:border-primary sm:text-sm bg-muted/50 text-foreground transition-colors"
                                    placeholder="••••••••"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="text-red-500 text-sm mt-2 text-center bg-red-500/10 py-2 rounded border border-red-500/20">{error}</div>
                    )}
                    {success && (
                        <div className="text-green-500 text-sm mt-2 text-center bg-green-500/10 py-2 rounded border border-green-500/20">{success}</div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-black bg-gradient-to-r from-primary to-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : variant === 'LOGIN' ? (
                                'Sign in'
                            ) : variant === 'FORGOT_PASSWORD' ? (
                                'Send Reset Link'
                            ) : (
                                'Register'
                            )}
                        </button>
                    </div>
                </form>



                <div className="flex gap-2 justify-center text-sm mt-8 px-2 text-muted-foreground flex-col items-center">
                    {variant === 'LOGIN' && (
                        <div className="mb-2">
                            <button
                                type="button"
                                onClick={openForgotPassword}
                                className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0 underline"
                            >
                                Forgot your password?
                            </button>
                        </div>
                    )}
                    <div className="flex gap-2">
                        <div>
                            {variant === 'LOGIN'
                                ? 'New to Velox?'
                                : variant === 'REGISTER'
                                    ? 'Already have an account?'
                                    : 'Remember your password?'}
                        </div>
                        <div
                            onClick={variant === 'FORGOT_PASSWORD' ? openLogin : toggleVariant}
                            className="underline cursor-pointer text-primary hover:text-accent transition-colors"
                        >
                            {variant === 'LOGIN'
                                ? 'Create an account'
                                : variant === 'REGISTER'
                                    ? 'Login'
                                    : 'Login'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

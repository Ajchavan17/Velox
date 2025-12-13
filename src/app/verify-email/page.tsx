'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Missing verification token.');
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch('/api/verify-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                const data = await res.json();

                if (res.ok) {
                    setStatus('success');
                    setMessage('Email verified successfully!');
                    setTimeout(() => {
                        router.push('/');
                    }, 3000);
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Verification failed.');
                }
            } catch (error) {
                setStatus('error');
                setMessage('An error occurred. Please try again.');
            }
        };

        verify();
    }, [token, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-card/50 backdrop-blur-xl border border-border rounded-xl shadow-2xl text-center">
                <div className="flex justify-center">
                    <div className={`h-16 w-16 rounded-full flex items-center justify-center ${status === 'loading' ? 'bg-primary/20 animate-pulse' :
                        status === 'success' ? 'bg-primary/20' : 'bg-red-500/20'
                        }`}>
                        {status === 'loading' && (
                            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        )}
                        {status === 'success' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        {status === 'error' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </div>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {status === 'loading' ? 'Verifying...' :
                        status === 'success' ? 'Verified!' : 'Verification Failed'}
                </h1>

                <p className="text-muted-foreground">
                    {message}
                </p>

                {status === 'success' && (
                    <p className="text-sm text-muted-foreground">
                        Redirecting to home in 3 seconds...
                    </p>
                )}

                {status === 'error' && (
                    <Link href="/">
                        <Button className="w-full" variant="neon">
                            Back to Home
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-foreground">Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}

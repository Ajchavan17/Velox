'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useRouter } from 'next/navigation';
import { User, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

export default function ProfileNameForm() {
    const router = useRouter();
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Initialize with session name if available, otherwise empty string
    const [name, setName] = useState(session?.user?.name || '');
    const [currency, setCurrency] = useState((session?.user as any)?.currency || 'INR');

    const currencies = [
        { value: 'USD', label: 'USD ($)' },
        { value: 'EUR', label: 'EUR (€)' },
        { value: 'GBP', label: 'GBP (£)' },
        { value: 'INR', label: 'INR (₹)' },
        { value: 'JPY', label: 'JPY (¥)' },
        { value: 'CAD', label: 'CAD ($)' },
        { value: 'AUD', label: 'AUD ($)' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError('Name cannot be empty');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/user/update-profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, currency }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            // Update session client-side
            await update({ name, currency });

            setSuccess('Profile updated successfully');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-sm">
                    {success}
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="name">
                    Display Name
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setError('');
                            setSuccess('');
                        }}
                        className="pl-10"
                        placeholder="Your Name"
                        required
                    />
                </div>
                <p className="text-sm text-muted-foreground">
                    This is the name that will be displayed on your profile and emails.
                </p>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="currency">
                    Currency
                </label>
                <Select
                    value={currency}
                    onChange={setCurrency}
                    options={currencies}
                    id="currency"
                />
                <p className="text-sm text-muted-foreground">
                    Select your preferred currency for display.
                </p>
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                        </>
                    ) : (
                        'Update Profile'
                    )}
                </Button>
            </div>
        </form>
    );
}

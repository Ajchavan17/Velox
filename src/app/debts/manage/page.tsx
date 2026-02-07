"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Loader2, ArrowLeft, ArrowUpRight, ArrowDownLeft, WalletCards, CheckCircle2, ChevronRight } from "lucide-react";

interface Debt {
    _id: string;
    type: 'borrow' | 'lend';
    personName: string;
    amount: number;
    repaidAmount: number;
    date: string;
    status: 'pending' | 'settled' | 'partial';
}

interface PersonSummary {
    name: string;
    netAmount: number; // Positive = They Owe Me, Negative = I Owe Them
}

export default function ManageDebtsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [debts, setDebts] = useState<Debt[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === 'authenticated') fetchDebts();
    }, [status]);

    const fetchDebts = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/debts');
            if (res.ok) setDebts(await res.json());
        } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };

    // Aggregate Net Positions
    const { active, settled } = useMemo(() => {
        const map = new Map<string, number>();

        debts.forEach(d => {
            if (!map.has(d.personName)) map.set(d.personName, 0);

            let current = map.get(d.personName)!;
            const openAmount = d.amount - (d.repaidAmount || 0);

            if (d.type === 'borrow') {
                current -= openAmount; // I owe
            } else {
                current += openAmount; // They owe
            }
            map.set(d.personName, Math.round(current * 100) / 100);
        });

        const all = Array.from(map.entries()).map(([name, netAmount]) => ({ name, netAmount }));

        return {
            active: all.filter(p => Math.abs(p.netAmount) > 0).sort((a, b) => Math.abs(b.netAmount) - Math.abs(a.netAmount)),
            settled: all.filter(p => Math.abs(p.netAmount) === 0).sort((a, b) => a.name.localeCompare(b.name))
        };
    }, [debts]);

    if (status === 'loading') return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="container mx-auto py-8 px-4 md:px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Breadcrumbs & Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <Link href="/debts" className="hover:text-primary transition-colors">Debt/Lent</Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">Manage & Settle</span>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Active Settlements</h1>
                        <p className="text-muted-foreground mt-1">Review outstanding balances and initiate settlements.</p>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
                {active.length === 0 && settled.length === 0 && (
                    <div className="text-center py-16 border border-dashed rounded-xl bg-muted/20">
                        <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">No Records Found</h3>
                        <p className="text-muted-foreground">You have no debts or loans recorded.</p>
                        <Link href="/debts" className="mt-4 inline-block">
                            <Button variant="outline">Back to Dashboard</Button>
                        </Link>
                    </div>
                )}

                {/* Active Settlements */}
                {active.map(person => (
                    <div
                        key={person.name}
                        onClick={() => router.push(`/debts/${encodeURIComponent(person.name)}`)}
                        className="bg-card hover:bg-muted/40 border border-border rounded-xl p-5 flex items-center justify-between cursor-pointer transition-all hover:shadow-md group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg ${person.netAmount < 0 ? 'bg-red-100 text-red-600' : person.netAmount > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-muted text-muted-foreground'
                                }`}>
                                {person.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{person.name}</h3>
                                <p className={`text-sm font-medium flex items-center gap-1 ${person.netAmount < 0 ? 'text-red-600' : person.netAmount > 0 ? 'text-emerald-600' : 'text-muted-foreground'
                                    }`}>
                                    {person.netAmount < 0 ? <ArrowDownLeft className="h-4 w-4" /> : person.netAmount > 0 ? <ArrowUpRight className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                    {person.netAmount < 0 ? 'You Owe' : person.netAmount > 0 ? 'Owes You' : 'Settled'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className={`text-xl font-bold ${person.netAmount < 0 ? 'text-red-700' : person.netAmount > 0 ? 'text-emerald-700' : 'text-muted-foreground'
                                    }`}>
                                    ₹{Math.abs(person.netAmount).toLocaleString()}
                                </p>
                            </div>
                            <Button size="sm" className={
                                person.netAmount < 0 ? 'bg-red-600 hover:bg-red-700' : person.netAmount > 0 ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                            }>
                                Settle <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                ))}

                {/* Settled / Past Section */}
                {settled.length > 0 && (
                    <div className="pt-8">
                        <h2 className="text-lg font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5" /> Settled / Past Contacts
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {settled.map(person => (
                                <div
                                    key={person.name}
                                    onClick={() => router.push(`/debts/${encodeURIComponent(person.name)}`)}
                                    className="bg-muted/20 border border-border/50 rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all hover:bg-muted/50 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold">
                                            {person.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">{person.name}</h3>
                                            <p className="text-xs text-muted-foreground">All settled</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" /> Fully Settled
                                        </p>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

    );
}

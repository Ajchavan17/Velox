"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Loader2, ArrowLeft, ArrowUpCircle, ArrowDownCircle, Filter, Calendar, CheckCircle2, History } from "lucide-react";

interface Debt {
    _id: string;
    type: 'borrow' | 'lend';
    personName: string;
    amount: number;
    repaidAmount: number;
    date: string;
    status: 'pending' | 'settled' | 'partial';
    description?: string;
    settlements?: {
        amount: number;
        date: string;
        accountId: string;
    }[];
}

interface TimelineEvent {
    id: string;
    date: Date;
    type: 'create_borrow' | 'create_lend' | 'settle_borrow' | 'settle_lend';
    amount: number;
    personName: string;
    description?: string;
    originalDebtId: string;
}

export default function DebtHistoryPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [debts, setDebts] = useState<Debt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPerson, setSelectedPerson] = useState<string>('all');

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

    // 1. Extract Unique People
    const people = useMemo(() => {
        const set = new Set(debts.map(d => d.personName));
        return Array.from(set).sort();
    }, [debts]);

    // 2. Build Unified Timeline
    const timeline = useMemo(() => {
        let events: TimelineEvent[] = [];

        debts.forEach(d => {
            // Filter Logic
            if (selectedPerson !== 'all' && d.personName !== selectedPerson) return;

            // A. Creation Event
            events.push({
                id: `create-${d._id}`,
                date: new Date(d.date),
                type: d.type === 'borrow' ? 'create_borrow' : 'create_lend',
                amount: d.amount,
                personName: d.personName,
                description: d.description || 'Record Created',
                originalDebtId: d._id
            });

            // B. Settlement Events
            if (d.settlements) {
                d.settlements.forEach((s, idx) => {
                    events.push({
                        id: `settle-${d._id}-${idx}`,
                        date: new Date(s.date),
                        type: d.type === 'borrow' ? 'settle_borrow' : 'settle_lend',
                        amount: s.amount,
                        personName: d.personName,
                        description: 'Settlement / Repayment',
                        originalDebtId: d._id
                    });
                });
            }
        });

        return events.sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [debts, selectedPerson]);

    // 3. Analytics
    const stats = useMemo(() => {
        let borrowed = 0;
        let lent = 0;
        let repaidByMe = 0;
        let repaidToMe = 0;

        // Map to track net balance per person
        // Negative = I Owe Them. Positive = They Owe Me.
        const personBalances: Record<string, number> = {};

        timeline.forEach(e => {
            if (e.type === 'create_borrow') borrowed += e.amount;
            if (e.type === 'create_lend') lent += e.amount;
            if (e.type === 'settle_borrow') repaidByMe += e.amount;
            if (e.type === 'settle_lend') repaidToMe += e.amount;

            if (!personBalances[e.personName]) personBalances[e.personName] = 0;

            if (e.type === 'create_borrow') personBalances[e.personName] -= e.amount;
            if (e.type === 'settle_borrow') personBalances[e.personName] += e.amount;

            if (e.type === 'create_lend') personBalances[e.personName] += e.amount;
            if (e.type === 'settle_lend') personBalances[e.personName] -= e.amount;
        });

        // Round balances to 2 decimals
        Object.keys(personBalances).forEach(key => {
            personBalances[key] = Math.round(personBalances[key] * 100) / 100;
        });

        let outstandingPayable = 0;
        let outstandingReceivable = 0;

        Object.values(personBalances).forEach(balance => {
            if (balance > 0) outstandingReceivable += balance;
            if (balance < 0) outstandingPayable += Math.abs(balance);
        });

        return { borrowed, lent, repaidByMe, repaidToMe, outstandingPayable, outstandingReceivable };
    }, [timeline]);

    if (status === 'loading') return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="container mx-auto py-8 px-4 md:px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Breadcrumbs & Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <Link href="/debts" className="hover:text-primary transition-colors">Debt/Lent</Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">History</span>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>

                    {/* Filter */}
                    <div className="flex items-center gap-3 bg-card border border-border px-3 py-1.5 rounded-lg shadow-sm">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <div className="min-w-[150px]">
                            <Select
                                value={selectedPerson}
                                onChange={(val) => setSelectedPerson(val)}
                                options={[
                                    { label: 'All People', value: 'all' },
                                    ...people.map(p => ({ label: p, value: p }))
                                ]}
                                className="border-0 shadow-none bg-transparent focus:ring-0 px-0 h-auto py-0"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics Summary */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 rounded-xl bg-red-50 border border-red-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-red-600/80 uppercase tracking-wider">Total Outstanding Need to Pay</p>
                            <p className="text-3xl font-bold text-red-700 mt-2">₹{stats.outstandingPayable.toLocaleString()}</p>
                        </div>
                        <ArrowDownCircle className="h-10 w-10 text-red-300" />
                    </div>
                    <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-emerald-600/80 uppercase tracking-wider">Total Outstanding to Receive</p>
                            <p className="text-3xl font-bold text-emerald-700 mt-2">₹{stats.outstandingReceivable.toLocaleString()}</p>
                        </div>
                        <ArrowUpCircle className="h-10 w-10 text-emerald-300" />
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-card border border-border">
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Total Borrowed</p>
                        <p className="text-lg font-bold">₹{stats.borrowed.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-card border border-border">
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Repaid by Me</p>
                        <p className="text-lg font-bold text-emerald-600">₹{stats.repaidByMe.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-card border border-border">
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Total Lent</p>
                        <p className="text-lg font-bold">₹{stats.lent.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-card border border-border">
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Repaid to Me</p>
                        <p className="text-lg font-bold text-emerald-600">₹{stats.repaidToMe.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Timeline List */}
            <div className="space-y-4">
                {timeline.length === 0 && <div className="text-center py-10 text-muted-foreground border border-dashed rounded-xl">No history found.</div>}

                {timeline.map(event => (
                    <div
                        key={event.id}
                        className="bg-card hover:bg-muted/40 border border-border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all hover:shadow-sm group"
                    >
                        {/* Icon */}
                        <div className={`p-3 rounded-full shrink-0 ${event.type.includes('borrow') ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                            }`}>
                            {event.type.startsWith('create') ? (
                                event.type === 'create_borrow' ? <ArrowDownCircle className="h-5 w-5" /> : <ArrowUpCircle className="h-5 w-5" />
                            ) : (
                                <CheckCircle2 className="h-5 w-5" />
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                    {event.type === 'create_borrow' && 'Borrowed from'}
                                    {event.type === 'create_lend' && 'Lent to'}
                                    {event.type === 'settle_borrow' && 'Repayment to'}
                                    {event.type === 'settle_lend' && 'Payment from'}
                                    <span className="ml-1 text-primary">{event.personName}</span>
                                </span>
                                {event.type.startsWith('settle') && (
                                    <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">SETTLEMENT</span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-3 w-3" /> {event.date.toLocaleDateString()}
                                {event.description && <span className="text-muted-foreground/60">• {event.description}</span>}
                            </p>
                        </div>

                        {/* Amount */}
                        <div className="text-right">
                            <p className={`text-lg font-bold ${event.type.includes('borrow') ? 'text-red-600' : 'text-emerald-600'
                                }`}>
                                {event.type.startsWith('settle') ? '✓ ' : ''}
                                ₹{event.amount.toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

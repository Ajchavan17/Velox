"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Loader2, ArrowLeft, ArrowUpCircle, ArrowDownCircle, Filter, Calendar, CheckCircle2, History } from "lucide-react";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { useOfflineData } from "@/hooks/useOfflineData";

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
    const [selectedPerson, setSelectedPerson] = useState<string>('all');

    // Offline Hook
    const { data: debts = [], isLoading: isDebtsLoading } = useOfflineData<Debt[]>({
        key: 'VELOX_DEBTS_ALL',
        fetcher: async () => {
            const res = await fetch('/api/debts');
            if (!res.ok) throw new Error('Failed to fetch debts');
            return res.json();
        }
    });

    const isLoading = isDebtsLoading;

    // fetchDebts removed

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
                <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                        <Link href="/debts" className="hover:text-primary transition-colors">Debt/Lent</Link>
                        <span>/</span>
                        <span className="text-foreground font-medium">History</span>
                    </div>

                    {/* Mobile Filter: Inline with Breadcrumbs */}
                    <div className="flex items-center gap-1 md:hidden">
                        <Filter className="h-3 w-3 text-muted-foreground" />
                        <Select
                            value={selectedPerson}
                            onChange={(val) => setSelectedPerson(val)}
                            options={[
                                { label: 'All', value: 'all' },
                                ...people.map(p => ({ label: p, value: p }))
                            ]}
                            variant="ghost"
                            className="border-0 shadow-none bg-transparent focus:ring-0 px-0 h-auto py-0 text-sm w-[100px] text-right"
                        />
                    </div>
                </div>

                {/* Desktop Header: Original */}
                <div className="hidden md:flex items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
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
                {/* Mobile Stats (Split Layout) */}
                <div className="md:hidden space-y-3">
                    {/* Top Row: Need to Pay | To Receive */}
                    <Card className="bg-card/50 backdrop-blur-sm border-border p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center border-r border-border/50 pr-2">
                                <p className="text-[10px] font-medium text-red-500/80 uppercase tracking-wider truncate">Need to Pay</p>
                                <p className="text-lg font-bold mt-1">
                                    <CurrencyDisplay amount={stats.outstandingPayable} type="expense" />
                                </p>
                            </div>
                            <div className="text-center pl-2">
                                <p className="text-[10px] font-medium text-emerald-500/80 uppercase tracking-wider truncate">To Receive</p>
                                <p className="text-lg font-bold mt-1">
                                    <CurrencyDisplay amount={stats.outstandingReceivable} type="income" />
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Bottom Row: Others (Single Row Grid) */}
                    <Card className="bg-card/50 backdrop-blur-sm border-border">
                        <div className="grid grid-cols-4 gap-1 p-3 items-center text-center">
                            {/* Total Borrowed */}
                            <div className="border-r border-border/50">
                                <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider truncate px-1">Borrowed</p>
                                <p className="text-xs font-bold mt-1">
                                    <CurrencyDisplay amount={stats.borrowed} type="neutral" />
                                </p>
                            </div>
                            {/* Repaid by Me */}
                            <div className="border-r border-border/50">
                                <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider truncate px-1">Pd (Me)</p>
                                <p className="text-xs font-bold mt-1">
                                    <CurrencyDisplay amount={stats.repaidByMe} type="expense" />
                                </p>
                            </div>
                            {/* Total Lent */}
                            <div className="border-r border-border/50">
                                <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider truncate px-1">Lent</p>
                                <p className="text-xs font-bold mt-1">
                                    <CurrencyDisplay amount={stats.lent} type="neutral" />
                                </p>
                            </div>
                            {/* Repaid to Me */}
                            <div>
                                <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider truncate px-1">Pd (You)</p>
                                <p className="text-xs font-bold mt-1">
                                    <CurrencyDisplay amount={stats.repaidToMe} type="income" />
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Desktop Stats (Original Grid) */}
                <div className="hidden md:block space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 rounded-xl bg-card border border-border flex items-center justify-between shadow-sm">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Outstanding Need to Pay</p>
                                <p className="text-3xl font-bold mt-2">
                                    <CurrencyDisplay amount={stats.outstandingPayable} type="expense" />
                                </p>
                            </div>
                            <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                <ArrowDownCircle className="h-8 w-8" />
                            </div>
                        </div>
                        <div className="p-6 rounded-xl bg-card border border-border flex items-center justify-between shadow-sm">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Outstanding to Receive</p>
                                <p className="text-3xl font-bold mt-2">
                                    <CurrencyDisplay amount={stats.outstandingReceivable} type="income" />
                                </p>
                            </div>
                            <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <ArrowUpCircle className="h-8 w-8" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-card border border-border">
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Total Borrowed</p>
                            <p className="text-lg font-bold">
                                <CurrencyDisplay amount={stats.borrowed} type="neutral" />
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-card border border-border">
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Repaid by Me</p>
                            <p className="text-lg font-bold">
                                <CurrencyDisplay amount={stats.repaidByMe} type="expense" />
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-card border border-border">
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Total Lent</p>
                            <p className="text-lg font-bold">
                                <CurrencyDisplay amount={stats.lent} type="neutral" />
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-card border border-border">
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Repaid to Me</p>
                            <p className="text-lg font-bold">
                                <CurrencyDisplay amount={stats.repaidToMe} type="income" />
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline List */}
            <div className="space-y-4">
                {timeline.length === 0 && <div className="text-center py-10 text-muted-foreground border border-dashed rounded-xl">No history found.</div>}

                {timeline.map(event => (
                    <div key={event.id}>
                        {/* MOBILE CARD */}
                        <div className="md:hidden mb-3">
                            <div
                                onClick={() => router.push(`/debts/${encodeURIComponent(event.personName)}`)}
                                className="relative overflow-hidden rounded-xl border border-border/40 bg-background/60 backdrop-blur-md p-4 shadow-sm border-l-4 cursor-pointer active:scale-[0.98] transition-all"
                                style={{ borderLeftColor: event.type.includes('borrow') ? '#ef4444' : '#10b981' }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full shrink-0 ${event.type.includes('borrow') ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                            {event.type.startsWith('create') ? (
                                                event.type === 'create_borrow' ? <ArrowDownCircle className="h-5 w-5" /> : <ArrowUpCircle className="h-5 w-5" />
                                            ) : (
                                                <CheckCircle2 className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">
                                                {event.personName}
                                            </p>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                                <span className={event.type.includes('borrow') ? "text-red-500/80 font-medium" : "text-emerald-500/80 font-medium"}>
                                                    {event.type === 'create_borrow' && 'Borrowed'}
                                                    {event.type === 'create_lend' && 'Lent'}
                                                    {event.type === 'settle_borrow' && 'Repaid'}
                                                    {event.type === 'settle_lend' && 'Received'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-base font-bold">
                                            <CurrencyDisplay
                                                amount={event.amount}
                                                type={event.type.includes('borrow') ? 'expense' : 'income'}
                                            />
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{event.date.toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* DESKTOP CARD (Original) */}
                        <div
                            onClick={() => router.push(`/debts/${encodeURIComponent(event.personName)}`)}
                            className="hidden md:flex bg-card hover:bg-muted/40 border border-border rounded-xl p-4 flex-col sm:flex-row items-start sm:items-center gap-4 transition-all hover:shadow-sm group cursor-pointer"
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
                                    {event.description && event.description !== 'Record Created' && <span className="text-muted-foreground/60">• {event.description}</span>}
                                </p>
                            </div>

                            {/* Amount */}
                            <div className="text-right">
                                <p className="text-lg font-bold">
                                    {event.type.startsWith('settle') && <span className="mr-1">✓</span>}
                                    <CurrencyDisplay
                                        amount={event.amount}
                                        type={event.type.includes('borrow') ? 'expense' : 'income'}
                                    />
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

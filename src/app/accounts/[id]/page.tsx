"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, use } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Loader2, ArrowLeft, ArrowUpCircle, ArrowDownCircle, Landmark, CreditCard, Calendar, Filter, Clock, X } from "lucide-react";
import { format, startOfMonth, subMonths, startOfYear, endOfMonth, endOfDay } from "date-fns";
import { toast } from "react-hot-toast";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";

interface Transaction {
    _id: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
    description: string;
}

interface AccountData {
    _id: string;
    accountName?: string; // Bank
    cardName?: string;    // Card
    bankName: string;
    balance?: number;     // Bank
    limit?: number;       // Card 
    currentBalance?: number; // Card usage? Usually we track debt on cards differently but let's assume simple balance model or credit match.
    // Normalized in UI:
    name: string;
    type: 'bank' | 'card';
    currency: string;
}

export default function AccountPassbookPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use() for Next.js 15+ compliance if needed, or await in effect. 
    // Actually in Client Component 'params' prop is a Promise in Next 15 too? 
    // Let's use the 'use' hook pattern or standard useEffect with unwrapping if strictly needed, 
    // but typically client components receive params as props directly in simpler setups unless it's async component.
    // Wait, params IS a promise in generic layouts now. Let's safe-guard.

    // Workaround: We can't await in top level client component easily without 'use'.
    // Let's rely on standard useEffect fetching since we need ID for API.
    const [id, setId] = useState<string>('');

    useEffect(() => {
        // Unpack params
        params.then(p => setId(p.id));
    }, [params]);

    const { data: session, status } = useSession();
    const router = useRouter();
    const [data, setData] = useState<{ account: AccountData, transactions: Transaction[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    // const [filterMode, setFilterMode] = useState<'single' | 'range'>('single'); // Removed in favor of unified inputs
    const [showFilters, setShowFilters] = useState(false);

    // Focus states for date inputs to handle native placeholder behavior
    const [isStartFocused, setIsStartFocused] = useState(false);
    const [isEndFocused, setIsEndFocused] = useState(false);

    const applyQuickFilter = (type: 'month' | '3months' | 'year') => {
        const now = new Date();
        let start = now;
        let end = now;

        switch (type) {
            case 'month':
                start = startOfMonth(now);
                end = endOfMonth(now);
                break;
            case '3months':
                start = subMonths(now, 3);
                end = now;
                break;
            case 'year':
                start = startOfYear(now);
                end = endOfDay(now); // or end of year if preferred, but usually "YTD" means up to now
                break;
        }

        setStartDate(format(start, 'yyyy-MM-dd'));
        setEndDate(format(end, 'yyyy-MM-dd'));
        // setFilterMode('range'); // No longer needed
    };

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
    };

    // Auto-hide filters on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (showFilters) {
                setShowFilters(false);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [showFilters]);

    useEffect(() => {
        if (status === 'authenticated' && id) {
            fetchAccountDetails();
        }
    }, [status, id]);

    const fetchAccountDetails = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/accounts/${id}`);
            if (res.ok) {
                const json = await res.json();
                // Normalize name
                json.account.name = json.account.accountName || json.account.cardName;
                setData(json);
            } else {
                toast.error("Account not found");
                router.push('/dashboard');
            }
        } catch (e) {
            console.error(e);
            toast.error("Error loading passbook");
        } finally {
            setIsLoading(false);
        }
    };

    if (status === 'loading' || isLoading || !id) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!data) return <div className="p-8 text-center">Account not found</div>;

    const { account, transactions } = data;

    // Filter Transactions
    const filteredTransactions = transactions.filter(t => {
        if (startDate && new Date(t.date) < new Date(startDate)) return false;
        if (endDate && new Date(t.date) > new Date(endDate)) return false;
        return true;
    });

    const totalDeposits = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalWithdrawals = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

    const balanceValue = account.balance ?? account.limit ?? 0;
    let balanceColorClass = "text-foreground";
    if (balanceValue > 0) balanceColorClass = "text-emerald-500";
    if (balanceValue < 0) balanceColorClass = "text-red-500";

    return (
        <div className="container mx-auto py-8 px-4 md:px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Nav */}
            <div className="flex items-start gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="mt-1">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight break-words">
                        {account.name} <span className="text-primary/80">Passbook</span>
                    </h1>
                    <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                        {account.type === 'bank' ? <Landmark className="h-3 w-3" /> : <CreditCard className="h-3 w-3" />}
                        {account.bankName}
                    </p>
                </div>
            </div>

            {/* Account Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {/* Mobile Combined Card */}
                <Card className="md:hidden bg-background/60 backdrop-blur-md border border-border/50">
                    <CardContent className="p-4 grid grid-cols-3 divide-x divide-border/50">
                        <div className="text-center px-2">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 truncate">Balance</p>
                            <div className={`text-base font-bold ${balanceColorClass} truncate`}>
                                ₹{balanceValue.toLocaleString()}
                            </div>
                        </div>
                        <div className="text-center px-2">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 truncate">Inflow</p>
                            <div className="text-base font-bold text-emerald-600 truncate">
                                +₹{totalDeposits.toLocaleString()}
                            </div>
                        </div>
                        <div className="text-center px-2">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 truncate">Outflow</p>
                            <div className="text-base font-bold text-red-600 truncate">
                                -₹{totalWithdrawals.toLocaleString()}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Desktop Cards */}
                <Card className="hidden md:block bg-primary/5 border-primary/20 md:col-span-1 shadow-lg shadow-primary/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Available Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-4xl font-bold ${balanceColorClass}`}>
                            ₹{balanceValue.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            as of {format(new Date(), 'MMM d, yyyy')}
                        </p>
                    </CardContent>
                </Card>

                <Card className="hidden md:block md:col-span-2">
                    <CardContent className="p-6 grid grid-cols-2 divide-x divide-border/50 items-center h-full">
                        <div className="flex flex-col items-center justify-center gap-2 px-4">
                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-center">Total Inflow</span>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                    <ArrowUpCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    +₹{totalDeposits.toLocaleString()}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-2 px-4">
                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-center">Total Outflow</span>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                                    <ArrowDownCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    -₹{totalWithdrawals.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions List (Passbook Style) */}
            <div className="space-y-4">
                <div className="flex flex-col gap-4 relative">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-semibold tracking-tight">Transaction History</h2>
                            <div className="h-4 w-[1px] bg-border mx-2 hidden sm:block"></div>
                            <span className="text-xs text-muted-foreground hidden sm:block">
                                {transactions.length} entries
                            </span>
                        </div>
                        <Button
                            variant={showFilters ? "secondary" : "ghost"}
                            size="sm"
                            className="gap-2"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="h-4 w-4" />
                            <span className="hidden sm:inline">Filter</span>
                        </Button>
                    </div>

                    {/* Filter Panel - Professional Layout */}
                    {showFilters && (
                        <div className="w-full md:w-[400px] md:absolute md:right-0 md:top-12 md:z-50 md:shadow-xl bg-muted/30 md:bg-background/95 md:backdrop-blur-md border border-border/50 rounded-xl p-4 animate-in slide-in-from-top-2 fade-in duration-200">
                            <div className="flex flex-col gap-4">
                                {/* Row 1: Quick Actions & Clear */}
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3">
                                    <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">Presets</span>
                                        <Button variant="outline" size="sm" className="h-7 text-xs rounded-full px-3" onClick={() => applyQuickFilter('month')}>This Month</Button>
                                        <Button variant="outline" size="sm" className="h-7 text-xs rounded-full px-3" onClick={() => applyQuickFilter('3months')}>Last 3 Months</Button>
                                        <Button variant="outline" size="sm" className="h-7 text-xs rounded-full px-3" onClick={() => applyQuickFilter('year')}>This Year</Button>
                                    </div>
                                    {(startDate || endDate) && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFilters}
                                            className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 px-2 ml-auto"
                                        >
                                            <X className="h-3 w-3 mr-1" /> Clear Filters
                                        </Button>
                                    )}
                                </div>

                                {/* Row 2: Custom Date Range Inputs */}
                                <div className="flex flex-row flex-wrap sm:flex-nowrap items-center gap-3">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-full sm:w-auto">Range</span>

                                    <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                                        {/* Start Date */}
                                        <div className="relative flex-1">
                                            <Input
                                                type="date"
                                                className={`relative z-10 w-full border border-border focus:border-primary bg-background/50 ${!startDate && !isStartFocused ? 'text-transparent' : ''}`}
                                                value={startDate}
                                                onFocus={() => setIsStartFocused(true)}
                                                onBlur={() => setIsStartFocused(false)}
                                                onChange={(e) => setStartDate(e.target.value)}
                                            />
                                            {!startDate && !isStartFocused && (
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm z-0 pointer-events-none">
                                                    Start Date
                                                </span>
                                            )}
                                        </div>

                                        <span className="text-muted-foreground">-</span>

                                        {/* End Date */}
                                        <div className="relative flex-1">
                                            <Input
                                                type="date"
                                                className={`relative z-10 w-full border border-border focus:border-primary bg-background/50 ${!endDate && !isEndFocused ? 'text-transparent' : ''}`}
                                                value={endDate}
                                                onFocus={() => setIsEndFocused(true)}
                                                onBlur={() => setIsEndFocused(false)}
                                                onChange={(e) => setEndDate(e.target.value)}
                                            />
                                            {!endDate && !isEndFocused && (
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm z-0 pointer-events-none">
                                                    End Date
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile: Card List View */}
                <div className="md:hidden space-y-3">
                    {filteredTransactions.length === 0 ? (
                        <div className="text-center py-12 border rounded-xl border-dashed bg-muted/20 text-muted-foreground">
                            No transactions found.
                        </div>
                    ) : (
                        filteredTransactions.map((t) => (
                            <div
                                key={t._id}
                                className="flex items-center justify-between p-4 bg-background/60 backdrop-blur-md border border-border/40 rounded-xl transition-all hover:shadow-md border-l-4 relative overflow-hidden"
                                style={{ borderLeftColor: t.type === 'income' ? '#10b981' : '#ef4444' }}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`shrink-0 ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {t.type === 'income' ? <ArrowUpCircle className="h-8 w-8" /> : <ArrowDownCircle className="h-8 w-8" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-sm leading-tight mb-1 line-clamp-2 text-wrap break-words pr-2">
                                            {t.description || "No Description"}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {t.category}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 ml-2 flex flex-col items-end">
                                    <CurrencyDisplay
                                        amount={t.amount}
                                        type={t.type}
                                        className="font-bold text-sm whitespace-nowrap block"
                                    />
                                    <p className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">
                                        {format(new Date(t.date), 'MMM d, yy')}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop: Table View */}
                <Card className="hidden md:block">
                    <CardContent className="p-0">
                        {transactions.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">
                                No transactions found for this account.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/30 border-b border-border">
                                        <tr>
                                            <th className="text-left p-4 font-medium text-sm text-muted-foreground w-[150px]">Date</th>
                                            <th className="text-left p-4 font-medium text-sm text-muted-foreground">Description</th>
                                            <th className="text-left p-4 font-medium text-sm text-muted-foreground w-[200px] hidden md:table-cell">Category</th>
                                            <th className="text-right p-4 font-medium text-sm text-muted-foreground w-[150px]">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredTransactions.map((t) => (
                                            <tr key={t._id} className="hover:bg-muted/10 transition-colors group">
                                                <td className="p-4 text-sm whitespace-nowrap text-muted-foreground">
                                                    {format(new Date(t.date), 'dd MMM yyyy')}
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-medium text-foreground">{t.description}</div>
                                                    <div className="md:hidden text-xs text-muted-foreground mt-0.5">{t.category}</div>
                                                </td>
                                                <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">
                                                    <span className="px-2 py-1 rounded-full bg-muted text-xs font-medium">
                                                        {t.category}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right font-bold whitespace-nowrap">
                                                    <CurrencyDisplay amount={t.amount} type={t.type} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

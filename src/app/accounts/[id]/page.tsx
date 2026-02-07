"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, use } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Loader2, ArrowLeft, ArrowUpCircle, ArrowDownCircle, Landmark, CreditCard, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

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
    const [filterMode, setFilterMode] = useState<'single' | 'range'>('range');

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-primary/5 border-primary/20 md:col-span-1 shadow-lg shadow-primary/5">
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

                <Card className="md:col-span-2">
                    <CardContent className="p-6 grid grid-cols-2 gap-8 items-center h-full">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                <ArrowUpCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Inflow</p>
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">+₹{totalDeposits.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                <ArrowDownCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Outflow</p>
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">-₹{totalWithdrawals.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions List (Passbook Style) */}
            <div className="space-y-4">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-muted-foreground" /> Transaction History
                    </h2>

                    {/* Date Filters */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full xl:w-auto">
                        {/* Mode Toggle */}
                        <div className="flex items-center bg-muted/50 rounded-lg p-1 w-full sm:w-auto">
                            <button
                                onClick={() => { setFilterMode('single'); setEndDate(''); setStartDate(''); }}
                                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filterMode === 'single' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Single Date
                            </button>
                            <button
                                onClick={() => { setFilterMode('range'); setStartDate(''); setEndDate(''); }}
                                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filterMode === 'range' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Date Range
                            </button>
                        </div>

                        {/* Inputs */}
                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                            <Input
                                type="date"
                                className="w-full sm:w-auto"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                placeholder="Start Date"
                            />

                            {filterMode === 'range' && (
                                <>
                                    <span className="text-muted-foreground hidden sm:inline">-</span>
                                    <Input
                                        type="date"
                                        className="w-full sm:w-auto"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        placeholder="End Date"
                                    />
                                </>
                            )}

                            {(startDate || endDate) && (
                                <Button variant="ghost" size="sm" onClick={() => { setStartDate(''); setEndDate(''); }}>
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <Card>
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
                                                <td className={`p-4 text-right font-bold whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
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

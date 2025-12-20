"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useOfflineData } from "@/hooks/useOfflineData";
import { Plus, Loader2, ArrowUpRight, ArrowDownLeft, Landmark, Percent, Calendar, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { calculateEMI } from "@/lib/loanUtils";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";

// Types
interface Loan {
    _id: string;
    name: string;
    provider: string;
    type: 'taken' | 'given';
    principalAmount: number;
    interestRate: number;
    emiAmount: number;
    emiDate: number;
    tenureMonths: number;
    schedule: any[];
    status: 'active' | 'closed';
    linkedAccountId?: string;
}

interface AccountOption {
    _id: string;
    name: string;
    type: 'bank' | 'wallet';
}

export default function LoansDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Offline Data Hook for Loans
    const { data: loans = [], isLoading: isLoansLoading, refresh: refreshLoans } = useOfflineData<Loan[]>({
        key: 'VELOX_LOANS_CACHE',
        fetcher: async () => {
            const res = await fetch('/api/loans');
            if (!res.ok) throw new Error('Failed to fetch loans');
            return res.json();
        }
    });

    const [accounts, setAccounts] = useState<AccountOption[]>([]);
    // Combined loading state if needed, or just use isLoansLoading for main content
    const isLoading = isLoansLoading;

    const [isAdding, setIsAdding] = useState(false);
    const [view, setView] = useState<'taken' | 'given'>('taken');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        provider: '',
        type: 'taken' as 'taken' | 'given',
        principalAmount: '',
        interestRate: '',
        processingFee: '0',
        startDate: new Date().toISOString().split('T')[0],
        tenureMonths: '',
        emiDate: '5', // Default 5th of month
        linkedAccountId: '',
    });

    // Principal Formatting State
    const [formattedPrincipal, setFormattedPrincipal] = useState('');

    // Provider Autosuggest State
    const [showProviderDropdown, setShowProviderDropdown] = useState(false);

    const knownProviders = useMemo(() => {
        const providers = new Set(loans.map(l => l.provider));
        return Array.from(providers).sort();
    }, [loans]);

    const handlePrincipalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/,/g, '');
        if (value === '' || /^\d*$/.test(value)) {
            setFormData({ ...formData, principalAmount: value });
            if (value) {
                setFormattedPrincipal(Number(value).toLocaleString('en-IN'));
            } else {
                setFormattedPrincipal('');
            }
        }
    };

    // Computed EMI for Preview
    const previewEMI = useMemo(() => {
        const P = parseFloat(formData.principalAmount) || 0;
        const R = parseFloat(formData.interestRate) || 0;
        const N = parseFloat(formData.tenureMonths) || 1;
        if (P === 0 || N === 0) return 0;

        const r = R / 12 / 100;
        if (r === 0) return P / N;
        return (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
    }, [formData.principalAmount, formData.interestRate, formData.tenureMonths]);

    useEffect(() => {
        if (status === 'authenticated') {
            // Loans are handled by useOfflineData hook automatically
            fetchAccounts();
        }
    }, [status]);

    // Removed old fetchLoans

    const fetchAccounts = async () => {
        try {
            // Fetch banks mainly
            const res = await fetch('/api/accounts');
            if (res.ok) {
                const data = await res.json();
                setAccounts(data.map((a: any) => ({ _id: a._id, name: a.accountName, type: 'bank' })));
            }
        } catch (e) { console.error(e); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/loans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    principalAmount: parseFloat(formData.principalAmount),
                    interestRate: parseFloat(formData.interestRate),
                    processingFee: parseFloat(formData.processingFee),
                    tenureMonths: parseFloat(formData.tenureMonths),
                    emiDate: parseInt(formData.emiDate),
                })
            });

            if (res.ok) {
                toast.success("Loan created successfully");
                setIsAdding(false);
                refreshLoans(); // Use hook refresh
                // Reset Form
                setFormData({
                    name: '', provider: '', type: 'taken', principalAmount: '', interestRate: '',
                    processingFee: '0', startDate: new Date().toISOString().split('T')[0],
                    tenureMonths: '', emiDate: '5', linkedAccountId: ''
                });
                setFormattedPrincipal('');
            } else {
                toast.error("Failed to create loan");
            }
        } catch (e) {
            toast.error("Error creating loan");
        }
    };

    // Quick Action: Pay EMI for current month
    const payEMI = async (loan: Loan) => {
        // Find first pending installment
        const pending = loan.schedule.find((s: any) => s.status === 'pending');
        if (!pending) {
            toast.success("No pending EMIs!");
            return;
        }

        if (!confirm(`Confirm payment of EMI #${pending.installmentNo} (₹${Math.round(loan.emiAmount)})? This will define settlement.`)) return;

        try {
            const res = await fetch(`/api/loans/${loan._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'pay_emi',
                    installmentNo: pending.installmentNo,
                    transactionDate: new Date()
                })
            });
            if (res.ok) {
                toast.success("EMI Paid & Recorded!");
                refreshLoans();
            } else {
                toast.error("Payment failed");
            }
        } catch (e) {
            toast.error("Error connecting to server");
        }
    };

    // Stats
    const totalTaken = loans.filter(l => l.type === 'taken').reduce((acc, curr) => acc + curr.principalAmount, 0);
    const totalGiven = loans.filter(l => l.type === 'given').reduce((acc, curr) => acc + curr.principalAmount, 0);
    const monthlyBurn = loans.filter(l => l.type === 'taken' && l.status === 'active').reduce((acc, curr) => acc + curr.emiAmount, 0);

    if (status === 'loading') return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="container mx-auto py-4 md:py-8 px-4 md:px-6 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-auto">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent w-fit">Loans & EMIs</h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">Track your bank loans and lendings.</p>
                </div>
                <Button onClick={() => setIsAdding(true)} className="hidden md:flex shadow-lg shadow-primary/20">
                    <Plus className="h-4 w-4 mr-2" /> Add Loan
                </Button>
            </div>

            {/* Quick Stats */}
            {/* Desktop View: Separate Cards */}
            <div className="hidden md:grid grid-cols-3 gap-6">
                <Card className="bg-card/50 backdrop-blur-sm border-border">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground uppercase">Monthly EMI Burn</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            <CurrencyDisplay amount={monthlyBurn} type="expense" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Total active outgoing EMIs</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-border">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground uppercase">Total Loan Liability</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            <CurrencyDisplay amount={totalTaken} className="text-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Principal amount borrowed</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-border">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground uppercase">Total Lent Assets</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            <CurrencyDisplay amount={totalGiven} type="income" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Principal amount given</p>
                    </CardContent>
                </Card>
            </div>

            {/* Mobile View: Unified Stats & Toggle */}
            <div className="md:hidden space-y-6">
                {/* Unified Stats Row */}
                <div className="grid grid-cols-3 gap-2 text-center pb-2">
                    <div className="space-y-0.5">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Monthly Burn</p>
                        <p className="text-sm font-bold">
                            <CurrencyDisplay amount={monthlyBurn} type="expense" />
                        </p>
                    </div>
                    <div className="space-y-0.5 border-l border-border/50">
                        <p className="text-[10px] uppercase tracking-wider text-red-500 font-semibold">Total Liability</p>
                        <p className="text-sm font-bold">
                            <CurrencyDisplay amount={totalTaken} className="text-foreground" />
                        </p>
                    </div>
                    <div className="space-y-0.5 border-l border-border/50">
                        <p className="text-[10px] uppercase tracking-wider text-emerald-500 font-semibold">Total Assets</p>
                        <p className="text-sm font-bold">
                            <CurrencyDisplay amount={totalGiven} type="income" />
                        </p>
                    </div>
                </div>

                {/* Toggle Tabs (Pill Style) */}
                <div className="flex p-1 bg-muted/30 rounded-full w-full max-w-md mx-auto relative backdrop-blur-sm border border-white/5">
                    <button
                        onClick={() => setView('taken')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-full transition-all duration-300 relative z-10 ${view === 'taken'
                            ? 'bg-red-500/10 text-red-500 shadow-sm ring-1 ring-red-500/20'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <ArrowDownLeft className="h-4 w-4" /> Loans Taken
                    </button>
                    <button
                        onClick={() => setView('given')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-full transition-all duration-300 relative z-10 ${view === 'given'
                            ? 'bg-emerald-500/10 text-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <ArrowUpRight className="h-4 w-4" /> Loans Given
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Taken (Liabilities) */}
                <div className={`space-y-4 ${view === 'given' ? 'hidden md:block' : ''}`}>
                    <h2 className="text-xl font-semibold flex items-center gap-2 md:hidden"><ArrowDownLeft className="h-5 w-5 text-red-500" /> Loans Taken</h2>
                    <h2 className="text-xl font-semibold items-center gap-2 hidden md:flex"><ArrowDownLeft className="h-5 w-5 text-red-500" /> Loans Taken</h2>
                    {loans.filter(l => l.type === 'taken').map(loan => (
                        <Card
                            key={loan._id}
                            className="group hover:border-primary/50 transition-colors cursor-pointer relative"
                            onClick={(e) => {
                                // Prevent navigation if clicking buttons
                                if ((e.target as HTMLElement).closest('button')) return;
                                router.push(`/loans/${loan._id}`);
                            }}
                        >
                            <CardContent className="p-4 md:p-5">
                                <div className="flex justify-between items-start mb-3 md:mb-4">
                                    <div>
                                        <h3 className="font-bold text-base md:text-lg group-hover:text-primary transition-colors">{loan.name}</h3>
                                        <p className="text-xs md:text-sm text-muted-foreground">{loan.provider}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-base md:text-lg">
                                            <CurrencyDisplay amount={Math.round(loan.emiAmount)} type="expense" />
                                        </div>
                                        <div className="text-[10px] md:text-xs text-muted-foreground">Due: {loan.emiDate}th</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs md:text-sm mb-3 md:mb-4">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Landmark className="h-3 w-3 md:h-4 md:w-4" />
                                        <CurrencyDisplay amount={loan.principalAmount} className="text-muted-foreground" showSymbol={false} />
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground"><Percent className="h-3 w-3 md:h-4 md:w-4" /> {loan.interestRate}%</div>
                                </div>

                                {/* Active EMI Status */}
                                <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-border/50">
                                    <div className="text-[10px] md:text-xs">
                                        <span className="text-muted-foreground">Next: </span>
                                        <span className="font-medium text-foreground">
                                            {(() => {
                                                const next = loan.schedule.find((s: any) => s.status === 'pending');
                                                if (!next) return 'Completed';
                                                return `${new Date(next.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} (#${next.installmentNo})`;
                                            })()}
                                        </span>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 md:h-8 text-xs gap-1 md:gap-2 hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/50 z-10 relative"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            payEMI(loan);
                                        }}
                                        disabled={(() => {
                                            const next = loan.schedule.find((s: any) => s.status === 'pending');
                                            if (!next) return true;

                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            const dueDate = new Date(next.dueDate);
                                            dueDate.setHours(0, 0, 0, 0);

                                            // Active only if today is ON or AFTER due date
                                            return today < dueDate;
                                        })()}
                                    >
                                        <CheckCircle2 className="h-3 w-3" /> Pay
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {loans.filter(l => l.type === 'taken').length === 0 && <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg bg-muted/20">No active loans.</div>}
                </div>

                {/* Given (Assets) */}
                <div className={`space-y-4 ${view === 'taken' ? 'hidden md:block' : ''}`}>
                    <h2 className="text-xl font-semibold flex items-center gap-2 md:hidden"><ArrowUpRight className="h-5 w-5 text-emerald-500" /> Loans Given</h2>
                    <h2 className="text-xl font-semibold items-center gap-2 hidden md:flex"><ArrowUpRight className="h-5 w-5 text-emerald-500" /> Loans Given</h2>
                    {loans.filter(l => l.type === 'given').map(loan => (
                        <Card
                            key={loan._id}
                            className="group hover:border-primary/50 transition-colors cursor-pointer relative"
                            onClick={(e) => {
                                if ((e.target as HTMLElement).closest('button')) return;
                                router.push(`/loans/${loan._id}`);
                            }}
                        >
                            <CardContent className="p-4 md:p-5">
                                <div className="flex justify-between items-start mb-3 md:mb-4">
                                    <div>
                                        <h3 className="font-bold text-base md:text-lg group-hover:text-primary transition-colors">{loan.name}</h3>
                                        <p className="text-xs md:text-sm text-muted-foreground">To: {loan.provider}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-base md:text-lg">
                                            <CurrencyDisplay amount={Math.round(loan.emiAmount)} type="income" />
                                        </div>
                                        <div className="text-[10px] md:text-xs text-muted-foreground">Due: {loan.emiDate}th</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs md:text-sm mb-3 md:mb-4">
                                    <div className="flex items-center gap-2 text-muted-foreground"><Landmark className="h-3 w-3 md:h-4 md:w-4" /> <CurrencyDisplay amount={loan.principalAmount} className="text-muted-foreground" showSymbol={false} /></div>
                                    <div className="flex items-center gap-2 text-muted-foreground"><Percent className="h-3 w-3 md:h-4 md:w-4" /> {loan.interestRate}%</div>
                                </div>
                                <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-border/50">
                                    <div className="text-[10px] md:text-xs">
                                        <span className="text-muted-foreground">Next: </span>
                                        <span className="font-medium text-foreground">
                                            {(() => {
                                                const next = loan.schedule.find((s: any) => s.status === 'pending');
                                                if (!next) return 'Completed';
                                                const dateStr = new Date(next.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                                                return `${dateStr} (#${next.installmentNo})`;
                                            })()}
                                        </span>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 md:h-8 text-xs gap-1 md:gap-2 hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/50 z-10 relative"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            payEMI(loan);
                                        }}
                                        disabled={(() => {
                                            const next = loan.schedule.find((s: any) => s.status === 'pending');
                                            if (!next) return true;

                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            const dueDate = new Date(next.dueDate);
                                            dueDate.setHours(0, 0, 0, 0);

                                            return today < dueDate;
                                        })()}
                                    >
                                        <CheckCircle2 className="h-3 w-3" /> Receive
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {loans.filter(l => l.type === 'given').length === 0 && <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg bg-muted/20">No active given loans.</div>}
                </div>
            </div>

            <FloatingActionButton onClick={() => setIsAdding(true)} />

            {/* Add Loan Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <Card className="w-full max-w-2xl bg-background border-border shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <CardHeader className="bg-muted/30 pb-4 border-b border-border">
                            <CardTitle>Add New Loan / EMI</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="flex gap-4 p-1 bg-muted rounded-lg">
                                    <button type="button" onClick={() => setFormData({ ...formData, type: 'taken' })} className={`flex-1 py-2 rounded-md font-medium transition-all ${formData.type === 'taken' ? 'bg-background shadow text-red-500' : 'text-muted-foreground'}`}>Taken (Liability)</button>
                                    <button type="button" onClick={() => setFormData({ ...formData, type: 'given' })} className={`flex-1 py-2 rounded-md font-medium transition-all ${formData.type === 'given' ? 'bg-background shadow text-emerald-500' : 'text-muted-foreground'}`}>Given (Asset)</button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Loan Name</label>
                                        <Input required placeholder="e.g. Home Loan, iPhone EMI" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                    <div className="space-y-2 relative">
                                        <label className="text-sm font-medium">{formData.type === 'taken' ? 'Provider (Bank/Person)' : 'Borrower Name'}</label>
                                        <Input
                                            required
                                            placeholder="e.g. HDFC Bank, Roy"
                                            value={formData.provider}
                                            onChange={e => {
                                                setFormData({ ...formData, provider: e.target.value });
                                                setShowProviderDropdown(true);
                                            }}
                                            onFocus={() => setShowProviderDropdown(true)}
                                            onBlur={() => setTimeout(() => setShowProviderDropdown(false), 200)}
                                            autoComplete="off"
                                        />
                                        {showProviderDropdown && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-xl z-50 max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                                                {knownProviders.filter(p => !formData.provider || p.toLowerCase().includes(formData.provider.toLowerCase())).map(p => (
                                                    <div
                                                        key={p}
                                                        className="px-3 py-2 text-sm hover:bg-muted cursor-pointer"
                                                        onClick={() => {
                                                            setFormData({ ...formData, provider: p });
                                                            setShowProviderDropdown(false);
                                                        }}
                                                    >
                                                        {p}
                                                    </div>
                                                ))}
                                                {/* Allow custom entry always */}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Principal Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-muted-foreground z-10">₹</span>
                                            <Input
                                                required
                                                type="text"
                                                className="pl-7"
                                                placeholder="0.00"
                                                value={formattedPrincipal || formData.principalAmount}
                                                onChange={handlePrincipalChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Interest Rate (ROI %)</label>
                                        <Input required type="number" step="0.1" placeholder="e.g 8.5" value={formData.interestRate} onChange={e => setFormData({ ...formData, interestRate: e.target.value })} />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Tenure (Months)</label>
                                        <Input required type="number" placeholder="e.g 12, 240" value={formData.tenureMonths} onChange={e => setFormData({ ...formData, tenureMonths: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Start Date</label>
                                        <Input required type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">EMI Due Day</label>
                                        <Input required type="number" min={1} max={31} placeholder="e.g 5" value={formData.emiDate} onChange={e => setFormData({ ...formData, emiDate: e.target.value })} />
                                        <p className="text-xs text-muted-foreground">Day of month when EMI is deducted.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Linked Account (Optional)</label>
                                        <Select
                                            value={formData.linkedAccountId}
                                            onChange={(val) => setFormData({ ...formData, linkedAccountId: val })}
                                            options={[
                                                { label: '-- No Auto-Link --', value: '' },
                                                ...accounts.map(acc => ({ label: `${acc.name} (${acc.type})`, value: acc._id }))
                                            ]}
                                        />
                                        <p className="text-xs text-muted-foreground">Select where EMI is paid from / received to.</p>
                                    </div>
                                </div>

                                {/* Preview */}
                                <div className="p-4 bg-muted/40 rounded-lg border border-border/50">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-muted-foreground">Estimated Monthly EMI</span>
                                        <span className="text-xl font-bold">₹{Math.round(previewEMI).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2 text-sm">
                                        <span className="text-muted-foreground">Total Payment</span>
                                        <span>₹{Math.round(previewEMI * (parseFloat(formData.tenureMonths) || 0)).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                                    <Button type="submit" disabled={!previewEMI}>Create Loan</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

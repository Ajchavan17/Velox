"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo, Suspense } from "react";
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Plus, Loader2, ArrowUpRight, ArrowDownLeft, Search, ChevronDown, UserPlus, History, WalletCards, ArrowDownCircle, ArrowUpCircle, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "react-hot-toast";
import { SwipeableCard } from "@/components/ui/SwipeableCard";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { DateFilter } from "@/components/dashboard/DateFilter";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";

interface Debt {
    _id: string;
    type: 'borrow' | 'lend';
    personName: string;
    amount: number;
    repaidAmount: number;
    accountId: string;
    date: string;
    description?: string;
    status: 'pending' | 'settled' | 'partial';
}

interface PersonSummary {
    name: string;
    totalBorrowed: number;
    totalLent: number;
    totalRepaidByMe: number; // Settlement for borrow
    totalRepaidToMe: number; // Settlement for lend
    netAmount: number; // Positive = Asset (Owed to Me), Negative = Liability (I Owe)
}

interface AccountOption {
    _id: string;
    name: string;
    type: 'bank' | 'card';
}

function DebtsContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [debts, setDebts] = useState<Debt[]>([]);
    const [accounts, setAccounts] = useState<AccountOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Mobile View State
    const [activeTab, setActiveTab] = useState<'borrow' | 'lend'>('borrow'); // 'borrow' = Liability (I Owe), 'lend' = Asset (Owed to Me)
    const [openSwipeId, setOpenSwipeId] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<{ start: string, end: string } | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        type: 'borrow' as 'borrow' | 'lend',
        personName: '',
        amount: '',
        accountId: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
    });

    // Derived People List for Combobox
    const knownPeople = useMemo(() => {
        const names = new Set(debts.map(d => d.personName));
        return Array.from(names).sort();
    }, [debts]);
    const [personSearch, setPersonSearch] = useState('');
    const [showPersonDropdown, setShowPersonDropdown] = useState(false);

    useEffect(() => {
        if (status === 'authenticated' && dateRange) {
            fetchDebts();
            fetchAccountsData();
        }
    }, [status, dateRange]);

    // Handle Quick Action param
    useEffect(() => {
        if (searchParams?.get('new') === 'true') {
            setIsAdding(true);
            // Clean URL
            const params = new URLSearchParams(searchParams.toString());
            params.delete('new');
            router.replace(`/debts?${params.toString()}`, { scroll: false });
        }
    }, [searchParams]);

    const fetchDebts = async () => {
        setIsLoading(true);
        try {
            const query = new URLSearchParams();
            if (dateRange) {
                query.append('startDate', dateRange.start);
                query.append('endDate', dateRange.end);
            }
            const res = await fetch(`/api/debts?${query.toString()}`);
            if (res.ok) setDebts(await res.json());
        } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };

    const fetchAccountsData = async () => {
        try {
            const [banksRes, cardsRes] = await Promise.all([fetch('/api/accounts'), fetch('/api/cards')]);
            let allAccs: AccountOption[] = [];
            if (banksRes.ok) {
                const b = await banksRes.json();
                allAccs.push(...b.map((i: any) => ({ _id: i._id, name: i.accountName, type: 'bank' })));
            }
            if (cardsRes.ok) {
                const c = await cardsRes.json();
                allAccs.push(...c.map((i: any) => ({ _id: i._id, name: i.cardName, type: 'card' })));
            }
            setAccounts(allAccs);
        } catch (e) { console.error(e); }
    };

    // Aggregation Logic
    const personSummaries: PersonSummary[] = useMemo(() => {
        const map = new Map<string, PersonSummary>();

        debts.forEach(d => {
            if (!map.has(d.personName)) {
                map.set(d.personName, { name: d.personName, totalBorrowed: 0, totalLent: 0, totalRepaidByMe: 0, totalRepaidToMe: 0, netAmount: 0 });
            }
            const p = map.get(d.personName)!;

            if (d.type === 'borrow') {
                p.totalBorrowed += d.amount;
                p.totalRepaidByMe += (d.repaidAmount || 0); // Amount I paid back
            } else {
                p.totalLent += d.amount;
                p.totalRepaidToMe += (d.repaidAmount || 0); // Amount received back
            }
        });

        // Calculate Net
        // Net = (Lent - RepaidToMe) - (Borrowed - RepaidByMe)
        // Positive = They Owe Me. Negative = I Owe Them.
        Array.from(map.values()).forEach(p => {
            const outstandingLent = p.totalLent - p.totalRepaidToMe;
            const outstandingBorrowed = p.totalBorrowed - p.totalRepaidByMe;
            p.netAmount = Math.round((outstandingLent - outstandingBorrowed) * 100) / 100;
        });

        return Array.from(map.values());
    }, [debts]);

    const assets = personSummaries.filter(p => p.netAmount > 0);
    const liabilities = personSummaries.filter(p => p.netAmount < 0);
    const settled = personSummaries.filter(p => p.netAmount === 0);

    const totalAssetVal = assets.reduce((sum, p) => sum + p.netAmount, 0);
    const totalLiabilityVal = liabilities.reduce((sum, p) => sum + Math.abs(p.netAmount), 0);
    const netPosition = totalAssetVal - totalLiabilityVal;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/debts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                toast.success("Record added successfully");
                fetchDebts();
                setIsAdding(false);
                setFormData({ type: 'borrow', personName: '', amount: '', accountId: '', date: new Date().toISOString().split('T')[0], description: '' });
                setPersonSearch('');
            } else {
                toast.error("Failed to add record");
            }
        } catch (e) {
            console.error(e);
            toast.error("An error occurred");
        }
    };

    if (status === 'loading') return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    if (!session) return <div className="flex h-screen items-center justify-center">Please log in.</div>;

    return (
        <div className="container mx-auto py-8 px-4 md:px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Summary */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-row flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent w-fit">Debt/Lent</h1>
                        <p className="text-muted-foreground mt-1 hidden md:block">Manage your debts and loans efficiently.</p>
                        <p className="text-muted-foreground mt-1 md:hidden text-xs">Manage debts & loans</p>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                        <Link href="/debts/history">
                            <Button variant="ghost" size="icon" title="View History" className="shrink-0 h-9 w-9">
                                <History className="h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/debts/manage">
                            <Button variant="ghost" size="icon" title="Manage Settlements" className="shrink-0 h-9 w-9">
                                <WalletCards className="h-5 w-5" />
                            </Button>
                        </Link>
                        <DateFilter onFilterChange={setDateRange} className="w-24 md:w-36 shrink-0" defaultFilter="all-time" />
                        <Button onClick={() => setIsAdding(true)} className="hidden md:flex flex-1 md:flex-none shadow-lg shadow-primary/20 whitespace-nowrap">
                            <Plus className="h-4 w-4 mr-2" /> Add Record
                        </Button>
                    </div>
                </div>

                <Card className="bg-card/50 backdrop-blur-sm border-border hidden md:block">
                    <CardContent className="p-6 flex flex-col md:flex-row items-center justify-around gap-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Net Position</p>
                            <p className="text-3xl font-bold mt-1">
                                <CurrencyDisplay amount={netPosition} type={netPosition > 0 ? 'income' : netPosition < 0 ? 'expense' : 'neutral'} />
                            </p>
                        </div>
                        <div className="h-px md:h-12 w-full md:w-px bg-border/50" />
                        <div className="text-center">
                            <p className="text-sm font-medium text-red-500/80 uppercase tracking-wider">You Owe</p>
                            <p className="text-2xl font-bold mt-1">
                                <CurrencyDisplay amount={totalLiabilityVal} type="expense" />
                            </p>
                        </div>
                        <div className="h-px md:h-12 w-full md:w-px bg-border/50" />
                        <div className="text-center">
                            <p className="text-sm font-medium text-emerald-500/80 uppercase tracking-wider">Owed to You</p>
                            <p className="text-2xl font-bold mt-1">
                                <CurrencyDisplay amount={totalAssetVal} type="income" />
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- MOBILE VIEW (Tabs + List) --- */}
            <div className="md:hidden space-y-6">
                {/* Compact Summary (Mobile) */}
                <div className="grid grid-cols-3 gap-2 text-center pb-2">
                    <div className="space-y-0.5">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Net Position</p>
                        <p className="text-sm font-bold">
                            <CurrencyDisplay amount={netPosition} type={netPosition > 0 ? 'income' : netPosition < 0 ? 'expense' : 'neutral'} />
                        </p>
                    </div>
                    <div className="space-y-0.5 border-l border-border/50">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">You Owe</p>
                        <p className="text-sm font-bold">
                            <CurrencyDisplay amount={totalLiabilityVal} type="expense" />
                        </p>
                    </div>
                    <div className="space-y-0.5 border-l border-border/50">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Owed to Me</p>
                        <p className="text-sm font-bold">
                            <CurrencyDisplay amount={totalAssetVal} type="income" />
                        </p>
                    </div>
                </div>

                {/* Toggle Tabs */}
                <div className="flex p-1 bg-muted/30 rounded-full w-full max-w-md mx-auto relative backdrop-blur-sm border border-white/5">
                    <button
                        onClick={() => setActiveTab('borrow')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-full transition-all duration-300 relative z-10 ${activeTab === 'borrow'
                            ? 'bg-red-500/10 text-red-500 shadow-sm ring-1 ring-red-500/20'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <ArrowDownLeft className="h-4 w-4" /> I Owe
                    </button>
                    <button
                        onClick={() => setActiveTab('lend')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-full transition-all duration-300 relative z-10 ${activeTab === 'lend'
                            ? 'bg-emerald-500/10 text-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <ArrowUpRight className="h-4 w-4" /> Owed to Me
                    </button>
                </div>



                {/* List */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-sm font-medium text-muted-foreground">People List</h3>
                        <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-full">{(activeTab === 'lend' ? assets : liabilities).length} people</span>
                    </div>

                    {(activeTab === 'lend' ? assets : liabilities).length === 0 ? (
                        <div className="text-center py-12 border rounded-xl border-dashed bg-muted/20 text-muted-foreground">
                            No active {activeTab === 'lend' ? 'loans given' : 'debts'} found.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {(activeTab === 'lend' ? assets : liabilities).map((p) => (
                                <SwipeableCard
                                    key={p.name}
                                    id={p.name}
                                    openId={openSwipeId}
                                    onSwipeOpen={setOpenSwipeId}
                                    onEdit={() => router.push(`/debts/${encodeURIComponent(p.name)}`)}
                                    onDelete={() => toast("Please settle balance to remove.")}
                                    className="rounded-xl"
                                >
                                    <Card
                                        onClick={() => router.push(`/debts/${encodeURIComponent(p.name)}`)}
                                        className="group relative overflow-hidden border-l-4 transition-all duration-300 hover:shadow-md hover:translate-x-1 active:scale-[0.99] rounded-xl cursor-pointer"
                                        style={{ borderLeftColor: activeTab === 'lend' ? '#10b981' : '#ef4444' }}
                                    >
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg ${activeTab === 'lend' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                    {p.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{p.name}</p>
                                                    <p className="text-xs text-muted-foreground">Tap for details</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-lg">
                                                    <CurrencyDisplay amount={p.netAmount} type={activeTab === 'lend' ? 'income' : 'expense'} />
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </SwipeableCard>
                            ))}
                        </div>
                    )}
                </div>

                {/* Floating Add Button */}
                <FloatingActionButton onClick={() => setIsAdding(true)} />
            </div>

            {/* Split View (Desktop) */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Liabilities Column */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2"><ArrowDownLeft className="h-5 w-5" /> People I Owe</h2>
                    {liabilities.length === 0 && <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground text-sm">You are debt free!</div>}
                    {liabilities.map(p => (
                        <div
                            key={p.name}
                            onClick={() => router.push(`/debts/${encodeURIComponent(p.name)}`)}
                            className="bg-card hover:bg-muted/40 border border-border rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-lg">
                                    {p.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold group-hover:text-primary transition-colors">{p.name}</p>
                                    <p className="text-xs text-muted-foreground">Click for details</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold">
                                    <CurrencyDisplay amount={p.netAmount} type="expense" />
                                </p>
                                <p className="text-xs text-red-600/70">Liability</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Assets Column */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-emerald-600 flex items-center gap-2"><ArrowUpRight className="h-5 w-5" /> People Who Owe Me</h2>
                    {assets.length === 0 && <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground text-sm">No active loans given.</div>}
                    {assets.map(p => (
                        <div
                            key={p.name}
                            onClick={() => router.push(`/debts/${encodeURIComponent(p.name)}`)}
                            className="bg-card hover:bg-muted/40 border border-border rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">
                                    {p.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold group-hover:text-primary transition-colors">{p.name}</p>
                                    <p className="text-xs text-muted-foreground">Click for details</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold">
                                    <CurrencyDisplay amount={p.netAmount} type="income" />
                                </p>
                                <p className="text-xs text-emerald-600/70">Asset</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Record Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
                    <Card className="w-full max-w-lg bg-background border-border shadow-2xl overflow-hidden">
                        <CardHeader className={`${formData.type === 'borrow' ? 'bg-red-500/10' : 'bg-emerald-500/10'} pb-6 border-b border-border/50`}>
                            <CardTitle className="flex justify-between items-center">
                                <span>Add New Record</span>
                                <button onClick={() => setIsAdding(false)}><Search className="h-0 w-0 hidden" /> <span className="text-2xl text-muted-foreground hover:text-foreground">&times;</span></button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Type Switch */}
                                <div className="flex p-1 bg-muted rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'borrow' })}
                                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${formData.type === 'borrow' ? 'bg-red-500 text-white shadow' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        I am Borrowing (Receive)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'lend' })}
                                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${formData.type === 'lend' ? 'bg-emerald-500 text-white shadow' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        I am Lending (Give)
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Person (Combobox) */}
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-sm font-medium">Person Name</label>
                                        <div className="relative">
                                            <Input
                                                type="text"
                                                required
                                                className="pl-3 pr-10 w-full min-w-0"
                                                placeholder="Select or Type Name"
                                                value={formData.personName}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, personName: e.target.value });
                                                    setPersonSearch(e.target.value);
                                                    setShowPersonDropdown(true);
                                                }}
                                                onClick={() => setShowPersonDropdown(true)}
                                                onFocus={() => setShowPersonDropdown(true)}
                                                onBlur={() => setTimeout(() => setShowPersonDropdown(false), 200)}
                                                autoComplete="off"
                                            />
                                            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />

                                            {showPersonDropdown && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-xl z-50 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                                                    {knownPeople.filter(n => !personSearch || n.toLowerCase().includes(personSearch.toLowerCase())).map(name => (
                                                        <div
                                                            key={name}
                                                            className="px-3 py-2 text-sm hover:bg-muted cursor-pointer flex items-center justify-between"
                                                            onClick={() => {
                                                                setFormData({ ...formData, personName: name });
                                                                setPersonSearch(name);
                                                                setShowPersonDropdown(false);
                                                            }}
                                                        >
                                                            {name}
                                                        </div>
                                                    ))}
                                                    {personSearch && !knownPeople.some(n => n.toLowerCase() === personSearch.toLowerCase()) && (
                                                        <div
                                                            className="px-3 py-2 text-sm text-primary font-medium border-t border-border/50 bg-primary/5 cursor-pointer flex items-center gap-2"
                                                            onClick={() => {
                                                                setShowPersonDropdown(false);
                                                            }}
                                                        >
                                                            <span className="font-bold">Add "{personSearch}"</span>
                                                        </div>
                                                    )}
                                                    {knownPeople.length === 0 && !personSearch && (
                                                        <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                                                            No people yet. Type to add.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-muted-foreground z-10">₹</span>
                                            <Input type="number" required className="pl-7" placeholder="0.00" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Date</label>
                                        <Input type="date" required className="text-xs sm:text-sm" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                    </div>

                                    {/* Account */}
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-sm font-medium">Affected Account</label>
                                        <Select
                                            value={formData.accountId}
                                            onChange={(val) => setFormData({ ...formData, accountId: val })}
                                            options={[
                                                { label: 'Select Bank / Wallet / Cash', value: '' },
                                                ...accounts.map(acc => ({ label: acc.name, value: acc._id }))
                                            ]}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {formData.type === 'borrow' ? 'Money will be ADDED to this account.' : 'Money will be DEDUCTED from this account.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                                    <Button variant="ghost" type="button" onClick={() => setIsAdding(false)}>Cancel</Button>
                                    <Button type="submit" className={formData.type === 'borrow' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}>Save Record</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default function DebtsPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <DebtsContent />
        </Suspense>
    );
}

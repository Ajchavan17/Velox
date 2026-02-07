"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Loader2, ArrowLeft, ArrowUpCircle, ArrowDownCircle, Trash2, Edit2, CheckCircle2, History, Wallet } from "lucide-react";
import { toast } from "react-hot-toast";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { SwipeableCard } from "@/components/ui/SwipeableCard";
import { useOfflineData } from "@/hooks/useOfflineData";
import { format } from "date-fns";

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

interface AccountOption {
    _id: string;
    name: string;
    type: 'bank' | 'card';
}

export default function PersonDetailView() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const personName = decodeURIComponent(params.name as string);

    const [accounts, setAccounts] = useState<AccountOption[]>([]);

    // Modal States
    const [settleItem, setSettleItem] = useState<Debt | null>(null);
    const [editItem, setEditItem] = useState<Debt | null>(null);
    const [totalSettleModal, setTotalSettleModal] = useState(false);
    const [openSwipeId, setOpenSwipeId] = useState<string | null>(null);

    // Settlement Form
    const [settleData, setSettleData] = useState({ amount: '', date: new Date().toISOString().split('T')[0], accountId: '' });

    // Edit Form
    const [editData, setEditData] = useState({ amount: '', date: '', description: '', personName: '' });

    // Offline Hook
    const { data: allDebts = [], isLoading: isDebtsLoading, refresh: refreshDebts } = useOfflineData<Debt[]>({
        key: 'VELOX_DEBTS_ALL',
        fetcher: async () => {
            const res = await fetch('/api/debts');
            if (!res.ok) throw new Error('Failed to fetch debts');
            return res.json();
        }
    });

    const debts = useMemo(() => allDebts.filter(d => d.personName === personName), [allDebts, personName]);
    const isLoading = isDebtsLoading;

    useEffect(() => {
        if (status === 'authenticated') {
            fetchAccountsData();
        }
    }, [status]);

    // fetchDebts removed (handled by hook)

    const fetchAccountsData = async () => {
        try {
            const [banksRes, cardsRes] = await Promise.all([fetch('/api/accounts'), fetch('/api/cards')]);
            let allAccs: AccountOption[] = [];
            if (banksRes.ok) allAccs.push(...(await banksRes.json()).map((i: any) => ({ _id: i._id, name: i.accountName, type: 'bank' })));
            if (cardsRes.ok) allAccs.push(...(await cardsRes.json()).map((i: any) => ({ _id: i._id, name: i.cardName, type: 'card' })));
            setAccounts(allAccs);
        } catch (e) { console.error(e); }
    };

    // Calculations
    const totalBorrowed = debts.filter(d => d.type === 'borrow').reduce((sum, d) => sum + d.amount, 0);
    const totalRepaidByMe = debts.filter(d => d.type === 'borrow').reduce((sum, d) => sum + (d.repaidAmount || 0), 0);

    const totalLent = debts.filter(d => d.type === 'lend').reduce((sum, d) => sum + d.amount, 0);
    const totalRepaidToMe = debts.filter(d => d.type === 'lend').reduce((sum, d) => sum + (d.repaidAmount || 0), 0);

    const outstandingBorrowed = totalBorrowed - totalRepaidByMe;
    const outstandingLent = totalLent - totalRepaidToMe;
    const netOutstanding = outstandingLent - outstandingBorrowed;

    // Actions
    const handleSettleSubmit = async () => {
        if (!settleItem) return;
        if (!settleData.accountId) {
            toast.error("Please select an account");
            return;
        }
        try {
            const res = await fetch(`/api/debts/${settleItem._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'settle', ...settleData }),
            });
            if (res.ok) {
                toast.success("Settled successfully");
                toast.success("Settled successfully");
                refreshDebts();
                setSettleItem(null);
            } else {
                toast.error("Failed to settle");
            }
        } catch (e) {
            console.error(e);
            toast.error("An error occurred");
        }
    };

    const handleEditSubmit = async () => {
        if (!editItem) return;
        try {
            const res = await fetch(`/api/debts/${editItem._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'edit', ...editData }),
            });
            if (res.ok) { refreshDebts(); setEditItem(null); }
        } catch (e) { console.error(e); }
    };

    const handleTotalSettleSubmit = async () => {
        try {
            const res = await fetch('/api/debts/settle-all', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    personName,
                    accountId: settleData.accountId,
                    date: settleData.date
                }),
            });
            if (res.ok) {
                refreshDebts();
                setTotalSettleModal(false);
            }
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This will revert the balance impact on the original account.')) return;
        try {
            const res = await fetch(`/api/debts/${id}`, { method: 'DELETE' });
            if (res.ok) refreshDebts();
        } catch (e) { console.error(e); }
    };

    if (status === 'loading') return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="container mx-auto py-4 md:py-8 px-4 md:px-6 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Button variant="ghost" className="w-fit -ml-2 text-muted-foreground" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <div className="border-b border-border/40 pb-6">
                    {/* MOBILE LAYOUT (Grid) */}
                    <div className="grid grid-cols-2 gap-4 md:hidden">
                        {/* Left Col: Name & Badge */}
                        <div className="flex flex-col justify-start gap-1">
                            <h1 className="text-xl font-bold tracking-tight">{personName}</h1>
                            <div className="flex items-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${netOutstanding >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                    {netOutstanding >= 0 ? 'Asset (Owes You)' : 'Liability (You Owe)'}
                                </span>
                            </div>
                        </div>

                        {/* Right Col: Net Amount & Actions */}
                        <div className="flex flex-col items-end justify-start gap-1">
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Net Outstanding</p>
                            <p className="text-xl font-bold">
                                <CurrencyDisplay amount={netOutstanding} type={netOutstanding >= 0 ? 'income' : 'expense'} showSymbol={true} />
                            </p>
                            {Math.abs(netOutstanding) > 0 && (
                                <Button
                                    size="sm"
                                    className={`mt-1 h-7 text-xs ${netOutstanding < 0 ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                                    onClick={() => setTotalSettleModal(true)}
                                >
                                    Settle All <CheckCircle2 className="h-3 w-3 ml-1" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* DESKTOP LAYOUT (Flex) - Restored */}
                    <div className="hidden md:flex items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{personName}</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${netOutstanding >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                    {netOutstanding >= 0 ? 'Asset (Owes You)' : 'Liability (You Owe)'}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Net Outstanding</p>
                            <p className="text-4xl font-bold mt-1">
                                <CurrencyDisplay amount={netOutstanding} type={netOutstanding >= 0 ? 'income' : 'expense'} showSymbol={true} />
                            </p>
                            {Math.abs(netOutstanding) > 0 && (
                                <Button
                                    size="sm"
                                    className={`mt-2 ${netOutstanding < 0 ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                                    onClick={() => setTotalSettleModal(true)}
                                >
                                    Settle All <CheckCircle2 className="h-4 w-4 ml-1" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            {/* Stats */}
            <Card className="bg-card/50 backdrop-blur-sm border-border">
                <CardContent className="p-4 md:p-6 grid grid-cols-4 gap-2 md:gap-4 items-center justify-around relative">
                    {/* Total Borrowed */}
                    <div className="text-center relative border-r border-border/50 md:border-none pr-1 md:pr-0">
                        <p className="text-[9px] md:text-sm font-medium text-red-500/80 uppercase tracking-wider truncate">Borrowed</p>
                        <p className="text-sm md:text-2xl font-bold mt-1">
                            <CurrencyDisplay amount={totalBorrowed} showSymbol={true} type="expense" />
                        </p>
                    </div>

                    {/* Repaid by Me */}
                    <div className="text-center relative border-r border-border/50 md:border-none pr-1 md:pr-0">
                        <p className="text-[9px] md:text-sm font-medium text-red-500/60 uppercase tracking-wider truncate">Pd (Me)</p>
                        <p className="text-sm md:text-2xl font-bold mt-1 opacity-80">
                            <CurrencyDisplay amount={totalRepaidByMe} showSymbol={true} type="expense" />
                        </p>
                    </div>

                    {/* Divider for Desktop (Center) - Hidden on Mobile */}
                    <div className="hidden md:block absolute left-1/2 top-1/2 -translate-y-1/2 h-12 w-px bg-border/50" />


                    {/* Total Lent */}
                    <div className="text-center relative border-r border-border/50 md:border-none pr-1 md:pr-0">
                        <p className="text-[9px] md:text-sm font-medium text-emerald-500/80 uppercase tracking-wider truncate">Lent</p>
                        <p className="text-sm md:text-2xl font-bold mt-1">
                            <CurrencyDisplay amount={totalLent} showSymbol={true} type="income" />
                        </p>
                    </div>

                    {/* Repaid to Me */}
                    <div className="text-center">
                        <p className="text-[9px] md:text-sm font-medium text-emerald-500/60 uppercase tracking-wider truncate">Pd (You)</p>
                        <p className="text-sm md:text-2xl font-bold mt-1 opacity-80">
                            <CurrencyDisplay amount={totalRepaidToMe} showSymbol={true} type="income" />
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* History List */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <History className="h-4 w-4" /> Recent Activity
                    </h2>
                    <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-full">{debts.length} records</span>
                </div>

                {debts.length === 0 && <div className="text-center py-10 text-muted-foreground">No records found.</div>}

                {debts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(debt => (
                    <SwipeableCard
                        key={debt._id}
                        id={debt._id}
                        openId={openSwipeId}
                        onSwipeOpen={setOpenSwipeId}
                        onEdit={() => {
                            setEditItem(debt);
                            setEditData({ amount: String(debt.amount), date: debt.date ? new Date(debt.date).toISOString().split('T')[0] : '', description: debt.description || '', personName: debt.personName });
                        }}
                        onDelete={() => handleDelete(debt._id)}
                        onSettle={debt.status !== 'settled' ? () => {
                            setSettleItem(debt);
                            setSettleData({ amount: String((debt.amount - (debt.repaidAmount || 0))), date: new Date().toISOString().split('T')[0], accountId: debt.accountId });
                        } : undefined}
                        className="rounded-xl group"
                    >
                        <div
                            className="flex items-center justify-between p-4 bg-background/60 backdrop-blur-md border border-border/40 rounded-xl transition-all duration-300 hover:shadow-md cursor-pointer border-l-4 relative overflow-hidden"
                            style={{ borderLeftColor: debt.type === 'borrow' ? '#ef4444' : '#10b981' }}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`shrink-0 ${debt.type === 'borrow' ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {debt.type === 'borrow' ? <ArrowDownCircle className="h-8 w-8" /> : <ArrowUpCircle className="h-8 w-8" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-sm md:text-base leading-none mb-1">
                                            {debt.type === 'borrow' ? 'Borrowed' : 'Lent'}
                                            {debt.description ? ` - ${debt.description}` : ''}
                                        </p>
                                        {debt.status === 'settled' && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate max-w-[120px] md:max-w-xs flex items-center gap-1">
                                        <Wallet className="h-3 w-3" />
                                        {accounts.find(a => a._id === debt.accountId)?.name || 'Unknown Account'}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right transition-transform duration-300 group-hover:-translate-x-32 md:group-hover:-translate-x-40">
                                <p className="font-bold text-sm md:text-base">
                                    <CurrencyDisplay amount={debt.amount} type={debt.type === 'borrow' ? 'expense' : 'income'} />
                                </p>
                                {(debt.repaidAmount || 0) > 0 && (
                                    <p className="text-[10px] text-muted-foreground">
                                        Settled: <CurrencyDisplay amount={debt.repaidAmount} showSymbol={true} type="neutral" />
                                    </p>
                                )}
                                <p className="text-[10px] md:text-xs text-muted-foreground">
                                    {format(new Date(debt.date), 'MMM d, yy')}
                                </p>
                            </div>

                            {/* Desktop Hover Actions */}
                            <div className="hidden md:flex items-center gap-1 absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                {debt.status !== 'settled' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-xs bg-primary/10 hover:bg-primary/20 dark:hover:text-white mr-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSettleItem(debt);
                                            setSettleData({ amount: String((debt.amount - (debt.repaidAmount || 0))), date: new Date().toISOString().split('T')[0], accountId: debt.accountId });
                                        }}
                                    >
                                        Settle
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditItem(debt);
                                        setEditData({ amount: String(debt.amount), date: debt.date ? new Date(debt.date).toISOString().split('T')[0] : '', description: debt.description || '', personName: debt.personName });
                                    }}
                                >
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(debt._id);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </SwipeableCard>
                ))}
            </div>

            {/* Settle Modal */}
            {settleItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md bg-background border-border shadow-xl">
                        <CardHeader><CardTitle>Settle Debt</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Mark payment for: <b>{settleItem.type === 'borrow' ? 'You paying back' : 'You receiving back'}</b>
                            </p>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Amount to Settle</label>
                                    <Input type="number" value={settleData.amount} onChange={e => setSettleData({ ...settleData, amount: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Date</label>
                                    <Input type="date" value={settleData.date} onChange={e => setSettleData({ ...settleData, date: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Source Account</label>
                                    <Select
                                        value={settleData.accountId}
                                        onChange={(val) => setSettleData({ ...settleData, accountId: val })}
                                        options={[
                                            { label: 'Select Account', value: '' },
                                            ...accounts.map(a => ({ label: a.name, value: a._id }))
                                        ]}
                                    />
                                    <p className="text-xs text-muted-foreground">This account balance will be updated.</p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="ghost" onClick={() => setSettleItem(null)}>Cancel</Button>
                                <Button onClick={handleSettleSubmit}>Confirm</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Edit Modal */}
            {editItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md bg-background border-border shadow-xl">
                        <CardHeader><CardTitle>Edit Record</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Person Name</label>
                                <Input type="text" value={editData.personName} onChange={e => setEditData({ ...editData, personName: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Amount</label>
                                <Input type="number" value={editData.amount} onChange={e => setEditData({ ...editData, amount: e.target.value })} />
                                <p className="text-xs text-yellow-600">Warning: Changing amount updates your account balance by the difference.</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Date</label>
                                <Input type="date" value={editData.date} onChange={e => setEditData({ ...editData, date: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="ghost" onClick={() => setEditItem(null)}>Cancel</Button>
                                <Button onClick={handleEditSubmit}>Save Changes</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
            {/* Total Settle Modal */}
            {totalSettleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md bg-background border-border shadow-xl">
                        <CardHeader><CardTitle>Settle All Outstanding</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                This will settle all open records with <b>{personName}</b>.
                            </p>
                            <div className="p-3 bg-muted rounded-md flex justify-between items-center">
                                <span className="text-sm font-medium">Net Pending Amount</span>
                                <span className="font-bold text-lg">₹{Math.abs(netOutstanding).toLocaleString()}</span>
                            </div>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Date</label>
                                    <Input type="date" value={settleData.date} onChange={e => setSettleData({ ...settleData, date: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Source Account</label>
                                    <Select
                                        value={settleData.accountId}
                                        onChange={(val) => setSettleData({ ...settleData, accountId: val })}
                                        options={[
                                            { label: 'Select Account', value: '' },
                                            ...accounts.map(a => ({ label: a.name, value: a._id }))
                                        ]}
                                    />
                                    <p className="text-xs text-muted-foreground">This account balance will be updated by the Net Amount.</p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="ghost" onClick={() => setTotalSettleModal(false)}>Cancel</Button>
                                <Button onClick={handleTotalSettleSubmit}>Confirm Settlement</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

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

    const [debts, setDebts] = useState<Debt[]>([]);
    const [accounts, setAccounts] = useState<AccountOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal States
    const [settleItem, setSettleItem] = useState<Debt | null>(null);
    const [editItem, setEditItem] = useState<Debt | null>(null);
    const [totalSettleModal, setTotalSettleModal] = useState(false);

    // Settlement Form
    const [settleData, setSettleData] = useState({ amount: '', date: new Date().toISOString().split('T')[0], accountId: '' });

    // Edit Form
    const [editData, setEditData] = useState({ amount: '', date: '', description: '', personName: '' });

    useEffect(() => {
        if (status === 'authenticated') {
            fetchDebts();
            fetchAccountsData();
        }
    }, [status]);

    const fetchDebts = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/debts');
            if (res.ok) {
                const all = await res.json();
                setDebts(all.filter((d: Debt) => d.personName === personName));
            }
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

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
                fetchDebts();
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
            if (res.ok) { fetchDebts(); setEditItem(null); }
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
                fetchDebts();
                setTotalSettleModal(false);
            }
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This will revert the balance impact on the original account.')) return;
        try {
            const res = await fetch(`/api/debts/${id}`, { method: 'DELETE' });
            if (res.ok) fetchDebts();
        } catch (e) { console.error(e); }
    };

    if (status === 'loading') return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="container mx-auto py-8 px-4 md:px-6 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Button variant="ghost" className="w-fit -ml-2 text-muted-foreground" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border/40 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{personName}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${netOutstanding >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {netOutstanding >= 0 ? 'Asset (Owes You)' : 'Liability (You Owe)'}
                            </span>
                        </div>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Net Outstanding</p>
                        <p className={`text-4xl font-bold mt-1 ${netOutstanding >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {netOutstanding >= 0 ? '+' : '-'}₹{Math.abs(netOutstanding).toLocaleString()}
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

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                    <p className="text-xs text-red-600/70 uppercase font-semibold">Total Borrowed</p>
                    <p className="text-xl font-bold text-red-700">₹{totalBorrowed.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 opacity-70">
                    <p className="text-xs text-red-600/70 uppercase font-semibold">Repaid by Me</p>
                    <p className="text-xl font-bold text-red-700">₹{totalRepaidByMe.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <p className="text-xs text-emerald-600/70 uppercase font-semibold">Total Lent</p>
                    <p className="text-xl font-bold text-emerald-700">₹{totalLent.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 opacity-70">
                    <p className="text-xs text-emerald-600/70 uppercase font-semibold">Repaid to Me</p>
                    <p className="text-xl font-bold text-emerald-700">₹{totalRepaidToMe.toLocaleString()}</p>
                </div>
            </div>

            {/* History List */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><History className="h-5 w-5" /> Transaction History</h2>
                {debts.length === 0 && <div className="text-center py-10 text-muted-foreground">No records found.</div>}

                {debts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(debt => (
                    <Card key={debt._id} className={`group overflow-hidden transition-all hover:shadow-md ${debt.status === 'settled' ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                        <CardContent className="p-0 flex flex-col sm:flex-row">
                            {/* Status Strip */}
                            <div className={`w-full sm:w-2 h-2 sm:h-auto ${debt.type === 'borrow' ? 'bg-red-500' : 'bg-emerald-500'}`} />

                            <div className="p-4 flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                {/* Icon */}
                                <div className={`p-3 rounded-full shrink-0 ${debt.type === 'borrow' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                    {debt.type === 'borrow' ? <ArrowDownCircle className="h-6 w-6" /> : <ArrowUpCircle className="h-6 w-6" />}
                                </div>

                                {/* Main Info */}
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-lg">{debt.type === 'borrow' ? 'Borrowed' : 'Lent'}</span>
                                        {debt.status === 'settled' && <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> SETTLED</span>}
                                        {debt.status === 'partial' && <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">PARTIAL</span>}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{new Date(debt.date).toLocaleDateString()} • {debt.description || 'No description'}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Wallet className="h-3 w-3" /> {accounts.find(a => a._id === debt.accountId)?.name || 'Unknown Account'}</p>
                                </div>

                                {/* Amounts */}
                                <div className="text-right shrink-0">
                                    <p className={`text-xl font-bold ${debt.type === 'borrow' ? 'text-red-600' : 'text-emerald-600'}`}>₹{debt.amount.toLocaleString()}</p>
                                    {(debt.repaidAmount || 0) > 0 && (
                                        <p className="text-xs font-medium text-muted-foreground mt-1">Settled: ₹{debt.repaidAmount.toLocaleString()}</p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 pl-4 border-l border-border/50 sm:ml-4">
                                    {debt.status !== 'settled' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setSettleItem(debt);
                                                setSettleData({ amount: String((debt.amount - (debt.repaidAmount || 0))), date: new Date().toISOString().split('T')[0], accountId: debt.accountId });
                                            }}
                                            className={debt.type === 'borrow' ? "border-red-200 hover:bg-red-50 text-red-600" : "border-emerald-200 hover:bg-emerald-50 text-emerald-600"}
                                        >
                                            Settle
                                        </Button>
                                    )}
                                    <button onClick={() => { setEditItem(debt); setEditData({ amount: String(debt.amount), date: debt.date ? new Date(debt.date).toISOString().split('T')[0] : '', description: debt.description || '', personName: debt.personName }); }} className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-muted rounded-md"><Edit2 className="h-4 w-4" /></button>
                                    <button onClick={() => handleDelete(debt._id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors hover:bg-red-50 rounded-md"><Trash2 className="h-4 w-4" /></button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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

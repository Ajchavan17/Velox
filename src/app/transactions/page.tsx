"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/Card";
import { Plus, Loader2, Trash2, Edit2, Filter, ArrowUpCircle, ArrowDownCircle, Landmark, CreditCard, X, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { SwipeableCard } from "@/components/ui/SwipeableCard";

interface Transaction {
    _id: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
    description: string;
    accountId?: string;
}

interface Category {
    _id: string;
    name: string;
    type: 'income' | 'expense';
    subcategories: string[];
}

interface AccountOption {
    _id: string;
    name: string;
    type: 'bank' | 'card';
    bankName: string;
}

function TransactionsContent() {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [accounts, setAccounts] = useState<AccountOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // View State
    const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Split category state for UI
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');
    const [selectedAccountId, setSelectedAccountId] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        amount: '',
        type: 'expense' as 'income' | 'expense',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        accountId: '',
    });

    useEffect(() => {
        if (status === 'authenticated') {
            fetchTransactions();
            fetchCategories();
            fetchAccountsData();
        }
    }, [status]);

    // Handle Quick Action param
    useEffect(() => {
        if (searchParams?.get('new') === 'true') {
            setIsAdding(true);
            const params = new URLSearchParams(searchParams.toString());
            params.delete('new');
            router.replace(`/transactions?${params.toString()}`, { scroll: false });
        }
    }, [searchParams]);

    // Sync formData type with activeTab when opening form from FAB (optional, but good UX)
    useEffect(() => {
        if (!editingId && isAdding) {
            setFormData(prev => ({ ...prev, type: activeTab }));
        }
    }, [isAdding, activeTab, editingId]);


    // Update formData.category when selected parts change
    useEffect(() => {
        if (selectedCategory) {
            const fullCategory = selectedSubcategory
                ? `${selectedCategory} - ${selectedSubcategory}`
                : selectedCategory;
            setFormData(prev => ({ ...prev, category: fullCategory }));
        }
    }, [selectedCategory, selectedSubcategory]);

    // Update formData.accountId when selectedAccountId changes
    useEffect(() => {
        setFormData(prev => ({ ...prev, accountId: selectedAccountId }));
    }, [selectedAccountId]);

    const fetchAccountsData = async () => {
        try {
            const [banksRes, cardsRes] = await Promise.all([
                fetch('/api/accounts'),
                fetch('/api/cards')
            ]);

            let allAccounts: AccountOption[] = [];

            if (banksRes.ok) {
                const banks = await banksRes.json();
                allAccounts = [...allAccounts, ...banks.map((b: any) => ({
                    _id: b._id,
                    name: b.accountName,
                    type: 'bank' as const,
                    bankName: b.bankName
                }))];
            }

            if (cardsRes.ok) {
                const cards = await cardsRes.json();
                allAccounts = [...allAccounts, ...cards.map((c: any) => ({
                    _id: c._id,
                    name: c.cardName,
                    type: 'card' as const,
                    bankName: c.bankName
                }))];
            }

            setAccounts(allAccounts);
        } catch (error) {
            console.error('Error fetching accounts:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/transactions`);
            if (res.ok) {
                const data = await res.json();
                setTransactions(data);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingId ? `/api/transactions/${editingId}` : '/api/transactions';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success(editingId ? "Transaction updated" : "Transaction added");
                await fetchTransactions();
                setIsAdding(false);
                setEditingId(null);
                setFormData({
                    amount: '',
                    type: 'expense',
                    category: '',
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                    accountId: '',
                });
                setSelectedCategory('');
                setSelectedSubcategory('');
                setSelectedAccountId('');
            } else {
                toast.error("Failed to save transaction");
            }
        } catch (error) {
            console.error('Error saving transaction:', error);
            toast.error("An error occurred");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this transaction?')) return;
        try {
            const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Transaction deleted");
                fetchTransactions();
            } else {
                toast.error("Failed to delete");
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
            toast.error("An error occurred");
        }
    };

    const handleEdit = (transaction: Transaction) => {
        // Parse category string "Main - Sub"
        const [main, sub] = transaction.category.split(' - ');

        setSelectedCategory(main || '');
        setSelectedSubcategory(sub || '');

        setFormData({
            amount: transaction.amount.toString(),
            type: transaction.type,
            category: transaction.category,
            description: transaction.description,
            date: new Date(transaction.date).toISOString().split('T')[0],
            accountId: transaction.accountId || '',
        });
        setEditingId(transaction._id);
        setIsAdding(true);
        setSelectedAccountId(transaction.accountId || '');
    };

    if (status === 'loading') {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!session) {
        return <div className="flex h-screen items-center justify-center">Please log in to view transactions.</div>;
    }

    const availableCategories = categories.filter(c => c.type === formData.type);
    const availableSubcategories = availableCategories.find(c => c.name === selectedCategory)?.subcategories || [];

    // Filter transactions based on active Tab (Mobile)
    const filteredTransactions = transactions.filter(t => t.type === activeTab);

    // Separate for Desktop Split View
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    // Calculate Total for Summary Card (Mobile)
    const totalAmount = filteredTransactions.reduce((acc, curr) => acc + Number(curr.amount), 0);

    return (
        <div className="container mx-auto pb-24 md:pb-10 pt-6 px-4 md:px-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header with Title and Add Button */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent w-fit">
                        Transactions
                    </h1>
                    <p className="text-muted-foreground text-xs md:text-sm mt-1">Manage your income and expenses</p>
                </div>
                <div className="hidden md:block">
                    <Button onClick={() => {
                        setIsAdding(true);
                        setEditingId(null);
                        setFormData({ ...formData, type: activeTab, amount: '', category: '', description: '', accountId: '' });
                        setSelectedCategory('');
                        setSelectedSubcategory('');
                        setSelectedAccountId('');
                    }}>
                        <Plus className="h-4 w-4 mr-2" /> Add Transaction
                    </Button>
                </div>
            </div>

            {/* --- MOBILE VIEW (Tabs + Single List) --- */}
            <div className="md:hidden space-y-6">
                {/* Toggle Tabs (Segmented Control) */}
                <div className="flex p-1 bg-muted/30 rounded-full w-full max-w-md mx-auto relative backdrop-blur-sm border border-white/5">
                    <button
                        onClick={() => setActiveTab('expense')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-full transition-all duration-300 relative z-10 ${activeTab === 'expense'
                                ? 'bg-red-500/10 text-red-500 shadow-sm ring-1 ring-red-500/20'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <ArrowDownCircle className="h-4 w-4" /> Expense
                    </button>
                    <button
                        onClick={() => setActiveTab('income')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-full transition-all duration-300 relative z-10 ${activeTab === 'income'
                                ? 'bg-emerald-500/10 text-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <ArrowUpCircle className="h-4 w-4" /> Income
                    </button>
                </div>

                {/* Summary Card */}
                <Card className="bg-gradient-to-br from-card to-muted/50 border-primary/10 shadow-sm overflow-hidden relative">
                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none ${activeTab === 'income' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`} />
                    <CardContent className="p-6 flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total {activeTab === 'income' ? 'Received' : 'Spent'}</p>
                            <h2 className={`text-3xl font-bold tracking-tight ${activeTab === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                                ₹{totalAmount.toLocaleString()}
                            </h2>
                        </div>
                        <div className={`p-3 rounded-full ${activeTab === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            {activeTab === 'income' ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                        </div>
                    </CardContent>
                </Card>

                {/* Swipeable List */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-sm font-medium text-muted-foreground">Recent Activity</h3>
                        <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-full">{filteredTransactions.length} records</span>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="text-center py-12 border rounded-xl border-dashed bg-muted/20 text-muted-foreground">
                            No {activeTab} records found.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredTransactions.map((t) => (
                                <SwipeableCard // Will fix import in tool logic or manual
                                    key={t._id}
                                    onEdit={() => handleEdit(t)}
                                    onDelete={() => handleDelete(t._id)}
                                    className="rounded-xl"
                                >
                                    <Card
                                        className="group relative overflow-hidden border-l-4 transition-all duration-300 hover:shadow-md hover:translate-x-1 active:scale-[0.99] rounded-xl"
                                        style={{ borderLeftColor: t.type === 'income' ? '#10b981' : '#ef4444' }}
                                    >
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className={`p-2.5 rounded-xl flex-shrink-0 ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {t.type === 'income' ? <ArrowUpCircle className="h-5 w-5" /> : <ArrowDownCircle className="h-5 w-5" />}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="font-semibold text-foreground truncate">{t.description}</p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                        <span className="bg-muted/50 px-1.5 py-0.5 rounded capitalize">{t.category}</span>
                                                        <span>•</span>
                                                        <span>{format(new Date(t.date), 'MMM d')}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right pl-3">
                                                <p className={`font-bold text-base ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {t.type === 'income' ? '+' : '-'}₹{Number(t.amount).toLocaleString()}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </SwipeableCard>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* --- DESKTOP VIEW (Split Columns) --- */}
            <div className="hidden md:grid grid-cols-2 gap-8">
                {/* Income Column */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-border/50">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-emerald-600">
                            <ArrowUpCircle className="h-5 w-5" /> Income
                        </h2>
                        <span className="text-sm text-muted-foreground">
                            {incomeTransactions.length} transactions
                        </span>
                    </div>
                    <div className="space-y-3">
                        {incomeTransactions.map((t) => (
                            <Card key={t._id} className="group hover:border-emerald-500/30 transition-all duration-300 hover:shadow-sm">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex-1 min-w-0 mr-4">
                                        <p className="font-semibold truncate">{t.description}</p>
                                        <p className="text-xs text-muted-foreground">{t.category} • {format(new Date(t.date), 'MMM d, yyyy')}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="font-bold text-emerald-600">+₹{Number(t.amount).toLocaleString()}</p>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(t)}><Edit2 className="h-3.5 w-3.5" /></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(t._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {incomeTransactions.length === 0 && <div className="text-center py-8 text-muted-foreground">No income recorded.</div>}
                    </div>
                </div>
                {/* Expense Column */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-border/50">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-red-600">
                            <ArrowDownCircle className="h-5 w-5" /> Expenses
                        </h2>
                        <span className="text-sm text-muted-foreground">
                            {expenseTransactions.length} transactions
                        </span>
                    </div>
                    <div className="space-y-3">
                        {expenseTransactions.map((t) => (
                            <Card key={t._id} className="group hover:border-red-500/30 transition-all duration-300 hover:shadow-sm">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex-1 min-w-0 mr-4">
                                        <p className="font-semibold truncate">{t.description}</p>
                                        <p className="text-xs text-muted-foreground">{t.category} • {format(new Date(t.date), 'MMM d, yyyy')}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="font-bold text-red-600">-₹{Number(t.amount).toLocaleString()}</p>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(t)}><Edit2 className="h-3.5 w-3.5" /></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(t._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {expenseTransactions.length === 0 && <div className="text-center py-8 text-muted-foreground">No expenses recorded.</div>}
                    </div>
                </div>
            </div>

            {/* Floating Action Button (Mobile) */}
            <FloatingActionButton onClick={() => {
                setIsAdding(true);
                setEditingId(null);
                setFormData({ ...formData, type: activeTab, amount: '', category: '', description: '', accountId: '' });
                setSelectedCategory('');
                setSelectedSubcategory('');
                setSelectedAccountId('');
            }} />

            {/* Modal Form */}
            {isAdding && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-lg border-primary/20 bg-background shadow-2xl max-h-[90vh] overflow-y-auto ring-1 ring-white/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-4 sticky top-0 bg-background/95 backdrop-blur z-10 border-b border-white/5">
                            <CardTitle>{editingId ? 'Edit Transaction' : 'Add New Transaction'}</CardTitle>
                            <Button variant="ghost" size="icon" onClick={() => { setIsAdding(false); setEditingId(null); }} className="h-8 w-8 rounded-full">
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 overflow-y-auto max-h-[75vh]">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Type Toggle */}
                                <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'expense' })}
                                        className={`py-2 text-sm font-medium rounded-md transition-all ${formData.type === 'expense' ? 'bg-background shadow-sm text-red-500' : 'text-muted-foreground hover:text-primary'}`}
                                    >
                                        Expense
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'income' })}
                                        className={`py-2 text-sm font-medium rounded-md transition-all ${formData.type === 'income' ? 'bg-background shadow-sm text-emerald-500' : 'text-muted-foreground hover:text-primary'}`}
                                    >
                                        Income
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">₹</span>
                                            <Input
                                                type="number"
                                                required
                                                className="pl-8 text-lg font-bold h-12 bg-muted/20"
                                                placeholder="0.00"
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                autoFocus={!editingId}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</label>
                                        <Input
                                            type="text"
                                            required
                                            placeholder="What is this for?"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="bg-muted/20"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</label>
                                            <Select
                                                value={selectedCategory}
                                                onChange={(val) => {
                                                    setSelectedCategory(val);
                                                    setSelectedSubcategory('');
                                                }}
                                                placeholder="Select"
                                                options={availableCategories.map(cat => ({ label: cat.name, value: cat.name }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Subcategory</label>
                                            <Select
                                                value={selectedSubcategory}
                                                onChange={setSelectedSubcategory}
                                                placeholder="Select"
                                                disabled={!selectedCategory || availableSubcategories.length === 0}
                                                options={availableSubcategories.map(sub => ({ label: sub, value: sub }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Account</label>
                                            <Select
                                                value={selectedAccountId}
                                                onChange={setSelectedAccountId}
                                                placeholder="Cash"
                                                options={[
                                                    { label: 'None (Cash)', value: '' },
                                                    ...accounts.map(acc => ({ label: acc.name, value: acc._id }))
                                                ]}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</label>
                                            <Input
                                                type="date"
                                                required
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                className="bg-muted/20"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button type="submit" className="w-full text-base py-6 shadow-lg shadow-primary/20">
                                        {editingId ? 'Update Transaction' : 'Save Transaction'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default function TransactionsPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <TransactionsContent />
        </Suspense>
    );
}

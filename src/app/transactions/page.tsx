"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
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
import { Plus, Loader2, Trash2, Edit2, Filter, ArrowUpCircle, ArrowDownCircle, Landmark, CreditCard, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

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
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
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
    }, [status, filterType]);

    // Handle Quick Action param
    useEffect(() => {
        if (searchParams?.get('new') === 'true') {
            setIsAdding(true);
            const params = new URLSearchParams(searchParams.toString());
            params.delete('new');
            router.replace(`/transactions?${params.toString()}`, { scroll: false });
        }
    }, [searchParams]);

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
            const query = filterType !== 'all' ? `?type=${filterType}` : '';
            const res = await fetch(`/api/transactions${query}`);
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

    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    return (
        <div className="container mx-auto py-10 px-4 md:px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-border/40 pb-8">
                <div className="text-left">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent w-fit">
                        Transactions
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">Track your income and expenses.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => {
                        setIsAdding(true);
                        setEditingId(null);
                        setFormData({ ...formData, type: 'expense', amount: '', category: '', description: '', accountId: '' });
                        setSelectedCategory('');
                        setSelectedSubcategory('');
                        setSelectedAccountId('');
                    }}>
                        <Plus className="h-4 w-4 mr-2" /> Add Transaction
                    </Button>
                </div>
            </div>

            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-lg border-primary/20 bg-background shadow-xl max-h-[90vh] overflow-y-auto">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <CardTitle>{editingId ? 'Edit Transaction' : 'Add New Transaction'}</CardTitle>
                            <Button variant="ghost" size="icon" onClick={() => { setIsAdding(false); setEditingId(null); }}>
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 overflow-y-auto max-h-[75vh]">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Row 1: Type Selection and Date */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 border-b border-border/40 pb-3">
                                    <div className="flex gap-2 p-1 bg-muted/30 rounded-lg">
                                        <label className={`cursor-pointer px-4 py-2 rounded-md transition-all text-sm font-medium ${formData.type === 'income' ? 'bg-emerald-100 text-emerald-700 shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}>
                                            <input
                                                type="radio"
                                                name="type"
                                                value="income"
                                                checked={formData.type === 'income'}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, type: 'income', category: '' });
                                                    setSelectedCategory('');
                                                    setSelectedSubcategory('');
                                                }}
                                                className="sr-only"
                                            />
                                            Income
                                        </label>
                                        <label className={`cursor-pointer px-4 py-2 rounded-md transition-all text-sm font-medium ${formData.type === 'expense' ? 'bg-red-100 text-red-700 shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}>
                                            <input
                                                type="radio"
                                                name="type"
                                                value="expense"
                                                checked={formData.type === 'expense'}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, type: 'expense', category: '' });
                                                    setSelectedCategory('');
                                                    setSelectedSubcategory('');
                                                }}
                                                className="sr-only"
                                            />
                                            Expense
                                        </label>
                                    </div>
                                    <div className="space-y-2 w-full sm:w-auto min-w-0">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</label>
                                        <Input
                                            type="date"
                                            required
                                            className="w-full sm:w-[150px]"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Account, Category, Subcategory */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Account</label>
                                        <Select
                                            value={selectedAccountId}
                                            onChange={setSelectedAccountId}
                                            options={[
                                                { label: 'None (Cash)', value: '' },
                                                ...accounts.map(acc => ({ label: acc.name, value: acc._id }))
                                            ]}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-muted-foreground font-semibold z-10">₹</span>
                                            <Input
                                                type="number"
                                                required
                                                className="pl-7 pr-3"
                                                placeholder="0.00"
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</label>
                                        <Select
                                            value={selectedCategory}
                                            onChange={(val) => {
                                                setSelectedCategory(val);
                                                setSelectedSubcategory('');
                                            }}
                                            placeholder="Select Category"
                                            options={availableCategories.map(cat => ({ label: cat.name, value: cat.name }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Subcategory</label>
                                        <Select
                                            value={selectedSubcategory}
                                            onChange={setSelectedSubcategory}
                                            placeholder={availableSubcategories.length === 0 ? 'No subcategories' : 'Select Subcategory'}
                                            disabled={!selectedCategory || availableSubcategories.length === 0}
                                            options={availableSubcategories.map(sub => ({ label: sub, value: sub }))}
                                        />
                                    </div>
                                </div>

                                {/* Row 4: Description */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</label>
                                    <Input
                                        type="text"
                                        required
                                        placeholder="What was this transaction for?"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="ghost" onClick={() => { setIsAdding(false); setEditingId(null); }}>Cancel</Button>
                                    <Button type="submit" className="min-w-[120px]">{editingId ? 'Update' : 'Save Transaction'}</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Transaction Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                        {isLoading ? (
                            <div className="text-center py-8 text-muted-foreground">Loading...</div>
                        ) : incomeTransactions.length === 0 ? (
                            <div className="text-center py-12 border rounded-xl border-dashed bg-muted/20 text-muted-foreground">
                                No income records found.
                            </div>
                        ) : (
                            incomeTransactions.map((transaction) => (
                                <Card key={transaction._id} className="group hover:border-emerald-500/30 transition-all duration-300 hover:shadow-sm">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex-1 min-w-0 mr-4">
                                            <p className="font-semibold truncate" title={transaction.description}>{transaction.description}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <span className="text-[10px] uppercase font-medium tracking-wide text-muted-foreground">
                                                    {transaction.category}
                                                </span>
                                                <span>• {format(new Date(transaction.date), 'MMM d, yyyy')}</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 ml-auto">
                                            <p className="font-bold text-emerald-600 whitespace-nowrap">
                                                +₹{Number(transaction.amount).toLocaleString()}
                                            </p>
                                            <div className="hidden group-hover:flex gap-1 transition-all">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(transaction)}>
                                                    <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(transaction._id)}>
                                                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
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
                        {isLoading ? (
                            <div className="text-center py-8 text-muted-foreground">Loading...</div>
                        ) : expenseTransactions.length === 0 ? (
                            <div className="text-center py-12 border rounded-xl border-dashed bg-muted/20 text-muted-foreground">
                                No expense records found.
                            </div>
                        ) : (
                            expenseTransactions.map((transaction) => (
                                <Card key={transaction._id} className="group hover:border-red-500/30 transition-all duration-300 hover:shadow-sm">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex-1 min-w-0 mr-4">
                                            <p className="font-semibold truncate" title={transaction.description}>{transaction.description}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <span className="text-[10px] uppercase font-medium tracking-wide text-muted-foreground">
                                                    {transaction.category}
                                                </span>
                                                <span>• {format(new Date(transaction.date), 'MMM d, yyyy')}</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 ml-auto">
                                            <p className="font-bold text-red-600 whitespace-nowrap">
                                                -₹{Number(transaction.amount).toLocaleString()}
                                            </p>
                                            <div className="hidden group-hover:flex gap-1 transition-all">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(transaction)}>
                                                    <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(transaction._id)}>
                                                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
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

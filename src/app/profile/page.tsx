"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/Card";
import { Plus, CreditCard as CreditCardIcon, Landmark, Loader2, Trash2, Wallet, Pencil } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface BankAccount {
    _id: string;
    bankName: string;
    accountType: string;
    accountName: string;
    balance: number;
    currency: string;
}

interface CreditCard {
    _id: string;
    bankName: string;
    cardName: string;
    last4Digits: string;
    creditLimit: number;
    currentBalance: number;
    currency: string;
}

interface Category {
    _id: string;
    name: string;
    type: 'income' | 'expense';
    subcategories: string[];
    isDefault: boolean;
}

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [cards, setCards] = useState<CreditCard[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
    const [isLoadingCards, setIsLoadingCards] = useState(true);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);


    // Mutual exclusive form state
    const [activeForm, setActiveForm] = useState<'account' | 'card' | 'category' | null>(null);

    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Form States
    const [newAccount, setNewAccount] = useState({
        bankName: '',
        accountName: '',
        accountType: 'Checking',
        balance: ''
    });
    const [newCard, setNewCard] = useState({
        bankName: '',
        cardName: '',
        last4Digits: '',
        creditLimit: '',
        currentBalance: ''
    });
    const [newCategory, setNewCategory] = useState({
        name: '',
        type: 'expense',
        subcategories: '' // Comma separated for initial add
    });

    useEffect(() => {
        if (status === 'authenticated') {
            fetchAccounts();
            fetchCards();
            fetchCategories();
        }
    }, [status]);

    const fetchAccounts = async () => {
        try {
            const res = await fetch('/api/accounts');
            if (res.ok) {
                const data = await res.json();
                setAccounts(data);
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
        } finally {
            setIsLoadingAccounts(false);
        }
    };

    const fetchCards = async () => {
        try {
            const res = await fetch('/api/cards');
            if (res.ok) {
                const data = await res.json();
                setCards(data);
            }
        } catch (error) {
            console.error('Error fetching cards:', error);
        } finally {
            setIsLoadingCards(false);
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
        } finally {
            setIsLoadingCategories(false);
        }
    };

    const handleUpdateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;

        try {
            const res = await fetch('/api/categories', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingCategory._id,
                    name: editingCategory.name,
                    type: editingCategory.type,
                    subcategories: editingCategory.subcategories
                }),
            });

            if (res.ok) {
                await fetchCategories();
                setEditingCategory(null);
            }
        } catch (error) {
            console.error('Error updating category:', error);
        }
    };

    const handleAddAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAccount),
            });
            if (res.ok) {
                await fetchAccounts();
                setActiveForm(null);
                setNewAccount({ bankName: '', accountType: 'Checking', accountName: '', balance: '' });
            }
        } catch (error) {
            console.error('Error adding account:', error);
        }
    };

    const handleAddCard = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCard),
            });
            if (res.ok) {
                await fetchCards();
                setActiveForm(null);
                setNewCard({ bankName: '', cardName: '', last4Digits: '', creditLimit: '', currentBalance: '' });
            }
        } catch (error) {
            console.error('Error adding card:', error);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const subcats = newCategory.subcategories.split(',').map(s => s.trim()).filter(Boolean);
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newCategory.name,
                    type: newCategory.type,
                    subcategories: subcats
                }),
            });

            if (res.ok) {
                await fetchCategories();
                setActiveForm(null);
                setNewCategory({ name: '', type: 'expense', subcategories: '' });
            }
        } catch (error) {
            console.error('Error adding category:', error);
        }
    };

    const [deletingItem, setDeletingItem] = useState<{ type: 'account' | 'card' | 'category', id: string } | null>(null);

    const confirmDelete = async () => {
        if (!deletingItem) return;

        try {
            let endpoint = '';
            if (deletingItem.type === 'account') endpoint = `/api/accounts?id=${deletingItem.id}`;
            else if (deletingItem.type === 'card') endpoint = `/api/cards?id=${deletingItem.id}`;
            else if (deletingItem.type === 'category') endpoint = `/api/categories?id=${deletingItem.id}`;

            const res = await fetch(endpoint, { method: 'DELETE' });

            if (res.ok) {
                if (deletingItem.type === 'account') await fetchAccounts();
                else if (deletingItem.type === 'card') await fetchCards();
                else if (deletingItem.type === 'category') await fetchCategories();
            }
        } catch (error) {
            console.error('Error deleting item:', error);
        } finally {
            setDeletingItem(null);
        }
    };

    if (status === 'loading') {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!session) {
        return <div className="flex h-screen items-center justify-center">Please log in to view your profile.</div>;
    }

    return (
        <div className="container mx-auto py-10 px-4 md:px-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-border/40 pb-8">
                <div className="text-left">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent w-fit">
                        Financial Profile
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">Manage your connected accounts and categories.</p>
                </div>

                <div className="flex items-center gap-4 p-4 border border-border/60 rounded-xl bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20">
                        <span className="text-xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                            {session.user?.name?.[0] || 'U'}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <h2 className="font-semibold leading-none">{session.user?.name}</h2>
                        <div className="flex items-center gap-2">
                            <p className="text-muted-foreground text-xs">{session.user?.email}</p>
                            <span className="h-1 w-1 rounded-full bg-border" />
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] text-primary font-medium uppercase tracking-wider">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                                </span>
                                {session.user?.plan || 'Free'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Bank Accounts Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Landmark className="h-5 w-5 text-primary" /> Bank Accounts
                        </h2>
                        <Button
                            variant={activeForm === 'account' ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => setActiveForm(activeForm === 'account' ? null : 'account')}
                            className="transition-all"
                        >
                            <Plus className={`h-4 w-4 mr-2 transition-transform duration-300 ${activeForm === 'account' ? 'rotate-45' : ''}`} />
                            {activeForm === 'account' ? 'Cancel' : 'Add Account'}
                        </Button>
                    </div>

                    {activeForm === 'account' && (
                        <Card className="border-primary/50 bg-primary/5 animate-in zoom-in-95 duration-200">
                            <CardHeader>
                                <CardTitle className="text-lg">Add New Bank Account</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleAddAccount} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Bank Name</label>
                                            <Input
                                                type="text"
                                                required
                                                placeholder="e.g. HDFC Bank"
                                                value={newAccount.bankName}
                                                onChange={(e) => setNewAccount({ ...newAccount, bankName: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Account Name</label>
                                            <Input
                                                type="text"
                                                required
                                                placeholder="e.g. Main Savings"
                                                value={newAccount.accountName}
                                                onChange={(e) => setNewAccount({ ...newAccount, accountName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Type</label>
                                            <Select
                                                value={newAccount.accountType}
                                                onChange={(val) => setNewAccount({ ...newAccount, accountType: val })}
                                                options={[
                                                    { label: 'Checking', value: 'Checking' },
                                                    { label: 'Savings', value: 'Savings' },
                                                    { label: 'Investment', value: 'Investment' },
                                                    { label: 'Other', value: 'Other' },
                                                ]}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Balance (₹)</label>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={newAccount.balance}
                                                onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <Button type="submit">Save Account</Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid gap-4">
                        {isLoadingAccounts ? (
                            <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <p>Loading accounts...</p>
                            </div>
                        ) : accounts.length === 0 ? (
                            <div className="text-center py-12 border rounded-xl border-dashed bg-muted/20 text-muted-foreground flex flex-col items-center gap-2">
                                <Landmark className="h-8 w-8 opacity-50" />
                                <p>No bank accounts added yet.</p>
                            </div>
                        ) : (
                            accounts.map((account) => (
                                <Card key={account._id} className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform duration-300">
                                                <Landmark className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg">{account.bankName}</p>
                                                <p className="text-sm text-muted-foreground">{account.accountName} • {account.accountType}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-bold text-lg">₹{account.balance.toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground">Available Balance</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-300"
                                                onClick={() => setDeletingItem({ type: 'account', id: account._id })}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* Credit Cards Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <CreditCardIcon className="h-5 w-5 text-primary" /> Credit Cards
                        </h2>
                        <Button
                            variant={activeForm === 'card' ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => setActiveForm(activeForm === 'card' ? null : 'card')}
                            className="transition-all"
                        >
                            <Plus className={`h-4 w-4 mr-2 transition-transform duration-300 ${activeForm === 'card' ? 'rotate-45' : ''}`} />
                            {activeForm === 'card' ? 'Cancel' : 'Add Card'}
                        </Button>
                    </div>

                    {activeForm === 'card' && (
                        <Card className="border-primary/50 bg-primary/5 animate-in zoom-in-95 duration-200">
                            <CardHeader>
                                <CardTitle className="text-lg">Add New Credit Card</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleAddCard} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Bank Name</label>
                                            <Input
                                                type="text"
                                                required
                                                placeholder="e.g. SBI"
                                                value={newCard.bankName}
                                                onChange={(e) => setNewCard({ ...newCard, bankName: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Card Name</label>
                                            <Input
                                                type="text"
                                                required
                                                placeholder="e.g. SimplyClick"
                                                value={newCard.cardName}
                                                onChange={(e) => setNewCard({ ...newCard, cardName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Last 4 Digits</label>
                                            <Input
                                                type="text"
                                                required
                                                maxLength={4}
                                                placeholder="1234"
                                                value={newCard.last4Digits}
                                                onChange={(e) => setNewCard({ ...newCard, last4Digits: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Credit Limit (₹)</label>
                                            <Input
                                                type="number"
                                                required
                                                placeholder="50000"
                                                value={newCard.creditLimit}
                                                onChange={(e) => setNewCard({ ...newCard, creditLimit: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Current Balance (₹)</label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={newCard.currentBalance}
                                            onChange={(e) => setNewCard({ ...newCard, currentBalance: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <Button type="submit">Save Card</Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid gap-4">
                        {isLoadingCards ? (
                            <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <p>Loading cards...</p>
                            </div>
                        ) : cards.length === 0 ? (
                            <div className="text-center py-12 border rounded-xl border-dashed bg-muted/20 text-muted-foreground flex flex-col items-center gap-2">
                                <CreditCardIcon className="h-8 w-8 opacity-50" />
                                <p>No credit cards added yet.</p>
                            </div>
                        ) : (
                            cards.map((card) => (
                                <Card key={card._id} className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform duration-300">
                                                <CreditCardIcon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg">{card.bankName} {card.cardName}</p>
                                                <p className="text-sm text-muted-foreground">•••• {card.last4Digits}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-bold text-lg text-red-500">₹{card.currentBalance.toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground">Limit: ₹{card.creditLimit.toLocaleString()}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-300"
                                                onClick={() => setDeletingItem({ type: 'card', id: card._id })}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>


            {/* Categories Section */}
            <div className="space-y-6">

                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-primary" /> Categories
                    </h2>
                    <Button
                        variant={activeForm === 'category' ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setActiveForm(activeForm === 'category' ? null : 'category')}
                        className="transition-all"
                    >
                        <Plus className={`h-4 w-4 mr-2 transition-transform duration-300 ${activeForm === 'category' ? 'rotate-45' : ''}`} />
                        {activeForm === 'category' ? 'Cancel' : 'Add Category'}
                    </Button>
                </div>

                {activeForm === 'category' && (
                    <Card className="border-primary/50 bg-primary/5 animate-in slide-in-from-top-2 fade-in zoom-in-95 duration-300 ease-out origin-top">
                        <CardHeader>
                            <CardTitle className="text-lg">Add New Category</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddCategory} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Category Name</label>
                                        <Input
                                            type="text"
                                            required
                                            placeholder="e.g. Shopping"
                                            value={newCategory.name}
                                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Type</label>
                                        <Select
                                            value={newCategory.type}
                                            onChange={(val) => setNewCategory({ ...newCategory, type: val })}
                                            options={[
                                                { label: 'Income', value: 'income' },
                                                { label: 'Expense', value: 'expense' },
                                            ]}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Subcategories (comma separated)</label>
                                    <Input
                                        type="text"
                                        placeholder="e.g. Groceries, Clothes"
                                        value={newCategory.subcategories}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategory({ ...newCategory, subcategories: e.target.value })}
                                    />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button type="submit">Save Category</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Income Categories */}
                    <Card className="hover:border-primary/20 transition-all duration-300">
                        <CardHeader className="pb-4 border-b border-border/50">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                Income Categories
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            {isLoadingCategories ? (
                                <div className="text-center py-4 text-muted-foreground">Loading...</div>
                            ) : categories.filter(c => c.type === 'income').length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground italic text-sm">No income categories.</div>
                            ) : (
                                categories.filter(c => c.type === 'income').map(category => (
                                    <div key={category._id} className="group flex flex-col border border-border/50 bg-muted/20 rounded-lg p-3 hover:bg-muted/40 transition-colors relative">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold">{category.name}</span>
                                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                    onClick={() => setEditingCategory(category)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                                    onClick={() => setDeletingItem({ type: 'category', id: category._id })}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {category.subcategories.map((sub, idx) => (
                                                <span key={idx} className="text-xs bg-background border border-border px-2 py-0.5 rounded-full text-muted-foreground">
                                                    {sub}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Expense Categories */}
                    <Card className="hover:border-primary/20 transition-all duration-300">
                        <CardHeader className="pb-4 border-b border-border/50">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-red-500" />
                                Expense Categories
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            {isLoadingCategories ? (
                                <div className="text-center py-4 text-muted-foreground">Loading...</div>
                            ) : categories.filter(c => c.type === 'expense').length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground italic text-sm">No expense categories.</div>
                            ) : (
                                categories.filter(c => c.type === 'expense').map(category => (
                                    <div key={category._id} className="group flex flex-col border border-border/50 bg-muted/20 rounded-lg p-3 hover:bg-muted/40 transition-colors relative">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold">{category.name}</span>
                                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                    onClick={() => setEditingCategory(category)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                                    onClick={() => setDeletingItem({ type: 'category', id: category._id })}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {category.subcategories.map((sub, idx) => (
                                                <span key={idx} className="text-xs bg-background border border-border px-2 py-0.5 rounded-full text-muted-foreground">
                                                    {sub}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>


            {/* Edit Category Dialog */}
            {editingCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-lg mx-4 animate-in zoom-in-95 duration-200 border-primary/20 shadow-2xl">
                        <CardHeader>
                            <CardTitle>Edit Category</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateCategory} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Category Name</label>
                                        <Input
                                            type="text"
                                            required
                                            value={editingCategory.name}
                                            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                            placeholder="e.g. Shopping"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Type</label>
                                        <Select
                                            value={editingCategory.type}
                                            onChange={(val) => setEditingCategory({ ...editingCategory, type: val as 'income' | 'expense' })}
                                            options={[
                                                { label: 'Income', value: 'income' },
                                                { label: 'Expense', value: 'expense' },
                                            ]}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Subcategories (comma separated)</label>
                                    <Input
                                        type="text"
                                        value={editingCategory.subcategories.join(', ')}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingCategory({ ...editingCategory, subcategories: e.target.value.split(',').map((s: string) => s.trim()) })}
                                        placeholder="e.g. Groceries, Clothes"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setEditingCategory(null)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Confirmation Dialog */}
            {
                deletingItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-card border border-border p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
                            <div>
                                <h3 className="text-xl font-bold mb-2">Confirm Deletion</h3>
                                <p className="text-muted-foreground">
                                    Are you sure you want to delete this {deletingItem.type === 'account' ? 'bank account' : deletingItem.type === 'card' ? 'credit card' : 'category'}? This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button variant="outline" onClick={() => setDeletingItem(null)}>
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-red-500 hover:bg-red-600 text-white"
                                    onClick={confirmDelete}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}

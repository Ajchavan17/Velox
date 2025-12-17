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
import { Plus, CreditCard as CreditCardIcon, Landmark, Loader2, Trash2, Wallet, Pencil, Settings } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import Link from "next/link";
import { SwipeableCard } from "@/components/ui/SwipeableCard";
import toast from "react-hot-toast";

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
    const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
    const [editingCard, setEditingCard] = useState<CreditCard | null>(null);

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
                toast.success("Bank account added successfully");
            }
        } catch (error) {
            console.error('Error adding account:', error);
            toast.error("Failed to add bank account");
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
                toast.success("Credit card added successfully");
            }
        } catch (error) {
            console.error('Error adding card:', error);
            toast.error("Failed to add credit card");
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
                toast.success("Category added successfully");
            }
        } catch (error) {
            console.error('Error adding category:', error);
            toast.error("Failed to add category");
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
                if (deletingItem.type === 'account') {
                    await fetchAccounts();
                    toast.success("Account deleted successfully");
                }
                else if (deletingItem.type === 'card') {
                    await fetchCards();
                    toast.success("Card deleted successfully");
                }
                else if (deletingItem.type === 'category') {
                    await fetchCategories();
                    toast.success("Category deleted successfully");
                }
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            toast.error("Failed to delete item");
        } finally {
            setDeletingItem(null);
        }
    };

    const handleUpdateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAccount) return;

        try {
            const res = await fetch('/api/accounts', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingAccount),
            });

            if (res.ok) {
                await fetchAccounts();
                setEditingAccount(null);
                toast.success("Account updated successfully");
            }
        } catch (error) {
            console.error('Error updating account:', error);
            toast.error("Failed to update account");
        }
    };

    const handleUpdateCard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCard) return;

        try {
            const res = await fetch('/api/cards', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingCard),
            });

            if (res.ok) {
                await fetchCards();
                setEditingCard(null);
                toast.success("Card updated successfully");
            }
        } catch (error) {
            console.error('Error updating card:', error);
            toast.error("Failed to update card");
        }
    };

    if (status === 'loading') {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!session) {
        return <div className="flex h-screen items-center justify-center">Please log in to view your profile.</div>;
    }

    return (
        <div className="container mx-auto py-6 md:py-10 px-4 md:px-6 space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-border/40 pb-6 md:pb-8">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <div className="text-left">
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent w-fit">
                            Financial Profile
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">Manage your connected accounts.</p>
                    </div>
                    {/* Mobile Settings Icon */}
                    <div className="md:hidden">
                        <Link href="/settings">
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary">
                                <Settings className="h-6 w-6" />
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-4">
                    {/* User Card */}
                    <div className="flex flex-1 md:flex-none items-center justify-between md:justify-start gap-4 p-4 border border-border/60 rounded-xl bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 w-full md:w-auto">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20 shrink-0">
                                <span className="text-lg md:text-xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                                    {session.user?.name?.[0] || 'U'}
                                </span>
                            </div>
                            <div className="space-y-1 min-w-0">
                                <h2 className="font-semibold leading-none truncate">{session.user?.name}</h2>
                                <p className="text-muted-foreground text-xs truncate max-w-[120px] md:max-w-none">{session.user?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] text-primary font-medium uppercase tracking-wider shrink-0 ml-auto md:ml-0">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                            </span>
                            {session.user?.plan || 'Free'}
                        </div>
                    </div>


                </div>
            </div>

            <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
                {/* Bank Accounts Section */}
                <div className="space-y-4 md:space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                            <Landmark className="h-5 w-5 text-primary" /> Bank Accounts
                        </h2>
                        <Button
                            variant={activeForm === 'account' ? "secondary" : "outline"}
                            size="icon"
                            onClick={() => setActiveForm(activeForm === 'account' ? null : 'account')}
                            className={`transition-all ${activeForm === 'account' ? 'bg-secondary' : ''} h-7 w-7 md:h-9 md:w-9 rounded-full flex items-center justify-center`}
                        >
                            <Plus className={`h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 ${activeForm === 'account' ? 'rotate-45' : ''}`} />
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
                                            <label className="text-xs md:text-sm font-medium">Bank Name</label>
                                            <Input
                                                type="text"
                                                required
                                                placeholder="e.g. HDFC Bank"
                                                value={newAccount.bankName}
                                                onChange={(e) => setNewAccount({ ...newAccount, bankName: e.target.value })}
                                                className="h-10 md:h-12 bg-background md:bg-transparent"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs md:text-sm font-medium">Account Name</label>
                                            <Input
                                                type="text"
                                                required
                                                placeholder="e.g. Main Savings"
                                                value={newAccount.accountName}
                                                onChange={(e) => setNewAccount({ ...newAccount, accountName: e.target.value })}
                                                className="h-10 md:h-12 bg-background md:bg-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs md:text-sm font-medium">Type</label>
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
                                            <label className="text-xs md:text-sm font-medium">Balance (₹)</label>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={newAccount.balance}
                                                onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
                                                className="h-10 md:h-12 bg-background md:bg-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <Button type="submit" className="w-full md:w-auto h-10 md:h-10">Save Account</Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid gap-3 md:gap-4">
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
                                <SwipeableCard
                                    key={account._id}
                                    onEdit={() => setEditingAccount(account)}
                                    onDelete={() => setDeletingItem({ type: 'account', id: account._id })}
                                    className="rounded-xl group"
                                >
                                    <div className="flex items-center justify-between p-4 border border-border/60 rounded-xl bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <Wallet className="h-5 w-5" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-medium leading-none">{account.bankName}</p>
                                                <p className="text-sm text-muted-foreground">{account.accountName} • {account.accountType}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 md:gap-4 pl-2">
                                            <div className="text-right transition-transform duration-300 group-hover:-translate-x-24">
                                                <p className={`font-bold md:text-2xl ${account.balance > 0 ? 'text-emerald-500' : account.balance < 0 ? 'text-red-500' : 'text-foreground'}`}>
                                                    ₹{account.balance.toLocaleString()}
                                                </p>
                                                <p className="text-[10px] md:text-xs text-muted-foreground">Available</p>
                                            </div>
                                            {/* Desktop Hover Action only */}
                                            <div className="hidden md:flex items-center gap-1 absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                                                    onClick={(e) => { e.stopPropagation(); setEditingAccount(account); }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full"
                                                    onClick={(e) => { e.stopPropagation(); setDeletingItem({ type: 'account', id: account._id }); }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </SwipeableCard>
                            ))
                        )}
                    </div>
                </div>

                {/* Credit Cards Section */}
                <div className="space-y-4 md:space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                            <CreditCardIcon className="h-5 w-5 text-primary" /> Credit Cards
                        </h2>
                        <Button
                            variant={activeForm === 'card' ? "secondary" : "outline"}
                            size="icon"
                            onClick={() => setActiveForm(activeForm === 'card' ? null : 'card')}
                            className={`transition-all ${activeForm === 'card' ? 'bg-secondary' : ''} h-7 w-7 md:h-9 md:w-9 rounded-full flex items-center justify-center`}
                        >
                            <Plus className={`h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 ${activeForm === 'card' ? 'rotate-45' : ''}`} />
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
                                            <label className="text-xs md:text-sm font-medium">Bank Name</label>
                                            <Input
                                                type="text"
                                                required
                                                placeholder="e.g. SBI"
                                                value={newCard.bankName}
                                                onChange={(e) => setNewCard({ ...newCard, bankName: e.target.value })}
                                                className="h-10 md:h-12 bg-background md:bg-transparent"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs md:text-sm font-medium">Card Name</label>
                                            <Input
                                                type="text"
                                                required
                                                placeholder="e.g. SimplyClick"
                                                value={newCard.cardName}
                                                onChange={(e) => setNewCard({ ...newCard, cardName: e.target.value })}
                                                className="h-10 md:h-12 bg-background md:bg-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs md:text-sm font-medium">Last 4 Digits</label>
                                            <Input
                                                type="text"
                                                required
                                                maxLength={4}
                                                placeholder="1234"
                                                value={newCard.last4Digits}
                                                onChange={(e) => setNewCard({ ...newCard, last4Digits: e.target.value })}
                                                className="h-10 md:h-12 bg-background md:bg-transparent"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs md:text-sm font-medium">Credit Limit (₹)</label>
                                            <Input
                                                type="number"
                                                required
                                                placeholder="50000"
                                                value={newCard.creditLimit}
                                                onChange={(e) => setNewCard({ ...newCard, creditLimit: e.target.value })}
                                                className="h-10 md:h-12 bg-background md:bg-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs md:text-sm font-medium">Current Balance (₹)</label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={newCard.currentBalance}
                                            onChange={(e) => setNewCard({ ...newCard, currentBalance: e.target.value })}
                                            className="h-10 md:h-12 bg-background md:bg-transparent"
                                        />
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <Button type="submit" className="w-full md:w-auto h-10 md:h-10">Save Card</Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid gap-3 md:gap-4">
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
                                <SwipeableCard
                                    key={card._id}
                                    onEdit={() => setEditingCard(card)}
                                    onDelete={() => setDeletingItem({ type: 'card', id: card._id })}
                                    className="rounded-xl group"
                                >
                                    <div className="flex items-center justify-between p-4 border border-border/60 rounded-xl bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                                <CreditCardIcon className="h-5 w-5" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-medium leading-none">{card.bankName}</p>
                                                <p className="text-sm text-muted-foreground">{card.cardName} • ••• {card.last4Digits}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 md:gap-4 pl-2">
                                            <div className="text-right transition-transform duration-300 group-hover:-translate-x-24">
                                                <p className="font-bold md:text-lg">₹{card.currentBalance.toLocaleString()}</p>
                                                <p className="text-[10px] md:text-xs text-muted-foreground">Used / ₹{card.creditLimit.toLocaleString()}</p>
                                            </div>
                                            {/* Desktop Hover Action only */}
                                            <div className="hidden md:flex items-center gap-1 absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                                                    onClick={(e) => { e.stopPropagation(); setEditingCard(card); }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full"
                                                    onClick={(e) => { e.stopPropagation(); setDeletingItem({ type: 'card', id: card._id }); }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </SwipeableCard>
                            ))
                        )}
                    </div>
                </div>
            </div>


            {/* Categories Section */}
            <div className="space-y-4 md:space-y-6">

                <div className="flex items-center justify-between">
                    <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-primary" /> Categories
                    </h2>
                    <Button
                        variant={activeForm === 'category' ? "secondary" : "outline"}
                        size="icon"
                        onClick={() => setActiveForm(activeForm === 'category' ? null : 'category')}
                        className={`transition-all ${activeForm === 'category' ? 'bg-secondary' : ''} h-7 w-7 md:h-9 md:w-9 rounded-full flex items-center justify-center`}
                    >
                        <Plus className={`h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 ${activeForm === 'category' ? 'rotate-45' : ''}`} />
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
                                        <label className="text-xs md:text-sm font-medium">Category Name</label>
                                        <Input
                                            type="text"
                                            required
                                            placeholder="e.g. Shopping"
                                            value={newCategory.name}
                                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                            className="h-10 md:h-12 bg-background md:bg-transparent"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs md:text-sm font-medium">Type</label>
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
                                    <label className="text-xs md:text-sm font-medium">Subcategories (comma separated)</label>
                                    <Input
                                        type="text"
                                        placeholder="e.g. Groceries, Clothes"
                                        value={newCategory.subcategories}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategory({ ...newCategory, subcategories: e.target.value })}
                                        className="h-10 md:h-12 bg-background md:bg-transparent"
                                    />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button type="submit" className="w-full md:w-auto h-10 md:h-10">Save Category</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Income Categories */}
                    <Card className="hover:border-primary/20 transition-all duration-300">
                        <CardHeader className="pb-4 border-b border-border/50">
                            <CardTitle className="text-base md:text-lg flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                Income Categories
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 md:space-y-4 pt-4">
                            {isLoadingCategories ? (
                                <div className="text-center py-4 text-muted-foreground">Loading...</div>
                            ) : categories.filter(c => c.type === 'income').length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground italic text-sm">No income categories.</div>
                            ) : (
                                categories.filter(c => c.type === 'income').map(category => (
                                    <SwipeableCard
                                        key={category._id}
                                        onEdit={() => setEditingCategory(category)}
                                        onDelete={() => setDeletingItem({ type: 'category', id: category._id })}
                                        className="rounded-lg"
                                    >
                                        <Card className="group border-border/60 bg-card/50 backdrop-blur-sm hover:shadow-md transition-all relative overflow-hidden">
                                            <CardContent className="p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-semibold text-sm md:text-base">{category.name}</span>
                                                    {/* Desktop Actions Only */}
                                                    <div className="hidden md:flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                            onClick={(e) => { e.stopPropagation(); setEditingCategory(category); }}
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                                            onClick={(e) => { e.stopPropagation(); setDeletingItem({ type: 'category', id: category._id }); }}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {category.subcategories.map((sub, idx) => (
                                                        <span key={idx} className="text-[10px] md:text-xs bg-background/50 border border-border px-2 py-0.5 rounded-full text-muted-foreground">
                                                            {sub}
                                                        </span>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </SwipeableCard>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Expense Categories */}
                    <Card className="hover:border-primary/20 transition-all duration-300">
                        <CardHeader className="pb-4 border-b border-border/50">
                            <CardTitle className="text-base md:text-lg flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-red-500" />
                                Expense Categories
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 md:space-y-4 pt-4">
                            {isLoadingCategories ? (
                                <div className="text-center py-4 text-muted-foreground">Loading...</div>
                            ) : categories.filter(c => c.type === 'expense').length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground italic text-sm">No expense categories.</div>
                            ) : (
                                categories.filter(c => c.type === 'expense').map(category => (
                                    <SwipeableCard
                                        key={category._id}
                                        onEdit={() => setEditingCategory(category)}
                                        onDelete={() => setDeletingItem({ type: 'category', id: category._id })}
                                        className="rounded-lg"
                                    >
                                        <Card className="group border-border/60 bg-card/50 backdrop-blur-sm hover:shadow-md transition-all relative overflow-hidden">
                                            <CardContent className="p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-semibold text-sm md:text-base">{category.name}</span>
                                                    {/* Desktop Actions Only */}
                                                    <div className="hidden md:flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                            onClick={(e) => { e.stopPropagation(); setEditingCategory(category); }}
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                                            onClick={(e) => { e.stopPropagation(); setDeletingItem({ type: 'category', id: category._id }); }}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {category.subcategories.map((sub, idx) => (
                                                        <span key={idx} className="text-[10px] md:text-xs bg-background/50 border border-border px-2 py-0.5 rounded-full text-muted-foreground">
                                                            {sub}
                                                        </span>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </SwipeableCard>
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

            {/* Edit Account Dialog */}
            {editingAccount && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-lg mx-4 animate-in zoom-in-95 duration-200 border-primary/20 shadow-2xl">
                        <CardHeader>
                            <CardTitle>Edit Account</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateAccount} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Bank Name</label>
                                        <Input
                                            type="text"
                                            required
                                            value={editingAccount.bankName}
                                            onChange={(e) => setEditingAccount({ ...editingAccount, bankName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Account Name</label>
                                        <Input
                                            type="text"
                                            required
                                            value={editingAccount.accountName}
                                            onChange={(e) => setEditingAccount({ ...editingAccount, accountName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Type</label>
                                        <Select
                                            value={editingAccount.accountType}
                                            onChange={(val) => setEditingAccount({ ...editingAccount, accountType: val })}
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
                                            value={editingAccount.balance}
                                            onChange={(e) => setEditingAccount({ ...editingAccount, balance: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setEditingAccount(null)}>
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

            {/* Edit Card Dialog */}
            {editingCard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-lg mx-4 animate-in zoom-in-95 duration-200 border-primary/20 shadow-2xl">
                        <CardHeader>
                            <CardTitle>Edit Credit Card</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateCard} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Bank Name</label>
                                        <Input
                                            type="text"
                                            required
                                            value={editingCard.bankName}
                                            onChange={(e) => setEditingCard({ ...editingCard, bankName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Card Name</label>
                                        <Input
                                            type="text"
                                            required
                                            value={editingCard.cardName}
                                            onChange={(e) => setEditingCard({ ...editingCard, cardName: e.target.value })}
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
                                            value={editingCard.last4Digits}
                                            onChange={(e) => setEditingCard({ ...editingCard, last4Digits: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Credit Limit (₹)</label>
                                        <Input
                                            type="number"
                                            required
                                            value={editingCard.creditLimit}
                                            onChange={(e) => setEditingCard({ ...editingCard, creditLimit: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Current Balance (₹)</label>
                                    <Input
                                        type="number"
                                        value={editingCard.currentBalance}
                                        onChange={(e) => setEditingCard({ ...editingCard, currentBalance: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setEditingCard(null)}>
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

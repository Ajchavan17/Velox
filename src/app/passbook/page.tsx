"use client";

import { useSession } from "next-auth/react";
import { useCallback } from "react";
import { Loader2, Wallet, CreditCard, Landmark, ArrowRight, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { useOfflineData } from "@/hooks/useOfflineData";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface Account {
    _id: string;
    bankName: string;
    accountName: string;
    accountType: string;
    balance: number;
}

interface CardType {
    _id: string;
    bankName: string;
    cardName: string;
    last4Digits: string;
    currentBalance: number;
    creditLimit: number;
}

export default function PassbookPage() {
    const { status } = useSession();
    const router = useRouter();

    const fetchAccounts = useCallback(async () => {
        const res = await fetch('/api/accounts');
        if (!res.ok) throw new Error('Failed to fetch accounts');
        return res.json();
    }, []);

    const { data: accounts = [], isLoading: isAccountsLoading } = useOfflineData<Account[]>({
        key: 'VELOX_ACCOUNTS_CACHE',
        fetcher: fetchAccounts
    });

    const fetchCards = useCallback(async () => {
        const res = await fetch('/api/cards');
        if (!res.ok) throw new Error('Failed to fetch cards');
        return res.json();
    }, []);

    const { data: cards = [], isLoading: isCardsLoading } = useOfflineData<CardType[]>({
        key: 'VELOX_CARDS_CACHE',
        fetcher: fetchCards
    });

    const isLoading = isAccountsLoading || isCardsLoading;

    if (status === 'loading' || (isLoading && accounts.length === 0 && cards.length === 0)) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const cashAccounts = accounts.filter(a => a.accountType === 'Cash');
    const bankAccounts = accounts.filter(a => a.accountType !== 'Cash');

    const totalLiquidity = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    const totalCreditDebt = cards.reduce((sum, card) => sum + (card.currentBalance || 0), 0);
    const netWorth = totalLiquidity - totalCreditDebt;

    return (
        <div className="container mx-auto py-6 pb-24 px-4 md:px-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent w-fit">
                        Passbook
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">All your accounts in one place.</p>
                </div>
            </div>

            {/* Net Worth Summary */}
            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center text-center space-y-2">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Net Liquid Assets</p>
                        <h2 className="text-4xl font-bold tracking-tight">
                            <CurrencyDisplay amount={netWorth} type={netWorth >= 0 ? 'income' : 'expense'} />
                        </h2>
                        <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Assets: <CurrencyDisplay amount={totalLiquidity} type="income" showSymbol={false} /></span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Credit Debt: <CurrencyDisplay amount={totalCreditDebt} type="expense" showSymbol={false} /></span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0 lg:items-start">
                {/* Cash Wallets */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-border/40">
                        <Wallet className="h-4 w-4" /> Cash Wallets
                    </h3>
                    {cashAccounts.length > 0 ? (
                        <div className="grid gap-4">
                            {cashAccounts.map(acc => (
                                <Card key={acc._id} onClick={() => router.push(`/accounts/${acc._id}`)} className="cursor-pointer hover:bg-muted/30 hover:shadow-md transition-all border-l-4 border-l-emerald-500 hover:scale-[1.02] active:scale-[0.98]">
                                    <CardContent className="p-4 lg:p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                                <Wallet className="h-5 w-5 lg:h-6 lg:w-6" />
                                            </div>
                                            <div>
                                                <p className="font-semibold lg:text-lg">{acc.accountName}</p>
                                                <p className="text-xs text-muted-foreground">Cash</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-lg lg:text-xl"><CurrencyDisplay amount={acc.balance} type="income" /></span>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 border border-dashed rounded-xl text-center text-muted-foreground text-sm bg-muted/10">No cash wallets found.</div>
                    )}
                </div>

                {/* Bank Accounts */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-border/40">
                        <Landmark className="h-4 w-4" /> Bank Accounts
                    </h3>
                    {bankAccounts.length === 0 ? (
                        <div className="p-6 border border-dashed rounded-xl text-center text-muted-foreground text-sm bg-muted/10">No bank accounts found.</div>
                    ) : (
                        <div className="grid gap-4">
                            {bankAccounts.map(acc => (
                                <Card key={acc._id} onClick={() => router.push(`/accounts/${acc._id}`)} className="cursor-pointer hover:bg-muted/30 hover:shadow-md transition-all border-l-4 border-l-blue-500 hover:scale-[1.02] active:scale-[0.98]">
                                    <CardContent className="p-4 lg:p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                                                <Landmark className="h-5 w-5 lg:h-6 lg:w-6" />
                                            </div>
                                            <div>
                                                <p className="font-semibold lg:text-lg">{acc.bankName}</p>
                                                <p className="text-sm text-muted-foreground">{acc.accountName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-lg lg:text-xl"><CurrencyDisplay amount={acc.balance} type="income" /></span>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Credit Cards */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-border/40">
                        <CreditCard className="h-4 w-4" /> Credit Cards
                    </h3>
                    {cards.length === 0 ? (
                        <div className="p-6 border border-dashed rounded-xl text-center text-muted-foreground text-sm bg-muted/10">No credit cards found.</div>
                    ) : (
                        <div className="grid gap-4">
                            {cards.map(card => (
                                <Card key={card._id} onClick={() => router.push(`/accounts/${card._id}`)} className="cursor-pointer hover:bg-muted/30 hover:shadow-md transition-all border-l-4 border-l-red-500 hover:scale-[1.02] active:scale-[0.98]">
                                    <CardContent className="p-4 lg:p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-600">
                                                <CreditCard className="h-5 w-5 lg:h-6 lg:w-6" />
                                            </div>
                                            <div>
                                                <p className="font-semibold lg:text-lg">{card.bankName}</p>
                                                <p className="text-sm text-muted-foreground">{card.cardName} •••• {card.last4Digits}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="font-bold text-lg lg:text-xl"><CurrencyDisplay amount={card.currentBalance} type="expense" showSymbol /></p>
                                                <p className="text-[10px] text-muted-foreground">Due</p>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

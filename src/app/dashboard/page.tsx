"use client";

import { useEffect, useState } from "react";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { useOfflineData } from "@/hooks/useOfflineData";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { BurnChart } from "@/components/dashboard/BurnChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { Loader2, TrendingUp, TrendingDown, Wallet, CreditCard, Landmark, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { AccountsGrid } from "@/components/dashboard/AccountsGrid";
import { DebtTile } from "@/components/dashboard/DebtTile";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { Card, CardContent } from "@/components/ui/Card";

export default function DashboardPage() {
    const { data: session } = useSession();

    // Offline Data Hook for Dashboard
    const { data: stats, isLoading } = useOfflineData<any>({
        key: 'VELOX_DASHBOARD_CACHE',
        fetcher: async () => {
            const res = await fetch('/api/dashboard', { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to fetch dashboard data');
            return res.json();
        }
    });

    if (isLoading && !stats) { // Only show loader if no cache AND loading
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-6 lg:p-10 pb-20">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent w-fit">
                            Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-1">Overview of your financial health.</p>
                    </div>
                </div>

                {/* 1. High Level Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                    {/* Liquid Cash */}
                    <Card className="col-span-1 border-l-4 border-l-primary shadow-none bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-4 md:p-6">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="text-[10px] md:text-sm font-medium text-muted-foreground uppercase tracking-wide leading-tight">Total Liquidity</h3>
                                <Wallet className="h-4 w-4 text-primary shrink-0 ml-1" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl md:text-3xl font-bold truncate">
                                    <CurrencyDisplay amount={stats?.totalLiquidity || 0} />
                                </p>
                                <p className="text-[10px] md:text-xs text-muted-foreground truncate">Across all accounts</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Credit Debt */}
                    <Card className="col-span-1 border-l-4 border-l-red-500 shadow-none bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-4 md:p-6">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="text-[10px] md:text-sm font-medium text-muted-foreground uppercase tracking-wide leading-tight">Credit Card Debt</h3>
                                <CreditCard className="h-4 w-4 text-red-500 shrink-0 ml-1" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl md:text-3xl font-bold truncate">
                                    <CurrencyDisplay amount={stats?.totalCreditDebt || 0} type={(stats?.totalCreditDebt || 0) > 0 ? 'expense' : 'neutral'} />
                                </p>
                                <p className="text-[10px] md:text-xs text-muted-foreground truncate">Total outstanding</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Loans & EMIs - Desktop Only -> Now Mobile too */}
                    <Card className="col-span-2 md:col-span-1 border-l-4 border-l-blue-500 shadow-none bg-card/50 backdrop-blur-sm p-0 overflow-hidden flex flex-col transition-all hover:border-l-blue-400 hover:shadow-md cursor-pointer group/card relative">
                        <Link href="/loans" className="absolute inset-0 z-10" aria-label="View Loans" />
                        <div className="grid grid-cols-2 h-full divide-x divide-border/50">
                            {/* Taken (Liability) */}
                            <div className="p-4 bg-red-500/5 flex flex-col justify-between transition-all hover:bg-red-500/10 h-full relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1.5 rounded-md bg-red-500/10 text-red-500 shadow-sm ring-1 ring-red-500/20">
                                            <ArrowDownLeft className="h-4 w-4" />
                                        </div>
                                        <span className="text-[10px] md:text-xs font-bold text-red-900/80 dark:text-red-200/80 uppercase tracking-widest">Taken</span>
                                    </div>
                                    <span className="text-xl md:text-2xl font-bold tracking-tight">
                                        <CurrencyDisplay amount={stats?.totalLoanTaken || 0} type={(stats?.totalLoanTaken || 0) > 0 ? 'expense' : 'neutral'} />
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1 pt-4 mt-auto border-t border-red-200/20 dark:border-red-500/10">
                                    <div className="flex justify-between items-center text-[10px] md:text-xs font-medium text-muted-foreground">
                                        <span>Active</span>
                                        <span className="bg-background/50 px-1.5 py-0.5 rounded shadow-sm">{stats?.loanTakenCount || 0}</span>
                                    </div>
                                    {(stats?.totalEmiPayable || 0) > 0 && (
                                        <div className="flex justify-between items-center text-[10px] md:text-xs font-medium">
                                            <span className="text-muted-foreground">Monthly</span>
                                            <span className="font-semibold bg-red-100/50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">
                                                <CurrencyDisplay amount={stats?.totalEmiPayable} showSymbol={false} type="expense" />
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Given (Asset) */}
                            <div className="p-4 bg-emerald-500/5 flex flex-col justify-between transition-all hover:bg-emerald-500/10 h-full relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex flex-col gap-1 items-end text-right">
                                    <div className="flex items-center gap-2 mb-2 flex-row-reverse">
                                        <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 shadow-sm ring-1 ring-emerald-500/20">
                                            <ArrowUpRight className="h-4 w-4" />
                                        </div>
                                        <span className="text-[10px] md:text-xs font-bold text-emerald-900/80 dark:text-emerald-200/80 uppercase tracking-widest">Given</span>
                                    </div>
                                    <span className="text-xl md:text-2xl font-bold tracking-tight">
                                        <CurrencyDisplay amount={stats?.totalLoanGiven || 0} type={(stats?.totalLoanGiven || 0) > 0 ? 'income' : 'neutral'} />
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1 pt-4 mt-auto border-t border-emerald-200/20 dark:border-emerald-500/10">
                                    <div className="flex justify-between items-center text-[10px] md:text-xs font-medium text-muted-foreground">
                                        <span>Active</span>
                                        <span className="bg-background/50 px-1.5 py-0.5 rounded shadow-sm">{stats?.loanGivenCount || 0}</span>
                                    </div>
                                    {(stats?.totalEmiReceivable || 0) > 0 && (
                                        <div className="flex justify-between items-center text-[10px] md:text-xs font-medium">
                                            <span className="text-muted-foreground">Monthly</span>
                                            <span className="font-semibold bg-emerald-100/50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">
                                                <CurrencyDisplay amount={stats?.totalEmiReceivable} showSymbol={false} type="income" />
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Net Debt Position */}
                    <div className="col-span-2 md:col-span-1">
                        <DebtTile
                            receivable={stats?.totalReceivable || 0}
                            payable={stats?.totalPayable || 0}
                            net={stats?.netDebtPosition || 0}
                        />
                    </div>
                </div>

                {/* 2. Accounts Grid (Carousel) */}
                <AccountsGrid
                    accounts={stats?.accounts || []}
                    cards={stats?.cards || []}
                    currency={stats?.currency || 'INR'}
                />

                {/* 3. Analytics Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Burn Chart - Spans 2 cols */}
                    <div className="col-span-1 lg:col-span-2">
                        <BurnChart
                            data={stats?.chartData || []}
                            currency={stats?.currency || 'INR'}
                        />
                    </div>
                    {/* Category Donut - Spans 1 col */}
                    <div className="col-span-1">
                        <CategoryChart
                            expenseData={stats?.expenseCategoryData || []}
                            incomeData={stats?.incomeCategoryData || []}
                        />
                    </div>
                </div>

                {/* 4. Recent Transactions */}
                <div>
                    <RecentTransactions
                        transactions={stats?.recentTransactions || []}
                        currency={stats?.currency || 'INR'}
                    />
                </div>
            </div>
        </div>
    );
}

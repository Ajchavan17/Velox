"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { BurnChart } from "@/components/dashboard/BurnChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { Loader2, TrendingUp, TrendingDown, Wallet, CreditCard } from "lucide-react";
import { AccountsGrid } from "@/components/dashboard/AccountsGrid";
import { DebtTile } from "@/components/dashboard/DebtTile";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { Card, CardContent } from "@/components/ui/Card";

export default function DashboardPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch('/api/dashboard');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchDashboardData();
        }
    }, [session]);

    if (loading) {
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Liquid Cash */}
                    <Card className="h-full border-l-4 border-l-primary">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Liquidity</h3>
                                <Wallet className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className={`text-3xl font-bold ${(stats?.totalLiquidity || 0) > 0 ? "text-emerald-500" :
                                    (stats?.totalLiquidity || 0) < 0 ? "text-red-500" : "text-foreground"
                                    }`}>
                                    ₹{(stats?.totalLiquidity || 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">Across all bank accounts</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Credit Debt */}
                    <Card className="h-full border-l-4 border-l-red-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Credit Card Debt</h3>
                                <CreditCard className="h-4 w-4 text-red-500" />
                            </div>
                            <div>
                                <p className={`text-3xl font-bold ${(stats?.totalCreditDebt || 0) > 0 ? "text-red-500" : "text-foreground"
                                    }`}>
                                    ₹{(stats?.totalCreditDebt || 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">Total outstanding due</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Net Debt Position */}
                    <DebtTile
                        receivable={stats?.totalReceivable || 0}
                        payable={stats?.totalPayable || 0}
                        net={stats?.netDebtPosition || 0}
                    />
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
                        <CategoryChart data={stats?.categoryData || []} />
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

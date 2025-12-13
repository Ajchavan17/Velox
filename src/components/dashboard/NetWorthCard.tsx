import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { TrendingUp, DollarSign, Wallet } from "lucide-react";

interface NetWorthProps {
    netBalance: number;
    totalIncome: number;
    totalExpenses: number;
    currency: string;
}

export const NetWorthCard = ({ netBalance, totalIncome, totalExpenses, currency = 'INR' }: NetWorthProps) => {
    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <Card className="glass-card border-primary/20 bg-primary/5 h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Net Balance</CardTitle>
                <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-foreground tracking-tight mb-4">{formatAmount(netBalance)}</div>

                <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Income</span>
                        <span className="text-emerald-500 font-medium">+{formatAmount(totalIncome)}</span>
                    </div>
                    <div className="w-full bg-zinc-800/50 h-1 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min((totalIncome / (totalIncome + totalExpenses || 1)) * 100, 100)}%` }} />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-muted-foreground">Expenses</span>
                        <span className="text-red-500 font-medium">-{formatAmount(totalExpenses)}</span>
                    </div>
                    <div className="w-full bg-zinc-800/50 h-1 rounded-full overflow-hidden">
                        <div className="bg-red-500 h-full rounded-full" style={{ width: `${Math.min((totalExpenses / (totalIncome + totalExpenses || 1)) * 100, 100)}%` }} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

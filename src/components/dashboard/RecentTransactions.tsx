import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
    _id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
}

interface RecentTransactionsProps {
    transactions: Transaction[];
    currency: string;
}

export const RecentTransactions = ({ transactions, currency = 'INR' }: RecentTransactionsProps) => {
    // Currency formatter
    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <Card className="glass-card border-primary/20 h-full">
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    <Link href="/transactions" className="hover:text-primary transition-colors cursor-pointer">
                        Recent Activity
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {transactions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No recent transactions.
                        </div>
                    ) : (
                        transactions.map((t) => (
                            <div key={t._id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                                    <div className={`p-2 rounded-full flex-shrink-0 ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {t.type === 'income' ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate" title={t.description}>
                                            {t.description}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {format(new Date(t.date), 'MMM d')} • {t.category}
                                        </p>
                                    </div>
                                </div>
                                <div className={`text-sm font-bold whitespace-nowrap ml-auto ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {t.type === 'income' ? '+' : '-'} {formatAmount(t.amount)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

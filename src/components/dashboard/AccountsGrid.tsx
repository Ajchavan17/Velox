import { Card, CardContent } from "@/components/ui/Card";
import { Landmark, CreditCard, Wallet } from "lucide-react";
import { useRouter } from 'next/navigation';

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

interface AccountsGridProps {
    accounts: Account[];
    cards: CardType[];
    currency: string;
}

export const AccountsGrid = ({ accounts = [], cards = [], currency }: AccountsGridProps) => {
    const router = useRouter();
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4 px-1 flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" /> Accounts & Cards
                </h3>
                {/* Horizontal Scroll Container */}
                <div
                    className="flex gap-4 overflow-x-auto pb-4 px-1 no-scrollbar -mx-1 snap-x"
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                >

                    {/* Bank Accounts */}
                    {accounts.map((acc) => (
                        <div
                            key={acc._id}
                            onClick={() => router.push(`/accounts/${acc._id}`)}
                            className="block"
                        >
                            <Card className="min-w-[280px] snap-center bg-gradient-to-br from-background to-muted/50 border-primary/20 hover:border-primary/50 transition-colors cursor-pointer group hover:shadow-md h-full">
                                <CardContent className="p-5 flex flex-col justify-between h-[160px]">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-lg group-hover:text-primary transition-colors">{acc.bankName}</p>
                                            <p className="text-sm text-muted-foreground">{acc.accountName}</p>
                                        </div>
                                        <div className="p-2 bg-primary/10 rounded-full text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            <Landmark className="h-5 w-5" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Available Balance</p>
                                        <p className={`text-2xl font-bold ${acc.balance > 0 ? "text-emerald-500" :
                                            acc.balance < 0 ? "text-red-500" : "text-foreground"
                                            }`}>
                                            ₹{acc.balance.toLocaleString()}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}

                    {/* Credit Cards */}
                    {cards.map((card) => {
                        const usage = Math.min((card.currentBalance / card.creditLimit) * 100, 100);
                        const isHighUsage = usage > 70;

                        return (
                            <div
                                key={card._id}
                                onClick={() => router.push(`/accounts/${card._id}`)}
                                className="block"
                            >
                                <Card className="min-w-[280px] snap-center bg-gradient-to-br from-background to-muted/50 border-secondary/20 hover:border-secondary/50 transition-colors cursor-pointer group hover:shadow-md h-full">

                                    <CardContent className="p-5 flex flex-col justify-between h-[160px]">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-lg">{card.bankName}</p>
                                                <p className="text-sm text-muted-foreground">{card.cardName} •••• {card.last4Digits}</p>
                                            </div>
                                            <div className="p-2 bg-secondary/10 rounded-full text-secondary">
                                                <CreditCard className="h-5 w-5" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current Due</p>
                                                    <p className={`text-2xl font-bold ${card.currentBalance > 0 ? "text-red-500" : "text-foreground"
                                                        }`}>
                                                        ₹{card.currentBalance.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isHighUsage ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                                        {usage.toFixed(0)}% Used
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${isHighUsage ? 'bg-red-500' : 'bg-primary'}`}
                                                    style={{ width: `${usage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })}

                    {accounts.length === 0 && cards.length === 0 && (
                        <div className="min-w-[280px] h-[160px] flex items-center justify-center border border-dashed rounded-xl bg-muted/20 text-muted-foreground text-sm">
                            No accounts linked yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

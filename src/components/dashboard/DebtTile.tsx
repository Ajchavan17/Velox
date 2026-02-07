import { Card, CardContent } from "@/components/ui/Card";
import { ArrowUpRight, ArrowDownLeft, WalletCards } from "lucide-react";

interface DebtTileProps {
    receivable: number;
    payable: number;
    net: number;
}

export const DebtTile = ({ receivable, payable, net }: DebtTileProps) => {
    return (
        <Card className="h-full border-l-4 border-l-orange-500">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Debt Position</h3>
                    <WalletCards className="h-4 w-4 text-orange-500" />
                </div>

                <div className="mb-4">
                    <p className={`text-3xl font-bold ${net > 0 ? 'text-emerald-500' : net < 0 ? 'text-red-500' : 'text-foreground'}`}>
                        {net > 0 ? '+' : net < 0 ? '-' : ''}₹{Math.abs(net).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Net Value</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border/50">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-emerald-500 text-xs font-medium">
                            <ArrowDownLeft className="h-3 w-3" /> To Receive
                        </div>
                        <p className="font-semibold">₹{receivable.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-red-500 text-xs font-medium">
                            <ArrowUpRight className="h-3 w-3" /> To Pay
                        </div>
                        <p className="font-semibold">₹{payable.toLocaleString()}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

import { Card, CardContent } from "@/components/ui/Card";
import { ArrowUpRight, ArrowDownLeft, WalletCards } from "lucide-react";

interface DebtTileProps {
    receivable: number;
    payable: number;
    net: number;
}

export const DebtTile = ({ receivable, payable, net }: DebtTileProps) => {
    return (
        <Card className="h-full border-l-4 border-l-orange-500 shadow-none bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                    <h3 className="text-[10px] md:text-sm font-medium text-muted-foreground uppercase tracking-wide">Net Debt Position</h3>
                    <ArrowUpRight className="h-4 w-4 text-orange-500" />
                </div>

                <div className="mb-2 md:mb-4">
                    <div className="flex items-baseline justify-between">
                        <p className={`text-xl md:text-3xl font-bold ${net > 0 ? 'text-emerald-500' : net < 0 ? 'text-red-500' : 'text-foreground'}`}>
                            {net > 0 ? '+' : net < 0 ? '-' : ''}₹{Math.abs(net).toLocaleString()}
                        </p>
                        <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wide md:mt-1">Net Position</p>
                    </div>
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

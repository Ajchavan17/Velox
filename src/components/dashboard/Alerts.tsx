import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { AlertTriangle, Bell, Info } from "lucide-react";

export const Alerts = () => {
    return (
        <Card className="glass-card col-span-1 md:col-span-2 lg:col-span-3">
            <CardHeader>
                <CardTitle className="text-sm font-medium text-zinc-400">Actionable Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start space-x-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-medium text-red-400">Unusual Spending Detected</h4>
                        <p className="text-xs text-zinc-400 mt-1">
                            We noticed a large transaction of ₹450.00 at "TechStore Inc." on your Visa card.
                        </p>
                    </div>
                </div>

                <div className="flex items-start space-x-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <Bell className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-medium text-yellow-400">Bill Due Tomorrow</h4>
                        <p className="text-xs text-zinc-400 mt-1">
                            Your electricity bill of ₹85.20 is due tomorrow. Auto-pay is enabled.
                        </p>
                    </div>
                </div>

                <div className="flex items-start space-x-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-medium text-blue-400">Budget Update</h4>
                        <p className="text-xs text-zinc-400 mt-1">
                            You've used 80% of your "Dining Out" budget for this month.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

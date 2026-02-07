import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface ChartData {
    name: string;
    income: number;
    expense: number;
}

interface BurnChartProps {
    data: ChartData[];
    currency: string;
}

export const BurnChart = ({ data = [], currency = 'INR' }: BurnChartProps) => {
    // If no data, show mockup or empty state? Let's handle empty.
    const expenses = data.map(d => d.expense);
    const max = Math.max(...expenses, 100); // Default max to avoid div by zero

    return (
        <Card className="glass-card h-full">
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Monthly Spend</CardTitle>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                        No spending data available.
                    </div>
                ) : (
                    <>
                        <div className="h-[200px] w-full flex items-end justify-between gap-2 mt-4">
                            {data.map((item, index) => (
                                <div key={index} className="relative w-full h-full flex items-end group">
                                    <div
                                        className="w-full bg-muted/20 rounded-t-sm group-hover:bg-red-500/50 transition-all duration-300 relative overflow-hidden"
                                        style={{ height: `${(item.expense / max) * 100}%` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    {/* Tooltip */}
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                        {item.name}: {item.expense}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                            {data.map((item, i) => (
                                <span key={i}>{item.name}</span>
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

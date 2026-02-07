import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CategoryData {
    name: string;
    value: number;
}

interface CategoryChartProps {
    expenseData: CategoryData[];
    incomeData: CategoryData[];
}

export const CategoryChart = ({ expenseData, incomeData }: CategoryChartProps) => {
    const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');

    const data = activeTab === 'expense' ? expenseData : incomeData;
    const total = data.reduce((sum, item) => sum + item.value, 0);

    // Modern color palette - Adjusted for Income/Expense theme hints
    const colors = activeTab === 'expense'
        ? ['#ef4444', '#f97316', '#eab308', '#84cc16', '#06b6d4', '#6366f1'] // Red/Warm bias
        : ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4']; // Green/Cool bias

    // SVG Config (Same as before)
    const size = 100;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;
    let currentAngle = -90;

    const chartData = data.slice(0, 6).map((item, index) => {
        const percentage = total > 0 ? (item.value / total) * 100 : 0;
        const angle = (percentage / 100) * 360;
        const segmentLength = (percentage / 100) * circumference;
        const segment = {
            ...item,
            color: colors[index % colors.length],
            percentage,
            strokeDasharray: `${segmentLength} ${circumference}`,
            strokeDashoffset: 0,
            rotation: currentAngle,
        };
        currentAngle += angle;
        return segment;
    });

    return (
        <Card className="h-full border-border/60 shadow-sm flex flex-col">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                        Top Categories
                    </CardTitle>
                    <div className="flex bg-muted/50 rounded-lg p-1 gap-1">
                        <button
                            onClick={() => setActiveTab('expense')}
                            className={cn(
                                "text-[10px] px-2 py-1 rounded-md transition-all font-medium",
                                activeTab === 'expense' ? "bg-white text-red-500 shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Expense
                        </button>
                        <button
                            onClick={() => setActiveTab('income')}
                            className={cn(
                                "text-[10px] px-2 py-1 rounded-md transition-all font-medium",
                                activeTab === 'income' ? "bg-white text-emerald-500 shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Income
                        </button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
                <div className="flex flex-col gap-6">
                    {/* Chart & Center Text */}
                    <div className="relative h-48 w-full flex items-center justify-center">
                        {total > 0 ? (
                            <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-auto drop-shadow-xl transform transition-all duration-500 ease-out hover:scale-105">
                                <circle cx={center} cy={center} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-muted/10" />
                                {chartData.map((item, i) => (
                                    <circle
                                        key={item.name}
                                        cx={center} cy={center} r={radius}
                                        fill="none" stroke={item.color} strokeWidth={strokeWidth}
                                        strokeDasharray={item.strokeDasharray}
                                        transform={`rotate(${item.rotation} ${center} ${center})`}
                                        strokeLinecap="round"
                                        className="transition-all duration-500"
                                    />
                                ))}
                            </svg>
                        ) : (
                            <div className="h-32 w-32 rounded-full border-4 border-muted/20 border-dashed flex items-center justify-center text-center p-4">
                                <span className="text-xs text-muted-foreground">No {activeTab} data</span>
                            </div>
                        )}

                        {/* Center Text Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Total</span>
                            <span className="text-xl font-bold tracking-tight">
                                <CurrencyDisplay amount={total} showSymbol={true} type={activeTab} />
                            </span>
                        </div>
                    </div>

                    {/* Modern Legend */}
                    <div className="space-y-3">
                        {chartData.map((item) => (
                            <div key={item.name} className="group flex items-center justify-between text-sm">
                                <div className="flex items-center gap-3">
                                    <div className="h-2.5 w-2.5 rounded-full shadow-sm ring-2 ring-transparent group-hover:ring-offset-1 group-hover:ring-current transition-all" style={{ backgroundColor: item.color, color: item.color }} />
                                    <span className="font-medium text-foreground/90 group-hover:text-primary transition-colors">{item.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-semibold text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">{item.percentage.toFixed(0)}%</span>
                                    <span className="font-semibold tabular-nums">
                                        <CurrencyDisplay amount={item.value} showSymbol={true} type={activeTab} />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface CategoryData {
    name: string;
    value: number;
}

interface CategoryChartProps {
    data: CategoryData[];
}

export const CategoryChart = ({ data }: CategoryChartProps) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    // Calculate segments for conic-gradient
    // Colors: We'll use a predefined palette
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']; // emerald, blue, amber, red, violet

    let currentDeg = 0;
    const gradientSegments = data.map((item, index) => {
        const percentage = (item.value / total) * 100;
        const deg = (percentage / 100) * 360;
        const start = currentDeg;
        const end = currentDeg + deg;
        currentDeg = end;
        return `${colors[index % colors.length]} ${start}deg ${end}deg`;
    }).join(', ');

    const backgroundStyle = data.length > 0
        ? { background: `conic-gradient(${gradientSegments})` }
        : { background: '#e5e7eb' };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Top Expenses</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-6">
                    {/* Donut Chart */}
                    <div className="relative h-32 w-32 shrink-0 rounded-full" style={backgroundStyle}>
                        {/* Inner Circle for Donut Effect */}
                        <div className="absolute inset-4 bg-card rounded-full flex items-center justify-center">
                            <div className="text-center">
                                <span className="text-xs text-muted-foreground">Total</span>
                                <p className="font-bold text-sm">₹{total.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex-1 space-y-2">
                        {data.slice(0, 5).map((item, index) => (
                            <div key={item.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: colors[index % colors.length] }}
                                    />
                                    <span className="truncate max-w-[100px]">{item.name}</span>
                                </div>
                                <span className="font-medium">₹{item.value.toLocaleString()}</span>
                            </div>
                        ))}
                        {data.length === 0 && (
                            <div className="text-muted-foreground text-sm italic">No expense data yet.</div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

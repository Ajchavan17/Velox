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

    // Modern color palette
    const colors = [
        '#10b981', // Emerald
        '#3b82f6', // Blue
        '#f59e0b', // Amber
        '#ef4444', // Red
        '#8b5cf6', // Violet
        '#ec4899', // Pink
        '#06b6d4', // Cyan
    ];

    // SVG Config
    const size = 100;
    const strokeWidth = 12; // Thicker, modern donut
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;
    const gapAngle = 2; // Gap between segments in degrees (approx)

    let currentAngle = -90; // Start at top

    // Process data to add chart properties
    const chartData = data.slice(0, 6).map((item, index) => {
        const percentage = total > 0 ? (item.value / total) * 100 : 0;
        const angle = (percentage / 100) * 360;

        // Calculate stroke-dasharray for this segment
        // We subtract a tiny bit for the gap simulation if we want, or just rely on rotation
        const segmentLength = (percentage / 100) * circumference;

        const segment = {
            ...item,
            color: colors[index % colors.length],
            percentage,
            strokeDasharray: `${segmentLength} ${circumference}`,
            strokeDashoffset: 0, // We'll rotate the circle element instead
            rotation: currentAngle,
        };

        currentAngle += angle;
        return segment;
    });

    return (
        <Card className="h-full border-border/60 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                    Top Expenses
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full normal-case tracking-normal">This Month</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-6">
                    {/* Chart & Center Text */}
                    <div className="relative h-48 w-full flex items-center justify-center">
                        {total > 0 ? (
                            <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-auto drop-shadow-xl transform transition-all duration-500 ease-out hover:scale-105">
                                {/* Background "Track" Circle (Optional, adds depth) */}
                                <circle
                                    cx={center}
                                    cy={center}
                                    r={radius}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={strokeWidth}
                                    className="text-muted/10"
                                />

                                {/* Segments */}
                                {chartData.map((item, i) => (
                                    <circle
                                        key={item.name}
                                        cx={center}
                                        cy={center}
                                        r={radius}
                                        fill="none"
                                        stroke={item.color}
                                        strokeWidth={strokeWidth}
                                        strokeDasharray={item.strokeDasharray}
                                        strokeDashoffset={0}
                                        strokeLinecap="round"
                                        transform={`rotate(${item.rotation} ${center} ${center})`}
                                        className="transition-all duration-500"
                                    />
                                ))}
                            </svg>
                        ) : (
                            <div className="h-32 w-32 rounded-full border-4 border-muted/20 border-dashed flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">No Data</span>
                            </div>
                        )}

                        {/* Center Text Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Total</span>
                            <span className="text-2xl font-bold tracking-tight">₹{total > 1000 ? `${(total / 1000).toFixed(1)}k` : total}</span>
                        </div>
                    </div>

                    {/* Modern Legend */}
                    <div className="space-y-3">
                        {chartData.map((item) => (
                            <div key={item.name} className="group flex items-center justify-between text-sm">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="h-2.5 w-2.5 rounded-full shadow-sm ring-2 ring-transparent group-hover:ring-offset-1 group-hover:ring-current transition-all"
                                        style={{ backgroundColor: item.color, color: item.color }}
                                    />
                                    <span className="font-medium text-foreground/90 group-hover:text-primary transition-colors">{item.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-semibold text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">{item.percentage.toFixed(0)}%</span>
                                    <span className="font-semibold tabular-nums">₹{item.value.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

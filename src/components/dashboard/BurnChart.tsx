import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState, useRef } from "react";

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
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Safe access for selected data
    const selectedData = hoveredIndex !== null && data[hoveredIndex] ? data[hoveredIndex] : null;

    if (data.length === 0) {
        return (
            <Card className="glass-card h-full border-border/60 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                        Monthly Activity
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                    No data available.
                </CardContent>
            </Card>
        );
    }

    // Determine Y scale max (income or expense) + padding
    const allValues = data.flatMap(d => [d.income, d.expense]);
    const maxVal = Math.max(...allValues, 100) * 1.1;

    // SVG Dimensions
    const width = 300;
    const height = 150;
    const paddingX = 10;
    const paddingY = 10;

    const chartHeight = height - paddingY * 2;
    const chartWidth = width - paddingX * 2;

    const barGroupWidth = chartWidth / data.length;
    const barWidth = (barGroupWidth * 0.7) / 2; // 2 bars (income/expense) taking 70% of space
    const gap = barGroupWidth * 0.1;

    const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        // Handle both touch and mouse clientX
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;

        const relativeX = clientX - rect.left;

        // Find closest group index
        // x ~ index * barGroupWidth + paddingX
        // index ~ (x - paddingX) / barGroupWidth

        // Scale relativeX to SVG coord
        const scaleX = width / rect.width;
        const svgX = relativeX * scaleX;

        let index = Math.floor((svgX - paddingX) / barGroupWidth);

        // Clamp index
        if (index < 0) index = 0;
        if (index >= data.length) index = data.length - 1;

        setHoveredIndex(index);
    };

    return (
        <Card className="glass-card h-full border-border/60 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center justify-between min-h-[20px]">
                    {selectedData ? (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 animate-in fade-in slide-in-from-left-2 duration-200">
                            <span className="text-foreground font-bold">{selectedData.name}</span>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-emerald-500 text-[10px] md:text-xs font-mono">₹{(selectedData.income || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span className="text-red-500 text-[10px] md:text-xs font-mono">₹{selectedData.expense.toLocaleString()}</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            Monthly Activity
                            <div className="flex gap-2">
                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-normal normal-case tracking-normal">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> In
                                </span>
                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-normal normal-case tracking-normal">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Out
                                </span>
                            </div>
                        </>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div
                    ref={containerRef}
                    className="relative h-[180px] w-full mt-2 touch-none select-none"
                    onMouseLeave={() => setHoveredIndex(null)}
                    onMouseMove={handleTouchMove}
                    onTouchStart={handleTouchMove}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={() => setTimeout(() => setHoveredIndex(null), 1000)} // Delay hide on touch end
                >
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible pointer-events-none">

                        {/* Grid Lines */}
                        <line x1="0" y1={height - paddingY} x2={width} y2={height - paddingY} stroke="currentColor" strokeOpacity="0.1" />
                        <line x1="0" y1={paddingY} x2={width} y2={paddingY} stroke="currentColor" strokeOpacity="0.1" strokeDasharray="4 4" />
                        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="currentColor" strokeOpacity="0.05" strokeDasharray="4 4" />

                        {/* Bars */}
                        {data.map((d, i) => {
                            const groupX = paddingX + i * barGroupWidth;

                            const incomeHeight = ((d.income || 0) / maxVal) * chartHeight;
                            const expenseHeight = (d.expense / maxVal) * chartHeight;

                            const isHovered = hoveredIndex === i;
                            const opacity = hoveredIndex === null ? 1 : (isHovered ? 1 : 0.4);

                            return (
                                <g key={i} className="transition-opacity duration-200" style={{ opacity }}>
                                    {/* Income Bar (Left with rounded top-left) */}
                                    <rect
                                        x={groupX + (barGroupWidth - 2 * barWidth - gap) / 2}
                                        y={height - paddingY - incomeHeight}
                                        width={barWidth}
                                        height={incomeHeight}
                                        fill="#10b981"
                                        rx="2"
                                        className="transition-all duration-300"
                                    />

                                    {/* Expense Bar (Right with rounded top-right) */}
                                    <rect
                                        x={groupX + (barGroupWidth - 2 * barWidth - gap) / 2 + barWidth + gap}
                                        y={height - paddingY - expenseHeight}
                                        width={barWidth}
                                        height={expenseHeight}
                                        fill="#ef4444"
                                        rx="2"
                                        className="transition-all duration-300"
                                    />

                                    {/* Interaction Highlight Background (Optional) */}
                                    {isHovered && (
                                        <rect
                                            x={groupX}
                                            y={0}
                                            width={barGroupWidth}
                                            height={height}
                                            fill="currentColor"
                                            className="text-muted-foreground/5"
                                        />
                                    )}
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* Labels */}
                <div className="flex justify-between mt-2 px-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    {data.map((d, i) => (
                        <span key={i} className={
                            // Show first, last, and active
                            i === 0 || i === data.length - 1 || hoveredIndex === i
                                ? "opacity-100 transition-opacity"
                                : "opacity-0 md:opacity-50"
                        } style={{ width: `${100 / data.length}%`, textAlign: 'center' }}>
                            {d.name.substring(0, 3)}
                        </span>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

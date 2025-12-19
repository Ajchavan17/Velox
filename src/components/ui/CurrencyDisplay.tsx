import React from "react";
import { cn } from "@/lib/utils";

interface CurrencyDisplayProps {
    amount: number;
    type?: 'income' | 'expense' | 'neutral';
    className?: string;
    showSymbol?: boolean;
}

export function CurrencyDisplay({
    amount,
    type,
    className,
    showSymbol = true
}: CurrencyDisplayProps) {
    // Determine type if not provided
    const resolvedType = type
        ? type
        : amount > 0
            ? 'income'
            : amount < 0
                ? 'expense'
                : 'neutral';

    const colorClass =
        resolvedType === 'income' ? 'text-emerald-500' :
            resolvedType === 'expense' ? 'text-red-500' :
                'text-foreground';

    return (
        <span className={cn(colorClass, className)}>
            {showSymbol && "₹"}{Math.abs(amount).toLocaleString()}
        </span>
    );
}

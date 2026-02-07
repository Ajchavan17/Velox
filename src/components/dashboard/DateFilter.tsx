"use client";

import { Select } from "@/components/ui/Select";
import { useEffect, useState } from "react";
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, format } from "date-fns";
import { cn } from "@/lib/utils";

export type DateRange = {
    start: string;
    end: string;
    label: string;
};

interface DateFilterProps {
    onFilterChange: (range: { start: string, end: string }) => void;
    className?: string;
    defaultFilter?: string;
}

export const DateFilter = ({ onFilterChange, className = "", defaultFilter = 'this-month' }: DateFilterProps) => {
    const [selectedFilter, setSelectedFilter] = useState(defaultFilter);

    const filters = [
        { label: 'This Month', value: 'this-month' },
        { label: 'Last Month', value: 'last-month' },
        { label: 'Last 3 Months', value: 'last-3-months' },
        { label: 'This Year', value: 'this-year' },
        { label: 'All Time', value: 'all-time' },
    ];

    useEffect(() => {
        applyFilter(selectedFilter);
    }, []);

    const applyFilter = (filterValue: string) => {
        const now = new Date();
        let start: Date;
        let end: Date = endOfMonth(now); // Default to end of current month (or today)

        switch (filterValue) {
            case 'this-month':
                start = startOfMonth(now);
                break;
            case 'last-month':
                start = startOfMonth(subMonths(now, 1));
                end = endOfMonth(subMonths(now, 1));
                break;
            case 'last-3-months':
                start = startOfMonth(subMonths(now, 2)); // Current + Prev 2 = 3 months
                break;
            case 'this-year':
                start = startOfYear(now);
                end = endOfYear(now);
                break;
            case 'all-time':
                start = new Date('2000-01-01'); // Way back
                end = new Date('2100-01-01'); // Way forward
                break;
            default:
                start = startOfMonth(now);
        }

        const range = {
            start: format(start, 'yyyy-MM-dd'),
            end: format(end, 'yyyy-MM-dd')
        };

        onFilterChange(range);
    };

    const handleChange = (value: string) => {
        setSelectedFilter(value);
        applyFilter(value);
    };

    return (
        <div className={cn("w-full max-w-[140px] md:max-w-[150px]", className)}>
            <Select
                value={selectedFilter}
                onChange={handleChange}
                options={filters}
                className="text-xs sm:text-sm"
                align="end"
                variant="ghost"
            />
        </div>
    );
};

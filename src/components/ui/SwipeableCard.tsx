"use client";

import React, { useRef, useState } from "react";
import { Trash2, Edit2 } from "lucide-react";

interface SwipeableCardProps {
    children: React.ReactNode;
    onEdit: () => void;
    onDelete: () => void;
    className?: string; // To merge styles
}

export const SwipeableCard = ({ children, onEdit, onDelete, className = "" }: SwipeableCardProps) => {
    const [offset, setOffset] = useState(0);
    const startX = useRef<number | null>(null);
    const currentOffset = useRef(0);
    const maxSwipe = 130; // Total width of actions + spacing

    const handleTouchStart = (e: React.TouchEvent) => {
        // Stop bubbling to prevent conflicts with global swipe navigation
        e.stopPropagation();
        startX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        e.stopPropagation();
        if (startX.current === null) return;
        const diff = e.touches[0].clientX - startX.current;

        // Calculate new offset:
        // currentOffset.current is the starting closed/open state (0 or -maxSwipe)
        // diff is the movement
        let newOffset = currentOffset.current + diff;

        // Clamp values:
        // Max (Right): 0 (Closed)
        // Min (Left): -maxSwipe (Fully Open)
        // Allow a little rubber banding
        if (newOffset > 20) newOffset = 20;
        if (newOffset < -maxSwipe - 50) newOffset = -maxSwipe - 50;

        setOffset(newOffset);
    };

    const handleTouchEnd = () => {
        if (offset < -(maxSwipe / 3)) {
            // Snap open
            setOffset(-maxSwipe);
            currentOffset.current = -maxSwipe;
        } else {
            // Snap closed
            setOffset(0);
            currentOffset.current = 0;
        }
        startX.current = null;
    };

    const resetSwipe = () => {
        setOffset(0);
        currentOffset.current = 0;
    };

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Actions Background */}
            <div className="absolute inset-y-0 right-0 flex items-center justify-end z-0 pr-4 gap-3 w-[150px]">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        resetSwipe();
                        onEdit();
                    }}
                    className="h-10 w-10 rounded-full bg-yellow-500 text-white flex items-center justify-center shadow-md transition-transform active:scale-95"
                >
                    <Edit2 className="h-5 w-5" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        resetSwipe();
                        onDelete();
                    }}
                    className="h-10 w-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md transition-transform active:scale-95"
                >
                    <Trash2 className="h-5 w-5" />
                </button>
            </div>

            {/* Foreground Content */}
            <div
                className="relative z-10 bg-card transition-transform duration-200 ease-out"
                style={{ transform: `translateX(${offset}px)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {children}
            </div>
        </div>
    );
};

"use client";

import { Plus } from "lucide-react";

interface FloatingActionButtonProps {
    onClick: () => void;
    label?: string; // Optional label for accessibility
}

export const FloatingActionButton = ({ onClick, label = "Add" }: FloatingActionButtonProps) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-24 right-4 z-50 md:hidden flex items-center justify-center w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={label}
        >
            <Plus className="h-8 w-8" />
        </button>
    );
};

'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function ThemeSelector() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    const themes = [
        { id: 'light', name: 'Light', icon: Sun },
        { id: 'dark', name: 'Dark', icon: Moon },
        { id: 'system', name: 'System', icon: Laptop },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themes.map((t) => {
                const Icon = t.icon;
                const isActive = theme === t.id;

                return (
                    <div
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`
                            cursor-pointer rounded-xl border-2 p-4 transition-all hover:bg-accent hover:text-accent-foreground
                            ${isActive
                                ? 'border-primary bg-primary/5'
                                : 'border-transparent bg-card text-card-foreground shadow-sm hover:border-border'
                            }
                        `}
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className={`p-2 rounded-full ${isActive ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
                                <Icon className="h-6 w-6" />
                            </div>
                            <span className="font-medium">{t.name}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

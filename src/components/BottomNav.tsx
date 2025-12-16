'use client';

import { LayoutDashboard, ArrowRightLeft, Wallet, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function BottomNav() {
    const pathname = usePathname();
    const { data: session } = useSession();

    if (!session) return null;

    const navItems = [
        {
            label: 'Home',
            href: '/dashboard',
            icon: LayoutDashboard,
        },
        {
            label: 'Transact',
            href: '/transactions',
            icon: ArrowRightLeft,
        },
        {
            label: 'Debts',
            href: '/debts',
            icon: Wallet,
        },
        {
            label: 'Profile',
            href: '/profile',
            icon: User,
        },
    ];

    return (
        <div className="fixed-nav fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe-area-inset-bottom bg-background/80 backdrop-blur-xl border-t border-border/40">
            <nav className="flex items-center justify-around h-16 pb-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <div className={`p-1 rounded-xl transition-all duration-200 ${isActive ? 'bg-primary/10' : ''}`}>
                                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

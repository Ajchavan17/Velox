'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { usePathname, useRouter } from 'next/navigation';

import { useAuthUI } from '@/context/AuthUIContext';

import { useSession, signOut } from 'next-auth/react';
import { User, Settings, LogOut, ChevronDown, Bell, Menu, X, Zap, Plus, WalletCards } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { openLogin, openRegister, isSidebarOpen } = useAuthUI();
    const { data: session, status } = useSession();
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean | 'quick'>(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const quickActionRef = useRef<HTMLDivElement>(null);

    const isAuthPage = pathname?.startsWith('/auth') || pathname === '/login' || pathname === '/register';

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            const isOutsideProfile = dropdownRef.current && !dropdownRef.current.contains(target);
            const isOutsideQuick = quickActionRef.current && !quickActionRef.current.contains(target);

            if (isOutsideProfile && isOutsideQuick) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Prevent scrolling when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileMenuOpen]);

    if (isAuthPage) return null;

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/transactions', label: 'Transactions' },
        { href: '/loans', label: 'Loans' },
        { href: '/debts', label: 'Debt/Lent' },
        { href: '/budget', label: 'Budget' },
        { href: '/investments', label: 'Investments' },
    ];

    return (
        <>
            <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-2">
                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-primary"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                        <Link href={session ? "/dashboard" : "/"} className="flex items-center gap-3 group">
                            <Logo size={32} className="transition-transform duration-300 group-hover:scale-110" />
                        </Link>
                    </div>

                    <nav className="hidden md:flex gap-8">
                        {status === 'loading' ? (
                            <div className="flex gap-8">
                                <div className="h-5 w-20 bg-muted/50 animate-pulse rounded-md" />
                                <div className="h-5 w-24 bg-muted/50 animate-pulse rounded-md" />
                                <div className="h-5 w-16 bg-muted/50 animate-pulse rounded-md" />
                                <div className="h-5 w-16 bg-muted/50 animate-pulse rounded-md" />
                            </div>
                        ) : session ? (
                            navLinks.map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-sm font-medium transition-colors ${pathname === link.href ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                                >
                                    {link.label}
                                </Link>
                            ))
                        ) : (
                            <>
                                <Link
                                    href="/#features"
                                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Features
                                </Link>
                                <Link
                                    href="/pricing"
                                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Pricing
                                </Link>
                                <Link
                                    href="/about"
                                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                                >
                                    About
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Hide buttons when sidebar is open to avoid clutter/distraction */}
                    <div className="flex items-center gap-4">
                        {!session && <ThemeToggle />}

                        {/* Actions Area */}
                        <div className={`flex gap-4 items-center transition-opacity duration-300 ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${isMobileMenuOpen ? 'hidden' : 'flex'}`}>


                            {status === 'loading' ? (
                                <div className="h-9 w-20 bg-muted/50 animate-pulse rounded-md" />
                            ) : session ? (
                                <>
                                    {/* Quick Actions */}
                                    <div className="relative" ref={quickActionRef}>
                                        <button
                                            onClick={() => setIsDropdownOpen(isDropdownOpen === 'quick' ? false : 'quick')}
                                            className="p-2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                                            title="Quick Actions"
                                        >
                                            <Zap className="h-5 w-5" />
                                        </button>

                                        {isDropdownOpen === 'quick' && (
                                            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-input bg-background shadow-lg py-1 animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
                                                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50 bg-muted/20">
                                                    Quick Actions
                                                </div>
                                                <div className="p-1">
                                                    <button
                                                        onClick={() => {
                                                            router.push("/transactions?new=true");
                                                            setIsDropdownOpen(false);
                                                        }}
                                                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors text-left"
                                                    >
                                                        <Plus className="h-4 w-4 text-emerald-500" />
                                                        Add Transaction
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            router.push("/debts?new=true");
                                                            setIsDropdownOpen(false);
                                                        }}
                                                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors text-left"
                                                    >
                                                        <WalletCards className="h-4 w-4 text-primary" />
                                                        Record Debt
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
                                        <Bell className="h-5 w-5" />
                                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
                                    </button>
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => setIsDropdownOpen(isDropdownOpen === true ? false : true)}
                                            className="flex items-center gap-2 p-1.5 rounded-full hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                                        >
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isDropdownOpen === true ? 'rotate-180' : ''}`} />
                                        </button>

                                        {isDropdownOpen === true && (
                                            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-input bg-background shadow-lg py-1 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                                <div className="px-4 py-3 border-b border-border/50">
                                                    <p className="text-sm font-medium text-foreground truncate">{session.user?.name || 'User'}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                                                </div>

                                                <div className="p-1">
                                                    <Link
                                                        href="/profile"
                                                        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                                                        onClick={() => setIsDropdownOpen(false)}
                                                    >
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        Profile
                                                    </Link>
                                                    <Link
                                                        href="/settings"
                                                        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                                                        onClick={() => setIsDropdownOpen(false)}
                                                    >
                                                        <Settings className="h-4 w-4 text-muted-foreground" />
                                                        Settings
                                                    </Link>
                                                </div>

                                                <div className="border-t border-border/50 p-1">
                                                    <button
                                                        onClick={() => signOut({ callbackUrl: '/' })}
                                                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    >
                                                        <LogOut className="h-4 w-4" />
                                                        Log out
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="ghost"
                                        className="text-muted-foreground hover:text-foreground"
                                        onClick={openLogin}
                                    >
                                        Log in
                                    </Button>
                                    <Button
                                        variant="neon"
                                        onClick={openRegister}
                                    >
                                        Get Started
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-background md:hidden animate-in slide-in-from-left duration-300">
                    <div className="container mx-auto px-6 py-6 flex flex-col gap-8 h-full">
                        <div className="flex items-center justify-between">
                            <Logo size={28} />
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {session ? (
                            <>
                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        {navLinks.map(link => (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                className={`flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === link.href ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                {link.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-auto pb-8 space-y-4">
                                    <div className="pt-4 border-t border-border/40 space-y-1">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Account</p>
                                        <Link href="/profile" className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>
                                            <User className="h-4 w-4" /> Profile
                                        </Link>
                                        <Link href="/settings" className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Settings className="h-4 w-4" /> Settings
                                        </Link>
                                        <button onClick={() => signOut({ callbackUrl: '/' })} className="flex w-full items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors">
                                            <LogOut className="h-4 w-4" /> Log out
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col gap-6">
                                <div className="space-y-1">
                                    <Link href="/#features" className="block px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
                                    <Link href="/pricing" className="block px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
                                    <Link href="/about" className="block px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Button variant="outline" className="w-full justify-center" onClick={() => { openLogin(); setIsMobileMenuOpen(false); }}>Log in</Button>
                                    <Button variant="neon" className="w-full justify-center" onClick={() => { openRegister(); setIsMobileMenuOpen(false); }}>Get Started</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

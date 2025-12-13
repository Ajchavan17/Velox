"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function PricingPage() {
    const [isYearly, setIsYearly] = useState(false);
    const [isLoading, setIsLoading] = useState<'free' | 'pro' | null>(null);
    const router = useRouter();
    const { update } = useSession();

    const onSubscribe = async (plan: 'free' | 'pro') => {
        setIsLoading(plan);
        try {
            if (plan === 'free') {
                const res = await fetch('/api/user/plan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ plan: 'free' }),
                });

                if (res.ok) {
                    await update({
                        user: {
                            plan: 'free',
                            subscriptionStatus: 'active'
                        }
                    });
                    router.push('/pricing/confirmation?plan=free');
                }
            } else {
                // Mock Stripe Checkout
                const res = await fetch('/api/stripe/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ plan: 'pro', isYearly }),
                });

                if (res.ok) {
                    // In a real app, this would be the Stripe URL
                    // For now, we simulate a successful payment redirecting to confirmation
                    // We also need to update the user plan in DB for this mock to work
                    await fetch('/api/user/plan', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ plan: 'pro' }),
                    });

                    await update({
                        user: {
                            plan: 'pro',
                            subscriptionStatus: 'active'
                        }
                    });
                    router.push('/pricing/confirmation?plan=pro');
                }
            }
        } catch (error) {
            console.error('Subscription error:', error);
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center py-24">
            <main className="w-full">
                <div className="container px-4 md:px-6 mx-auto">
                    {/* Header Section */}
                    <div className="text-center space-y-4 mb-16">
                        <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-zinc-500 to-zinc-900 dark:from-white dark:via-gray-200 dark:to-gray-400">
                            Simple, Transparent Pricing
                        </h1>
                        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                            Choose the plan that fits your financial journey. No hidden fees.
                        </p>

                        {/* Billing Toggle */}
                        <div className="flex items-center justify-center mt-8 gap-4">
                            <span className={cn("text-sm font-medium transition-colors", !isYearly ? "text-foreground" : "text-muted-foreground")}>
                                Monthly
                            </span>
                            <button
                                onClick={() => setIsYearly(!isYearly)}
                                className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <span
                                    className={cn(
                                        "inline-block h-4 w-4 transform rounded-full bg-primary transition-transform",
                                        isYearly ? "translate-x-6" : "translate-x-1"
                                    )}
                                />
                            </button>
                            <span className={cn("text-sm font-medium transition-colors", isYearly ? "text-foreground" : "text-muted-foreground")}>
                                Yearly <span className="text-primary text-xs ml-1">(Save 20%)</span>
                            </span>
                        </div>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid gap-8 md:grid-cols-3 max-w-7xl mx-auto">
                        {/* Free Tier */}
                        <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300">
                            <CardHeader>
                                <CardTitle className="text-2xl">Free</CardTitle>
                                <CardDescription>Essential tracking for individuals.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold mb-6">
                                    ₹0
                                    <span className="text-lg font-normal text-muted-foreground">
                                        /mo
                                    </span>
                                </div>
                                <ul className="space-y-3 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2">
                                        <CheckIcon className="text-primary" /> 5 Bank Accounts
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckIcon className="text-primary" /> Basic Analytics
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckIcon className="text-primary" /> 1 Month History
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckIcon className="text-primary" /> Email Support
                                    </li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => onSubscribe('free')}
                                    disabled={isLoading === 'free'}
                                >
                                    {isLoading === 'free' ? 'Processing...' : 'Get Started'}
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Pro Tier */}
                        <Card className="bg-card/80 border-primary shadow-[0_0_30px_rgba(0,255,148,0.1)] relative overflow-hidden transform md:-translate-y-4">
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                                POPULAR
                            </div>
                            <CardHeader>
                                <CardTitle className="text-2xl text-primary">Pro</CardTitle>
                                <CardDescription>Advanced tools for power users.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold mb-6">
                                    ₹{isYearly ? "999" : "1,299"}
                                    <span className="text-lg font-normal text-muted-foreground">
                                        /mo
                                    </span>
                                </div>
                                <ul className="space-y-3 text-sm">
                                    <li className="flex items-center gap-2">
                                        <CheckIcon className="text-primary" /> Unlimited Accounts
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckIcon className="text-primary" /> Advanced Analytics & AI
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckIcon className="text-primary" /> Unlimited History
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckIcon className="text-primary" /> Export to CSV/PDF
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckIcon className="text-primary" /> Priority Support
                                    </li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    variant="neon"
                                    className="w-full"
                                    onClick={() => onSubscribe('pro')}
                                    disabled={isLoading === 'pro'}
                                >
                                    {isLoading === 'pro' ? 'Processing...' : 'Start Pro Trial'}
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Enterprise Tier */}
                        <Card className="bg-card/50 border-border/50 hover:border-secondary/30 transition-all duration-300">
                            <CardHeader>
                                <CardTitle className="text-2xl">Enterprise</CardTitle>
                                <CardDescription>For teams and organizations.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold mb-6">
                                    Custom
                                </div>
                                <ul className="space-y-3 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2">
                                        <CheckIcon className="text-secondary" /> Everything in Pro
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckIcon className="text-secondary" /> Team Management
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckIcon className="text-secondary" /> Custom Integrations
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckIcon className="text-secondary" /> Dedicated Account Manager
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckIcon className="text-secondary" /> SLA Support
                                    </li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full">Contact Sales</Button>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* FAQ Section */}
                    <div className="mt-32 max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold">Can I cancel my subscription?</h3>
                                <p className="text-muted-foreground">
                                    Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold">Is my data secure?</h3>
                                <p className="text-muted-foreground">
                                    Absolutely. We use bank-grade encryption (AES-256) to protect your financial data. We never sell your data to third parties.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold">Do you offer a free trial?</h3>
                                <p className="text-muted-foreground">
                                    Yes, the Pro plan comes with a 14-day free trial. No credit card required to start.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold">What payment methods do you accept?</h3>
                                <p className="text-muted-foreground">
                                    We accept all major credit cards (Visa, Mastercard, Amex) and PayPal.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function CheckIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("h-4 w-4", className)}
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

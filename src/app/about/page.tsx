import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Users, Target, Shield, Zap, Heart, Globe } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata = {
    title: "About Us - Velox",
    description: "Learn about our mission to revolutionize personal finance.",
};

export default async function AboutPage() {
    const session = await getServerSession(authOptions);
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden py-24 lg:py-32">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 opacity-50" />

                    <div className="container mx-auto px-4 md:px-6 text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500 mb-6">
                            Revolutionizing <span className="text-primary">Personal Finance</span>
                        </h1>
                        <p className="mx-auto max-w-[700px] text-zinc-400 md:text-xl leading-relaxed">
                            We're on a mission to empower everyone to master their money with speed, clarity, and style.
                        </p>
                    </div>
                </section>

                {/* Mission & Story */}
                <section className="py-16 bg-muted/20">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                                    <Target className="mr-2 h-4 w-4" /> Our Mission
                                </div>
                                <h2 className="text-3xl font-bold text-foreground">Building the Future of Wealth</h2>
                                <p className="text-zinc-400 leading-relaxed">
                                    Velox was founded in 2024 with a simple belief: financial tools shouldn't be boring, slow, or complicated. We believe that managing your wealth should be as fast and fluid as the rest of your digital life.
                                </p>
                                <p className="text-zinc-400 leading-relaxed">
                                    We're building a platform that combines bank-grade security with the aesthetics and performance of a high-end consumer app. No more spreadsheets, no more clunky interfaces. Just pure financial clarity.
                                </p>
                            </div>
                            <div className="relative h-[400px] rounded-2xl overflow-hidden glass-card border-white/5 p-2">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-50" />
                                <div className="w-full h-full bg-zinc-900/50 rounded-xl flex items-center justify-center">
                                    {/* Placeholder for Office/Team Image */}
                                    <span className="text-zinc-600 font-medium">Our Journey Visualized</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values */}
                <section className="py-24">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-foreground mb-4">Our Core Values</h2>
                            <p className="text-zinc-400">The principles that drive everything we do.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            <Card className="glass-card border-white/5 hover:border-primary/50 transition-colors">
                                <CardHeader>
                                    <Zap className="h-10 w-10 text-primary mb-4" />
                                    <CardTitle className="text-foreground">Speed & Performance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-zinc-400">
                                        We obsess over milliseconds. Your financial data should be available instantly, anytime, anywhere.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="glass-card border-white/5 hover:border-secondary/50 transition-colors">
                                <CardHeader>
                                    <Shield className="h-10 w-10 text-secondary mb-4" />
                                    <CardTitle className="text-foreground">Uncompromising Security</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-zinc-400">
                                        We use state-of-the-art encryption to ensure your data remains yours and yours alone.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="glass-card border-white/5 hover:border-accent/50 transition-colors">
                                <CardHeader>
                                    <Heart className="h-10 w-10 text-accent mb-4" />
                                    <CardTitle className="text-foreground">User-Centric Design</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-zinc-400">
                                        We design for humans, not accountants. Every interaction is crafted to be intuitive and delightful.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="py-24 bg-muted/20">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-foreground mb-4">Meet the Team</h2>
                            <p className="text-zinc-400">The diverse group of thinkers and doers behind Velox.</p>
                        </div>
                        <div className="grid md:grid-cols-4 gap-8 justify-center">
                            <div className="group relative col-start-2 col-span-2 md:col-start-auto md:col-span-1 md:col-start-2"> {/* Center on mobile if grid-cols-4, or just simplify grid */}
                                {/* Actually, if it's just one person, maybe center it? Let's stick to grid or flex center */}
                            </div>
                        </div>
                        {/* Let's simplify the grid for a single item */}
                        <div className="flex justify-center">
                            <div className="group relative w-64 text-center">
                                <div className="aspect-square rounded-xl overflow-hidden bg-zinc-800 mb-4 relative">
                                    <Image
                                        src="/AjitChavan.jpeg"
                                        alt="Ajit Chavan"
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {/* Gradient Overlay for style */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground">Ajit Chavan</h3>
                                <p className="text-primary font-medium">Founder & CEO</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                {!session && (
                    <section className="py-24">
                        <div className="container mx-auto px-4 md:px-6 text-center">
                            <div className="max-w-2xl mx-auto space-y-8">
                                <h2 className="text-3xl font-bold text-foreground">Ready to join the revolution?</h2>
                                <p className="text-zinc-400 text-lg">
                                    Start tracking your wealth with Velox today. It's free to get started.
                                </p>
                                <Link href="/register">
                                    <Button variant="neon" size="lg" className="px-8">
                                        Get Started Now
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

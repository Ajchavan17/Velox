"use client";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import Link from "next/link";
import { ArrowRight, BarChart3, Globe, Lock, PieChart, Shield, Zap } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthUI } from "@/context/AuthUIContext";

export default function Home() {
  const { data: session, status } = useSession();
  const { openRegister } = useAuthUI();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.plan) {
        router.push('/dashboard');
      } else {
        router.push('/pricing');
      }
    }
  }, [status, session, router]);

  if (status === 'loading' || status === 'authenticated') {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 lg:py-32">
          {/* Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 opacity-50 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-secondary/10 rounded-full blur-[100px] -z-10 opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />

          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4 backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                v2.0 is now live
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-500">
                Master Your Money with <span className="text-primary">Velox</span>
              </h1>
              <p className="mx-auto max-w-[800px] text-zinc-400 md:text-xl leading-relaxed">
                Experience the future of financial tracking. Real-time analytics,
                AI-powered insights, and a design that moves as fast as you do.
              </p>
            </div>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Button
                variant="neon"
                size="lg"
                className="text-lg px-8 w-full sm:w-auto h-12"
                onClick={openRegister}
              >
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link href="#demo">
                <Button variant="ghost" size="lg" className="text-lg px-8 w-full sm:w-auto h-12 border border-zinc-800 hover:bg-zinc-900">
                  View Demo
                </Button>
              </Link>
            </div>

            {/* Abstract Visual */}
            <div className="mt-20 relative mx-auto max-w-6xl">
              <div className="aspect-video rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Dashboard Mockup Placeholder */}
                <div className="w-full h-full p-8 flex flex-col items-center justify-center space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl opacity-80">
                    <div className="h-40 rounded-xl bg-zinc-900/50 border border-white/5 animate-pulse"></div>
                    <div className="h-40 rounded-xl bg-zinc-900/50 border border-white/5 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-40 rounded-xl bg-zinc-900/50 border border-white/5 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <div className="w-full max-w-4xl h-64 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                    <span className="text-2xl font-bold text-zinc-700">Interactive Dashboard</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 relative">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground mb-6">
                Why Choose Velox?
              </h2>
              <p className="mx-auto max-w-[700px] text-zinc-400 md:text-lg">
                Built for the modern era of finance. We provide the tools you need to take control of your wealth.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <Card className="glass-card border-white/5 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 group">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-foreground">Real-Time Tracking</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Monitor your transactions as they happen with zero latency.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 2 */}
              <Card className="glass-card border-white/5 hover:border-secondary/50 transition-all duration-300 hover:-translate-y-1 group">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                    <BarChart3 className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="text-foreground">Smart Analytics</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Visualize your spending habits with beautiful, interactive charts.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 3 */}
              <Card className="glass-card border-white/5 hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 group">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <Shield className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-foreground">Bank-Grade Security</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Your data is encrypted and protected with industry-leading standards.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 4 */}
              <Card className="glass-card border-white/5 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 group">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <PieChart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-foreground">Budgeting Made Easy</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Set monthly budgets and get notified before you overspend.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 5 */}
              <Card className="glass-card border-white/5 hover:border-secondary/50 transition-all duration-300 hover:-translate-y-1 group">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                    <Globe className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="text-foreground">Multi-Currency</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Travel the world? We handle exchange rates automatically.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 6 */}
              <Card className="glass-card border-white/5 hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 group">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <Lock className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-foreground">Privacy First</CardTitle>
                  <CardDescription className="text-zinc-400">
                    We never sell your data. Your financial privacy is our priority.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div >
  );
}


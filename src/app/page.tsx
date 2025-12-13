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
import { ArrowRight, BarChart3, Globe, Lock, PieChart, Shield, Zap, TrendingUp, LayoutDashboard, Wallet, CreditCard, Search, Bell, Plus, MoreVertical, ShoppingBag, Coffee, Target, Radio, Wifi } from "lucide-react";
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

            {/* Abstract Visual - Interactive Dashboard Preview */}
            <div className="mt-20 relative mx-auto max-w-7xl">
              <div className="relative rounded-2xl border border-white/10 bg-[#09090b] shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto min-h-[600px] md:h-[800px] w-full max-w-7xl mx-auto">
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-500/5 via-transparent to-emerald-500/5" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

                {/* Sidebar Mockup */}
                <div className="w-20 border-r border-white/5 flex flex-col items-center py-8 gap-8 bg-black/20 backdrop-blur-sm z-10 hidden md:flex">
                  <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-4">
                    <Zap className="h-6 w-6" />
                  </div>
                  {[LayoutDashboard, Wallet, CreditCard, PieChart, TrendingUp, Radio].map((Icon, i) => (
                    <div key={i} className={`p-3 rounded-xl transition-all duration-300 cursor-default ${i === 0 ? 'bg-white/10 text-white shadow-lg shadow-primary/10' : 'text-zinc-600 hover:text-zinc-400'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  ))}
                  <div className="mt-auto">
                    <div className="h-8 w-8 rounded-full bg-zinc-800 border border-white/10" />
                  </div>
                </div>

                {/* Main Dashboard Area */}
                <div className="flex-1 flex flex-col bg-zinc-950/30">
                  {/* Header Mockup */}
                  <div className="h-20 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-black/10 backdrop-blur-sm shrink-0">
                    <div className="flex items-center gap-4 text-zinc-500 w-full max-w-md">
                      <Search className="h-4 w-4" />
                      <div className="h-8 bg-zinc-900/50 rounded-lg w-full items-center px-3 text-sm hidden md:flex">Search transactions...</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Bell className="h-5 w-5 text-zinc-400" />
                        <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Content Grid */}
                  <div className="p-4 md:p-8 overflow-hidden h-full">
                    <div className="flex flex-col md:flex-row items-center md:items-center justify-between mb-6 md:mb-8 gap-4 animate-slide-up">
                      <div className="text-center md:text-left">
                        <h3 className="text-2xl font-bold text-white">Good Evening, Alex</h3>
                        <p className="text-zinc-400 text-sm">Here's what's happening today.</p>
                      </div>
                      <div className="flex gap-3 w-full md:w-auto justify-center">
                        <div className="bg-zinc-900 border border-white/5 px-4 py-2 rounded-lg text-sm text-zinc-400">Oct 24, 2024</div>
                        <div className="bg-primary text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                          <Plus className="h-4 w-4" /> Add New
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 md:gap-6 h-full pb-20">
                      {/* Row 1 */}
                      {/* 1. Net Worth Card (Large) */}
                      <div className="col-span-12 md:col-span-8 rounded-2xl bg-[#111113] border border-white/5 p-4 md:p-6 animate-slide-up delay-100 hover:border-primary/20 transition-colors group/card relative overflow-hidden">
                        <div className="flex flex-col md:flex-row md:justify-between items-center mb-4 md:mb-6 gap-2">
                          <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 text-center md:text-left">
                            <p className="text-zinc-400 text-sm font-medium">Net Worth</p>
                            <h4 className="text-3xl font-bold text-white">₹84,23,500</h4>
                          </div>
                          <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-medium flex items-center w-fit mx-auto md:mx-0">
                            <TrendingUp className="h-3 w-3 mr-1" /> +12.5%
                          </div>
                        </div>
                        {/* Mock Chart Area */}
                        <div className="h-24 md:h-48 w-full flex items-end gap-1 md:gap-2 relative">
                          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-50" />
                          {[30, 45, 35, 60, 50, 75, 65, 80, 70, 90, 85, 100].map((h, i) => (
                            <div key={i} className="flex-1 bg-zinc-800/50 rounded-t-sm relative group/bar overflow-hidden">
                              <div
                                className="absolute bottom-0 left-0 right-0 bg-primary/80 transition-all duration-1000 ease-out"
                                style={{ height: `${h}%`, transitionDelay: `${i * 50}ms` }}
                              />
                              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 2. My Cards (New) - Stacked Cards Visual */}
                      <div className="col-span-12 md:col-span-4 rounded-2xl bg-[#111113] border border-white/5 p-4 md:p-6 animate-slide-up delay-200 hover:border-white/20 transition-colors relative overflow-hidden group/cards">
                        <div className="flex justify-between items-center mb-6">
                          <div>
                            <p className="text-zinc-400 text-sm font-medium">My Cards</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-white/10"><Plus className="h-3 w-3" /></Button>
                        </div>
                        <div className="relative h-40 md:h-48 mt-4 mx-2">
                          {/* Card 1 (Back) */}
                          <div className="absolute top-0 w-full h-32 md:h-40 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 transform scale-95 opacity-60 translate-y-4 transition-transform group-hover/cards:translate-y-8 duration-500"></div>
                          {/* Card 2 (Middle) */}
                          <div className="absolute top-2 w-full h-32 md:h-40 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#4c1d95] border border-white/10 transform scale-98 translate-y-2 group-hover/cards:translate-y-4 transition-transform duration-500 shadow-xl">
                            <div className="p-4 flex flex-col justify-between h-full text-white/50">
                              <div className="flex justify-between"><span className="text-white font-bold tracking-widest">VELOX</span> <span className="text-xs">PLATINUM</span></div>
                            </div>
                          </div>
                          {/* Card 3 (Front - Primary) */}
                          <div className="absolute top-4 w-full h-32 md:h-40 rounded-xl bg-gradient-to-br from-primary to-[#047857] border border-white/10 shadow-2xl p-5 flex flex-col justify-between group-hover/cards:-translate-y-1 transition-transform duration-300">
                            <div className="flex justify-between items-start">
                              <span className="font-mono text-white/90 font-bold tracking-widest text-lg">VELOX</span>
                              <Wifi className="h-5 w-5 text-white/50 rotate-90" />
                            </div>
                            <div className="space-y-4">
                              <div className="font-mono text-white text-lg tracking-[0.15em] opacity-90">•••• 4242</div>
                              <div className="flex justify-between text-xs text-white/70 font-mono">
                                <span>ALEX MORGAN</span>
                                <span>12/28</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Row 2 */}
                      {/* 3. Asset Allocation */}
                      <div className="col-span-12 md:col-span-4 rounded-2xl bg-[#111113] border border-white/5 p-4 md:p-6 animate-slide-up delay-300 hover:border-secondary/20 transition-colors">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <p className="text-zinc-400 text-sm font-medium">Asset Allocation</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-center relative h-32 md:h-40">
                          <div className="absolute inset-0 rounded-full border-[10px] md:border-[12px] border-zinc-800" />
                          <div className="absolute inset-0 rounded-full border-[10px] md:border-[12px] border-primary border-t-transparent border-r-transparent border-l-transparent rotate-45 transform transition-transform hover:scale-105 duration-500" />
                          <div className="absolute inset-0 rounded-full border-[10px] md:border-[12px] border-secondary border-b-transparent border-r-transparent border-l-transparent -rotate-12 opacity-80 transform transition-transform hover:scale-105 duration-500" />
                          <div className="text-center">
                            <p className="text-xs text-zinc-500">Total</p>
                            <p className="text-lg md:text-xl font-bold text-white">100%</p>
                          </div>
                        </div>
                        <div className="mt-6 space-y-3">
                          <div className="flex justify-between text-sm">
                            <div className="flex items-center text-zinc-400"><div className="w-2 h-2 rounded-full bg-primary mr-2" /> Stocks</div>
                            <span className="text-white">45%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <div className="flex items-center text-zinc-400"><div className="w-2 h-2 rounded-full bg-secondary mr-2" /> Crypto</div>
                            <span className="text-white">35%</span>
                          </div>
                        </div>
                      </div>

                      {/* 4. Transactions (Table) */}
                      <div className="col-span-12 md:col-span-8 rounded-2xl bg-[#111113] border border-white/5 p-0 overflow-hidden animate-slide-up delay-300 hover:border-white/10 transition-colors">
                        <div className="p-4 md:p-6 border-b border-white/5 flex justify-between items-start">
                          <div>
                            <p className="text-zinc-400 text-sm font-medium">Live Transactions</p>
                          </div>
                          <Button variant="ghost" size="sm" className="text-xs">View All</Button>
                        </div>
                        <div className="p-2">
                          {[
                            { name: "Apple Store", date: "Just now", amount: "-₹14,900", icon: ShoppingBag, color: "text-white" },
                            { name: "Upwork Inc.", date: "2 mins ago", amount: "+₹45,000", icon: Wallet, color: "text-green-400" },
                            { name: "Starbucks", date: "1 hour ago", amount: "-₹450", icon: Coffee, color: "text-white" },
                          ].map((tx, i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors group/row cursor-default">
                              <div className="flex items-center gap-3 md:gap-4">
                                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 group-hover/row:text-primary transition-colors">
                                  <tx.icon className="h-3 w-3 md:h-4 md:w-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-white">{tx.name}</p>
                                  <p className="text-xs text-zinc-500">{tx.date}</p>
                                </div>
                              </div>
                              <span className={`text-sm font-bold ${tx.color}`}>{tx.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Row 3 */}
                      {/* 5. Monthly Budget (New) */}
                      <div className="col-span-12 md:col-span-4 rounded-2xl bg-[#111113] border border-white/5 p-4 md:p-6 animate-slide-up delay-400 hover:border-accent/20 transition-colors">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <p className="text-zinc-400 text-sm font-medium">Monthly Budget</p>
                          </div>
                          <span className="text-xs text-accent bg-accent/10 px-2 py-1 rounded">On Track</span>
                        </div>
                        <div className="space-y-5">
                          <div>
                            <div className="flex justify-between text-xs text-zinc-400 mb-1">
                              <span>Shopping</span>
                              <span className="text-white">75%</span>
                            </div>
                            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-accent w-[75%]" />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs text-zinc-400 mb-1">
                              <span>Dining</span>
                              <span className="text-white">45%</span>
                            </div>
                            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-primary w-[45%]" />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs text-zinc-400 mb-1">
                              <span>Bills</span>
                              <span className="text-white">90%</span>
                            </div>
                            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-500 w-[90%]" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 6. Savings Goal (Floating Card) */}
                      <div className="col-span-12 md:col-span-4 rounded-2xl bg-[#111113] border border-white/5 p-4 md:p-6 animate-slide-up delay-400 hover:border-yellow-500/20 transition-colors group/goal">
                        <div className="flex justify-between items-center mb-4">
                          <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                            <Target className="h-5 w-5" />
                          </div>
                          <MoreVertical className="h-4 w-4 text-zinc-600" />
                        </div>
                        <div className="text-center py-2">
                          <h4 className="text-white font-bold text-lg">Tesla Model 3</h4>
                          <p className="text-zinc-500 text-xs">Target: Dec 2025</p>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-2xl font-bold text-white">₹12.4L</span>
                            <span className="text-xs text-yellow-500 font-bold">62%</span>
                          </div>
                          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500 w-[62%] group-hover/goal:w-[65%] transition-all duration-700" />
                          </div>
                        </div>
                      </div>

                      {/* 7. Debt Manager (New) */}
                      <div className="col-span-12 md:col-span-4 rounded-2xl bg-[#111113] border border-white/5 p-4 md:p-6 animate-slide-up delay-400 hover:border-red-500/20 transition-colors">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <p className="text-zinc-400 text-sm font-medium">Debt Manager</p>
                          </div>
                        </div>
                        <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/10 mb-3">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                              <CreditCard className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">HDFC Regalia</p>
                              <p className="text-xs text-red-400">Due in 5 days</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-zinc-400">Outstanding</span>
                            <span className="text-sm font-bold text-white">₹45,230</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full text-xs h-8 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                          Pay Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements (Decorations) */}
                <div className="absolute bottom-10 left-10 p-4 bg-zinc-900/90 backdrop-blur rounded-2xl border border-white/10 shadow-2xl animate-float z-20 hidden md:block">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400">Portfolio Growth</p>
                      <p className="text-sm font-bold text-white">+24.8% <span className="text-zinc-500 font-normal">vs last year</span></p>
                    </div>
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


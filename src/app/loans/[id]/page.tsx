"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader2, ArrowLeft, Calendar, Landmark, Percent, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

interface ScheduleItem {
    installmentNo: number;
    dueDate: string;
    principalComponent: number;
    interestComponent: number;
    balance: number;
    status: 'pending' | 'paid';
    paymentDate?: string;
    transactionId?: string;
}

interface Loan {
    _id: string;
    name: string;
    provider: string;
    type: 'taken' | 'given';
    principalAmount: number;
    interestRate: number;
    emiAmount: number;
    emiDate: number;
    tenureMonths: number;
    startDate: string;
    schedule: ScheduleItem[];
    status: 'active' | 'closed';
    linkedAccountId?: string;
}

export default function LoanDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loan, setLoan] = useState<Loan | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLoan = async () => {
            try {
                const res = await fetch(`/api/loans/${id}`);
                if (res.ok) {
                    setLoan(await res.json());
                } else {
                    toast.error("Loan not found");
                    router.push('/loans');
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load loan details");
            } finally {
                setLoading(false);
            }
        };
        fetchLoan();
    }, [id, router]);

    const payEMI = async (installmentNo: number, amount: number) => {
        if (!confirm(`Confirm payment of EMI #${installmentNo} (₹${Math.round(amount)})?`)) return;

        try {
            const res = await fetch(`/api/loans/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'pay_emi',
                    installmentNo,
                    transactionDate: new Date()
                })
            });

            if (res.ok) {
                toast.success("EMI Paid Successfully");
                // Refresh data
                const updatedRes = await fetch(`/api/loans/${id}`);
                if (updatedRes.ok) setLoan(await updatedRes.json());
            } else {
                const err = await res.json();
                toast.error(err.error || "Payment failed");
            }
        } catch (e) {
            toast.error("Connection error");
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    if (!loan) return null;

    const totalPrincipalPaid = loan.schedule.filter(s => s.status === 'paid').reduce((acc, cur) => acc + (cur.principalComponent || 0), 0);
    const progress = (totalPrincipalPaid / loan.principalAmount) * 100;

    // Handle legacy data where principalComponent might be missing if created before full amortization logic
    const hasDetailedAmortization = loan.schedule.some(s => s.principalComponent > 0);

    return (
        <div className="container mx-auto py-8 px-4 md:px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Breadcrumbs */}
            <div className="flex items-center text-sm text-muted-foreground mb-4">
                <Link href="/loans" className="hover:text-primary transition-colors">Loans</Link>
                <span className="mx-2">/</span>
                <span className="font-medium text-foreground truncate max-w-[200px]">{loan.name}</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent w-fit">
                        {loan.name}
                    </h1>
                    <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                        <span>{loan.provider}</span>
                        <span>•</span>
                        <span className={`uppercase font-bold text-xs px-2 py-0.5 rounded-full ${loan.type === 'taken' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            {loan.type === 'taken' ? 'Liability' : 'Asset'}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <div className={`text-2xl font-bold ${loan.type === 'taken' ? 'text-red-500' : 'text-emerald-500'}`}>
                        ₹{Math.round(loan.emiAmount).toLocaleString()}
                        <span className="text-sm text-muted-foreground font-normal"> / month</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Due on day {loan.emiDate} of every month</p>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Principal Amount</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <Landmark className="h-5 w-5 text-primary" />
                            ₹{loan.principalAmount.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Interest Rate</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <Percent className="h-5 w-5 text-primary" />
                            {loan.interestRate}%
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Tenure</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            {loan.tenureMonths} Months
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Repayment Progress</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            {progress.toFixed(1)}%
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full mt-2">
                            <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Amortization Schedule */}
            <Card>
                <CardHeader>
                    <CardTitle>Amortization Schedule</CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/50">
                            <tr>
                                <th className="px-6 py-4">#</th>
                                <th className="px-6 py-4">Due Date</th>
                                {hasDetailedAmortization && (
                                    <>
                                        <th className="px-6 py-4 text-right">Principal</th>
                                        <th className="px-6 py-4 text-right">Interest</th>
                                        <th className="px-6 py-4 text-right">Balance</th>
                                    </>
                                )}
                                <th className="px-6 py-4 text-right">EMI Amount</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {loan.schedule.map((item) => {
                                const isPastDue = new Date(item.dueDate) < new Date() && item.status === 'pending';
                                const isPaid = item.status === 'paid';

                                return (
                                    <tr key={item.installmentNo} className={`hover:bg-muted/20 transition-colors ${isPaid ? 'bg-emerald-500/5' : ''}`}>
                                        <td className="px-6 py-4 font-medium">{item.installmentNo}</td>
                                        <td className="px-6 py-4">
                                            {new Date(item.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            {isPastDue && <div className="text-xs text-red-500 font-medium mt-0.5 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Overdue</div>}
                                        </td>
                                        {hasDetailedAmortization && (
                                            <>
                                                <td className="px-6 py-4 text-right text-muted-foreground">₹{Math.round(item.principalComponent).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right text-muted-foreground">₹{Math.round(item.interestComponent).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right text-muted-foreground">₹{Math.round(item.balance).toLocaleString()}</td>
                                            </>
                                        )}
                                        <td className="px-6 py-4 text-right font-medium">₹{Math.round(loan.emiAmount).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center">
                                            {isPaid ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                                                    Paid
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/30">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {!isPaid && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 hover:bg-primary/10 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                                    onClick={() => payEMI(item.installmentNo, loan.emiAmount)}
                                                    disabled={(() => {
                                                        const today = new Date();
                                                        today.setHours(0, 0, 0, 0);
                                                        const dueDate = new Date(item.dueDate);
                                                        dueDate.setHours(0, 0, 0, 0);
                                                        return today < dueDate;
                                                    })()}
                                                >
                                                    Mark Paid
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}

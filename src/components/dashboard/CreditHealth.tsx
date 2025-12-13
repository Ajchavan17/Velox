import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ShieldCheck } from "lucide-react";

export const CreditHealth = () => {
    const score = 785;
    const percentage = (score / 850) * 100;
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">Credit Health</CardTitle>
                <ShieldCheck className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-4">
                <div className="relative h-32 w-32">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                        {/* Background Circle */}
                        <circle
                            className="text-zinc-800"
                            strokeWidth="10"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                        />
                        {/* Progress Circle */}
                        <circle
                            className="text-secondary transition-all duration-1000 ease-out"
                            strokeWidth="10"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-white">{score}</span>
                        <span className="text-xs text-secondary font-medium">Excellent</span>
                    </div>
                </div>
                <p className="text-xs text-zinc-400 mt-4 text-center">
                    Your credit score is looking great! Keep it up.
                </p>
            </CardContent>
        </Card>
    );
};

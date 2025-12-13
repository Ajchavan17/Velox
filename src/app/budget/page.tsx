"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { TrendingUp, Wallet } from "lucide-react";

export default function BudgetPage() {
    return (
        <div className="container mx-auto py-8 px-4 md:px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent w-fit">Budget</h1>
                <p className="text-muted-foreground">Manage your monthly spending limits.</p>
            </div>

            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                    <div className="p-4 rounded-full bg-primary/10 text-primary">
                        <Wallet className="h-12 w-12" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">Coming Soon</h2>
                        <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                            The budgeting module is currently under development. Stay tuned for updates!
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

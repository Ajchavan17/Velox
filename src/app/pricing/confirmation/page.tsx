"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState, Suspense } from "react";

function ConfirmationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const plan = searchParams.get("plan");
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (countdown === 0) {
            router.push("/dashboard");
        }
    }, [countdown, router]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md text-center border-primary/20 bg-card/50 backdrop-blur-xl">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">
                        {plan === "pro" ? "Pro Plan Activated!" : "Free Plan Activated!"}
                    </CardTitle>
                    <CardDescription>
                        {plan === "pro"
                            ? "Thank you for upgrading. You now have access to all premium features."
                            : "You're all set with the Free plan. Upgrade anytime to unlock more power."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">
                        Redirecting to dashboard in {countdown} seconds...
                    </p>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full"
                        onClick={() => router.push("/dashboard")}
                    >
                        Continue to Dashboard
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function ConfirmationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center border-primary/20 bg-card/50 backdrop-blur-xl">
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground">Loading confirmation details...</p>
                    </CardContent>
                </Card>
            </div>
        }>
            <ConfirmationContent />
        </Suspense>
    );
}

"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Suspense } from "react";

function ConfirmationContent() {
    const searchParams = useSearchParams();
    // ... existing implementation ...
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

"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
// ... imports

// ... interfaces

function TransactionsContent() {
    // ... existing implementation ...
}

export default function TransactionsPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <TransactionsContent />
        </Suspense>
    );
}



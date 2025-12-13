"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo, Suspense } from "react";
import Link from 'next/link';
// ... other imports

// ... interfaces

function DebtsContent() {
    const { data: session, status } = useSession();
    // ... existing implementation ...
}

export default function DebtsPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <DebtsContent />
        </Suspense>
    );
}

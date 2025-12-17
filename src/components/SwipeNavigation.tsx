'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function SwipeNavigation() {
    const router = useRouter();
    const pathname = usePathname();
    const touchStart = useRef<number | null>(null);
    const touchEnd = useRef<number | null>(null);

    // Navigation order
    const navOrder = ['/dashboard', '/transactions', '/debts', '/profile'];

    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            touchEnd.current = null;
            touchStart.current = e.targetTouches[0].clientX;
        };

        const handleTouchMove = (e: TouchEvent) => {
            touchEnd.current = e.targetTouches[0].clientX;
        };

        const handleTouchEnd = () => {
            if (!touchStart.current || !touchEnd.current) return;

            const distance = touchStart.current - touchEnd.current;
            const isLeftSwipe = distance > 120;
            const isRightSwipe = distance < -120;

            if (isLeftSwipe || isRightSwipe) {
                const currentIndex = navOrder.indexOf(pathname || '');
                if (currentIndex === -1) return;

                if (isLeftSwipe) {
                    // Go to next tab
                    if (currentIndex < navOrder.length - 1) {
                        router.push(navOrder[currentIndex + 1]);
                    }
                } else {
                    // Go to previous tab
                    if (currentIndex > 0) {
                        router.push(navOrder[currentIndex - 1]);
                    }
                }
            }
        };

        // Attach to window mostly, but careful with scrollable elements
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [pathname, router]);

    return null;
}

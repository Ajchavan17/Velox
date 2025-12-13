import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAuth = !!token;
        const isPricingPage = req.nextUrl.pathname === '/pricing';
        const isDashboard = req.nextUrl.pathname.startsWith('/dashboard');
        const hasPlan = token?.plan && token.plan !== null;

        // If logged in and no plan, force redirect to pricing (unless already there)
        if (isAuth && !hasPlan && !isPricingPage) {
            return NextResponse.redirect(new URL('/pricing', req.url));
        }

        // If logged in and has plan, redirect root to dashboard
        if (isAuth && hasPlan && req.nextUrl.pathname === '/') {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        // If logged in and has plan, but tries to go to pricing, let them (maybe they want to upgrade)
        // But if they are just logging in (root), send to dashboard.
    },
    {
        pages: {
            signIn: '/',
        },
        callbacks: {
            authorized: ({ token, req }) => {
                // Allow access to root and pricing even if not authenticated
                if (req.nextUrl.pathname === '/' || req.nextUrl.pathname === '/pricing') {
                    return true;
                }
                // Require token for other protected routes
                return !!token;
            },
        },
    }
);

export const config = {
    matcher: [
        '/',
        '/dashboard/:path*',
        '/transactions/:path*',
        '/accounts/:path*',
        '/reports/:path*',
        '/settings/:path*',
    ],
};

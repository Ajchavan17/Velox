import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { plan, isYearly } = body;

        // TODO: Integrate Stripe here
        // 1. Create Stripe Checkout Session
        // 2. Return session URL

        console.log('Stripe Checkout initiated for:', { plan, isYearly, user: session.user.email });

        // Mock response for now
        return NextResponse.json({ url: '/dashboard?success=true' });

    } catch (error: any) {
        console.error('STRIPE_CHECKOUT_ERROR', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

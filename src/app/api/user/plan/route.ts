import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { plan } = body;

        if (!plan || !['free', 'pro', 'enterprise'].includes(plan)) {
            return new NextResponse('Invalid plan', { status: 400 });
        }

        await dbConnect();

        const user = await User.findByIdAndUpdate(
            session.user.id,
            {
                plan: plan,
                subscriptionStatus: 'active' // Auto-activate free plan
            },
            { new: true }
        );

        return NextResponse.json(user);
    } catch (error: any) {
        console.error('PLAN_UPDATE_ERROR', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

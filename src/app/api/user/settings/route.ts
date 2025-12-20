import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/getAuthUser';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function PUT(req: Request) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { currency } = body;

        await dbConnect();

        const updatedUser = await User.findByIdAndUpdate(
            user.id,
            { $set: { ...(currency && { currency }) } },
            { new: true }
        ).select('currency');

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating settings:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

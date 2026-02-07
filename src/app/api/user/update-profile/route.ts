import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/getAuthUser';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function PATCH(req: Request) {
    try {
        const userAuth = await getAuthUser(req);

        if (!userAuth) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { name, currency } = await req.json();

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return NextResponse.json(
                { message: 'Name is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        const updateData: any = { name: name.trim() };
        if (currency) {
            updateData.currency = currency;
        }

        const user = await User.findByIdAndUpdate(
            userAuth.id,
            updateData,
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Profile updated successfully', user });
    } catch (error: any) {
        console.error('Update profile error:', error);
        return NextResponse.json(
            { message: `Internal server error: ${error instanceof Error ? error.message : String(error)}` },
            { status: 500 }
        );
    }
}

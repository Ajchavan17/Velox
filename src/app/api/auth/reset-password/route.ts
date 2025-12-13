import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { token, newPassword } = await req.json();

        if (!token || !newPassword) {
            return NextResponse.json({ message: 'Token and password are required' }, { status: 400 });
        }

        // Find user by token only first
        const user = await User.findOne({
            resetPasswordToken: token,
        });

        if (!user) {
            console.log('Reset Password Failed: Token not found in DB', token);
            return NextResponse.json({ message: 'DEBUG: Token not found in database. Double check you are using the latest link.' }, { status: 400 });
        }

        // Manually check expiry
        const now = new Date();
        const expiry = new Date(user.resetPasswordExpire);

        console.log('Token Validation - Current Time:', now.toISOString());
        console.log('Token Validation - Token Expiry:', expiry.toISOString());

        if (expiry < now) {
            console.log('Reset Password Failed: Token expired');
            return NextResponse.json({ message: 'DEBUG: Token has expired. Please request a new one.' }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear reset token
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        return NextResponse.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/mail';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email } = await req.json();

        const user = await User.findOne({ email });

        if (!user) {
            // Return 200 even if user not found for security (prevent enumeration)
            return NextResponse.json({ message: 'If an account exists with this email, a reset link has been sent.' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        // Update user directly to ensure fields are set regardless of document state
        await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    resetPasswordToken: resetToken,
                    resetPasswordExpire: resetTokenExpiry
                }
            }
        );

        // DEBUG: Verify save
        const savedUser = await User.findOne({ email });
        console.log('Forgot Password Debug - Saved Token:', savedUser?.resetPasswordToken);
        console.log('Forgot Password Debug - Generated Token:', resetToken);
        if (savedUser?.resetPasswordToken !== resetToken) {
            console.error('CRITICAL: Token mismatch after save!');
        }

        // Send email
        try {
            await sendPasswordResetEmail(user.email, resetToken);
            return NextResponse.json({ message: 'If an account exists with this email, a reset link has been sent.' });
        } catch (emailError) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            console.error('Email send error:', emailError);
            return NextResponse.json({ message: 'Email could not be sent' }, { status: 500 });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

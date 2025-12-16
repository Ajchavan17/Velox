import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: 'Please provide email and password' },
                { status: 400 }
            );
        }

        await dbConnect();

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        if (!user.isVerified) {
            return NextResponse.json(
                { message: 'Please verify your email first' },
                { status: 403 }
            );
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Remove password from response
        const userObj = user.toObject();
        delete userObj.password;

        return NextResponse.json({
            user: userObj,
            token
        });

    } catch (error) {
        console.error('Mobile Login Error:', error);
        return NextResponse.json(
            { message: `Internal server error: ${error instanceof Error ? error.message : String(error)}` },
            { status: 500 }
        );
    }
}

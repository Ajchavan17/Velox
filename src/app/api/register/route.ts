import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/mail';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        await dbConnect();

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return NextResponse.json(
                { message: 'Email already in use' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            provider: 'credentials',
            isVerified: false,
            verificationToken,
            verificationToken,
            verificationTokenExpiry,
            categories: [
                // Income
                { name: 'Salary', type: 'income', isDefault: true, subcategories: ['Full-time', 'Bonus'] },
                { name: 'Freelance', type: 'income', isDefault: true, subcategories: [] },
                { name: 'Investments', type: 'income', isDefault: true, subcategories: ['Dividends', 'Interest'] },
                { name: 'Other Income', type: 'income', isDefault: true, subcategories: [] },
                // Expenses
                { name: 'Housing', type: 'expense', isDefault: true, subcategories: ['Rent', 'Mortgage', 'Repairs'] },
                { name: 'Transportation', type: 'expense', isDefault: true, subcategories: ['Fuel', 'Public Transit', 'Maintenance'] },
                { name: 'Food', type: 'expense', isDefault: true, subcategories: ['Groceries', 'Dining Out'] },
                { name: 'Utilities', type: 'expense', isDefault: true, subcategories: ['Electricity', 'Water', 'Internet', 'Phone'] },
                { name: 'Health', type: 'expense', isDefault: true, subcategories: ['Doctor', 'Pharmacy', 'Insurance'] },
                { name: 'Entertainment', type: 'expense', isDefault: true, subcategories: ['Movies', 'Games', 'Subscriptions'] },
                { name: 'Shopping', type: 'expense', isDefault: true, subcategories: ['Clothing', 'Electronics'] },
                { name: 'Other Expense', type: 'expense', isDefault: true, subcategories: [] },
            ]
        });

        try {
            await sendVerificationEmail(email, verificationToken);
        } catch (emailError) {
            console.error('Error sending verification email:', emailError);
            // Optional: Delete user if email fails, or allow retry later
        }

        return NextResponse.json(
            { message: 'User created successfully. Please verify your email.', userId: user._id },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('❌ Registration Error:', error);
        return NextResponse.json(
            { message: error.message || 'Something went wrong' },
            { status: 500 }
        );
    }
}

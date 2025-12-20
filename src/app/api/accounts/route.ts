import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/getAuthUser';
import dbConnect from '@/lib/db';
import BankAccount from '@/models/BankAccount';

import mongoose from 'mongoose';

export async function GET(req: Request) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const accounts = await BankAccount.find({ userId: new mongoose.Types.ObjectId(user.id) }).sort({ createdAt: -1 });

        return NextResponse.json(accounts);
    } catch (error) {
        console.error('Error fetching accounts:', error);
        return NextResponse.json({ error: `Internal Server Error: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { bankName, accountType, accountName, balance } = body;

        if (!bankName || !accountName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();
        const newAccount = await BankAccount.create({
            userId: user.id,
            bankName,
            accountType,
            accountName,
            balance: Number(balance) || 0,
        });

        return NextResponse.json(newAccount, { status: 201 });
    } catch (error) {
        console.error('Error creating account:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing account ID' }, { status: 400 });
        }

        await dbConnect();
        const deletedAccount = await BankAccount.findOneAndDelete({
            _id: id,
            userId: user.id,
        });

        if (!deletedAccount) {
            return NextResponse.json({ error: 'Account not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { _id, bankName, accountType, accountName, balance } = body;

        if (!_id || !bankName || !accountName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();
        const updatedAccount = await BankAccount.findOneAndUpdate(
            { _id, userId: user.id },
            {
                bankName,
                accountType,
                accountName,
                balance: Number(balance) || 0,
            },
            { new: true }
        );

        if (!updatedAccount) {
            return NextResponse.json({ error: 'Account not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json(updatedAccount);
    } catch (error) {
        console.error('Error updating account:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

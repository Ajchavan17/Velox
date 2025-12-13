import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import BankAccount from '@/models/BankAccount';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const accounts = await BankAccount.find({ userId: session.user.id }).sort({ createdAt: -1 });

        return NextResponse.json(accounts);
    } catch (error) {
        console.error('Error fetching accounts:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { bankName, accountType, accountName, balance } = body;

        if (!bankName || !accountName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();
        const newAccount = await BankAccount.create({
            userId: session.user.id,
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
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
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
            userId: session.user.id,
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

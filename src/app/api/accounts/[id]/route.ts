import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BankAccount from '@/models/BankAccount';
import CreditCard from '@/models/CreditCard';
import Transaction from '@/models/Transaction';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

// Helper to find account in either collection
async function findAccount(id: string, userId: string) {
    let account = await BankAccount.findOne({ _id: id, userId });
    let type = 'bank';

    if (!account) {
        account = await CreditCard.findOne({ _id: id, userId });
        type = 'card';
    }

    return { account, type };
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const { account, type } = await findAccount(id, session.user.id);

        if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

        // Fetch transactions
        const transactions = await Transaction.find({
            userId: session.user.id,
            accountId: id
        }).sort({ date: -1 });

        return NextResponse.json({
            account: { ...account.toObject(), type },
            transactions
        });
    } catch (error) {
        console.error('Error fetching account details:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

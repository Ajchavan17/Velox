import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';
import { updateAccountBalance } from '@/lib/accountUtils';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const limit = searchParams.get('limit');
        const type = searchParams.get('type');

        let query: any = { userId: session.user.id };
        if (type && type !== 'all') {
            query.type = type;
        }

        let transactionsQuery = Transaction.find(query).sort({ date: -1 });

        if (limit) {
            transactionsQuery = transactionsQuery.limit(parseInt(limit));
        }

        const transactions = await transactionsQuery.exec();

        return NextResponse.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
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
        const { amount, type, category, description, date, accountId } = body;

        if (!amount || !type || !category || !description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();
        const newTransaction = await Transaction.create({
            userId: session.user.id,
            amount: Number(amount),
            type,
            category,
            description,
            date: date || new Date(),
            accountId: accountId || null,
        });

        if (accountId) {
            await updateAccountBalance(session.user.id, accountId, Number(amount), type);
        }

        return NextResponse.json(newTransaction, { status: 201 });
    } catch (error) {
        console.error('Error creating transaction:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

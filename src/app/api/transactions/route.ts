import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/getAuthUser';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';
import { updateAccountBalance } from '@/lib/accountUtils';

export async function GET(req: Request) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const limit = searchParams.get('limit');
        const type = searchParams.get('type');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        let query: any = { userId: user.id };
        if (type && type !== 'all') {
            query.type = type;
        }

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
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
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { amount, type, category, description, date, accountId } = body;

        if (!amount || !type || !category || !description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();
        const newTransaction = await Transaction.create({
            userId: user.id,
            amount: Number(amount),
            type,
            category,
            description,
            date: date || new Date(),
            accountId: accountId || null,
        });

        if (accountId) {
            await updateAccountBalance(user.id, accountId, Number(amount), type);
        }

        return NextResponse.json(newTransaction, { status: 201 });
    } catch (error) {
        console.error('Error creating transaction:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

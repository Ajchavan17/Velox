import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-helper'; // Custom helper
import dbConnect from '@/lib/db';
import Debt from '@/models/Debt';
import User from '@/models/User';
import { updateAccountBalance } from '@/lib/accountUtils';

export async function GET(req: Request) {
    try {
        const session = await getAuthSession(req);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        let query: any = { userId: session.user.id };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        await dbConnect();
        const debts = await Debt.find(query).sort({ createdAt: -1 });

        return NextResponse.json(debts);
    } catch (error) {
        console.error('Error fetching debts:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getAuthSession(req);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { type, personName, amount, accountId, date, dueDate, description } = body;

        if (!type || !personName || !amount || !accountId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        // 1. Create Debt Record
        const newDebt = await Debt.create({
            userId: session.user.id,
            type, // 'borrow' or 'lend'
            personName,
            amount: Number(amount),
            accountId,
            date: date ? new Date(date) : new Date(),
            dueDate: dueDate ? new Date(dueDate) : null,
            description,
            status: 'pending',
        });

        // 2. Update Account Balance
        // Borrow (I receive money) -> Income
        // Lend (I give money) -> Expense
        if (accountId) {
            const balanceType = type === 'borrow' ? 'income' : 'expense';
            await updateAccountBalance(session.user.id, accountId, Number(amount), balanceType);
        }

        return NextResponse.json(newDebt, { status: 201 });
    } catch (error) {
        console.error('Error creating debt:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

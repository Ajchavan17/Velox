
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Debt from '@/models/Debt';
import User from '@/models/User';

// Helper to update User Account Balance
async function updateAccountBalance(userId: string, accountId: string, amount: number) {
    await User.updateOne(
        { _id: userId, "accounts._id": accountId },
        { $inc: { "accounts.$.balance": amount } }
    );
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { personName, accountId, date } = body;

        if (!personName || !accountId || !date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        // Find all pending debts for this person
        const debts = await Debt.find({
            userId: session.user.id,
            personName: personName,
            status: { $ne: 'settled' }
        });

        if (!debts || debts.length === 0) {
            return NextResponse.json({ message: 'No pending debts found' });
        }

        let totalSettledCount = 0;

        for (const debt of debts) {
            // Calculate outstanding amount for this specific debt record
            const outstanding = debt.amount - (debt.repaidAmount || 0);

            if (outstanding <= 0) continue; // Should be handled by status check, but double check

            // Determine Balance Impact based on Debt Type
            // Borrow (I Owe) -> Settling means PAYING -> Deduct from Account
            // Lend (Owed to Me) -> Settling means RECEIVING -> Add to Account

            let balanceChange = 0;
            if (debt.type === 'borrow') {
                balanceChange = -outstanding;
            } else {
                balanceChange = outstanding;
            }

            // 1. Update Account Balance
            await updateAccountBalance(session.user.id, accountId, balanceChange);

            // 2. Update Debt Record
            debt.repaidAmount = (debt.repaidAmount || 0) + outstanding;
            debt.status = 'settled';

            // Add to settlements history
            if (!debt.settlements) debt.settlements = [];
            debt.settlements.push({
                amount: outstanding,
                date: new Date(date),
                accountId: accountId
            });

            await debt.save();
            totalSettledCount++;
        }

        return NextResponse.json({
            message: 'Settled all debts',
            count: totalSettledCount
        });

    } catch (error: any) {
        console.error("Settle All Error Details:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

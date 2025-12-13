import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Debt from '@/models/Debt';
import { updateAccountBalance } from '@/lib/accountUtils';

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const debt = await Debt.findOne({ _id: params.id, userId: session.user.id });

        if (!debt) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        // Logic: Revert Creation
        // Borrow (Income-like) -> revert-income
        // Lend (Expense-like) -> revert-expense
        if (debt.accountId) {
            const revertType = debt.type === 'borrow' ? 'revert-income' : 'revert-expense';
            await updateAccountBalance(session.user.id, debt.accountId, debt.amount, revertType);
        }

        await Debt.findByIdAndDelete(params.id);
        return NextResponse.json({ message: 'Deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { action } = body;

        await dbConnect();
        const debt = await Debt.findOne({ _id: params.id, userId: session.user.id });
        if (!debt) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        // --- SETTLE (Repayment) ---
        if (action === 'settle') {
            const { amount, date, accountId } = body; // amount to settle now
            const settleAmt = Number(amount);

            // Validation
            if (settleAmt <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
            if (debt.status === 'settled') return NextResponse.json({ error: 'Already settled' }, { status: 400 });

            // Balance Logic
            // Borrow Settle (Pay Back) -> Expense (Money Out)
            // Lend Settle (Receive Back) -> Income (Money In)

            if (accountId) {
                const balanceType = debt.type === 'borrow' ? 'expense' : 'income';
                await updateAccountBalance(session.user.id, accountId, settleAmt, balanceType);
            }

            // Update Debt Record
            debt.repaidAmount = (debt.repaidAmount || 0) + settleAmt;
            if (debt.repaidAmount >= debt.amount) {
                debt.status = 'settled'; // or 'paid'
            } else {
                debt.status = 'partial';
            }

            // Add settlement to history array
            if (!debt.settlements) debt.settlements = [];
            debt.settlements.push({
                amount: settleAmt,
                date: date ? new Date(date) : new Date(),
                accountId
            });

            await debt.save();
            return NextResponse.json(debt);
        }

        // --- EDIT ---
        if (action === 'edit') {
            const { amount, accountId } = body; // New values
            const newAmount = Number(amount);

            // If amount or account changed, revert old and apply new
            if (newAmount !== debt.amount || accountId !== debt.accountId) {
                // 1. Revert Old (on old account)
                if (debt.accountId) {
                    const revertType = debt.type === 'borrow' ? 'revert-income' : 'revert-expense';
                    await updateAccountBalance(session.user.id, debt.accountId, debt.amount, revertType);
                }

                // 2. Apply New (on new account)
                const targetAccountId = accountId || debt.accountId;
                if (targetAccountId) {
                    const applyType = debt.type === 'borrow' ? 'income' : 'expense';
                    await updateAccountBalance(session.user.id, targetAccountId, newAmount, applyType);
                }

                debt.amount = newAmount;
                if (accountId) debt.accountId = accountId;
            }

            // Update other fields
            if (body.personName) debt.personName = body.personName;
            if (body.date) debt.date = new Date(body.date);
            if (body.description) debt.description = body.description;

            await debt.save();
            return NextResponse.json(debt);
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';
import { updateAccountBalance } from '@/lib/accountUtils';

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        await dbConnect();

        // Find first to get details for balance Revert
        const transaction = await Transaction.findOne({ _id: id, userId: session.user.id });

        if (!transaction) {
            return NextResponse.json({ error: 'Transaction not found or unauthorized' }, { status: 404 });
        }

        // Revert Balance
        if (transaction.accountId) {
            const revertType = transaction.type === 'income' ? 'revert-income' : 'revert-expense';
            await updateAccountBalance(session.user.id, transaction.accountId.toString(), transaction.amount, revertType);
        }

        await Transaction.deleteOne({ _id: id });

        return NextResponse.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        await dbConnect();

        // Get original to revert
        const originalTransaction = await Transaction.findOne({ _id: id, userId: session.user.id });
        if (!originalTransaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        // 1. Revert Old
        if (originalTransaction.accountId) {
            const revertType = originalTransaction.type === 'income' ? 'revert-income' : 'revert-expense';
            await updateAccountBalance(session.user.id, originalTransaction.accountId.toString(), originalTransaction.amount, revertType);
        }

        // 2. Update
        const updatedTransaction = await Transaction.findOneAndUpdate(
            { _id: id, userId: session.user.id },
            { $set: body },
            { new: true }
        );

        // 3. Apply New
        if (updatedTransaction.accountId) {
            await updateAccountBalance(session.user.id, updatedTransaction.accountId.toString(), updatedTransaction.amount, updatedTransaction.type);
        }

        return NextResponse.json(updatedTransaction);
    } catch (error) {
        console.error('Error updating transaction:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

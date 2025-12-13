import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Loan from '@/models/Loan';
import Transaction from '@/models/Transaction';
import BankAccount from '@/models/BankAccount';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const loan = await Loan.findOne({ _id: id, userId: session.user.id });
        if (!loan) return NextResponse.json({ error: 'Loan not found' }, { status: 404 });

        return NextResponse.json(loan);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const loan = await Loan.findOneAndDelete({ _id: id, userId: session.user.id });
        if (!loan) return NextResponse.json({ error: 'Loan not found' }, { status: 404 });

        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const body = await req.json();
        const { action, installmentNo, transactionDate } = body;

        const loan = await Loan.findOne({ _id: id, userId: session.user.id });
        if (!loan) return NextResponse.json({ error: 'Loan not found' }, { status: 404 });

        if (action === 'pay_emi') {
            // Find the specific installment
            const installment = loan.schedule.find((s: any) => s.installmentNo === installmentNo);
            if (!installment) return NextResponse.json({ error: 'Installment not found' }, { status: 404 });

            if (installment.status === 'paid') return NextResponse.json({ error: 'Detailed already paid' }, { status: 400 });

            // 1. Update Schedule Status
            installment.status = 'paid';
            installment.paymentDate = new Date(transactionDate || Date.now());

            // 2. Create Transaction if linked account exists
            if (loan.linkedAccountId) {
                const isTaken = loan.type === 'taken';
                // If Taken (Liability) -> We Pay -> Expense / Transfer Out
                // If Given (Asset) -> We Receive -> Income / Transfer In

                // Construct Description
                const desc = `EMI Payment - ${loan.name} (#${installmentNo})`;

                const transaction = await Transaction.create({
                    userId: session.user.id,
                    type: isTaken ? 'expense' : 'income',
                    amount: loan.emiAmount,
                    category: isTaken ? 'Loan Repayment' : 'Loan Income',
                    accountId: loan.linkedAccountId,
                    date: installment.paymentDate,
                    description: desc,
                    isRecurring: false
                });

                // Link to installment
                installment.transactionId = transaction._id;

                // Update Account Balance
                const account = await BankAccount.findById(loan.linkedAccountId);
                if (account) {
                    if (isTaken) {
                        account.balance -= loan.emiAmount;
                    } else {
                        account.balance += loan.emiAmount;
                    }
                    await account.save();
                }
            }

            await loan.save();
            return NextResponse.json(loan);
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

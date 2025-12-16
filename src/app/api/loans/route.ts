import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Loan from '@/models/Loan';
import { getAuthSession } from '@/lib/auth-helper';
import { generateAmortizationSchedule, calculateEMI } from '@/lib/loanUtils';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getAuthSession(req);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const loans = await Loan.find({ userId: session.user.id }).sort({ createdAt: -1 });
        return NextResponse.json(loans);
    } catch (error) {
        console.error('Error fetching loans:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getAuthSession(req);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const {
            name, provider, type,
            principalAmount, interestRate, processingFee,
            startDate, tenureMonths, emiDate, linkedAccountId
        } = body;

        // Validation
        if (!name || !provider || !principalAmount || !startDate || !tenureMonths) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const start = new Date(startDate);
        const emi = calculateEMI(principalAmount, interestRate, tenureMonths);
        const schedule = generateAmortizationSchedule(principalAmount, interestRate, tenureMonths, start, emiDate);

        // Calculate Derived End Date (last EMI date)
        const endDate = schedule[schedule.length - 1].dueDate;

        const newLoan = await Loan.create({
            userId: session.user.id,
            name,
            provider,
            type,
            principalAmount,
            interestRate,
            processingFee,
            startDate: start,
            tenureMonths,
            endDate,
            emiAmount: emi,
            emiDate,
            linkedAccountId: linkedAccountId || null,
            schedule,
            status: 'active'
        });

        return NextResponse.json(newLoan, { status: 201 });
    } catch (error) {
        console.error('Error creating loan:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/getAuthUser';
import dbConnect from '@/lib/db';
import CreditCard from '@/models/CreditCard';

import mongoose from 'mongoose';

export async function GET(req: Request) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const cards = await CreditCard.find({ userId: new mongoose.Types.ObjectId(user.id) }).sort({ createdAt: -1 });

        return NextResponse.json(cards);
    } catch (error) {
        console.error('Error fetching cards:', error);
        return NextResponse.json({ error: `Internal Server Error: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { bankName, cardName, last4Digits, creditLimit, currentBalance } = body;

        if (!bankName || !cardName || !last4Digits || !creditLimit) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();
        const newCard = await CreditCard.create({
            userId: user.id,
            bankName,
            cardName,
            last4Digits,
            creditLimit: Number(creditLimit),
            currentBalance: Number(currentBalance) || 0,
        });

        return NextResponse.json(newCard, { status: 201 });
    } catch (error) {
        console.error('Error creating card:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing card ID' }, { status: 400 });
        }

        await dbConnect();
        const deletedCard = await CreditCard.findOneAndDelete({
            _id: id,
            userId: user.id,
        });

        if (!deletedCard) {
            return NextResponse.json({ error: 'Card not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Card deleted successfully' });
    } catch (error) {
        console.error('Error deleting card:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

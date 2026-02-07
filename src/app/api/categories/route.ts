import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        await dbConnect();
        const user = await User.findById(session.user.id).select('categories');

        return NextResponse.json(user.categories);
    } catch (error) {
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { name, type, subcategories } = body;

        if (!name || !type) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        await dbConnect();

        const user = await User.findById(session.user.id);

        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }

        user.categories.push({
            name,
            type,
            subcategories: subcategories || [],
            isDefault: false
        });

        await user.save();

        return NextResponse.json(user.categories);
    } catch (error) {
        console.error('Error adding category:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return new NextResponse('Category ID required', { status: 400 });
        }

        await dbConnect();
        const user = await User.findById(session.user.id);

        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }

        // Pull the category with the matching _id from the categories array
        user.categories.pull({ _id: id });
        await user.save();

        return NextResponse.json(user.categories);
    } catch (error) {
        console.error('Error deleting category:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { id, name, type, subcategories } = body;

        if (!id) {
            return new NextResponse('Category ID required', { status: 400 });
        }

        await dbConnect();
        const user = await User.findById(session.user.id);

        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }

        // Find category and update
        const category = user.categories.id(id);
        if (!category) {
            return new NextResponse('Category not found', { status: 404 });
        }

        if (name) category.name = name;
        if (type) category.type = type;
        if (subcategories) category.subcategories = subcategories;

        await user.save();

        return NextResponse.json(user.categories);
    } catch (error) {
        console.error('Error updating category:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

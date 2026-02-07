import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import connectDB from "@/lib/db";
import PushSubscription from "@/models/PushSubscription";

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user || !(user as any).id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { subscription } = await req.json();
        if (!subscription || !subscription.endpoint) {
            return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
        }

        await connectDB();

        // Upsert the subscription
        await PushSubscription.findOneAndUpdate(
            { "subscription.endpoint": subscription.endpoint },
            {
                userId: (user as any).id,
                subscription: subscription
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ message: "Subscribed successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error saving subscription:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import connectDB from "@/lib/db";
import PushSubscription from "@/models/PushSubscription";
import webpush from "web-push";

// Initialize web-push with VAPID keys
// Note: In a real app, ensure these env vars are set!
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidSubject = process.env.NEXT_PUBLIC_VAPID_SUBJECT || 'mailto:support@velox.app';

if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(
        vapidSubject,
        vapidPublicKey,
        vapidPrivateKey
    );
}

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user || !(user as any).id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { title, message } = await req.json();

        await connectDB();

        // Get all subscriptions for this user
        const subscriptions = await PushSubscription.find({ userId: (user as any).id });

        if (subscriptions.length === 0) {
            return NextResponse.json({ message: "No subscriptions found for user" }, { status: 200 });
        }

        const payload = JSON.stringify({
            title: title || "Test Notification",
            body: message || "This is a test notification from Velox.",
            icon: "/icon-192x192.png",
            badge: "/maskable-icon.png",
            url: "/dashboard"
        });

        // Send to all user devices
        const promises = subscriptions.map(sub =>
            webpush.sendNotification(sub.subscription as any, payload)
                .catch(err => {
                    console.error("Error sending push:", err);
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        // Subscription expired/gone, delete it
                        return PushSubscription.deleteOne({ _id: sub._id });
                    }
                })
        );

        await Promise.all(promises);

        return NextResponse.json({ message: `Sent to ${subscriptions.length} devices` }, { status: 200 });
    } catch (error) {
        console.error("Error in sending push:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

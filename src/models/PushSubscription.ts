import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPushSubscription extends Document {
    userId: string;
    subscription: {
        endpoint: string;
        expirationTime: number | null;
        keys: {
            p256dh: string;
            auth: string;
        };
    };
    createdAt: Date;
}

const PushSubscriptionSchema = new Schema<IPushSubscription>(
    {
        userId: { type: String, required: true },
        subscription: {
            endpoint: { type: String, required: true, unique: true },
            expirationTime: { type: Number, default: null },
            keys: {
                p256dh: { type: String, required: true },
                auth: { type: String, required: true },
            },
        },
    },
    { timestamps: true }
);

// Prevent re-compilation error in dev
const PushSubscription: Model<IPushSubscription> =
    mongoose.models.PushSubscription ||
    mongoose.model<IPushSubscription>("PushSubscription", PushSubscriptionSchema);

export default PushSubscription;

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email',
        ],
    },
    password: {
        type: String,
        select: false, // Don't return password by default
    },
    image: {
        type: String,
    },
    provider: {
        type: String,
        enum: ['credentials'],
        default: 'credentials',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: String,
    verificationTokenExpiry: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    failedLoginAttempts: {
        type: Number,
        default: 0,
    },
    lockUntil: {
        type: Date,
    },
    lastLockDuration: {
        type: Number,
        default: 0,
    },
    plan: {
        type: String,
        enum: ['free', 'pro', 'enterprise'],
        default: null,
    },
    subscriptionStatus: {
        type: String,
        enum: ['active', 'inactive', 'past_due', 'canceled'],
        default: 'inactive',
    },
    categories: [{
        name: { type: String, required: true },
        type: { type: String, enum: ['income', 'expense'], required: true },
        subcategories: [String],
        isDefault: { type: Boolean, default: false }
    }],
    accounts: [{
        name: { type: String, required: true },
        bankName: String,
        type: { type: String, enum: ['bank', 'credit_card', 'cash', 'wallet', 'other'], default: 'bank' },
        accountType: String,
        balance: { type: Number, default: 0 },
        currency: { type: String, default: 'INR' },
        last4Digits: String,
        creditLimit: Number,
        isDefault: { type: Boolean, default: false }
    }],
    currency: {
        type: String,
        default: 'INR',
    },
});

// Prevent stale model error in development
if (process.env.NODE_ENV === 'development') {
    if (mongoose.models.User) {
        delete mongoose.models.User;
    }
}

export default mongoose.models.User || mongoose.model('User', UserSchema);

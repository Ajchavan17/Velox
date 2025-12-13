import mongoose, { Schema, model, models } from 'mongoose';

const DebtSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['borrow', 'lend'],
        required: true,
    },
    personName: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    accountId: {
        type: Schema.Types.ObjectId, // References User.accounts._id
        required: false, // Optional because cash debts might not hit an account initially? Plan said Required. I'll make it False for flexibility, but UI will enforce.
    },
    currency: {
        type: String,
        default: 'INR',
    },
    dueDate: {
        type: Date,
    },
    description: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'partial', 'settled'],
        default: 'pending',
    },
    repaidAmount: {
        type: Number,
        default: 0,
    },
    settlements: [{
        amount: Number,
        date: Date,
        accountId: Schema.Types.ObjectId,
    }],
}, { timestamps: true });

// Prevent stale model error in development
if (process.env.NODE_ENV === 'development') {
    if (models.Debt) {
        delete models.Debt;
    }
}

export default models.Debt || model('Debt', DebtSchema);

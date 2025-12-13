import mongoose from 'mongoose';

const CreditCardSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    bankName: {
        type: String,
        required: [true, 'Please provide a bank name'],
    },
    cardName: {
        type: String,
        required: [true, 'Please provide a card name (e.g., Platinum Rewards)'],
    },
    last4Digits: {
        type: String,
        required: [true, 'Please provide the last 4 digits'],
        minlength: 4,
        maxlength: 4,
    },
    creditLimit: {
        type: Number,
        required: true,
    },
    currentBalance: {
        type: Number,
        default: 0,
    },
    currency: {
        type: String,
        default: 'INR',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.CreditCard || mongoose.model('CreditCard', CreditCardSchema);

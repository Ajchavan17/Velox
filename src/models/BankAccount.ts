import mongoose from 'mongoose';

const BankAccountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    bankName: {
        type: String,
        required: [true, 'Please provide a bank name'],
    },
    accountType: {
        type: String,
        enum: ['Checking', 'Savings', 'Investment', 'Cash', 'Other'],
        default: 'Checking',
    },
    accountName: {
        type: String,
        required: [true, 'Please provide an account name (e.g., Main Checking)'],
    },
    balance: {
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

// Prevent Mongoose model recompilation error in development
// Delete the existing model if it exists to ensure the new schema (with 'Cash') is applied
if (mongoose.models.BankAccount) {
    delete mongoose.models.BankAccount;
}

const BankAccount = mongoose.model('BankAccount', BankAccountSchema);
export default BankAccount;

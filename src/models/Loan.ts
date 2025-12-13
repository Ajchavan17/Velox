import mongoose, { Schema, model, models } from 'mongoose';

const LoanSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    provider: {
        type: String,
        required: true, // Bank Name or Person Name
        trim: true,
    },
    type: {
        type: String,
        enum: ['taken', 'given'],
        required: true,
    },

    // Financials
    principalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    interestRate: {
        type: Number, // Annual ROI %
        required: true,
        min: 0,
    },
    processingFee: {
        type: Number,
        default: 0,
        min: 0,
    },

    // Timeline
    startDate: {
        type: Date,
        required: true,
    },
    tenureMonths: {
        type: Number,
        required: true,
        min: 1,
    },
    endDate: {
        type: Date, // Derived
    },

    // EMI Details
    emiAmount: {
        type: Number,
        required: true,
    },
    emiDate: {
        type: Number, // Day of month (1-31)
        required: true,
        min: 1,
        max: 31,
    },
    linkedAccountId: {
        type: Schema.Types.ObjectId,
        ref: 'BankAccount', // Bank/Wallet to auto-deduct/deposit
        required: false,
    },

    // Amortization Schedule
    schedule: [{
        installmentNo: Number,
        dueDate: Date,
        principalComponent: Number,
        interestComponent: Number,
        balance: Number, // Remaining Principal AFTER this payment
        status: {
            type: String,
            enum: ['pending', 'paid', 'overdue'],
            default: 'pending'
        },
        paymentDate: Date, // Real date when user clicked "Paid"
        transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' }
    }],

    status: {
        type: String,
        enum: ['active', 'closed', 'defaulted'],
        default: 'active',
    },
}, { timestamps: true });

// Prevent stale model error in development
if (process.env.NODE_ENV === 'development') {
    if (models.Loan) {
        delete models.Loan;
    }
}

export default models.Loan || model('Loan', LoanSchema);

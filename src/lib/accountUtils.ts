
// ... (imports)
import BankAccount from '@/models/BankAccount';
import CreditCard from '@/models/CreditCard';

type TransactionType = 'income' | 'expense';

// For Debts, we map:
// 'borrow' (receivable, money comes in) -> treated like 'income' for update
// 'lend' (payable, money goes out) -> treated like 'expense' for update
// But wait, Debt 'borrow' means I borrowed FROM someone. I RECEIVED money. So my balance INCREASES. (Income-like)
// Debt 'lend' means I gave money TO someone. My balance DECREASES. (Expense-like)

export async function updateAccountBalance(
    userId: string,
    accountId: string,
    amount: number,
    type: TransactionType | 'revert-income' | 'revert-expense'
) {
    if (!accountId) return;

    // Try to find BankAccount first
    const bankAccount = await BankAccount.findOne({ _id: accountId, userId });

    if (bankAccount) {
        // Asset Logic
        // Income -> +
        // Expense -> -
        // Revert Income -> -
        // Revert Expense -> +
        let change = 0;
        if (type === 'income') change = amount;
        else if (type === 'expense') change = -amount;
        else if (type === 'revert-income') change = -amount;
        else if (type === 'revert-expense') change = amount;

        bankAccount.balance += change;
        await bankAccount.save();
        return;
    }

    // Try finding CreditCard
    const creditCard = await CreditCard.findOne({ _id: accountId, userId });

    if (creditCard) {
        // Liability Logic (currentBalance is how much you OWE)
        // Expense (Spend) -> Balance Increases (Owe more)
        // Income (Pay off) -> Balance Decreases (Owe less)

        // Revert Expense (Refund) -> Balance Decreases
        // Revert Income (Un-pay) -> Balance Increases

        let change = 0;
        if (type === 'expense') change = amount;
        else if (type === 'income') change = -amount;
        else if (type === 'revert-expense') change = -amount;
        else if (type === 'revert-income') change = amount;

        creditCard.currentBalance += change;
        await creditCard.save();
    }
}

import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/getAuthUser';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import BankAccount from '@/models/BankAccount';
import CreditCard from '@/models/CreditCard';
import Debt from '@/models/Debt';
import mongoose from 'mongoose';

export async function GET(req: Request) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const userId = new mongoose.Types.ObjectId(user.id);

        // Fetch user preferences (currency)
        const dbUser = await User.findById(userId).select('currency');
        const currency = dbUser?.currency || 'INR';

        // 1. Bank Accounts Total
        const bankAccounts = await BankAccount.find({ userId });
        const totalLiquidity = bankAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

        // 2. Credit Cards Total Debt
        const creditCards = await CreditCard.find({ userId });
        const totalCreditDebt = creditCards.reduce((sum, card) => sum + (card.currentBalance || 0), 0);

        // 3. Debts Summary
        const debts = await Debt.find({ userId, status: 'pending' }); // Only pending debts count towards net position
        let totalReceivable = 0; // Lend
        let totalPayable = 0;    // Borrow

        debts.forEach(debt => {
            if (debt.type === 'lend') totalReceivable += debt.amount;
            else if (debt.type === 'borrow') totalPayable += debt.amount;
        });
        const netDebtPosition = totalReceivable - totalPayable;


        // 4. Aggregation Pipeline for Total Income and Expenses (Existing)
        const totals = await Transaction.aggregate([
            { $match: { userId: userId } },
            {
                $group: {
                    _id: null,
                    totalIncome: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "income"] }, "$amount", 0]
                        }
                    },
                    totalExpenses: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0]
                        }
                    }
                }
            }
        ]);

        const stats = totals[0] || { totalIncome: 0, totalExpenses: 0 };
        const netBalance = stats.totalIncome - stats.totalExpenses;

        // 5. Recent Transactions (Last 5)
        const recentTransactions = await Transaction.find({ userId: userId })
            .sort({ date: -1 })
            .limit(5);

        // 6. Monthly Stats for Burn Chart (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyData = await Transaction.aggregate([
            {
                $match: {
                    userId: userId,
                    date: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" },
                        type: "$type"
                    },
                    total: { $sum: "$amount" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        const chartDataMap = new Map();
        const getMonthName = (monthIndex: number) => {
            const date = new Date();
            date.setMonth(monthIndex - 1);
            return date.toLocaleString('default', { month: 'short' });
        };

        monthlyData.forEach(item => {
            const key = `${item._id.year}-${item._id.month}`;
            if (!chartDataMap.has(key)) {
                chartDataMap.set(key, {
                    name: getMonthName(item._id.month),
                    income: 0,
                    expense: 0
                });
            }
            const entry = chartDataMap.get(key);
            if (item._id.type === 'income') entry.income = item.total;
            if (item._id.type === 'expense') entry.expense = item.total;
        });

        const chartData = Array.from(chartDataMap.values());


        // 7. Category Spending (Last 30 Days) for Donut Chart
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const categoryDataRaw = await Transaction.aggregate([
            {
                $match: {
                    userId: userId,
                    type: 'expense',
                    date: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: "$category",
                    value: { $sum: "$amount" }
                }
            },
            { $sort: { value: -1 } },
            { $limit: 5 } // Top 5 categories
        ]);

        const categoryData = categoryDataRaw.map(item => ({
            name: item._id,
            value: item.value
        }));


        return NextResponse.json({
            currency,
            // Header Stats
            totalLiquidity,
            totalCreditDebt,
            netDebtPosition,
            totalReceivable,
            totalPayable,
            // Legacy Stats
            totalIncome: stats.totalIncome,
            totalExpenses: stats.totalExpenses,
            netBalance,
            // Lists
            accounts: bankAccounts,
            cards: creditCards,
            recentTransactions,
            // Charts
            chartData,
            categoryData
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

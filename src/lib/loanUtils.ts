export interface AmortizationEntry {
    installmentNo: number;
    dueDate: Date;
    principalComponent: number;
    interestComponent: number;
    balance: number;
    status: 'pending' | 'paid' | 'overdue';
}

export function calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
    if (annualRate === 0) return principal / tenureMonths;

    const r = annualRate / 12 / 100;
    const n = tenureMonths;

    const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi); // Create round number EMIs for simplicity
}

export function generateAmortizationSchedule(
    principal: number,
    annualRate: number,
    tenureMonths: number,
    startDate: Date,
    emiDay: number
): AmortizationEntry[] {
    const schedule: AmortizationEntry[] = [];
    let balance = principal;
    const r = annualRate / 12 / 100;
    const emi = calculateEMI(principal, annualRate, tenureMonths);

    // Determine first EMI date
    // If startDate day > emiDay, first EMI is next month. Else same month (if not already passed? usually loans start next month)
    // Let's assume First EMI is exactly 1 month from Start Date roughly, aligned to emiDay.
    let currentDate = new Date(startDate);

    // Logic: First EMI is usually the next month's 'emiDay'
    // Example: taken on 15th Jan, EMI Day 5th. First EMI -> 5th Feb.
    // Example: taken on 2nd Jan, EMI Day 5th. First EMI -> 5th Feb (usually min 1 month gap).
    // Let's standardize: Move to next month, set date.
    if (currentDate.getDate() > emiDay) {
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    // Now ensure it's at least 25 days away? Or just simple Next Month logic.
    // Simple logic: First EMI is in the month FOLLOWING the start date.
    currentDate.setMonth(currentDate.getMonth() + 1);
    currentDate.setDate(emiDay);

    for (let i = 1; i <= tenureMonths; i++) {
        const interest = Math.round(balance * r);
        let principalPart = emi - interest;

        // Adjust for last installment to zero out
        if (i === tenureMonths || balance - principalPart < 0) {
            principalPart = balance;
            // slightly adjust EMI for last month if needed, but for schedule we track component
        }

        balance -= principalPart;

        schedule.push({
            installmentNo: i,
            dueDate: new Date(currentDate),
            principalComponent: principalPart,
            interestComponent: interest,
            balance: Math.max(0, balance),
            status: 'pending'
        });

        // Next month
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return schedule;
}

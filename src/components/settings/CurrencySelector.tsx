"use client";

import { useCurrency } from "@/context/CurrencyContext";
import { Select } from "@/components/ui/Select";

export default function CurrencySelector() {
    const { currency, setCurrency } = useCurrency();

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">Currency</label>
            <Select
                value={currency}
                onChange={(val) => setCurrency(val)}
                options={[
                    { label: 'Indan Rupee (₹)', value: 'INR' },
                    { label: 'US Dollar ($)', value: 'USD' },
                    { label: 'Euro (€)', value: 'EUR' },
                    { label: 'British Pound (£)', value: 'GBP' },
                    { label: 'Japanese Yen (¥)', value: 'JPY' },
                ]}
            />
            <p className="text-xs text-muted-foreground">
                This will update the currency symbol across the application. Conversion is not applied.
            </p>
        </div>
    );
}

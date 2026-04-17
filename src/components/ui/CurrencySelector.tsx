import { useEffect, useState } from "react";
import { useCurrencyStore } from "../../stores/currencyStore";
import { useExchangeRates, useSupportedCurrencies } from "../../api/hooks";
import { LucideChevronDown, LucideDollarSign } from "lucide-react";
import { cn } from "../../lib/utils";

export default function CurrencySelector({ className }: { className?: string }) {
    const [open, setOpen] = useState(false);
    const { selectedCurrency, setCurrency, setRates } = useCurrencyStore();

    const { data: ratesData } = useExchangeRates();
    const { data: currencies } = useSupportedCurrencies();

    useEffect(() => {
        if (ratesData) {
            setRates(ratesData.rates, ratesData.lastFetched);
        }
    }, [ratesData, setRates]);

    const currencyList = currencies ?? [
        { code: "USD", name: "US Dollar", symbol: "$" },
        { code: "EUR", name: "Euro", symbol: "€" },
        { code: "GBP", name: "British Pound", symbol: "£" },
        { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
        { code: "INR", name: "Indian Rupee", symbol: "₹" },
    ];

    const current = currencyList.find(c => c.code === selectedCurrency) ?? { code: "USD", name: "US Dollar", symbol: "$" };

    return (
        <div className={cn("relative", className)}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-border-light rounded-xl text-sm font-medium text-heading hover:border-accent/40 transition-colors"
            >
                <LucideDollarSign className="w-3.5 h-3.5 text-accent" />
                <span>{current.code}</span>
                <LucideChevronDown className={cn("w-3.5 h-3.5 text-muted transition-transform", open && "rotate-180")} />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute top-full right-0 mt-1.5 w-56 bg-white border border-border-light rounded-xl shadow-lg z-20 overflow-hidden max-h-72 overflow-y-auto">
                        {currencyList.map(cur => (
                            <button
                                key={cur.code}
                                onClick={() => { setCurrency(cur.code); setOpen(false); }}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-background-primary transition-colors",
                                    selectedCurrency === cur.code && "bg-accent/5 text-accent font-medium"
                                )}
                            >
                                <span className="flex items-center gap-2">
                                    <span className="w-6 text-center font-medium text-muted">{cur.symbol}</span>
                                    <span>{cur.code}</span>
                                </span>
                                <span className="text-xs text-muted">{cur.name}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

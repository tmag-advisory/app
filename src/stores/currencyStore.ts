import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CurrencyState {
    selectedCurrency: string;
    rates: Record<string, number>;
    lastFetched: string | null;

    setCurrency: (currency: string) => void;
    setRates: (rates: Record<string, number>, lastFetched: string | null) => void;
    convert: (usdAmount: number) => number;
    convertFrom: (amount: number, fromCurrency: string) => number;
    symbol: () => string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", NGN: "₦", INR: "₹",
    CAD: "C$", AUD: "A$", KES: "KSh", ZAR: "R", GHS: "GH₵",
    JPY: "¥", CNY: "¥", BRL: "R$", AED: "د.إ", SGD: "S$", CHF: "CHF",
};

export const useCurrencyStore = create<CurrencyState>()(
    persist(
        (set, get) => ({
            selectedCurrency: "USD",
            rates: {},
            lastFetched: null,

            setCurrency: (currency) => set({ selectedCurrency: currency }),

            setRates: (rates, lastFetched) => set({ rates, lastFetched }),

            convert: (usdAmount: number) => {
                const { selectedCurrency, rates } = get();
                if (selectedCurrency === "USD") return usdAmount;
                const rate = rates[selectedCurrency];
                if (!rate) return usdAmount;
                return Math.round(usdAmount * rate * 100) / 100;
            },

            convertFrom: (amount: number, fromCurrency: string) => {
                const { selectedCurrency, rates } = get();
                if (fromCurrency === selectedCurrency) return amount;
                const fromRate = rates[fromCurrency] ?? 1;
                const toRate = rates[selectedCurrency] ?? 1;
                const inUsd = amount / fromRate;
                return Math.round(inUsd * toRate * 100) / 100;
            },

            symbol: () => {
                return CURRENCY_SYMBOLS[get().selectedCurrency] ?? get().selectedCurrency;
            },
        }),
        {
            name: "tmag-currency",
            partialize: (state) => ({
                selectedCurrency: state.selectedCurrency,
                rates: state.rates,
                lastFetched: state.lastFetched,
            }),
        }
    )
);

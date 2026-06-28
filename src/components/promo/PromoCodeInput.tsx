import { useState } from "react";
import { LucideCheck, LucideLoader, LucideTag, LucideX } from "lucide-react";
import {
    validatePromoCode,
    setPendingPromoCode,
    clearPendingPromoCode,
    type PromoAudience,
    type PromoCode,
} from "../../api/promoCodes";

interface Props {
    audience: PromoAudience;
    /** Called when a code is successfully validated (or cleared). */
    onApplied?: (code: PromoCode | null) => void;
    className?: string;
}

const REASON_MESSAGES: Record<string, string> = {
    not_found: "Code not recognized.",
    expired: "This code has expired.",
    cap_reached: "This code has reached its redemption limit.",
    wrong_audience: "This code can't be used here.",
    inactive: "This code is no longer active.",
};

const PromoCodeInput = ({ audience, onApplied, className }: Props) => {
    const [value, setValue] = useState("");
    const [applied, setApplied] = useState<PromoCode | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const apply = async () => {
        const code = value.trim().toUpperCase();
        if (!code) return;
        setLoading(true);
        setError(null);
        try {
            const res = await validatePromoCode(code, audience);
            if (res.valid && res.code) {
                setApplied(res.code);
                setPendingPromoCode(code);
                onApplied?.(res.code);
            } else {
                setError(REASON_MESSAGES[res.reason || ""] || "Invalid code.");
                onApplied?.(null);
            }
        } catch {
            setError("Couldn't verify code. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const clear = () => {
        setApplied(null);
        setValue("");
        setError(null);
        clearPendingPromoCode();
        onApplied?.(null);
    };

    if (applied) {
        return (
            <div
                className={`flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 ${className ?? ""}`}
            >
                <div className="flex items-center gap-2 text-sm">
                    <LucideCheck className="h-4 w-4 text-emerald-700" />
                    <span className="font-semibold text-emerald-900">{applied.code}</span>
                    <span className="text-emerald-800">
                        — Free {applied.tier === "PREMIUM" ? "Premium" : "Standard"} tier applied
                    </span>
                </div>
                <button
                    type="button"
                    onClick={clear}
                    className="text-emerald-900/70 hover:text-emerald-900"
                    aria-label="Remove promo code"
                >
                    <LucideX className="h-4 w-4" />
                </button>
            </div>
        );
    }

    return (
        <div className={className}>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Promo code (optional)
            </label>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <LucideTag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value.toUpperCase())}
                        placeholder="e.g. TMAGCORP1"
                        className="w-full bg-white border border-border-light rounded-xl pl-9 pr-3 py-3 text-sm text-heading uppercase placeholder:text-border outline-none focus:border-accent transition-colors"
                    />
                </div>
                <button
                    type="button"
                    onClick={apply}
                    disabled={loading || !value.trim()}
                    className="px-4 rounded-xl bg-dark text-background-primary text-sm font-semibold disabled:opacity-50 hover:bg-darkest transition-colors"
                >
                    {loading ? <LucideLoader className="h-4 w-4 animate-spin" /> : "Apply"}
                </button>
            </div>
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
    );
};

export default PromoCodeInput;

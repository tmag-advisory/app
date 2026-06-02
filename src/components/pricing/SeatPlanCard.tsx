import { motion } from "framer-motion";
import {
    LucideArrowRight,
    LucideCheck,
    LucideUsers,
    LucideStar,
    LucideBuilding2,
    type LucideIcon,
} from "lucide-react";
import Button from "../ui/Button";
import { staggerItem } from "../animations/StaggerGroup";
import { cn } from "../../lib/utils";
import {
    INCLUDED_PLANS_PER_SEAT,
    resolveSeatTier,
    seatPricePerSeat,
    type CreditPlanTier,
} from "../../constants/companyPlans";
import { formatCurrencyAmount } from "../../lib/launchDiscount";

interface SeatStyle {
    Icon: LucideIcon;
    card: string;
    surface?: string;
    emblem: string;
    badge?: { label: string; className: string };
    name: string;
    description: string;
    price: string;
    note: string;
    feature: string;
    check: string;
    divider: string;
    cta: string;
}

// Visual styles mirror IndividualPlanCard's tier looks so the two grids match.
const SEAT_STYLES: Record<CreditPlanTier, SeatStyle> = {
    essential: {
        Icon: LucideUsers,
        card: "bg-white border border-stone-200 shadow-sm",
        surface: "linear-gradient(145deg, #ffffff 0%, #ffffff 45%, #ffffff 100%)",
        emblem: "bg-stone-100 text-stone-500",
        name: "text-stone-800",
        description: "text-stone-500",
        price: "text-stone-800",
        note: "text-stone-400",
        feature: "text-stone-700",
        check: "text-emerald-600",
        divider: "border-stone-200",
        cta: "",
    },
    standard: {
        Icon: LucideStar,
        card: "border-2 border-accent/40 shadow-md",
        surface: "linear-gradient(145deg, #eaf7f4 0%, #dff2ee 45%, #e6f5f1 100%)",
        emblem: "bg-accent/10 text-accent",
        badge: { label: "Most popular", className: "bg-accent text-white" },
        name: "text-[#1a3c38]",
        description: "text-[#2a5858]/80",
        price: "text-[#1a5c52]",
        note: "text-[#2a5858]/60",
        feature: "text-[#1a3c38]",
        check: "text-accent",
        divider: "border-accent/15",
        cta: "bg-accent! text-white! hover:bg-[#246858]!",
    },
    premium: {
        Icon: LucideBuilding2,
        card: "border border-gold/40 shadow-sm",
        surface: "linear-gradient(145deg, #fdf8f0 0%, #faf3e4 45%, #fdf7ee 100%)",
        emblem: "bg-gold/15 text-[#9a7020]",
        badge: { label: "Best rate", className: "bg-gold/15 text-[#9a7020]" },
        name: "text-stone-800",
        description: "text-stone-500",
        price: "text-[#9a7020]",
        note: "text-stone-400",
        feature: "text-stone-700",
        check: "text-gold",
        divider: "border-gold/20",
        cta: "bg-gold! text-white! hover:bg-[#b07a22]!",
    },
};

const SEAT_DESCRIPTIONS: Record<CreditPlanTier, string> = {
    essential: "For small teams getting started with traveller coverage.",
    standard: "For growing teams that travel often the sweet spot.",
    premium: "For large organisations covering travellers at scale.",
};

interface SeatPlanCardProps {
    seats: number;
    currency: string;
    variant: CreditPlanTier;
}

const SeatPlanCard = ({ seats, currency, variant }: SeatPlanCardProps) => {
    const style = SEAT_STYLES[variant];
    const { Icon } = style;

    const perSeat = seatPricePerSeat(seats, currency);
    const total = perSeat * seats;
    const tier = resolveSeatTier(seats);

    const features = [
        `${INCLUDED_PLANS_PER_SEAT} travel plans per seat / year`,
        "CSV employee onboarding",
        "Company admin dashboard",
        "Per-employee usage tracking",
        "Buy & assign extra plans anytime",
    ];

    return (
        <motion.div
            variants={staggerItem}
            className={cn("relative h-full p-8 flex flex-col overflow-hidden border border-slate-200")}
        >
            {style.surface && <div className="absolute inset-0" style={{ background: style.surface }} />}

            <div className="relative z-10 flex flex-1 flex-col">
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-5", style.emblem)}>
                    <Icon className="w-5 h-5" />
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className={cn("text-lg font-semibold", style.name)}>{seats} seats</h3>
                    {style.badge && (
                        <span className={cn("text-[11px] font-semibold px-2.5 py-0.5 rounded-full", style.badge.className)}>
                            {style.badge.label}
                        </span>
                    )}
                </div>

                <p className={cn("text-sm mb-6", style.description)}>{SEAT_DESCRIPTIONS[variant]}</p>

                <div className="flex items-end gap-2 mb-1">
                    <span className={cn("text-4xl font-serif leading-none", style.price)}>
                        {formatCurrencyAmount(perSeat, currency)}
                    </span>
                    <span className={cn("text-sm mb-0.5", style.note)}>/ seat / yr</span>
                </div>

                <p className={cn("text-xs mb-6", style.note)}>
                    {formatCurrencyAmount(total, currency)} billed annually · {tier.tier.replace("_", " ")}
                </p>

                <div className={cn("border-t mb-5", style.divider)} />

                <p className={cn("text-sm font-semibold mb-4", style.name)}>Each seat includes:</p>

                <ul className="space-y-3 mb-8">
                    {features.map((f) => (
                        <li key={f} className={cn("flex items-start gap-3 text-sm", style.feature)}>
                            <LucideCheck className={cn("w-4 h-4 mt-0.5 shrink-0", style.check)} />
                            <span>{f}</span>
                        </li>
                    ))}
                </ul>

                <Button
                    variant="secondary"
                    link={`/company-onboarding?seats=${seats}`}
                    icon={<LucideArrowRight />}
                    className={cn("mt-auto w-full justify-center", style.cta)}
                >
                    Get started
                </Button>
            </div>
        </motion.div>
    );
};

export default SeatPlanCard;

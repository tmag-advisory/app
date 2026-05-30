import { motion } from "framer-motion";
import {
    LucideArrowRight,
    LucideCheck,
    LucideCrown,
    LucidePiggyBank,
    LucideShield,
    LucideStar,
    LucideTag,
    type LucideIcon,
} from "lucide-react";
import Button from "../ui/Button";
import { staggerItem } from "../animations/StaggerGroup";
import { cn } from "../../lib/utils";
import type { CreditPlanTier, IndividualPlanDefinition } from "../../constants/companyPlans";
import { computeDiscount, formatCurrencyAmount, formatStackedPrice } from "../../lib/launchDiscount";

interface TierStyle {
    /** Plan emblem rendered in the top-left disc. */
    Icon: LucideIcon;
    /** Card border + elevation. */
    card: string;
    /** Optional gradient surface painted behind the content. */
    surface?: string;
    /** Emblem disc background + icon colour. */
    emblem: string;
    /** Inline badge beside the plan name. */
    badge?: { label: string; className: string };
    /** Discount accents (omitted on the free tier, which never discounts). */
    discount?: { ribbon: string; pill: string; savings: string };
    name: string;
    description: string;
    price: string;
    note: string;
    feature: string;
    check: string;
    divider: string;
    /** Header above the feature list, e.g. "Includes everything in Essential, plus:". */
    includesLabel: string;
    /** CTA button colour overrides (empty keeps the neutral secondary button). */
    cta: string;
}

const TIER_STYLES: Record<CreditPlanTier, TierStyle> = {
    essential: {
        Icon: LucideShield,
        card: "bg-white border border-stone-200 shadow-sm",
        emblem: "bg-stone-100 text-stone-500",
        name: "text-stone-800",
        surface: "linear-gradient(145deg, #ffffff 0%, #ffffff 45%, #ffffff 100%)",
        description: "text-stone-500",
        price: "text-stone-800",
        note: "text-stone-400",
        feature: "text-stone-700",
        check: "text-emerald-600",
        divider: "border-stone-200",
        includesLabel: "Includes:",
        cta: "",
    },
    standard: {
        Icon: LucideStar,
        card: "border-2 border-accent/40 shadow-md",
        surface: "linear-gradient(145deg, #eaf7f4 0%, #dff2ee 45%, #e6f5f1 100%)",
        emblem: "bg-accent/10 text-accent",
        badge: { label: "Most popular", className: "bg-accent text-white" },
        discount: { ribbon: "bg-accent", pill: "bg-accent/10 text-accent", savings: "text-accent" },
        name: "text-[#1a3c38]",
        description: "text-[#2a5858]/80",
        price: "text-[#1a5c52]",
        note: "text-[#2a5858]/60",
        feature: "text-[#1a3c38]",
        check: "text-accent",
        divider: "border-accent/15",
        includesLabel: "Includes everything in Essential, plus:",
        cta: "bg-accent! text-white! hover:bg-[#246858]!",
    },
    premium: {
        Icon: LucideCrown,
        card: "border border-gold/40 shadow-sm",
        surface: "linear-gradient(145deg, #fdf8f0 0%, #faf3e4 45%, #fdf7ee 100%)",
        emblem: "bg-gold/15 text-[#9a7020]",
        badge: { label: "Best report", className: "bg-gold/15 text-[#9a7020]" },
        discount: { ribbon: "bg-gold", pill: "bg-gold/15 text-[#9a7020]", savings: "text-[#9a7020]" },
        name: "text-stone-800",
        description: "text-stone-500",
        price: "text-[#9a7020]",
        note: "text-stone-400",
        feature: "text-stone-700",
        check: "text-gold",
        divider: "border-gold/20",
        includesLabel: "Includes everything in Standard, plus:",
        cta: "bg-gold! text-white! hover:bg-[#b07a22]!",
    },
};

interface IndividualPlanCardProps {
    plan: IndividualPlanDefinition;
    currency: string;
    affiliatePct: number;
    launchPct: number;
}

const IndividualPlanCard = ({ plan, currency, affiliatePct, launchPct }: IndividualPlanCardProps) => {
    const tier = TIER_STYLES[plan.tier];
    const { Icon } = tier;

    const base = currency === "NGN" ? plan.priceNgn : plan.priceUsd;
    const discount = computeDiscount(base, launchPct, affiliatePct);
    const headline = formatStackedPrice(plan.priceUsd, plan.priceNgn, currency, affiliatePct, launchPct);

    // In-list "plus:" lines (e.g. "Everything in Standard, plus:") are surfaced
    // by `includesLabel`; drop them so they never appear as a checked item.
    const features = plan.features.filter((f) => !f.trim().endsWith(":"));

    const discountReason =
        launchPct > 0 && affiliatePct > 0 ? "Launch + affiliate discount applied"
        : launchPct > 0 ? "Launch offer applied"
        : "Affiliate discount applied";

    // One-decimal precision so stacked rates read true (e.g. 50% + 5% = 52.5%).
    const pctLabel = (Math.round(discount.pctOff * 10) / 10).toString();

    return (
        <motion.div
            variants={staggerItem}
            className={cn("relative h-full p-8 flex flex-col overflow-hidden border border-slate-200")}
        >
            {tier.surface && <div className="absolute inset-0" style={{ background: tier.surface }} />}

            {tier.discount && discount.active && (
                <div
                    className={cn(
                        "absolute top-0 right-6 z-20 px-2.5 pt-3 pb-6 text-[11px] font-bold leading-none tracking-wide text-white shadow-md",
                        tier.discount.ribbon,
                    )}
                    style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 76%, 0 100%)" }}
                >
                    {pctLabel}% OFF
                </div>
            )}

            <div className="relative z-10 flex flex-1 flex-col">
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-5", tier.emblem)}>
                    <Icon className="w-5 h-5" />
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className={cn("text-lg font-semibold", tier.name)}>{plan.name}</h3>
                    {tier.badge && (
                        <span
                            className={cn(
                                "text-[11px] font-semibold px-2.5 py-0.5 rounded-full",
                                tier.badge.className,
                            )}
                        >
                            {tier.badge.label}
                        </span>
                    )}
                </div>

                <p className={cn("text-sm mb-6", tier.description)}>{plan.description}</p>

                <div className="flex items-end gap-2 mb-1">
                    <span className={cn("text-4xl font-serif leading-none", tier.price)}>{headline}</span>
                    {discount.active && (
                        <span className="text-base text-muted line-through mb-0.5">
                            {formatCurrencyAmount(discount.base, currency)}
                        </span>
                    )}
                </div>

                {tier.discount && discount.active && (
                    <div className="flex flex-col gap-1.5 mt-2 mb-1">
                        <span
                            className={cn(
                                "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
                                tier.discount.pill,
                            )}
                        >
                            <LucideTag className="w-3 h-3" />
                            {discountReason}
                        </span>
                        <span
                            className={cn(
                                "inline-flex items-center gap-1.5 text-sm font-semibold",
                                tier.discount.savings,
                            )}
                        >
                            <LucidePiggyBank className="w-4 h-4" />
                            You save {formatCurrencyAmount(discount.savings, currency)}
                        </span>
                    </div>
                )}

                <p className={cn("text-xs mb-6", tier.note)}>{plan.priceNote}</p>

                <div className={cn("border-t mb-5", tier.divider)} />

                <p className={cn("text-sm font-semibold mb-4", tier.name)}>{tier.includesLabel}</p>

                <ul className="space-y-3 mb-8">
                    {features.map((f) => (
                        <li key={f} className={cn("flex items-start gap-3 text-sm", tier.feature)}>
                            <LucideCheck className={cn("w-4 h-4 mt-0.5 shrink-0", tier.check)} />
                            <span>{f}</span>
                        </li>
                    ))}
                </ul>

                <Button
                    variant="secondary"
                    link={`/register?plan=${plan.code}`}
                    icon={<LucideArrowRight />}
                    className={cn("mt-auto w-full justify-center", tier.cta)}
                >
                    {plan.cta}
                </Button>
            </div>
        </motion.div>
    );
};

export default IndividualPlanCard;

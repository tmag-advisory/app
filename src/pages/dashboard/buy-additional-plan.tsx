import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import {
    LucideCheck,
    LucideTag,
    LucideLoader2,
    LucideUsers,
    LucideArrowRight,
} from "lucide-react";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import {
    useFamilyPackageActive,
    useFamilyPackageHistory,
} from "../../api/hooks";
import {
    familyPlans,
    formatFamilyPlanPrice,
} from "../../constants/companyPlans";
import { useLaunchDiscount } from "../../api";
import { applyLaunchToBase } from "../../lib/launchDiscount";
import LaunchDiscountBanner from "../../components/sections/LaunchDiscountBanner";
import { useCurrencyStore } from "../../stores/currencyStore";
import {
    getStoredAffiliateDiscountRate,
    refreshAffiliateDiscount,
} from "../../lib/affiliateTracking";
import { cn } from "../../lib/utils";
import { DASHBOARD_GLASS_SURFACE } from "../../components/dashboard/dashboardChrome";

const BuyAdditionalPlan = () => {
    const { user } = useAuth();
    const { selectedCurrency, setCurrency } = useCurrencyStore();
    const isFamily = user?.type?.toUpperCase() === "FAMILY";

    const { data: activeFamilyPackages, isLoading: loadingFamilyPackage } =
        useFamilyPackageActive();
    const { data: familyPurchaseHistory } = useFamilyPackageHistory();

    const [affiliateDiscountRate, setAffiliateDiscountRate] = useState(
        getStoredAffiliateDiscountRate,
    );
    const { data: launchDiscount } = useLaunchDiscount();
    const launchPct = launchDiscount?.active ? launchDiscount.percentage : 0;

    useEffect(() => {
        let cancelled = false;
        void refreshAffiliateDiscount()
            .then((discount) => {
                if (!cancelled && discount?.active) {
                    setAffiliateDiscountRate(Number(discount.discount_rate));
                }
            })
            .catch(() => undefined);
        return () => {
            cancelled = true;
        };
    }, []);

    if (!isFamily) {
        return <Navigate to="/unauthorized" replace />;
    }

    const hasActivePlans =
        activeFamilyPackages && activeFamilyPackages.length > 0;

    return (
        <div>
            <DashboardHeader title="Buy Additional Plans" />

            {/* ── About family plans ── */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm text-muted max-w-2xl leading-relaxed">
                        Purchase standalone family plans for upcoming trips.
                        Each plan includes up to 6 family members, with extra
                        members billed separately.
                    </p>
                </div>
                <div className="inline-flex items-center self-start sm:self-auto bg-button-secondary rounded-2xl p-1 gap-1">
                    {(["USD", "NGN"] as const).map((cur) => (
                        <button
                            key={cur}
                            onClick={() => setCurrency(cur)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                selectedCurrency === cur ?
                                    "bg-white shadow-sm text-heading"
                                :   "text-muted hover:text-heading"
                            }`}
                        >
                            {cur === "USD" ? "$ USD" : "₦ NGN"}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Current active family plans ── */}
            {loadingFamilyPackage ?
                <div
                    className={cn(
                        DASHBOARD_GLASS_SURFACE,
                        "p-6 mb-8 flex items-center gap-2 text-sm text-muted",
                    )}
                >
                    <LucideLoader2 className="w-4 h-4 animate-spin" />
                    Loading your family plans...
                </div>
            : hasActivePlans ?
                <div className={cn(DASHBOARD_GLASS_SURFACE, "p-6 mb-8")}>
                    <div className="flex items-center gap-2.5 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                            <LucideUsers className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-heading">
                                Your active family plans
                            </h2>
                            <p className="text-xs text-muted">
                                Manage trips and members for your current plans.
                            </p>
                        </div>
                    </div>

                    {/* Summary stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-background-primary rounded-xl p-4">
                            <p className="text-xs text-muted mb-1">
                                Active plans
                            </p>
                            <p className="text-2xl font-serif text-heading">
                                {activeFamilyPackages.length}
                            </p>
                        </div>
                        <div className="bg-background-primary rounded-xl p-4">
                            <p className="text-xs text-muted mb-1">
                                Trips remaining
                            </p>
                            <p className="text-2xl font-serif text-heading">
                                {activeFamilyPackages.reduce(
                                    (sum, p) =>
                                        sum + (p.tripsAllowed - p.tripsUsed),
                                    0,
                                )}
                            </p>
                        </div>
                        <div className="bg-background-primary rounded-xl p-4">
                            <p className="text-xs text-muted mb-1">
                                Total members
                            </p>
                            <p className="text-2xl font-serif text-heading">
                                {activeFamilyPackages.reduce(
                                    (sum, p) => sum + p.totalMembers,
                                    0,
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Individual plan cards */}
                    <div className="space-y-3">
                        {activeFamilyPackages.map((pkg) => (
                            <div
                                key={pkg.id}
                                className="bg-background-primary rounded-xl p-4 border border-border-light/50"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={cn(
                                                "text-xs font-semibold px-2.5 py-0.5 rounded-full border",
                                                pkg.status === "ACTIVE" ?
                                                    "text-emerald-700 bg-emerald-50 border-emerald-200"
                                                :   "text-muted bg-muted/10 border-border-light",
                                            )}
                                        >
                                            {pkg.status}
                                        </span>
                                        <span className="text-xs text-muted">
                                            {new Date(
                                                pkg.createdAt,
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <span className="text-xs font-semibold text-heading">
                                        {pkg.currency === "NGN" ? "₦" : "$"}
                                        {pkg.amountPaidMinor.toLocaleString()}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs text-muted">
                                            Trips used
                                        </p>
                                        <p className="text-base font-serif text-heading">
                                            {pkg.tripsUsed}
                                            <span className="text-xs text-muted font-sans font-normal">
                                                /{pkg.tripsAllowed}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted">
                                            Members
                                        </p>
                                        <p className="text-base font-serif text-heading">
                                            {pkg.totalMembers}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Link
                        to="/dashboard/settings?tab=billing"
                        className="mt-4 inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors"
                    >
                        View full details in Settings
                        <LucideArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            :   null}

            {/* ── Purchase history ── */}
            {familyPurchaseHistory && familyPurchaseHistory.length > 0 && (
                <div className={cn(DASHBOARD_GLASS_SURFACE, "p-6 mb-8")}>
                    <h2 className="text-base font-semibold text-heading mb-4">
                        Purchase history
                    </h2>
                    <div className="space-y-2">
                        {familyPurchaseHistory.map((pkg) => (
                            <div
                                key={pkg.id}
                                className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-background-primary"
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className={cn(
                                            "text-xs font-semibold px-2 py-0.5 rounded-full border",
                                            pkg.status === "ACTIVE" ?
                                                "text-emerald-700 bg-emerald-50 border-emerald-200"
                                            : pkg.status === "EXHAUSTED" ?
                                                "text-slate-500 bg-slate-100 border-slate-200"
                                            :   "text-muted bg-muted/10 border-border-light",
                                        )}
                                    >
                                        {pkg.status}
                                    </span>
                                    <span className="text-xs text-muted">
                                        {new Date(
                                            pkg.createdAt,
                                        ).toLocaleDateString()}{" "}
                                        — {pkg.tripsUsed}/{pkg.tripsAllowed}{" "}
                                        trips
                                    </span>
                                </div>
                                <span className="text-xs font-semibold text-heading">
                                    {pkg.currency === "NGN" ? "₦" : "$"}
                                    {pkg.amountPaidMinor.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Available plans for purchase ── */}

            <LaunchDiscountBanner variant="page" className="mb-4 max-w-md" />
            <section className="max-w-md">
                {familyPlans.map((plan) => {
                    const currencySymbol =
                        selectedCurrency === "NGN" ? "₦" : "$";
                    const originalBasePrice =
                        selectedCurrency === "NGN" ?
                            plan.priceNgn
                        :   plan.priceUsd;
                    const basePrice =
                        launchPct > 0
                            ? applyLaunchToBase(originalBasePrice, launchPct)
                            : originalBasePrice;
                    const discountAmt =
                        affiliateDiscountRate > 0 ?
                            Math.round(
                                (basePrice * affiliateDiscountRate) / 100,
                            )
                        :   0;
                    const discountedPrice = basePrice - discountAmt;

                    return (
                        <div
                            key={plan.id}
                            className="relative py-8 p-6 aspect-2/3 flex flex-col justify-between overflow-hidden min-h-150 border border-accent/25"
                        >
                            <div
                                className="absolute inset-0"
                                style={{
                                    background:
                                        "linear-gradient(145deg, #eaf7f4 0%, #dff2ee 45%, #e6f5f1 100%)",
                                }}
                            />
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-accent" />
                            <span className="absolute top-6 right-6 text-xs font-semibold text-white bg-accent px-3 py-1 rounded-full">
                                Best value
                            </span>
                            <div className="relative z-10">
                                <h3 className="text-lg font-semibold mb-1 text-[#1a3c38]">
                                    {plan.name}
                                </h3>
                                <p className="text-sm mb-6 text-[#2a5858]/80">
                                    {plan.description}
                                </p>
                                <div className="flex items-baseline gap-1.5 mb-1">
                                    <span className="text-4xl font-serif text-[#1a5c52]">
                                        {launchPct > 0 || affiliateDiscountRate > 0
                                            ? `${currencySymbol}${discountedPrice.toLocaleString()}`
                                            : formatFamilyPlanPrice(plan, selectedCurrency)}
                                    </span>
                                </div>

                                {(launchPct > 0 || affiliateDiscountRate > 0) && (
                                    <div className="mt-1 mb-2">
                                        <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 rounded-lg px-2.5 py-1.5 w-fit">
                                            <LucideTag className="w-3 h-3" />
                                            <span className="font-medium">
                                                {[
                                                    launchPct > 0 ? `${launchPct}% launch` : null,
                                                    affiliateDiscountRate > 0 ? `${affiliateDiscountRate}% affiliate` : null,
                                                ].filter(Boolean).join(" + ")} off
                                            </span>
                                        </div>
                                        <p className="text-sm text-green-700 mt-1">
                                            <span className="line-through text-muted text-xs">
                                                {currencySymbol}
                                                {originalBasePrice.toLocaleString()}
                                            </span>{" "}
                                            <span className="font-semibold">
                                                {currencySymbol}
                                                {discountedPrice.toLocaleString()}
                                            </span>
                                        </p>
                                    </div>
                                )}
                                <p className="text-xs mb-8 text-[#2a5858]/60">
                                    {plan.priceNote}
                                </p>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature) => (
                                        <li
                                            key={feature}
                                            className="flex items-start gap-3 text-sm text-[#1a3c38]"
                                        >
                                            <LucideCheck className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <Button
                                variant="primary"
                                link={`/family-checkout?plan=FAMILY_${plan.id}`}
                                className="relative z-10 self-stretch bg-accent text-white! hover:bg-[#246858] text-center justify-center flex"
                            >
                                {hasActivePlans ? "Add another plan" : plan.cta}
                            </Button>
                        </div>
                    );
                })}
            </section>
        </div>
    );
};

export default BuyAdditionalPlan;

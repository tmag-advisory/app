import { LucideCheck, LucideX, LucideLoader2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "../../lib/utils";
import { useUpgradeUserPlan, useLaunchDiscount } from "../../api";
import { applyLaunchToBase } from "../../lib/launchDiscount";
import LaunchDiscountBanner from "../sections/LaunchDiscountBanner";
import { individualPlans, individualPlanFeatures } from "../../constants/companyPlans";
import type { BillingCurrency } from "../../api/types";

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess: (planCode: string) => void;
  currentPlan?: string;
  currency: BillingCurrency;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  NGN: "₦",
};

export default function PlanUpgradeModal({
  isOpen,
  onClose,
  onUpgradeSuccess,
  currentPlan,
  currency,
}: PlanUpgradeModalProps) {
  const upgradePlan = useUpgradeUserPlan();
  const { data: launchDiscount } = useLaunchDiscount();
  const launchPct = launchDiscount?.active ? launchDiscount.percentage : 0;


  if (!isOpen) return null;

  const plans = individualPlans.filter((p) => p.code !== "ESSENTIAL");

  const handleUpgrade = async (planCode: string) => {
    try {
      await upgradePlan.mutateAsync(planCode);
      toast.success("Plan upgraded successfully!");
      onClose();
      onUpgradeSuccess(planCode);
    } catch {
      toast.error("Failed to upgrade plan. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-heading hover:bg-background-primary transition-colors duration-200 cursor-pointer"
        >
          <LucideX className="w-4 h-4" />
        </button>

        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-serif text-heading mb-2">
            Upgrade your plan
          </h2>
          <p className="text-sm text-muted">
            Choose a plan to unlock personalized travel health reports and exclusive features.
          </p>
        </div>

        <LaunchDiscountBanner variant="page" className="mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.code;
            const originalPrice =
              currency === "USD"
                ? plan.priceUsd
                : (plan.priceNgn ?? plan.priceUsd);
            const price =
              launchPct > 0 ? applyLaunchToBase(originalPrice, launchPct) : originalPrice;
            const symbol = CURRENCY_SYMBOLS[currency] || currency;
            const tierKey = (plan.tier as "standard" | "premium") || "standard";
            const features = individualPlanFeatures[tierKey] || [];

            return (
              <div
                key={plan.code}
                className={cn(
                  "relative p-6 rounded-xl border-2 transition-all duration-200",
                  isCurrentPlan
                    ? "border-accent bg-accent/5"
                    : plan.highlighted
                      ? "border-accent/40 bg-accent/5"
                      : "border-border-light hover:border-accent/30"
                )}
              >
                {plan.highlighted && (
                  <span className="absolute top-3 right-3 px-3 py-1 bg-accent text-white text-xs font-semibold rounded-full">
                    Most popular
                  </span>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-heading mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted mb-4">{plan.description}</p>

                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-3xl font-serif text-heading">
                      {symbol}
                      {price.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted">/credit</span>
                  </div>
                  {launchPct > 0 && price !== originalPrice && (
                    <p className="text-xs text-emerald-700 mb-1">
                      <span className="line-through text-muted mr-1">
                        {symbol}{originalPrice.toLocaleString()}
                      </span>
                      {launchPct}% launch off
                    </p>
                  )}
                </div>

                <div className="mb-6 pt-6 border-t border-border-light/50">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-4">
                    Features
                  </p>
                  <ul className="space-y-3">
                    {features.map((feature: string, idx: number) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-sm text-heading"
                      >
                        <LucideCheck
                          className={cn(
                            "w-4 h-4 mt-0.5 shrink-0",
                            plan.tier === "premium"
                              ? "text-amber-600"
                              : "text-emerald-600"
                          )}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleUpgrade(plan.code)}
                  disabled={upgradePlan.isPending || isCurrentPlan}
                  className={cn(
                    "w-full py-3 rounded-xl font-semibold text-sm transition-colors duration-200 flex items-center justify-center gap-2",
                    isCurrentPlan
                      ? "bg-background-primary text-muted cursor-default opacity-50"
                      : plan.highlighted
                        ? "bg-accent text-white hover:bg-accent/90"
                        : "bg-button-secondary text-heading hover:bg-button-secondary/80",
                    upgradePlan.isPending && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {upgradePlan.isPending ? (
                    <>
                      <LucideLoader2 className="w-4 h-4 animate-spin" />
                      Upgrading...
                    </>
                  ) : isCurrentPlan ? (
                    "Current plan"
                  ) : (
                    "Upgrade"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

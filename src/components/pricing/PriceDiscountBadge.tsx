import { LucideTag } from "lucide-react";
import { applyLaunchToBase } from "../../lib/launchDiscount";

interface PriceDiscountBadgeProps {
  priceUsd: number;
  priceNgn: number;
  currency: string;
  affiliatePct: number;
  launchPct: number;
  unit?: string;
}

/**
 * Strike-through badge displayed beside a plan's headline price.
 *
 * Applies the platform-launch discount first (multiplicatively) then the
 * affiliate referral discount. Returns `null` when neither discount applies
 * (callers can render it unconditionally).
 */
const PriceDiscountBadge = ({
  priceUsd,
  priceNgn,
  currency,
  affiliatePct,
  launchPct,
  unit,
}: PriceDiscountBadgeProps) => {
  if (affiliatePct <= 0 && launchPct <= 0) return null;
  const base = currency === "NGN" ? priceNgn : priceUsd;
  if (base === 0) return null;
  const symbol = currency === "NGN" ? "₦" : "$";

  const afterLaunch = launchPct > 0 ? applyLaunchToBase(base, launchPct) : base;
  const finalPrice = affiliatePct > 0
    ? Math.round(afterLaunch * (1 - affiliatePct / 100))
    : afterLaunch;

  const parts: string[] = [];
  if (launchPct > 0) parts.push(`${launchPct}% launch`);
  if (affiliatePct > 0) parts.push(`${affiliatePct}% affiliate`);

  return (
    <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 rounded-lg px-2.5 py-1 w-fit mb-1">
      <LucideTag className="w-3 h-3" />
      <span className="font-medium">
        {parts.join(" + ")} off{unit ? ` ${unit}` : ""} —{" "}
        <span className="line-through text-muted">
          {symbol}
          {base.toLocaleString()}
        </span>{" "}
        → {symbol}
        {finalPrice.toLocaleString()}
      </span>
    </div>
  );
};
export default PriceDiscountBadge;

/**
 * Helpers for the platform-wide launch discount.
 *
 * The backend already applies the launch rate at every price source, so any
 * `priceUsd` / `priceNgn` value rendered in the UI is already discounted.
 * These helpers reconstruct the *original* price so we can render a
 * strike-through alongside it, and combine the launch and affiliate rates
 * for the rare cases that need a single composite percentage.
 *
 * All inputs are integer/float currency units; we round HALF_UP at the end
 * to match the server's BigDecimal `scale(2)` rounding.
 */

/**
 * Returns the original (pre-discount) price given a discounted value and a
 * launch percentage 0..100. Returns the input unchanged when `launchPct <= 0`.
 */
export const revertLaunchToOriginal = (
  discounted: number,
  launchPct: number,
): number => {
  if (!Number.isFinite(discounted) || launchPct <= 0 || launchPct >= 100) {
    return discounted;
  }
  return Math.round((discounted * 100) / (100 - launchPct));
};

/** Apply the launch percentage to an *original* base value. */
export const applyLaunchToBase = (base: number, launchPct: number): number => {
  if (!Number.isFinite(base) || launchPct <= 0) return base;
  if (launchPct >= 100) return 0;
  return Math.round(base * (1 - launchPct / 100));
};

/**
 * Combine launch + affiliate percentages (both 0..100) into a single
 * composite percentage 0..100 using multiplicative stacking.
 */
export const effectiveDiscountRate = (
  launchPct: number,
  affiliatePct: number,
): number => {
  const a = Math.max(0, Math.min(100, launchPct)) / 100;
  const b = Math.max(0, Math.min(100, affiliatePct)) / 100;
  return Math.round((1 - (1 - a) * (1 - b)) * 100);
};

/**
 * Format the final stacked price for the given base values. Launch first,
 * affiliate second. Returns `"Free"` when base is zero.
 */
export function formatStackedPrice(
  priceUsd: number,
  priceNgn: number,
  currency: string,
  affiliatePct = 0,
  launchPct = 0,
): string {
  const base = currency === "NGN" ? priceNgn : priceUsd;
  if (base === 0) return "Free";
  const afterLaunch = launchPct > 0 ? base * (1 - launchPct / 100) : base;
  const afterAffiliate = affiliatePct > 0 ? afterLaunch * (1 - affiliatePct / 100) : afterLaunch;
  if (currency === "NGN") return `₦${Math.round(afterAffiliate).toLocaleString()}`;
  return `$${afterAffiliate.toLocaleString(undefined, {
    maximumFractionDigits: afterAffiliate % 1 === 0 ? 0 : 2,
    minimumFractionDigits: afterAffiliate % 1 === 0 ? 0 : 2,
  })}`;
}

/** Breakdown of a stacked launch + affiliate discount for one base price. */
export interface DiscountBreakdown {
  /** Original, pre-discount price in the selected currency. */
  base: number;
  /** Final price after launch then affiliate discounts (unrounded). */
  final: number;
  /** Amount saved versus {@link base}. */
  savings: number;
  /** Effective percentage off, 0..100 (may be fractional, e.g. 52.5). */
  pctOff: number;
  /** True when {@link savings} is greater than zero. */
  active: boolean;
}

/**
 * Compute the stacked-discount breakdown for a single base price. Uses the
 * same multiplicative, unrounded math as {@link formatStackedPrice} so the
 * headline price, strike-through original, and "you save" figure always
 * reconcile (e.g. $50 → $23.75 with $26.25 saved at 52.5% off).
 */
export function computeDiscount(
  base: number,
  launchPct = 0,
  affiliatePct = 0,
): DiscountBreakdown {
  const inactive: DiscountBreakdown = { base, final: base, savings: 0, pctOff: 0, active: false };
  if (!Number.isFinite(base) || base <= 0) return inactive;
  if (launchPct <= 0 && affiliatePct <= 0) return inactive;

  const afterLaunch = launchPct > 0 ? base * (1 - launchPct / 100) : base;
  const final = affiliatePct > 0 ? afterLaunch * (1 - affiliatePct / 100) : afterLaunch;
  const savings = Math.max(0, base - final);
  const pctOff = (savings / base) * 100;
  return { base, final, savings, pctOff, active: savings > 0 };
}

/**
 * Format a raw currency amount using the same locale rules as
 * {@link formatStackedPrice}: NGN is whole-number, USD shows cents only when
 * the value is fractional.
 */
export function formatCurrencyAmount(amount: number, currency: string): string {
  if (currency === "NGN") return `₦${Math.round(amount).toLocaleString()}`;
  const fractional = Math.abs(amount % 1) > 0;
  return `$${amount.toLocaleString(undefined, {
    maximumFractionDigits: fractional ? 2 : 0,
    minimumFractionDigits: fractional ? 2 : 0,
  })}`;
}

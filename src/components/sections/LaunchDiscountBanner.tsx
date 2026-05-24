import { LucidePartyPopper, LucideTag } from "lucide-react";
import clsx from "clsx";
import { useLaunchDiscount } from "../../api";

interface LaunchDiscountBannerProps {
    /** Visual variant. `"page"` is a full-width gradient strip; `"inline"` is a compact pill suited for order summaries. */
    variant?: "page" | "inline";
    className?: string;
}

const LaunchDiscountBanner = ({ variant = "page", className }: LaunchDiscountBannerProps) => {
    const { data } = useLaunchDiscount();
    if (!data || !data.active) return null;

    const headline = data.label && data.label.trim().length > 0
        ? data.label
        : `Launch promo — ${data.percentage}% off`;

    if (variant === "inline") {
        return (
            <div
                role="status"
                className={clsx(
                    "flex items-center gap-2 rounded-full  bg-emerald-50/80 px-3 py-1.5 text-sm font-medium text-emerald-800",
                    className,
                )}
            >
                <LucideTag className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="leading-none">
                    {headline} <span className="font-semibold">({data.percentage}% off)</span>
                </span>
            </div>
        );
    }

    return (
        <div
            role="status"
            aria-label={`${headline}. ${data.percentage}% off applied automatically.`}
            className={clsx(
                "relative isolate overflow-hidden rounded-2xl  bg-linear-to-r from-emerald-500 via-emerald-600 to-amber-500 px-5 py-4 text-white sm:px-7",
                className,
            )}
        >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <LucidePartyPopper className="h-6 w-6 shrink-0" aria-hidden="true" />
                    <p className="text-sm sm:text-base font-semibold tracking-wide">
                        {headline}
                    </p>
                </div>
                <p className="text-sm sm:text-base font-medium text-emerald-50">
                    <span className="rounded-full bg-white/15 px-2.5 py-1 text-white">
                        {data.percentage}% off
                    </span>{" "}
                    applied automatically at checkout
                </p>
            </div>
        </div>
    );
};

export default LaunchDiscountBanner;

import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useInitiateFamilyPackageCheckout } from "../api/hooks";
import FooterSection from "../components/sections/FooterSection";
import Navbar from "../components/sections/Navbar";
import { useAuth } from "../context/AuthContext";
import { useCurrencyStore } from "../stores/currencyStore";
import { familyPlans, formatFamilyPlanPrice, normalizePlanCurrency, calculateFamilyTotalPrice, formatFamilyTotalPrice } from "../constants/companyPlans";
import PromoCodeInput from "../components/promo/PromoCodeInput";
import type { BillingCurrency, FamilyPackageType, FamilyPackageCheckoutResponse } from "../api/types";
import { LucideLoader2, LucideLock, LucideShieldCheck, LucideAlertCircle, LucideUsers, LucideCheck, LucideHeart, LucideHome, LucideGlobe, LucideShield, LucideArrowRight, LucidePlus, LucideMinus, LucideUserPlus, LucideTag } from "lucide-react";
import { cn } from "../lib/utils";
import toast from "react-hot-toast";
import { getAffiliateReferralCode, getStoredAffiliateDiscountRate, refreshAffiliateDiscount } from "../lib/affiliateTracking";
import { useLaunchDiscount } from "../api";
import LaunchDiscountBanner from "../components/sections/LaunchDiscountBanner";
import { applyLaunchToBase } from "../lib/launchDiscount";

const BASE_INCLUDED_MEMBERS = 6;
const MAX_ADDITIONAL_MEMBERS = 10;

const fieldClassName =
    "w-full rounded-xl border border-slate-300 bg-white/50 px-4 py-3 text-sm text-heading placeholder:text-muted/50 outline-none transition-colors focus:ring-4 focus:ring-accent/15";

export default function FamilyCheckoutPage() {
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const { selectedCurrency } = useCurrencyStore();

    const planId = searchParams.get("plan")?.replace("FAMILY_", "") as FamilyPackageType | null;
    const plan = planId ? familyPlans.find((p: { id: string }) => p.id === planId) : null;

    // Referral code: prefer URL param (forwarded from pricing page) then fall back to cookie.
    const urlRef = searchParams.get("ref") ?? undefined;
    const resolvedReferralCode = urlRef ?? getAffiliateReferralCode() ?? undefined;

    const { mutate: initiateCheckout, isPending } = useInitiateFamilyPackageCheckout();

    const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
    const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [additionalMembers, setAdditionalMembers] = useState(0);
    const [affiliateDiscountRate, setAffiliateDiscountRate] = useState(getStoredAffiliateDiscountRate);
    const { data: launchDiscount } = useLaunchDiscount();
    const launchPct = launchDiscount?.active ? launchDiscount.percentage : 0;

    useEffect(() => {
        if (user) {
            setForm({ firstName: user.first_name ?? "", lastName: user.last_name ?? "", email: user.email ?? "", phone: user.phone ?? "" });
        }
    }, [user]);

    useEffect(() => {
        let cancelled = false;
        // Use the resolved referral code (URL param preferred) for the discount refresh.
        const codeForRefresh = resolvedReferralCode;
        void refreshAffiliateDiscount(codeForRefresh)
            .then((discount) => {
                if (!cancelled && discount?.active) {
                    setAffiliateDiscountRate(Number(discount.discount_rate));
                } else if (!cancelled) {
                    // If the referral is no longer active, clear the displayed rate
                    // so the checkout total matches what Flutterwave will actually charge.
                    setAffiliateDiscountRate(0);
                }
            })
            .catch(() => undefined);
        return () => {
            cancelled = true;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!user) {
            if (!form.firstName.trim()) errs.firstName = "First name is required";
            if (!form.lastName.trim()) errs.lastName = "Last name is required";
            if (!form.email.trim()) errs.email = "Email is required";
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email";
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!plan) return;
        if (!validate()) return;

        // Always forward the resolved referral code (URL param preferred over cookie)
        // so the backend can apply the discount even when cookies are out of sync.
        const referralCode = resolvedReferralCode;

        initiateCheckout(
            {
                packageType: plan.id,
                currency: normalizePlanCurrency(selectedCurrency),
                additionalMembers,
                affiliate_referral_code: referralCode,
                ...(user ? {} : { name: `${form.firstName.trim()} ${form.lastName.trim()}`, email: form.email.trim(), phone: form.phone.trim() }),
            },
            {
                onSuccess: (data: FamilyPackageCheckoutResponse) => {
                    if (data.paymentLink) {
                        window.location.href = data.paymentLink;
                    } else {
                        toast.error("Could not initiate payment. Please try again.");
                    }
                },
                onError: (err: unknown) => {
                    const msg = (err as { message?: string })?.message ?? "Checkout failed. Please try again.";
                    toast.error(msg);
                },
            }
        );
    };

    if (!plan) {
        return (
            <div className="min-h-screen bg-background-primary">
                <Navbar />
                <div className="min-h-[60vh] flex items-center justify-center px-6">
                    <div className="text-center">
                        <LucideAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                        <h2 className="font-serif text-2xl text-heading mb-2">Plan not found</h2>
                        <p className="text-muted mb-6">The selected family plan is not available.</p>
                        <Link to="/pricing" className="text-accent underline hover:text-accent/80">
                            Back to pricing
                        </Link>
                    </div>
                </div>
                <FooterSection />
            </div>
        );
    }

    const checkoutCurrency: BillingCurrency = normalizePlanCurrency(selectedCurrency);
    const priceDisplay = formatFamilyPlanPrice(plan, checkoutCurrency);
    const pricing = calculateFamilyTotalPrice(plan, checkoutCurrency, additionalMembers);
    const totalPriceDisplay = formatFamilyTotalPrice(plan, checkoutCurrency, additionalMembers);
    const totalMembers = BASE_INCLUDED_MEMBERS + additionalMembers;

    const memberBasePrice = checkoutCurrency === "NGN" ? plan.additionalMemberPriceNgn : plan.additionalMemberPriceUsd;
    const currencySymbol = checkoutCurrency === "NGN" ? "₦" : "$";

    // Apply platform-wide launch discount first, then any affiliate discount.
    const hasAffiliateDiscount = affiliateDiscountRate > 0;
    const originalBaseAmount = pricing.total;
    const baseAmount = launchPct > 0
        ? applyLaunchToBase(originalBaseAmount, launchPct)
        : originalBaseAmount;
    const launchDiscountAmount = originalBaseAmount - baseAmount;
    const discountAmount = hasAffiliateDiscount
        ? Math.round((baseAmount * affiliateDiscountRate) / 100)
        : 0;
    const finalTotal = baseAmount - discountAmount;
    const finalTotalDisplay = `${currencySymbol}${finalTotal.toLocaleString()}`;

    const familyPerks = [
        { icon: LucideHeart, text: "Personalised health reports for each member" },
        { icon: LucideHome, text: "Central family dashboard to manage everyone" },
        { icon: LucideGlobe, text: "Covers one trip for the whole family" },
        { icon: LucideShield, text: "Physician-reviewed, WHO & CDC validated" },
    ];

    return (
        <div className="min-h-screen bg-background-primary">
            <Navbar />

            <main className="max-w-6xl mx-auto px-6 pt-8 pb-20">
                <Link
                    to="/pricing?tab=family"
                    className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors mb-8 group"
                >
                    <LucideArrowRight className="w-3.5 h-3.5 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
                    Back to family plans
                </Link>

                <div className="grid lg:grid-cols-5 gap-10">
                    {/* ─── Left: Purchaser form ─── */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center shadow-sm">
                                <LucideUsers className="w-7 h-7 text-accent" />
                            </div>
                            <div>
                                <h1 className="font-serif text-3xl md:text-4xl text-heading leading-tight">
                                    Build your Family Plan
                                </h1>
                                <p className="text-muted text-sm mt-1.5">
                                    One plan covers up to{" "}
                                    {BASE_INCLUDED_MEMBERS} family members on a
                                    single trip. Add more if you need.
                                </p>
                            </div>
                        </div>

                        {/* Perks row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
                            {familyPerks.map(({ icon: Icon, text }) => (
                                <div
                                    key={text}
                                    className="bg-white rounded-xl border border-slate-200 p-3.5 text-center"
                                >
                                    <Icon className="w-5 h-5 text-accent mx-auto mb-1.5" />
                                    <p className="text-xs text-body leading-snug">
                                        {text}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* ─── Family Size Selector ─── */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
                            <div className="flex items-center gap-2.5 mb-5">
                                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                                    <LucideUserPlus className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-heading text-sm">
                                        How many family members?
                                    </h3>
                                    <p className="text-xs text-muted">
                                        {BASE_INCLUDED_MEMBERS} members included
                                        in the base plan.
                                        {memberBasePrice > 0 &&
                                            ` Additional members cost ${currencySymbol}${memberBasePrice.toLocaleString()} each.`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setAdditionalMembers(
                                            Math.max(0, additionalMembers - 1),
                                        )
                                    }
                                    disabled={additionalMembers === 0}
                                    className={cn(
                                        "w-10 h-10 rounded-xl border flex items-center justify-center transition-all",
                                        additionalMembers === 0 ?
                                            "border-border-light text-muted/40 cursor-not-allowed"
                                        :   "border-accent/30 text-accent hover:bg-accent/10 cursor-pointer",
                                    )}
                                >
                                    <LucideMinus className="w-4 h-4" />
                                </button>

                                <div className="flex-1 text-center">
                                    <p className="text-3xl font-bold text-heading">
                                        {totalMembers}
                                    </p>
                                    <p className="text-xs text-muted mt-0.5">
                                        {additionalMembers === 0 ?
                                            `${BASE_INCLUDED_MEMBERS} included — no extra charge`
                                        :   `${BASE_INCLUDED_MEMBERS} base + ${additionalMembers} additional`
                                        }
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setAdditionalMembers(
                                            Math.min(
                                                MAX_ADDITIONAL_MEMBERS,
                                                additionalMembers + 1,
                                            ),
                                        )
                                    }
                                    disabled={
                                        additionalMembers >=
                                        MAX_ADDITIONAL_MEMBERS
                                    }
                                    className={cn(
                                        "w-10 h-10 rounded-xl border flex items-center justify-center transition-all",
                                        (
                                            additionalMembers >=
                                                MAX_ADDITIONAL_MEMBERS
                                        ) ?
                                            "border-border-light text-muted/40 cursor-not-allowed"
                                        :   "border-accent/30 text-accent hover:bg-accent/10 cursor-pointer",
                                    )}
                                >
                                    <LucidePlus className="w-4 h-4" />
                                </button>
                            </div>

                            {additionalMembers > 0 && (
                                <div className="mt-4 bg-amber-50 border border-amber-200/60 rounded-xl px-4 py-3">
                                    <p className="text-xs text-amber-800 flex items-center gap-2">
                                        <span className="font-medium">
                                            Additional charge:
                                        </span>
                                        {additionalMembers} × {currencySymbol}
                                        {memberBasePrice.toLocaleString()} ={" "}
                                        <span className="font-semibold">
                                            {currencySymbol}
                                            {pricing.extra.toLocaleString()}
                                        </span>
                                    </p>
                                </div>
                            )}

                        </div>

                        {/* ─── Form ─── */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {user ?
                                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold text-sm">
                                            {(
                                                user.first_name?.[0] ?? ""
                                            ).toUpperCase()}
                                            {(
                                                user.last_name?.[0] ?? ""
                                            ).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-heading">
                                                {user.first_name}{" "}
                                                {user.last_name}
                                            </p>
                                            <p className="text-xs text-muted">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-accent/5 rounded-xl px-4 py-3">
                                        <p className="text-xs text-body flex items-center gap-2">
                                            <LucideCheck className="w-3.5 h-3.5 text-accent shrink-0" />
                                            Purchase linked to your account.
                                            Manage family members from your
                                            dashboard after activation.
                                        </p>
                                    </div>
                                </div>
                            :   <>
                                    <div className="bg-white border border-amber-200/60 rounded-2xl p-4 shadow-sm">
                                        <p className="text-xs text-amber-800">
                                            Already have an account?{" "}
                                            <Link
                                                to={`/login?redirect=${encodeURIComponent(`/family-checkout?plan=FAMILY_${plan.id}`)}`}
                                                className="text-accent font-medium hover:underline"
                                            >
                                                Sign in
                                            </Link>{" "}
                                            to link this family plan to your
                                            existing profile.
                                        </p>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
                                        <h3 className="font-semibold text-heading text-sm">
                                            Main Applicant Details
                                        </h3>

                                        <div>
                                            <label className="block text-xs font-semibold text-heading uppercase tracking-wider mb-1.5">
                                                First Name{" "}
                                                <span className="text-red-400">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={form.firstName}
                                                onChange={(e) =>
                                                    setForm((f) => ({
                                                        ...f,
                                                        firstName: e.target.value,
                                                    }))
                                                }
                                                placeholder="Your first name"
                                                className={cn(
                                                    fieldClassName,
                                                    errors.firstName ?
                                                        "border-red-300 ring-red-200"
                                                    :   "",
                                                )}
                                            />
                                            {errors.firstName && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    {errors.firstName}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-heading uppercase tracking-wider mb-1.5">
                                                Last Name{" "}
                                                <span className="text-red-400">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={form.lastName}
                                                onChange={(e) =>
                                                    setForm((f) => ({
                                                        ...f,
                                                        lastName: e.target.value,
                                                    }))
                                                }
                                                placeholder="Your last name"
                                                className={cn(
                                                    fieldClassName,
                                                    errors.lastName ?
                                                        "border-red-300 ring-red-200"
                                                    :   "",
                                                )}
                                            />
                                            {errors.lastName && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    {errors.lastName}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-heading uppercase tracking-wider mb-1.5">
                                                Email Address{" "}
                                                <span className="text-red-400">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="email"
                                                value={form.email}
                                                onChange={(e) =>
                                                    setForm((f) => ({
                                                        ...f,
                                                        email: e.target.value,
                                                    }))
                                                }
                                                placeholder="your@email.com"
                                                className={cn(
                                                    fieldClassName,
                                                    errors.email ?
                                                        "border-red-300 ring-red-200"
                                                    :   "",
                                                )}
                                            />
                                            {errors.email && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    {errors.email}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted mt-1.5 flex items-center gap-1">
                                                <LucideCheck className="w-3 h-3 text-accent" />
                                                Family login codes will be sent
                                                to this email.
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-heading uppercase tracking-wider mb-1.5">
                                                Phone{" "}
                                                <span className="text-muted font-normal normal-case">
                                                    (optional)
                                                </span>
                                            </label>
                                            <input
                                                type="tel"
                                                value={form.phone}
                                                onChange={(e) =>
                                                    setForm((f) => ({
                                                        ...f,
                                                        phone: e.target.value,
                                                    }))
                                                }
                                                placeholder="+1 234 567 8900"
                                                className={fieldClassName}
                                            />
                                        </div>
                                    </div>
                                </>
                            }


                            {/* ─── Declaration & Disclaimer ─── */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                <p className="text-xs font-bold tracking-wider text-muted uppercase mb-3">
                                    Declaration &amp; Disclaimer
                                </p>
                                <p className="text-xs text-body leading-relaxed mb-4">
                                    Travel medicine advice is educational and informational only. It does
                                    not replace consultation with a licensed physician or healthcare
                                    provider. Individual circumstances vary; always seek professional
                                    medical advice before travel, especially if you have pre-existing
                                    health conditions. TMAG is not liable for outcomes arising from
                                    decisions made solely on the basis of this advisory.
                                </p>
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={disclaimerAccepted}
                                        onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-accent cursor-pointer"
                                    />
                                    <span className="text-xs text-body leading-relaxed group-hover:text-heading transition-colors">
                                        I understand that the family travel health advisory is for
                                        informational purposes only and does not constitute medical
                                        advice. I confirm that all information provided is accurate to
                                        the best of my knowledge.
                                    </span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isPending || !disclaimerAccepted}
                                className={cn(
                                    "w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-semibold text-sm transition-colors duration-200",
                                    (isPending || !disclaimerAccepted) ?
                                        "bg-dark/40 text-white/50 cursor-not-allowed"
                                    :   "bg-dark text-background-primary hover:bg-darkest cursor-pointer",
                                )}
                            >
                                {isPending ?
                                    <>
                                        <LucideLoader2 className="w-4 h-4 animate-spin" />
                                        Redirecting to payment...
                                    </>
                                :   <>
                                        <LucideLock className="w-4 h-4" />
                                        Pay{" "}
                                        {launchPct > 0 || hasAffiliateDiscount ?
                                            finalTotalDisplay
                                        :   totalPriceDisplay}{" "}
                                        &amp; Activate Family Plan
                                    </>
                                }
                            </button>

                            <div className="flex items-center justify-center gap-2 text-xs text-muted">
                                <LucideShieldCheck className="w-3.5 h-3.5 text-accent" />
                                <span>Secured by Flutterwave</span>
                                <span className="text-muted/30">·</span>
                                <span>Instant activation</span>
                            </div>
                        </form>
                    </div>

                    {/* ─── Right: Plan summary ─── */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-8">
                            <div className="flex items-center gap-2.5 mb-5">
                                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                                    <LucideUsers className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <p className="font-semibold text-heading">
                                        {plan.name}
                                    </p>
                                    <p className="text-xs text-muted">
                                        {plan.description}
                                    </p>
                                </div>
                            </div>

                            {/* Price breakdown */}
                            <div className="bg-accent/5 rounded-xl border border-accent/10 p-5 mb-6">
                                <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-3 text-center">
                                    Total
                                </p>
                                <p className="text-4xl font-serif text-heading text-center">
                                    {launchPct > 0 || hasAffiliateDiscount
                                        ? finalTotalDisplay
                                        : totalPriceDisplay}
                                </p>

                                {launchPct > 0 && (
                                    <p className="mt-1 text-center text-sm text-muted">
                                        <span className="line-through">
                                            {currencySymbol}
                                            {originalBaseAmount.toLocaleString()}
                                        </span>
                                        <span className="ml-2 font-medium text-emerald-700">
                                            {launchPct}% launch off
                                        </span>
                                    </p>
                                )}

                                <div className="mt-3 flex justify-center">
                                    <LaunchDiscountBanner variant="inline" />
                                </div>

                                <div className="mt-4">
                                    <PromoCodeInput audience="family" />
                                </div>

                                {hasAffiliateDiscount && (
                                    <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-green-700 bg-green-50 rounded-lg px-2.5 py-1.5">
                                        <LucideTag className="w-3.5 h-3.5" />
                                        <span className="font-medium">
                                            {affiliateDiscountRate}% affiliate
                                            discount applied
                                        </span>
                                    </div>
                                )}

                                <div className="mt-4 space-y-2 border-t border-border-light pt-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted">
                                            Base plan ({BASE_INCLUDED_MEMBERS}{" "}
                                            members)
                                        </span>
                                        <span className="font-medium text-heading">
                                            {priceDisplay}
                                        </span>
                                    </div>
                                    {additionalMembers > 0 && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted">
                                                {additionalMembers} additional
                                                member
                                                {additionalMembers > 1 ?
                                                    "s"
                                                :   ""}
                                            </span>
                                            <span className="font-medium text-heading">
                                                {currencySymbol}
                                                {pricing.extra.toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                    {launchPct > 0 && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-emerald-700">
                                                Launch discount ({launchPct}%)
                                            </span>
                                            <span className="font-medium text-emerald-700">
                                                -{currencySymbol}
                                                {launchDiscountAmount.toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                    {hasAffiliateDiscount && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-green-700">
                                                Affiliate discount (
                                                {affiliateDiscountRate}%)
                                            </span>
                                            <span className="font-medium text-green-700">
                                                -{currencySymbol}
                                                {discountAmount.toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between text-sm border-t border-border-light pt-2">
                                        <span className="font-semibold text-heading">
                                            Total family members
                                        </span>
                                        <span className="font-bold text-heading">
                                            {totalMembers}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="space-y-3 mb-6">
                                <p className="text-xs font-bold tracking-wider text-muted uppercase">
                                    What's included
                                </p>
                                {plan.features.map((f, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-2.5 text-sm text-body"
                                    >
                                        <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <LucideCheck className="w-3 h-3 text-accent" />
                                        </div>
                                        {f}
                                    </div>
                                ))}
                            </div>

                            {/* Coverage details */}
                            <div className="border-t border-border-light pt-5 space-y-3">
                                <p className="text-xs font-bold tracking-wider text-muted uppercase">
                                    Coverage details
                                </p>
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted">
                                            Individual login codes
                                        </span>
                                        <span className="font-medium text-heading text-right">
                                            Yes, included
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Trust note */}
                            <div className="mt-6 bg-accent/5 rounded-xl p-4 text-xs text-body leading-relaxed">
                                <p className="font-semibold text-heading mb-1">
                                    Family-first protection
                                </p>
                                <p className="text-muted">
                                    Each family member gets their own
                                    personalised travel health report,
                                    physician-reviewed and based on their
                                    individual health profile.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <FooterSection />
        </div>
    );
}

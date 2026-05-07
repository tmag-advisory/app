import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useInitiateFamilyPackageCheckout } from "../api/hooks";
import FooterSection from "../components/sections/FooterSection";
import Navbar from "../components/sections/Navbar";
import { useAuth } from "../context/AuthContext";
import { useCurrencyStore } from "../stores/currencyStore";
import { familyPlans, formatFamilyAdditionalMemberPrice, formatFamilyPlanPrice, normalizePlanCurrency } from "../constants/companyPlans";
import type { BillingCurrency, FamilyPackageType, FamilyPackageCheckoutResponse } from "../api/types";
import { LucideLoader2, LucideLock, LucideShieldCheck, LucideAlertCircle, LucideUsers, LucideCheck } from "lucide-react";
import { cn } from "../lib/utils";
import toast from "react-hot-toast";

export default function FamilyCheckoutPage() {
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const { selectedCurrency } = useCurrencyStore();

    const planId = searchParams.get("plan")?.replace("FAMILY_", "") as FamilyPackageType | null;
    const plan = planId ? familyPlans.find((p: { id: string }) => p.id === planId) : null;

    const { mutate: initiateCheckout, isPending } = useInitiateFamilyPackageCheckout();

    const [form, setForm] = useState({ name: "", email: "", phone: "" });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (user) {
            const name = [user.first_name, user.last_name].filter(Boolean).join(" ");
            setForm({ name, email: user.email ?? "", phone: user.phone ?? "" });
        }
    }, [user]);

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!user) {
            if (!form.name.trim()) errs.name = "Full name is required";
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

        initiateCheckout(
            {
                packageType: plan.id,
                currency: normalizePlanCurrency(selectedCurrency),
                ...(user ? {} : { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() }),
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
    const priceNgnDisplay = `₦${plan.priceNgn.toLocaleString()}`;
    const priceUsdDisplay = `$${plan.priceUsd.toLocaleString()}`;
    const additionalMemberDisplay = formatFamilyAdditionalMemberPrice(plan, checkoutCurrency);
    const secondaryPriceDisplay = checkoutCurrency === "NGN" ? priceUsdDisplay : priceNgnDisplay;

    return (
        <div className="min-h-screen bg-background-primary">
            <Navbar />

            <main className="max-w-6xl mx-auto px-6 pt-10 pb-16">
                <Link to="/pricing?tab=family" className="inline-flex text-sm text-muted hover:text-heading transition-colors mb-6">
                    Back to family pricing
                </Link>
                <div className="grid md:grid-cols-5 gap-8">
                    <div className="md:col-span-3">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                                <LucideUsers className="w-6 h-6 text-accent" />
                            </div>
                            <div>
                                <h1 className="font-serif text-3xl text-heading">Complete your Family Plan purchase</h1>
                                <p className="text-muted text-sm mt-1">
                                    Your family plan will be activated immediately after payment confirmation.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {user ? (
                                <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4">
                                    <p className="text-sm font-medium text-heading">
                                        Purchasing as {user.first_name} {user.last_name}
                                    </p>
                                    <p className="text-xs text-muted mt-0.5">{user.email}</p>
                                    <p className="text-xs text-accent mt-2">
                                        Your family plan will appear in your dashboard and you can add family members after.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-background-secondary border border-border-light rounded-2xl p-4">
                                        <p className="text-xs text-muted mb-2">
                                            Already have an account?{" "}
                                            <Link to={`/login?redirect=${encodeURIComponent(`/family-checkout?plan=FAMILY_${plan.id}`)}`}
                                                className="text-accent hover:underline">
                                                Sign in
                                            </Link>{" "}
                                            to link this purchase to your account.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-heading uppercase tracking-wider mb-1.5">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                            placeholder="Your full name"
                                            className={cn(
                                                "w-full px-4 py-3 rounded-xl border bg-white text-sm text-heading placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all",
                                                errors.name ? "border-red-300" : "border-border-light"
                                            )}
                                        />
                                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-heading uppercase tracking-wider mb-1.5">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                            placeholder="your@email.com"
                                            className={cn(
                                                "w-full px-4 py-3 rounded-xl border bg-white text-sm text-heading placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all",
                                                errors.email ? "border-red-300" : "border-border-light"
                                            )}
                                        />
                                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                                        <p className="text-xs text-muted mt-1">
                                            Your family login codes will be sent to this address.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-heading uppercase tracking-wider mb-1.5">
                                            Phone (optional)
                                        </label>
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                            placeholder="+1 234 567 8900"
                                            className="w-full px-4 py-3 rounded-xl border border-border-light bg-white text-sm text-heading placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                                        />
                                    </div>
                                </>
                            )}

                            <button
                                type="submit"
                                disabled={isPending}
                                className={cn(
                                    "w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-semibold text-sm transition-all",
                                    isPending
                                        ? "bg-dark/50 text-white/50 cursor-not-allowed"
                                        : "bg-dark text-white hover:bg-darkest"
                                )}
                            >
                                {isPending ? (
                                    <>
                                        <LucideLoader2 className="w-4 h-4 animate-spin" />
                                        Redirecting to payment...
                                    </>
                                ) : (
                                    <>
                                        <LucideLock className="w-4 h-4" />
                                        Proceed to Secure Payment — {priceDisplay}
                                    </>
                                )}
                            </button>

                            <div className="flex items-center justify-center gap-2 text-xs text-muted">
                                <LucideShieldCheck className="w-3.5 h-3.5 text-accent" />
                                <span>Secured by Flutterwave</span>
                            </div>
                        </form>
                    </div>

                    <div className="md:col-span-2">
                        <div className="bg-white rounded-2xl border border-border-light p-6 sticky top-8">
                            <h3 className="text-xs font-bold tracking-wider text-muted uppercase mb-4">Plan Summary</h3>

                            <div className="mb-5">
                                <p className="text-lg font-serif font-semibold text-heading mb-1">{plan.name}</p>
                                <p className="text-sm text-muted">{plan.description}</p>
                            </div>

                            <div className="space-y-3 mb-5">
                                {plan.features.map((f, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm text-body">
                                        <LucideCheck className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                                        {f}
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-border-light pt-4 space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-body">Price (USD)</span>
                                    <span className={cn("font-medium", checkoutCurrency === "USD" ? "text-heading" : "text-muted")}>{priceUsdDisplay}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-body">Price (NGN)</span>
                                    <span className={cn("font-medium", checkoutCurrency === "NGN" ? "text-heading" : "text-muted")}>{priceNgnDisplay}</span>
                                </div>
                            </div>

                            <div className="border-t border-border-light mt-4 pt-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-heading">Total</span>
                                    <span className="text-xl font-bold text-accent">{priceDisplay}</span>
                                </div>
                                <p className="text-xs text-muted mt-1 text-right">{secondaryPriceDisplay}</p>
                            </div>

                            <div className="mt-5 space-y-2">
                                {[
                                    "Instant activation after payment",
                                    "Includes up to 6 family members per plan",
                                    `${additionalMemberDisplay} for each additional family member`,
                                    "Individual login codes for each family member",
                                ].map(t => (
                                    <div key={t} className="flex items-start gap-2 text-xs text-muted">
                                        <span className="text-accent mt-0.5">✓</span>
                                        {t}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <FooterSection />
        </div>
    );
}

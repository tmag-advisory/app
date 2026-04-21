import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
    useUpdateProfile,
    useUpdateProfilePassword,
    useMyCompanies,
    useInitiateCreditPurchase,
    useCreateCreditRequest,
} from "../../api/hooks";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import PlanUpgradeModal from "../../components/dashboard/PlanUpgradeModal";
import {
    LucideUser,
    LucideLock,
    LucideCreditCard, LucideLoader2,
    LucideX,
    LucideSend
} from "lucide-react";
import toast from "react-hot-toast";
import type { BillingCurrency } from "../../api/types";
import * as React from "react";
import { AxiosError } from "axios";
import { cn } from "../../lib/utils";
import { DASHBOARD_GLASS_SURFACE } from "../../components/dashboard/dashboardChrome";

const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: "$",
    NGN: "₦",
};

type Tab = "profile" | "password" | "billing";

const Settings = () => {
    const { user, refreshProfile } = useAuth();
    // const {data: onboardingData} = useOnboarding();
    const initiatePurchase = useInitiateCreditPurchase();
    const [tab, setTab] = useState<Tab>("profile");

    const [profileForm, setProfileForm] = useState({
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        phone: user?.phone || "",
        email: user?.email || "",
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const updateProfile = useUpdateProfile();
    const updatePassword = useUpdateProfilePassword();
    const { data: myCompanies } = useMyCompanies();
    const createCreditRequest = useCreateCreditRequest();

    const [purchaseCreditsOpen, setPurchaseCreditsOpen] = useState(false);
    const [creditCount, setCreditCount] = useState(1);
    const [requestReason, setRequestReason] = useState("");
    const [requestingCredits, setRequestingCredits] = useState(false);
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

    const isCompanyUser = myCompanies && myCompanies.length > 0;
    const company = isCompanyUser ? myCompanies[0] : null;

    // Detect free tier users
    const isFreeUser = user?.user_credit_plan?.code === "ESSENTIAL";

    // Billing currency — company users use company currency, individuals use their preference
    // Default to NGN if not set
    const userBillingCurrency = user?.billing_currency ?? "NGN";
    const activeCurrency: BillingCurrency = isCompanyUser
        ? (company?.billing_currency ?? "NGN")
        : userBillingCurrency;
    const currencySymbol = CURRENCY_SYMBOLS[activeCurrency] || activeCurrency;

    const basePriceUsd = user?.user_credit_plan?.basePriceUsd ?? 0;
    const basePriceNgn = user?.user_credit_plan?.basePriceNgn ?? 0;
    const pricePerCredit = activeCurrency === "USD"
        ? basePriceUsd
        : basePriceNgn;
    const effectivePricing = { pricePerCredit };

    const [currencyForm, setCurrencyForm] = useState<BillingCurrency>(userBillingCurrency);
    const [savingCurrency, setSavingCurrency] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);

    const handleSaveCurrency = async () => {
        if (currencyForm === userBillingCurrency) return;
        setSavingCurrency(true);
        try {
            await updateProfile.mutateAsync({ billing_currency: currencyForm });
            await refreshProfile();
            toast.success("Billing currency updated");
        } catch {
            toast.error("Failed to update billing currency");
        } finally {
            setSavingCurrency(false);
        }
    };

    const handlePurchaseCredits = async () => {
        setProcessingPayment(true);
        try {
            const result = await initiatePurchase.mutateAsync({
                credits: creditCount,
                currency: activeCurrency,
            });

            // Handle both SuccessResponse format and direct response
            const responseData = (result as any).data || result;
            const paymentLink = responseData.paymentLink || (responseData.data?.paymentLink);

            if (responseData.success && paymentLink) {
                window.location.href = paymentLink;
            } else {
                const errorMsg = responseData.error || responseData.data?.error || "Failed to initiate payment. Please try again.";
                toast.error(errorMsg);
            }
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data?.data?.error) {
                const errorMessage = error?.response?.data?.message || error?.response?.data?.data?.error || "Failed to initiate payment. Please try again.";
                toast.error(errorMessage);
            }
        } finally {
            setProcessingPayment(false);
        }
    };

    // const showQuestionnaireBanner = onboardingData && !onboardingData.questionnaireCompleted;

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: "profile", label: "Profile", icon: <LucideUser className="w-4 h-4" /> },
        { id: "password", label: "Password", icon: <LucideLock className="w-4 h-4" /> },
        { id: "billing", label: "Billing", icon: <LucideCreditCard className="w-4 h-4" /> },
    ];

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateProfile.mutateAsync(profileForm);
            await refreshProfile();
            toast.success("Profile updated successfully");
        } catch {
            toast.error("Failed to update profile");
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        try {
            await updatePassword.mutateAsync({
                OldPassword: passwordForm.currentPassword,
                NewPassword: passwordForm.newPassword,
            });
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            toast.success("Password updated successfully");
        } catch {
            toast.error("Failed to update password");
        }
    };

    const handleCreditRequest = async () => {
        try {
            if (!requestReason.trim()) {
                toast.error("Please provide a reason for your request");
                return;
            }
            if (!company?.id) {
                toast.error("Company not found");
                return;
            }
            setRequestingCredits(true);
            await createCreditRequest.mutateAsync({
                companyId: company.id,
                creditsRequested: creditCount,
                reason: requestReason,
                status: "pending",
            });
            toast.success("Credit request submitted to HR");
            setPurchaseCreditsOpen(false);
            setRequestReason("");
            setCreditCount(1);
        } catch (error) {
            toast.error("Failed to submit credit request");
            console.error("Credit request error:", error);
        } finally {
            setRequestingCredits(false);
        }
    };

    const handleUpgradeSuccess = async () => {
        await refreshProfile();
        setPurchaseCreditsOpen(true);
    };

    return (
        <div>
            <DashboardHeader title="Settings" />

            {/* Tabs */}
            <div className="flex gap-1 bg-button-secondary rounded-xl p-1 max-w-md mb-8 overflow-x-auto">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${tab === t.id ?
                            "bg-white text-heading shadow-sm"
                            : "text-muted hover:text-heading"
                            }`}
                    >
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* Profile tab */}
            {tab === "profile" && (
                <>
                    <form
                        onSubmit={handleProfileSubmit}
                        className={cn(DASHBOARD_GLASS_SURFACE, "p-6 md:p-8 max-w-2xl")}
                    >
                        <h2 className="text-base font-semibold text-heading mb-6">
                            Personal information
                        </h2>
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                        First name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileForm.first_name}
                                        onChange={(e) =>
                                            setProfileForm({
                                                ...profileForm,
                                                first_name: e.target.value,
                                            })
                                        }
                                        className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors duration-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                        Last name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileForm.last_name}
                                        onChange={(e) =>
                                            setProfileForm({
                                                ...profileForm,
                                                last_name: e.target.value,
                                            })
                                        }
                                        className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors duration-200"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={profileForm.email}
                                        onChange={(e) =>
                                            setProfileForm({
                                                ...profileForm,
                                                email: e.target.value,
                                            })
                                        }
                                        className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors duration-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={profileForm.phone}
                                        onChange={(e) =>
                                            setProfileForm({
                                                ...profileForm,
                                                phone: e.target.value,
                                            })
                                        }
                                        className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors duration-200"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-border-light/50 flex justify-end">
                            <button
                                type="submit"
                                disabled={updateProfile.isPending}
                                className="py-2.5 px-5 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200 flex items-center gap-2"
                            >
                                {updateProfile.isPending && (
                                    <LucideLoader2 className="w-3 h-3 animate-spin" />
                                )}
                                Save changes
                            </button>
                        </div>
                    </form>

                </>
            )}

            {/* Password tab */}
            {tab === "password" && (
                <form
                    onSubmit={handlePasswordSubmit}
                    className={cn(DASHBOARD_GLASS_SURFACE, "p-6 md:p-8 max-w-2xl")}
                >
                    <h2 className="text-base font-semibold text-heading mb-6">
                        Change password
                    </h2>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                Current password
                            </label>
                            <input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) =>
                                    setPasswordForm({
                                        ...passwordForm,
                                        currentPassword: e.target.value,
                                    })
                                }
                                placeholder="••••••••"
                                className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                New password
                            </label>
                            <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) =>
                                    setPasswordForm({
                                        ...passwordForm,
                                        newPassword: e.target.value,
                                    })
                                }
                                placeholder="Min. 8 characters"
                                className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                Confirm new password
                            </label>
                            <input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) =>
                                    setPasswordForm({
                                        ...passwordForm,
                                        confirmPassword: e.target.value,
                                    })
                                }
                                placeholder="••••••••"
                                className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                                required
                            />
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-border-light/50 flex justify-end">
                        <button
                            type="submit"
                            disabled={updatePassword.isPending}
                            className="py-2.5 px-5 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200 flex items-center gap-2"
                        >
                            {updatePassword.isPending && (
                                <LucideLoader2 className="w-3 h-3 animate-spin" />
                            )}
                            Update password
                        </button>
                    </div>
                </form>
            )}

            {/* Billing tab */}
            {tab === "billing" && (
                <div className="space-y-6 max-w-2xl">
                    <div className={cn(DASHBOARD_GLASS_SURFACE, "p-6")}>
                        <h2 className="text-base font-semibold text-heading mb-4">
                            Credits
                        </h2>
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-4xl font-serif text-heading">
                                {user?.credits ?? 0}
                            </span>
                            <span className="text-sm text-muted">
                                credits remaining
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                if (isFreeUser) {
                                    setUpgradeModalOpen(true);
                                } else {
                                    setPurchaseCreditsOpen(true);
                                }
                            }}
                            className="py-2.5 px-5 rounded-xl bg-accent text-white font-semibold text-sm cursor-pointer hover:bg-accent/90 transition-colors duration-200"
                        >
                            {isFreeUser ? (
                                "Upgrade plan"
                            ) : isCompanyUser ? (
                                "Request credits"
                            ) : (
                                "Purchase credits"
                            )}
                        </button>
                    </div>

                    {/* Billing currency — only editable for individual users */}
                    <div className={cn(DASHBOARD_GLASS_SURFACE, "p-6")}>
                        <h2 className="text-base font-semibold text-heading mb-1">
                            Billing currency
                        </h2>
                        {isCompanyUser ?
                            <p className="text-xs text-muted mb-4">
                                Your billing currency is set by{" "}
                                <span className="font-semibold text-heading">
                                    {company?.name}
                                </span>{" "}
                                and cannot be changed here.
                            </p>
                            : <p className="text-xs text-muted mb-4">
                                Choose the currency for credit purchases.
                            </p>
                        }
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                            {(
                                Object.keys(
                                    CURRENCY_SYMBOLS,
                                ) as BillingCurrency[]
                            ).map((c) => {
                                const symbol = CURRENCY_SYMBOLS[c];
                                const perCredit = c === "USD" ? basePriceUsd : basePriceNgn;
                                const selected =
                                    isCompanyUser ?
                                        activeCurrency === c
                                        : currencyForm === c;
                                return (
                                    <button
                                        key={c}
                                        disabled={isCompanyUser}
                                        onClick={() =>
                                            !isCompanyUser && setCurrencyForm(c)
                                        }
                                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${selected ?
                                            "border-accent bg-accent/5 text-accent"
                                            : "border-border-light text-muted hover:border-accent/40"
                                            } ${isCompanyUser ? "cursor-default opacity-60" : "cursor-pointer"}`}
                                    >
                                        <span className="text-lg">
                                            {symbol}
                                        </span>
                                        <span className="text-xs font-medium">
                                            {c}
                                        </span>
                                        <span className="text-xs text-muted">
                                            {symbol}
                                            {perCredit.toLocaleString()}/credit
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        {!isCompanyUser && (
                            <div className="flex items-center justify-between pt-4 border-t border-border-light/50">
                                <p className="text-xs text-muted">
                                    1 credit = {currencySymbol}
                                    {effectivePricing.pricePerCredit.toLocaleString()}{" "}
                                    {currencyForm}
                                </p>
                                <button
                                    onClick={handleSaveCurrency}
                                    disabled={
                                        savingCurrency ||
                                        currencyForm === user?.billing_currency
                                    }
                                    className="py-2 px-4 rounded-xl bg-dark text-background-primary font-semibold text-xs cursor-pointer hover:bg-darkest transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {savingCurrency && (
                                        <LucideLoader2 className="w-3 h-3 animate-spin" />
                                    )}
                                    Save
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={cn(DASHBOARD_GLASS_SURFACE, "p-6")}>
                        <h2 className="text-base font-semibold text-heading mb-4">
                            Your plan
                        </h2>
                        {(() => {
                            const plan = user?.user_credit_plan;
                            const planName = plan?.displayName ?? (isCompanyUser ? "Company" : "Individual");
                            const planDescription = plan?.description ?? (isCompanyUser ? "Organisational billing" : "Pay-per-plan pricing");
                            const basePriceUsd = plan?.basePriceUsd ?? null;
                            const planCode = plan?.code ?? null;
                            const planBadgeColor =
                                planCode === "PREMIUM" ? "text-amber-700 bg-amber-50 border-amber-200" :
                                    planCode === "STANDARD" ? "text-accent bg-accent/10 border-accent/20" :
                                        "text-muted bg-muted/10 border-border-light";
                            return (
                                <div>
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-sm font-semibold text-heading">{planName}</p>
                                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${planBadgeColor}`}>
                                                    Active
                                                </span>
                                            </div>
                                            {basePriceUsd !== null && basePriceUsd > 0 && (
                                                <p className="text-xs text-accent font-semibold mb-1">
                                                    ${basePriceUsd.toFixed(0)} USD per credit
                                                </p>
                                            )}
                                            {basePriceUsd === 0 && (
                                                <p className="text-xs text-muted font-semibold mb-1">Free tier</p>
                                            )}
                                            <p className="text-xs text-muted leading-relaxed max-w-sm line-clamp-2">
                                                {planDescription}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Plan Upgrade Modal */}
            <PlanUpgradeModal
                isOpen={upgradeModalOpen}
                onClose={() => setUpgradeModalOpen(false)}
                onUpgradeSuccess={handleUpgradeSuccess}
                currentPlan={user?.user_credit_plan?.code}
            />

            {/* Purchase Credits Modal */}
            {purchaseCreditsOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    onClick={() => setPurchaseCreditsOpen(false)}
                >
                    <div
                        className={cn(DASHBOARD_GLASS_SURFACE, "relative w-full max-w-md p-6 md:p-8")}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setPurchaseCreditsOpen(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-heading hover:bg-background-primary transition-colors duration-200 cursor-pointer"
                        >
                            <LucideX className="w-4 h-4" />
                        </button>

                        {isCompanyUser ?
                            /* ── Company user view - Request credits from HR ── */
                            <>
                                <h2 className="text-base font-semibold text-heading mb-1">
                                    Request credits
                                </h2>
                                <p className="text-xs text-muted mb-6">
                                    Submit a credit request to your HR
                                    department.
                                </p>

                                <div className="mb-4">
                                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                        Credits requested
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={creditCount}
                                        onChange={(e) =>
                                            setCreditCount(
                                                Math.max(
                                                    1,
                                                    Number(e.target.value),
                                                ),
                                            )
                                        }
                                        className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors duration-200"
                                        placeholder="Enter number of credits"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                        Reason
                                    </label>
                                    <textarea
                                        value={requestReason}
                                        onChange={(e) =>
                                            setRequestReason(e.target.value)
                                        }
                                        rows={3}
                                        className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors duration-200 resize-none"
                                        placeholder="Why do you need these credits?"
                                    />
                                </div>

                                <button
                                    onClick={handleCreditRequest}
                                    disabled={requestingCredits}
                                    className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm cursor-pointer hover:bg-accent/90 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {requestingCredits ?
                                        <>
                                            <LucideLoader2 className="w-4 h-4 animate-spin" />
                                            Submitting...
                                        </>
                                        : <>
                                            <LucideSend className="w-4 h-4" />
                                            Submit to HR
                                        </>
                                    }
                                </button>
                            </>
                            :   /* ── Individual user view ── */
                            <>
                                <h2 className="text-base font-semibold text-heading mb-1">
                                    Purchase credits
                                </h2>
                                {user?.user_credit_plan && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs text-muted">Plan:</span>
                                        <span className="text-xs font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                                            {user.user_credit_plan.displayName}
                                        </span>
                                        {user.user_credit_plan.basePriceUsd > 0 && (
                                            <span className="text-xs text-muted">
                                                — ${user.user_credit_plan.basePriceUsd.toFixed(0)} USD/credit
                                            </span>
                                        )}
                                    </div>
                                )}
                                <p className="text-xs text-muted mb-6">
                                    Select a credit pack that works for you.
                                </p>

                                {/* Tiered pricing cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                    {[
                                        {
                                            credits: 1,
                                            label: "1 credit",
                                            popular: false,
                                        },
                                        {
                                            credits: 5,
                                            label: "5 credits",
                                            popular: false,
                                        },
                                        {
                                            credits: 10,
                                            label: "10 credits",
                                            popular: true,
                                        },
                                    ].map((tier) => {
                                        const basePrice =
                                            effectivePricing.pricePerCredit * tier.credits;
                                        const isSelected =
                                            creditCount === tier.credits;
                                        return (
                                            <button
                                                key={tier.credits}
                                                onClick={() =>
                                                    setCreditCount(tier.credits)
                                                }
                                                className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${isSelected ?
                                                    "border-accent bg-accent/5"
                                                    : "border-border-light hover:border-accent/50"
                                                    }`}
                                            >
                                                {tier.popular && (
                                                    <span className="absolute -top-2 right-3 px-2 py-0.5 bg-accent text-white text-xs font-semibold rounded-full">
                                                        Popular
                                                    </span>
                                                )}
                                                <div className="text-2xl font-serif text-heading mb-1 mt-2">
                                                    {tier.credits}
                                                </div>
                                                <div className="text-xs text-muted mb-2">
                                                    {tier.label}
                                                </div>
                                                <div className="text-lg font-semibold text-heading">
                                                    {currencySymbol}
                                                    {basePrice.toLocaleString()}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Custom amount option */}
                                <div className="mb-6">
                                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                        Or enter custom amount
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={100}
                                        value={creditCount}
                                        onChange={(e) =>
                                            setCreditCount(
                                                Math.max(
                                                    1,
                                                    Math.min(
                                                        100,
                                                        Number(e.target.value),
                                                    ),
                                                ),
                                            )
                                        }
                                        className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors duration-200"
                                        placeholder="Enter number of credits"
                                    />
                                </div>

                                {/* Pricing summary */}
                                <div className="bg-background-primary rounded-xl p-4 mb-6 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted">
                                            Credits
                                        </span>
                                        <span className="text-sm font-semibold text-heading">
                                            {creditCount}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted">
                                            Price per credit ({activeCurrency})
                                        </span>
                                        <span className="text-sm font-semibold text-heading">
                                            {currencySymbol}
                                            {effectivePricing.pricePerCredit.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="pt-2 border-t border-border-light/50 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-muted">
                                            Total ({activeCurrency})
                                        </span>
                                        <span className="text-lg font-bold text-heading">
                                            {currencySymbol}
                                            {(effectivePricing.pricePerCredit * creditCount).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePurchaseCredits}
                                    disabled={processingPayment}
                                    className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm cursor-pointer hover:bg-accent/90 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {processingPayment ?
                                        <>
                                            <LucideLoader2 className="w-4 h-4 animate-spin" />
                                            Processing...
                                        </>
                                        : <>Proceed to payment</>}
                                </button>
                            </>
                        }
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;

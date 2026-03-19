import {useState} from "react";
import {Link} from "react-router-dom";
import {useAuth} from "../../context/AuthContext";
import {useOnboarding, useUpdateProfile, useUpdateProfilePassword, useMyCompanies, useCreditPricing, useInitiateCreditPurchase} from "../../api/hooks";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import {
    LucideUser,
    LucideLock,
    LucideCreditCard,
    LucideClipboardList,
    LucideArrowRight,
    LucideLoader2,
    LucideX,
    LucideBuilding2,
    LucideMail,
    LucideCheck,
    LucideTag
} from "lucide-react";
import toast from "react-hot-toast";
import type {BillingCurrency, CreditPricingResponse} from "../../api/types";
import * as React from "react";

const CURRENCY_SYMBOLS: Record<BillingCurrency, string> = {
    USD: "$",
    NGN: "₦",
    EUR: "€",
    GBP: "£",
};

const getDiscountLabel = (credits: number, pricePerCredit: number, pricing: CreditPricingResponse | undefined): string | null => {
    if (!pricing) return null;
    const total = credits * pricePerCredit;
    
    if (pricing.discountTier3Threshold && pricing.discountTier3Amount && 
        total >= pricing.discountTier3Threshold) {
        return "Best Value!";
    } else if (pricing.discountTier2Threshold && pricing.discountTier2Amount && 
               total >= pricing.discountTier2Threshold) {
        return "Great Discount!";
    } else if (pricing.discountTier1Threshold && pricing.discountTier1Amount && 
               total >= pricing.discountTier1Threshold) {
        return "Bulk Discount!";
    }
    return null;
};

const calculatePriceWithDiscount = (credits: number, pricing: CreditPricingResponse | undefined, defaultPrice: number) => {
    const pp = pricing?.pricePerCredit ?? defaultPrice;
    const basePrice = pp * credits;
    const total = basePrice;
    let discount = 0;
    
    if (pricing?.discountTier3Threshold && pricing?.discountTier3Amount && 
        total >= pricing.discountTier3Threshold) {
        discount = pricing.discountTier3Amount;
    } else if (pricing?.discountTier2Threshold && pricing?.discountTier2Amount && 
               total >= pricing.discountTier2Threshold) {
        discount = pricing.discountTier2Amount;
    } else if (pricing?.discountTier1Threshold && pricing?.discountTier1Amount && 
               total >= pricing.discountTier1Threshold) {
        discount = pricing.discountTier1Amount;
    }
    
    return { basePrice, discount, total: basePrice - discount };
};

type Tab = "profile" | "password" | "billing";

const Settings = () => {
    const {user, refreshProfile} = useAuth();
    const {data: onboardingData} = useOnboarding();
    const {data: creditPricing, isLoading: creditPricingLoading, error: creditPricingError} = useCreditPricing();
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
    const {data: myCompanies} = useMyCompanies();

    const [purchaseCreditsOpen, setPurchaseCreditsOpen] = useState(false);
    const [creditCount, setCreditCount] = useState(1);

    const isCompanyUser = myCompanies && myCompanies.length > 0;
    const company = isCompanyUser ? myCompanies[0] : null;

    // Billing currency — company users use company currency, individuals use their preference
    // Default to NGN if not set
    const userBillingCurrency = user?.billing_currency ?? "NGN";
    const activeCurrency: BillingCurrency = isCompanyUser
        ? (company?.billing_currency ?? "NGN")
        : userBillingCurrency;
    const currencySymbol = CURRENCY_SYMBOLS[activeCurrency] || activeCurrency;

    // Get pricing for active currency from API
    const activePricing = creditPricing?.find(p => p.currency === activeCurrency);
    
    // Default pricing based on currency if not found in API
    const getDefaultPricing = (currency: BillingCurrency) => {
        switch (currency) {
            case "USD": return { pricePerCredit: 3.23, discountTier1Threshold: 32.26, discountTier1Amount: 3.23, discountTier2Threshold: 64.52, discountTier2Amount: 5.48, discountTier3Threshold: 322.58, discountTier3Amount: 12.9 };
            case "EUR": return { pricePerCredit: 2.94, discountTier1Threshold: 29.41, discountTier1Amount: 2.94, discountTier2Threshold: 58.82, discountTier2Amount: 5, discountTier3Threshold: 294.12, discountTier3Amount: 11.76 };
            case "GBP": return { pricePerCredit: 2.56, discountTier1Threshold: 25.64, discountTier1Amount: 2.56, discountTier2Threshold: 51.28, discountTier2Amount: 4.36, discountTier3Threshold: 256.41, discountTier3Amount: 10.26 };
            default: return { pricePerCredit: 5000, discountTier1Threshold: 50000, discountTier1Amount: 5000, discountTier2Threshold: 100000, discountTier2Amount: 8500, discountTier3Threshold: 500000, discountTier3Amount: 20000 };
        }
    };
    
    const effectivePricing = activePricing || getDefaultPricing(activeCurrency);
    const pricePerCredit = effectivePricing.pricePerCredit;

    const [currencyForm, setCurrencyForm] = useState<BillingCurrency>(userBillingCurrency);
    const [savingCurrency, setSavingCurrency] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);

    const handleSaveCurrency = async () => {
        if (currencyForm === userBillingCurrency) return;
        setSavingCurrency(true);
        try {
            await updateProfile.mutateAsync({billing_currency: currencyForm});
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
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.response?.data?.data?.error || "Failed to initiate payment. Please try again.";
            toast.error(errorMessage);
        } finally {
            setProcessingPayment(false);
        }
    };

    const calculatePriceWithDiscount = (credits: number, pricing: CreditPricingResponse | undefined, defaultPrice: number) => {
        const pp = pricing?.pricePerCredit ?? defaultPrice;
        const basePrice = pp * credits;
        const total = basePrice;
        let discount = 0;
        
        if (pricing?.discountTier3Threshold && pricing?.discountTier3Amount && 
            total >= pricing.discountTier3Threshold) {
            discount = pricing.discountTier3Amount;
        } else if (pricing?.discountTier2Threshold && pricing?.discountTier2Amount && 
                   total >= pricing.discountTier2Threshold) {
            discount = pricing.discountTier2Amount;
        } else if (pricing?.discountTier1Threshold && pricing?.discountTier1Amount && 
                   total >= pricing.discountTier1Threshold) {
            discount = pricing.discountTier1Amount;
        }
        
        return { basePrice, discount, total: basePrice - discount };
    };

    const showQuestionnaireBanner = onboardingData && !onboardingData.questionnaireCompleted;

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        {id: "profile", label: "Profile", icon: <LucideUser className="w-4 h-4"/>},
        {id: "password", label: "Password", icon: <LucideLock className="w-4 h-4"/>},
        {id: "billing", label: "Billing", icon: <LucideCreditCard className="w-4 h-4"/>},
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
            setPasswordForm({currentPassword: "", newPassword: "", confirmPassword: ""});
            toast.success("Password updated successfully");
        } catch {
            toast.error("Failed to update password");
        }
    };

    return (
        <div>
            <DashboardHeader title="Settings"/>

            {/* Tabs */}
            <div className="flex gap-1 bg-button-secondary rounded-xl p-1 max-w-md mb-8 overflow-x-auto">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                            tab === t.id
                                ? "bg-white text-heading shadow-sm"
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
                    <form onSubmit={handleProfileSubmit}
                          className="bg-white rounded-2xl border border-border-light/50 p-6 md:p-8 max-w-2xl">
                        <h2 className="text-base font-semibold text-heading mb-6">Personal information</h2>
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label
                                        className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">First
                                        name</label>
                                    <input
                                        type="text"
                                        value={profileForm.first_name}
                                        onChange={(e) => setProfileForm({...profileForm, first_name: e.target.value})}
                                        className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors duration-200"
                                    />
                                </div>
                                <div>
                                    <label
                                        className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Last
                                        name</label>
                                    <input
                                        type="text"
                                        value={profileForm.last_name}
                                        onChange={(e) => setProfileForm({...profileForm, last_name: e.target.value})}
                                        className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors duration-200"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label
                                        className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                                        className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors duration-200"
                                    />
                                </div>
                                <div>
                                    <label
                                        className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        value={profileForm.phone}
                                        onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
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
                                {updateProfile.isPending && <LucideLoader2 className="w-3 h-3 animate-spin"/>}
                                Save changes
                            </button>
                        </div>
                    </form>

                    {/* Questionnaire card */}
                    {showQuestionnaireBanner && (
                        <Link
                            to="/onboarding/questionnaire"
                            className="mt-6 max-w-2xl flex items-center gap-4 p-5 rounded-2xl bg-accent/5 border border-accent/20 hover:bg-accent/10 transition-colors duration-200 group"
                        >
                            <div
                                className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                                <LucideClipboardList className="w-5 h-5 text-accent"/>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-heading">Health questionnaire</p>
                                <p className="text-xs text-muted">Complete your travel health questionnaire for
                                    personalised recommendations.</p>
                            </div>
                            <LucideArrowRight
                                className="w-4 h-4 text-accent shrink-0 group-hover:translate-x-0.5 transition-transform"/>
                        </Link>
                    )}
                </>
            )}

            {/* Password tab */}
            {tab === "password" && (
                <form onSubmit={handlePasswordSubmit}
                      className="bg-white rounded-2xl border border-border-light/50 p-6 md:p-8 max-w-2xl">
                    <h2 className="text-base font-semibold text-heading mb-6">Change password</h2>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Current
                                password</label>
                            <input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                placeholder="••••••••"
                                className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">New
                                password</label>
                            <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                placeholder="Min. 8 characters"
                                className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Confirm
                                new password</label>
                            <input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
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
                            {updatePassword.isPending && <LucideLoader2 className="w-3 h-3 animate-spin"/>}
                            Update password
                        </button>
                    </div>
                </form>
            )}

            {/* Billing tab */}
            {tab === "billing" && (
                <div className="space-y-6 max-w-2xl">
                    <div className="bg-white rounded-2xl border border-border-light/50 p-6">
                        <h2 className="text-base font-semibold text-heading mb-4">Credits</h2>
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-4xl font-serif text-heading">{user?.credits ?? 0}</span>
                            <span className="text-sm text-muted">credits remaining</span>
                        </div>
                        <button
                            onClick={() => setPurchaseCreditsOpen(true)}
                            className="py-2.5 px-5 rounded-xl bg-accent text-white font-semibold text-sm cursor-pointer hover:bg-accent/90 transition-colors duration-200"
                        >
                            Purchase credits
                        </button>
                    </div>

                    {/* Billing currency — only editable for individual users */}
                    <div className="bg-white rounded-2xl border border-border-light/50 p-6">
                        <h2 className="text-base font-semibold text-heading mb-1">Billing currency</h2>
                        {isCompanyUser ? (
                            <p className="text-xs text-muted mb-4">
                                Your billing currency is set by{" "}
                                <span className="font-semibold text-heading">{company?.name}</span> and cannot be
                                changed here.
                            </p>
                        ) : (
                            <p className="text-xs text-muted mb-4">Choose the currency for credit purchases.</p>
                        )}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                            {(Object.keys(CURRENCY_SYMBOLS) as BillingCurrency[]).map((c) => {
                                const symbol = CURRENCY_SYMBOLS[c];
                                const pricing = creditPricing?.find(p => p.currency === c);
                                const getDefaultPrice = (currency: BillingCurrency) => {
                                    switch (currency) {
                                        case "USD": return 3.23;
                                        case "EUR": return 2.94;
                                        case "GBP": return 2.56;
                                        default: return 5000;
                                    }
                                };
                                const perCredit = pricing?.pricePerCredit ?? getDefaultPrice(c);
                                const selected = isCompanyUser ? activeCurrency === c : currencyForm === c;
                                return (
                                    <button
                                        key={c}
                                        disabled={isCompanyUser}
                                        onClick={() => !isCompanyUser && setCurrencyForm(c)}
                                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                                            selected
                                                ? "border-accent bg-accent/5 text-accent"
                                                : "border-border-light text-muted hover:border-accent/40"
                                        } ${isCompanyUser ? "cursor-default opacity-60" : "cursor-pointer"}`}
                                    >
                                        <span className="text-lg">{symbol}</span>
                                        <span className="text-xs font-medium">{c}</span>
                                        <span className="text-xs text-muted">{symbol}{perCredit}/credit</span>
                                    </button>
                                );
                            })}
                        </div>
                        {!isCompanyUser && (
                            <div className="flex items-center justify-between pt-4 border-t border-border-light/50">
                                <p className="text-xs text-muted">
                                    1 credit
                                    = {currencySymbol}{effectivePricing.pricePerCredit.toLocaleString()} {currencyForm}
                                </p>
                                <button
                                    onClick={handleSaveCurrency}
                                    disabled={savingCurrency || currencyForm === user?.billing_currency}
                                    className="py-2 px-4 rounded-xl bg-dark text-background-primary font-semibold text-xs cursor-pointer hover:bg-darkest transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {savingCurrency && <LucideLoader2 className="w-3 h-3 animate-spin"/>}
                                    Save
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl border border-border-light/50 p-6">
                        <h2 className="text-base font-semibold text-heading mb-4">Plan</h2>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-heading capitalize">{isCompanyUser ? "Company" : "Individual"}</p>
                                <p className="text-xs text-muted">
                                    {isCompanyUser ? "Organisational billing" : "Pay-per-plan pricing"}
                                </p>
                            </div>
                            <span
                                className="text-xs font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full">Active</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Purchase Credits Modal */}
            {purchaseCreditsOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    onClick={() => setPurchaseCreditsOpen(false)}
                >
                    <div
                        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 md:p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setPurchaseCreditsOpen(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-heading hover:bg-background-primary transition-colors duration-200 cursor-pointer"
                        >
                            <LucideX className="w-4 h-4"/>
                        </button>

                        {isCompanyUser ? (
                            /* ── Company user view ── */
                            <div className="text-center">
                                <div
                                    className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                                    <LucideBuilding2 className="w-6 h-6 text-accent"/>
                                </div>
                                <h2 className="text-base font-semibold text-heading mb-2">Credits managed by your
                                    company</h2>
                                <p className="text-sm text-muted mb-6">
                                    Your travel credits are allocated by{" "}
                                    <span className="font-semibold text-heading">{company?.name}</span>.
                                    Please reach out to your HR department to request additional credits.
                                </p>
                                <a
                                    href={`mailto:hr@${company?.name?.toLowerCase().replace(/\s+/g, "")}.com`}
                                    className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors duration-200"
                                >
                                    <LucideMail className="w-4 h-4"/>
                                    Email HR at {company?.name}
                                </a>
                                <p className="text-xs text-muted mt-3">
                                    Or speak directly with your HR representative.
                                </p>
                            </div>
                        ) : (
                            /* ── Individual user view ── */
                            <>
                                <h2 className="text-base font-semibold text-heading mb-1">Purchase credits</h2>
                                <p className="text-xs text-muted mb-6">Select a credit pack that works for you.</p>

                                {/* Tiered pricing cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                    {[
                                        { credits: 1, label: "1 credit", popular: false },
                                        { credits: 5, label: "5 credits", popular: false },
                                        { credits: 10, label: "10 credits", popular: true },
                                    ].map((tier) => {
                                        const { basePrice, discount, total } = calculatePriceWithDiscount(tier.credits, activePricing, effectivePricing.pricePerCredit);
                                        const discountLabel = getDiscountLabel(tier.credits, effectivePricing.pricePerCredit, activePricing);
                                        const isSelected = creditCount === tier.credits;
                                        return (
                                            <button
                                                key={tier.credits}
                                                onClick={() => setCreditCount(tier.credits)}
                                                className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                                                    isSelected
                                                        ? "border-accent bg-accent/5"
                                                        : "border-border-light hover:border-accent/50"
                                                }`}
                                            >
                                                {tier.popular && (
                                                    <span className="absolute -top-2 right-3 px-2 py-0.5 bg-accent text-white text-xs font-semibold rounded-full">
                                                        Popular
                                                    </span>
                                                )}
                                                {discountLabel && (
                                                    <span className="absolute -top-2 left-3 px-2 py-0.5 bg-green-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                                                        <LucideTag className="w-3 h-3" />
                                                        {discountLabel}
                                                    </span>
                                                )}
                                                <div className="text-2xl font-serif text-heading mb-1 mt-2">
                                                    {tier.credits}
                                                </div>
                                                <div className="text-xs text-muted mb-2">
                                                    {tier.label}
                                                </div>
                                                {discount > 0 ? (
                                                    <>
                                                        <div className="text-lg font-semibold text-heading line-through opacity-50">
                                                            {currencySymbol}{basePrice.toLocaleString()}
                                                        </div>
                                                        <div className="text-lg font-bold text-green-600">
                                                            {currencySymbol}{total.toLocaleString()}
                                                        </div>
                                                        <div className="text-xs text-green-600 font-medium">
                                                            Save {currencySymbol}{discount.toLocaleString()}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-lg font-semibold text-heading">
                                                        {currencySymbol}{basePrice.toLocaleString()}
                                                    </div>
                                                )}
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
                                        onChange={(e) => setCreditCount(Math.max(1, Math.min(100, Number(e.target.value))))}
                                        className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors duration-200"
                                        placeholder="Enter number of credits"
                                    />
                                </div>

                                {/* Pricing summary */}
                                <div className="bg-background-primary rounded-xl p-4 mb-6 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted">Credits</span>
                                        <span className="text-sm font-semibold text-heading">{creditCount}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted">Price per credit ({activeCurrency})</span>
                                        <span className="text-sm font-semibold text-heading">
                                            {currencySymbol}{effectivePricing.pricePerCredit.toLocaleString()}
                                        </span>
                                    </div>
                                    {(() => {
                                        const calc = calculatePriceWithDiscount(creditCount, activePricing, effectivePricing.pricePerCredit);
                                        return calc.discount > 0 && (
                                            <div className="flex items-center justify-between text-green-600">
                                                <span className="text-xs">Discount</span>
                                                <span className="text-sm font-semibold">
                                                    -{currencySymbol}{calc.discount.toLocaleString()}
                                                </span>
                                            </div>
                                        );
                                    })()}
                                    <div className="pt-2 border-t border-border-light/50 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-muted">Total ({activeCurrency})</span>
                                        <span className="text-lg font-bold text-heading">
                                            {currencySymbol}{(() => {
                                                const calc = calculatePriceWithDiscount(creditCount, activePricing, effectivePricing.pricePerCredit);
                                                return calc.total.toLocaleString();
                                            })()}
                                        </span>
                                    </div>
                                </div>

                                {/* Discount tiers info */}
                                {effectivePricing && (
                                    <div className="bg-accent/5 rounded-xl p-4 mb-6">
                                        <h4 className="text-xs font-semibold text-heading mb-2">Bulk Discounts Available:</h4>
                                        <div className="space-y-1 text-xs text-muted">
                                            {effectivePricing.discountTier1Threshold && effectivePricing.discountTier1Amount && (
                                                <div className="flex items-center gap-2">
                                                    <LucideCheck className="w-3 h-3 text-green-600" />
                                                    <span>
                                                        Order {currencySymbol}{effectivePricing.discountTier1Threshold.toLocaleString()}+ 
                                                        to save {currencySymbol}{effectivePricing.discountTier1Amount.toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                            {effectivePricing.discountTier2Threshold && effectivePricing.discountTier2Amount && (
                                                <div className="flex items-center gap-2">
                                                    <LucideCheck className="w-3 h-3 text-green-600" />
                                                    <span>
                                                        Order {currencySymbol}{effectivePricing.discountTier2Threshold.toLocaleString()}+ 
                                                        to save {currencySymbol}{effectivePricing.discountTier2Amount.toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                            {effectivePricing.discountTier3Threshold && effectivePricing.discountTier3Amount && (
                                                <div className="flex items-center gap-2">
                                                    <LucideCheck className="w-3 h-3 text-green-600" />
                                                    <span>
                                                        Order {currencySymbol}{effectivePricing.discountTier3Threshold.toLocaleString()}+ 
                                                        to save {currencySymbol}{effectivePricing.discountTier3Amount.toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handlePurchaseCredits}
                                    disabled={processingPayment}
                                    className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm cursor-pointer hover:bg-accent/90 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {processingPayment ? (
                                        <>
                                            <LucideLoader2 className="w-4 h-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>Proceed to payment</>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;

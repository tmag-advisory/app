import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LucideLoader2,
  LucideUsers,
  LucideCheck,
  LucideArrowRight,
  LucideTag,
  LucideX,
  LucideSend,
} from "lucide-react";
import { AxiosError } from "axios";
import {
  useMyCompanies,
  useInitiateCreditPurchase,
  useUpdateProfile,
  useFamilyPackageActive,
  useFamilyPackageHistory,
  useCreateCreditRequest,
} from "../../../api/hooks";
import { DASHBOARD_GLASS_SURFACE } from "../../../components/dashboard/dashboardChrome";
import { cn } from "../../../lib/utils";
import {
  familyPlans,
  formatFamilyPlanPrice,
} from "../../../constants/companyPlans";
import {
  getAffiliateReferralCode,
  getStoredAffiliateDiscountRate,
  refreshAffiliateDiscount,
} from "../../../lib/affiliateTracking";
import toast from "react-hot-toast";
import type { BillingCurrency } from "../../../api/types";
import { useAuth } from "../../../context/AuthContext";
import PlanUpgradeModal from "../../../components/dashboard/PlanUpgradeModal";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  NGN: "₦",
};

interface BillingTabProps {
  onRefreshProfile: () => Promise<void>;
}

const BillingTab = ({ onRefreshProfile }: BillingTabProps) => {
  const { user } = useAuth();
  const [creditCount, setCreditCount] = useState(1);
  const [requestReason, setRequestReason] = useState("");
  const [requestingCredits, setRequestingCredits] = useState(false);
  const [purchaseCreditsOpen, setPurchaseCreditsOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [currencyForm, setCurrencyForm] = useState<BillingCurrency>(user?.billing_currency ?? "NGN");
  const [savingCurrency, setSavingCurrency] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [affiliateDiscountRate, setAffiliateDiscountRate] = useState(getStoredAffiliateDiscountRate);

  const { data: myCompanies } = useMyCompanies();
  const isCompanyUser = !!(myCompanies && myCompanies.length > 0);
  const company = isCompanyUser ? myCompanies[0] : null;
  const isFamily = user?.type?.toUpperCase() === "FAMILY";

  const { data: activeFamilyPackages, isLoading: loadingFamilyPackage } =
    useFamilyPackageActive();
  const { data: familyPurchaseHistory } = useFamilyPackageHistory();

  const initiatePurchase = useInitiateCreditPurchase();
  const createCreditRequest = useCreateCreditRequest();
  const updateProfile = useUpdateProfile();

  const isFreeUser = user?.user_credit_plan?.code === "ESSENTIAL";
  const userBillingCurrency = user?.billing_currency ?? "NGN";
  const activeCurrency: BillingCurrency = isCompanyUser
    ? (company?.billing_currency ?? "NGN")
    : userBillingCurrency;
  const currencySymbol = CURRENCY_SYMBOLS[activeCurrency] || activeCurrency;

  const basePriceUsd = user?.user_credit_plan?.basePriceUsd ?? 0;
  const basePriceNgn = user?.user_credit_plan?.basePriceNgn ?? 0;
  const pricePerCredit = activeCurrency === "USD" ? basePriceUsd : basePriceNgn;

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

  const handleSaveCurrency = async () => {
    if (currencyForm === userBillingCurrency) return;
    setSavingCurrency(true);
    try {
      await updateProfile.mutateAsync({ billing_currency: currencyForm });
      await onRefreshProfile();
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
        affiliate_referral_code: affiliateDiscountRate > 0 ? getAffiliateReferralCode() : undefined,
      });
      const paymentLink = result.paymentLink;

      if (result.success && paymentLink) {
        window.location.href = paymentLink;
      } else {
        const errorMsg = result.error ?? "Failed to initiate payment. Please try again.";
        toast.error(errorMsg);
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.data?.error) {
        const errorMessage = error?.response?.data?.message || error?.response?.data?.data?.error || "Failed to initiate payment.";
        toast.error(errorMessage);
      }
    } finally {
      setProcessingPayment(false);
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
    await onRefreshProfile();
    setPurchaseCreditsOpen(true);
  };


  return (
    <div className="space-y-6 max-w-2xl">
      {isFamily ? (
        /* ── Family account billing ── */
        <>
          {/* Family Plans Overview */}
          <div className={cn(DASHBOARD_GLASS_SURFACE, "p-6")}>
            <h2 className="text-base font-semibold text-heading mb-4">
              My family plans
            </h2>
            {loadingFamilyPackage ? (
              <div className="flex items-center gap-2 text-sm text-muted">
                <LucideLoader2 className="w-4 h-4 animate-spin" />
                Loading...
              </div>
            ) : activeFamilyPackages && activeFamilyPackages.length > 0 ? (
              <>
                {/* Summary stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-background-primary rounded-xl p-4">
                    <p className="text-xs text-muted mb-1">Active plans</p>
                    <p className="text-2xl font-serif text-heading">
                      {activeFamilyPackages.length}
                    </p>
                  </div>
                  <div className="bg-background-primary rounded-xl p-4">
                    <p className="text-xs text-muted mb-1">Trips remaining</p>
                    <p className="text-2xl font-serif text-heading">
                      {activeFamilyPackages.reduce(
                        (sum, p) => sum + (p.tripsAllowed - p.tripsUsed),
                        0,
                      )}
                    </p>
                  </div>
                  <div className="bg-background-primary rounded-xl p-4">
                    <p className="text-xs text-muted mb-1">Total members</p>
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
                              pkg.status === "ACTIVE"
                                ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                                : "text-muted bg-muted/10 border-border-light",
                            )}
                          >
                            {pkg.status}
                          </span>
                          <span className="text-xs text-muted">
                            {new Date(pkg.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-heading">
                          {pkg.currency === "NGN" ? "₦" : "$"}
                          {pkg.amountPaidMinor.toLocaleString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted">Trips used</p>
                          <p className="text-base font-serif text-heading">
                            {pkg.tripsUsed}
                            <span className="text-xs text-muted font-sans font-normal">
                              /{pkg.tripsAllowed}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted">Members</p>
                          <p className="text-base font-serif text-heading">
                            {pkg.totalMembers}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <LucideUsers className="w-8 h-8 text-muted/50 mx-auto mb-3" />
                <p className="text-sm text-muted">No active family plans</p>
                <p className="text-xs text-muted/70 mt-1">
                  Each plan covers one trip for your family. Purchase one
                  below to get started.
                </p>
              </div>
            )}
          </div>

          {/* Purchase History */}
          {familyPurchaseHistory && familyPurchaseHistory.length > 0 && (
            <div className={cn(DASHBOARD_GLASS_SURFACE, "p-6")}>
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
                          pkg.status === "ACTIVE"
                            ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                            : pkg.status === "EXHAUSTED"
                              ? "text-slate-500 bg-slate-100 border-slate-200"
                              : "text-muted bg-muted/10 border-border-light",
                        )}
                      >
                        {pkg.status}
                      </span>
                      <span className="text-xs text-muted">
                        {new Date(pkg.createdAt).toLocaleDateString()} —{pkg.tripsUsed}/{pkg.tripsAllowed} trips
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

          {/* Buy Another Family Plan */}
          <div className={cn(DASHBOARD_GLASS_SURFACE, "p-6")}>
            <h2 className="text-base font-semibold text-heading mb-4">
              {activeFamilyPackages && activeFamilyPackages.length > 0
                ? "Buy another family plan"
                : "Available family plan"}
            </h2>
            <p className="text-xs text-muted mb-4">
              Each family plan covers one trip for up to 6 family members.
              Need more trips? Simply purchase additional plans.
            </p>
            {familyPlans.map((plan) => (
              <div key={plan.id} className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-heading mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-serif text-heading">
                    {formatFamilyPlanPrice(plan, userBillingCurrency)}
                  </span>
                  <span className="text-xs text-muted">{plan.priceNote}</span>
                </div>

                <div className="bg-background-primary rounded-xl p-4">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                    What's included
                  </p>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-xs text-heading"
                      >
                        <LucideCheck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to="/dashboard/buy-family-plan"
                  className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors duration-200 inline-flex items-center justify-center gap-2"
                >
                  {activeFamilyPackages && activeFamilyPackages.length > 0
                    ? "Add another plan"
                    : "Purchase family plan"}
                  <LucideArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* ── Standard billing (individual/company) ── */
        <>
          {/* Credits Overview */}
          <div className={cn(DASHBOARD_GLASS_SURFACE, "p-6")}>
            <h2 className="text-base font-semibold text-heading mb-4">
              Credits
            </h2>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-serif text-heading">
                {user?.credits ?? 0}
              </span>
              <span className="text-sm text-muted">credits remaining</span>
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
              {isFreeUser
                ? "Upgrade plan"
                : isCompanyUser
                  ? "Request credits"
                  : "Purchase credits"}
            </button>
          </div>

          {/* Billing currency */}
          <div className={cn(DASHBOARD_GLASS_SURFACE, "p-6")}>
            <h2 className="text-base font-semibold text-heading mb-1">
              Billing currency
            </h2>
            {isCompanyUser ? (
              <p className="text-xs text-muted mb-4">
                Your billing currency is set by{" "}
                <span className="font-semibold text-heading">
                  {company?.name}
                </span>{" "}
                and cannot be changed here.
              </p>
            ) : (
              <p className="text-xs text-muted mb-4">
                Choose the currency for credit purchases.
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {(Object.keys(CURRENCY_SYMBOLS) as BillingCurrency[]).map(
                (c) => {
                  const symbol = CURRENCY_SYMBOLS[c];
                  const perCredit =
                    c === "USD" ? basePriceUsd : basePriceNgn;
                  const selected = isCompanyUser
                    ? activeCurrency === c
                    : currencyForm === c;
                  return (
                    <button
                      key={c}
                      disabled={isCompanyUser}
                      onClick={() =>
                        !isCompanyUser && setCurrencyForm(c)
                      }
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                        selected
                          ? "border-accent bg-accent/5 text-accent"
                          : "border-border-light text-muted hover:border-accent/40"
                      } ${isCompanyUser ? "cursor-default opacity-60" : "cursor-pointer"}`}
                    >
                      <span className="text-lg">{symbol}</span>
                      <span className="text-xs font-medium">{c}</span>
                      <span className="text-xs text-muted">
                        {symbol}
                        {perCredit.toLocaleString()}/credit
                      </span>
                    </button>
                  );
                },
              )}
            </div>
            {!isCompanyUser && (
              <div className="flex items-center justify-between pt-4 border-t border-border-light/50">
                <p className="text-xs text-muted">
                  1 credit = {currencySymbol}
                  {pricePerCredit.toLocaleString()} {currencyForm}
                </p>
                <button
                  onClick={handleSaveCurrency}
                  disabled={savingCurrency || currencyForm === user?.billing_currency}
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

          {/* Your plan */}
          <div className={cn(DASHBOARD_GLASS_SURFACE, "p-6")}>
            <h2 className="text-base font-semibold text-heading mb-4">
              Your plan
            </h2>
            {(() => {
              const plan = user?.user_credit_plan;
              const planName =
                plan?.displayName ??
                (isCompanyUser ? "Company" : "Individual");
              const planDescription =
                plan?.description ??
                (isCompanyUser
                  ? "Organisational billing"
                  : "Pay-per-plan pricing");
              const basePriceUsd = plan?.basePriceUsd ?? null;
              const planCode = plan?.code ?? null;
              const planBadgeColor =
                planCode === "PREMIUM"
                  ? "text-amber-700 bg-amber-50 border-amber-200"
                  : planCode === "STANDARD"
                    ? "text-accent bg-accent/10 border-accent/20"
                    : "text-muted bg-muted/10 border-border-light";
              return (
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-heading">
                          {planName}
                        </p>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${planBadgeColor}`}
                        >
                          Active
                        </span>
                      </div>
                      {basePriceUsd !== null && basePriceUsd > 0 && (
                        <p className="text-xs text-accent font-semibold mb-1">
                          ${basePriceUsd.toFixed(0)} USD per credit
                        </p>
                      )}
                      {basePriceUsd === 0 && (
                        <p className="text-xs text-muted font-semibold mb-1">
                          Free tier
                        </p>
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
        </>
      )}

      {/* Plan Upgrade Modal */}
      <PlanUpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onUpgradeSuccess={handleUpgradeSuccess}
        currentPlan={user?.user_credit_plan?.code}
        currency={activeCurrency}
      />

      {/* Purchase Credits Modal */}
      {purchaseCreditsOpen && (
        <PurchaseCreditsModal
          isCompanyUser={isCompanyUser}
          creditCount={creditCount}
          setCreditCount={setCreditCount}
          requestReason={requestReason}
          setRequestReason={setRequestReason}
          requestingCredits={requestingCredits}
          processingPayment={processingPayment}
          currencySymbol={currencySymbol}
          activeCurrency={activeCurrency}
          pricePerCredit={pricePerCredit}
          affiliateDiscountRate={affiliateDiscountRate}
          user={user}
          onClose={() => setPurchaseCreditsOpen(false)}
          onCreditRequest={handleCreditRequest}
          onPurchaseCredits={handlePurchaseCredits}
        />
      )}
    </div>
  );
};

interface PurchaseCreditsModalProps {
  isCompanyUser: boolean;
  creditCount: number;
  setCreditCount: (count: number) => void;
  requestReason: string;
  setRequestReason: (reason: string) => void;
  requestingCredits: boolean;
  processingPayment: boolean;
  currencySymbol: string;
  activeCurrency: BillingCurrency;
  pricePerCredit: number;
  affiliateDiscountRate: number;
  user: {
    user_credit_plan?: import("../../../api/types").CreditPlan | null;
  } | null;
  onClose: () => void;
  onCreditRequest: () => void;
  onPurchaseCredits: () => void;
}

const PurchaseCreditsModal = ({
  isCompanyUser,
  creditCount,
  setCreditCount,
  requestReason,
  setRequestReason,
  requestingCredits,
  processingPayment,
  currencySymbol,
  activeCurrency,
  pricePerCredit,
  affiliateDiscountRate,
  user,
  onClose,
  onCreditRequest,
  onPurchaseCredits,
}: PurchaseCreditsModalProps) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cn(
          DASHBOARD_GLASS_SURFACE,
          "relative w-full max-w-sm sm:max-w-md p-5 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-heading hover:bg-background-primary transition-colors duration-200 cursor-pointer"
        >
          <LucideX className="w-4 h-4" />
        </button>

        {isCompanyUser ? (
          /* ── Company user view - Request credits from HR ── */
          <>
            <h2 className="text-base font-semibold text-heading mb-1">
              Request credits
            </h2>
            <p className="text-xs text-muted mb-6">
              Submit a credit request to your HR department.
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
                  setCreditCount(Math.max(1, Number(e.target.value)))
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
                onChange={(e) => setRequestReason(e.target.value)}
                rows={3}
                className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors duration-200 resize-none"
                placeholder="Why do you need these credits?"
              />
            </div>

            <button
              onClick={onCreditRequest}
              disabled={requestingCredits}
              className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm cursor-pointer hover:bg-accent/90 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {requestingCredits ? (
                <>
                  <LucideLoader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <LucideSend className="w-4 h-4" />
                  Submit to HR
                </>
              )}
            </button>
          </>
        ) : (
          /* ── Individual user view ── */
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
                { credits: 1, label: "1 credit", popular: false },
                { credits: 5, label: "5 credits", popular: false },
                { credits: 10, label: "10 credits", popular: true },
              ].map((tier) => {
                const basePrice = pricePerCredit * tier.credits;
                const discountAmount =
                  affiliateDiscountRate > 0
                    ? Math.round(basePrice * affiliateDiscountRate / 100)
                    : 0;
                const finalPrice = basePrice - discountAmount;
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
                    <div className="text-2xl font-serif text-heading mb-1 mt-2">
                      {tier.credits}
                    </div>
                    <div className="text-xs text-muted mb-2">
                      {tier.label}
                    </div>
                    {affiliateDiscountRate > 0 ? (
                      <div>
                        <div className="text-sm text-muted line-through">
                          {currencySymbol}
                          {basePrice.toLocaleString()}
                        </div>
                        <div className="text-lg font-semibold text-heading">
                          {currencySymbol}
                          {finalPrice.toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <div className="text-lg font-semibold text-heading">
                        {currencySymbol}
                        {basePrice.toLocaleString()}
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
                onChange={(e) =>
                  setCreditCount(
                    Math.max(1, Math.min(100, Number(e.target.value))),
                  )
                }
                className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors duration-200"
                placeholder="Enter number of credits"
              />
            </div>

            {/* Pricing summary */}
            <div className="bg-background-primary rounded-xl p-4 mb-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Credits</span>
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
                  {pricePerCredit.toLocaleString()}
                </span>
              </div>
              {affiliateDiscountRate > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-700 font-medium flex items-center gap-1">
                    <LucideTag className="w-3 h-3" />
                    Affiliate discount ({affiliateDiscountRate}%)
                  </span>
                  <span className="text-sm font-semibold text-green-700">
                    -
                    {currencySymbol}
                    {Math.round(
                      (pricePerCredit * creditCount * affiliateDiscountRate) /
                        100,
                    ).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-border-light/50 flex items-center justify-between">
                <span className="text-xs font-semibold text-muted">
                  Total ({activeCurrency})
                </span>
                <span className="text-lg font-bold text-heading">
                  {currencySymbol}
                  {(
                    affiliateDiscountRate > 0
                      ? pricePerCredit * creditCount -
                        Math.round(
                          (pricePerCredit * creditCount * affiliateDiscountRate) /
                            100,
                        )
                      : pricePerCredit * creditCount
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={onPurchaseCredits}
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
  );
};
export default BillingTab;

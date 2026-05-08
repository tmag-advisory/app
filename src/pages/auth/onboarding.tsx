import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LucideUser, LucideBuilding2, LucideArrowRight, LucideArrowLeft, LucideCheck, LucideGift, LucideZap, LucideShield, LucideActivity, LucideMinus, LucidePlus, LucideSparkles } from "lucide-react";
import { useUpsertOnboarding, useAdvanceOnboardingStage, useUpdateProfile, useOnboarding, useValidateCompanyCode, useMyCompanies, useInitiateCreditPurchase } from "../../api/hooks";
import type { BillingCurrency } from "../../api/types";
import { useOnboardingStore } from "../../context/OnboardingContext";
import { useAuth } from "../../context/AuthContext";
import { getOnboardingCompletionRedirect, performRedirect } from "../../lib/roleRedirect";
import { useCurrencyStore } from "../../stores/currencyStore";
import CountryPicker from "../../components/CountryPicker";
import { getAffiliateReferralCode, getStoredAffiliateDiscountRate } from "../../lib/affiliateTracking";

// ─── Motion Variants ─────────────────────────────────────────

const stepVariants = {
    enter: (dir: number) => ({
        x: dir > 0 ? 80 : -80,
        opacity: 0,
        scale: 0.96,
    }),
    center: {
        x: 0,
        opacity: 1,
        scale: 1,
        transition: { type: "spring" as const, stiffness: 300, damping: 30 },
    },
    exit: (dir: number) => ({
        x: dir > 0 ? -80 : 80,
        opacity: 0,
        scale: 0.96,
        transition: { duration: 0.2, ease: "easeIn" as const },
    }),
};

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, type: "spring" as const, stiffness: 300, damping: 28 },
    }),
};

// const CONSENT_TEXT =
//     "I hereby give Travel Medicine Advisory Global my explicit consent to collect, process, and store my personal and sensitive health information (including medical history, medications, pregnancy status, and risk behaviours) for the sole purpose of generating my personalised travel health advisory plan.";
// const DATA_PROTECTION_TEXT =
//     "We protect your information with encryption, multi-factor authentication, and strict security measures. We comply with the Nigeria Data Protection Act (NDPA) 2023. Your data will not be sold or shared without your permission.";

const Onboarding = () => {
    const navigate = useNavigate();
    const { user, refreshProfile } = useAuth();
    const { setUserType: storeSetUserType, reset: resetOnboarding } = useOnboardingStore();
    const { selectedCurrency } = useCurrencyStore();
    const affiliateDiscountRate = getStoredAffiliateDiscountRate();
    const [searchParams] = useSearchParams();
    const { data: onboardingData } = useOnboarding();
    const { data: myCompanies } = useMyCompanies();

    if (user?.type?.toUpperCase() === "FAMILY") {
        navigate("/dashboard", { replace: true });
        return null;
    }

    // If user was invited (has a company membership already), prefill and lock fields
    const invitedCompany = myCompanies && myCompanies.length > 0 ? myCompanies[0] : null;
    const isInvitedUser = !!invitedCompany;

    // Show the buy-credits step only for Standard/Premium individual (non-invited) signups
    const planCode = user?.user_credit_plan?.code;
    const isPaidIndividualPlan = (planCode === "STANDARD" || planCode === "PREMIUM") && !isInvitedUser;

    // Get Credits is step 2 for paid individual users — shown after profile (name, phone, country),
    // before Welcome. Skip goes directly to Welcome.
    const steps = isPaidIndividualPlan
        ? ["User Type", "Profile", "Get Credits", "Welcome"]
        : ["User Type", "Profile", "Welcome"];

    const S_USERTYPE = 0;
    const S_PROFILE  = 1;
    const S_CREDITS  = isPaidIndividualPlan ? 2 : -1;
    const S_WELCOME  = isPaidIndividualPlan ? 3 : 2;

    const stage = user?.onboarding_stage ?? 0;
    const getInitialStep = () => {
        if (isPaidIndividualPlan) {
            if (stage >= 5) return S_WELCOME;
            if (stage >= 4) return S_CREDITS;
            if (stage >= 3) return S_PROFILE;
            return S_USERTYPE;
        }
        if (stage >= 5) return S_WELCOME;
        return Math.min(Math.max(stage - 2, 0), S_WELCOME);
    };
    const [step, setStep] = useState(getInitialStep);
    const didMountRefresh = useRef(false);
    const consumedPostPayment = useRef(false);

    // Consume ?step=welcome param from payment callback immediately on mount,
    // then remove it from the URL so re-renders don't re-trigger it.
    useEffect(() => {
        if (searchParams.get("step") === "welcome" && !consumedPostPayment.current) {
            consumedPostPayment.current = true;
            setStep(S_WELCOME);
            void navigate("/onboarding", { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const [creditsToBuy, setCreditsToBuy] = useState(1);

    // Belt-and-suspenders: sync the latest profile on mount so user_credit_plan
    // is fresh even if we bypassed a verify flow that already refreshed.
    useEffect(() => {
        if (didMountRefresh.current) return;
        didMountRefresh.current = true;
        void refreshProfile();
    }, [refreshProfile]);
    const initiatePurchase = useInitiateCreditPurchase();
    const [direction, setDirection] = useState(1);
    const [userType, setUserType] = useState<"individual" | "company" | null>(null);
    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        nationality: "",
        companyCode: "",
    });
    const [error, setError] = useState("");
    const [debouncedCode, setDebouncedCode] = useState("");
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { data: codeValidation, isFetching: codeValidating } = useValidateCompanyCode(debouncedCode);
    const codeIsValid = codeValidation?.valid === true;
    const codeIsInvalid = debouncedCode.length > 0 && !codeValidating && codeValidation?.valid === false;

    const handleCompanyCodeChange = (value: string) => {
        setProfile(prev => ({ ...prev, companyCode: value }));
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => setDebouncedCode(value.trim()), 500);
    };

    const SetProfileCall = useCallback(() => {
        if (user) {
            setProfile(prev => ({
                ...prev,
                firstName: user.first_name || "",
                lastName: user.last_name || "",
                phone: user.phone || "",
            }));
        }
    }, [user]);

    useEffect(() => {
        if (user) SetProfileCall();
    }, [SetProfileCall, user]);

    useEffect(() => {
        if (onboardingData) {
            if (onboardingData.userType) {
                setUserType(onboardingData.userType as "individual" | "company");
            }
            setProfile(prev => ({
                ...prev,
                nationality: onboardingData.nationality || "",
                companyCode: onboardingData.companyCode || "",
            }));
        }
    }, [onboardingData]);

    // Prefill for invited users who already have a company membership
    useEffect(() => {
        if (invitedCompany) {
            setUserType("company");
            setProfile(prev => ({
                ...prev,
                companyCode: invitedCompany.company_code || "",
            }));
            setDebouncedCode(invitedCompany.company_code || "");
        }
    }, [invitedCompany]);

    useEffect(() => {
        if(user && user.extend && user.extend.role_name.toLowerCase() === "individual") {
            setUserType(user?.extend?.role_name.toLowerCase() as "individual" | "company");
        }
    }, []);

    const upsertOnboarding = useUpsertOnboarding();
    const advanceStage = useAdvanceOnboardingStage();
    const updateProfile = useUpdateProfile();

    const goTo = (next: number) => {
        setDirection(next > step ? 1 : -1);
        setError("");
        setStep(next);
    };

    const handleUserTypeNext = async () => {
        if (!userType) return;
        setError("");
        try {
            storeSetUserType(userType);
            await upsertOnboarding.mutateAsync({ userType: userType });
            await advanceStage.mutateAsync({ stage: 3 });
            await refreshProfile();
            goTo(S_PROFILE);
        } catch {
            setError("Failed to save. Please try again.");
        }
    };

    const handleProfileNext = async () => {
        setError("");
        if (userType === "company" && !isInvitedUser && !profile.companyCode.trim()) {
            setError("A company invite code is required. Please enter your company code.");
            return;
        }
        if (userType === "company" && !isInvitedUser && !codeIsValid) {
            setError("Please enter a valid company code before continuing.");
            return;
        }
        try {
            const firstName = profile.firstName.trim();
            const lastName = profile.lastName.trim();

            await updateProfile.mutateAsync({
                first_name: firstName,
                last_name: lastName,
                phone: profile.phone,
            });
            await upsertOnboarding.mutateAsync({
                nationality: profile.nationality,
                companyCode: profile.companyCode,
            });
            await advanceStage.mutateAsync({ stage: 4 });
            await refreshProfile();
            goTo(isPaidIndividualPlan ? S_CREDITS : S_WELCOME);
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(msg || "Failed to save profile. Please try again.");
        }
    };

    const handleWelcomeNext = async () => {
        setError("");
        try {
            await upsertOnboarding.mutateAsync({ complete: true });
            await advanceStage.mutateAsync({ stage: 5 });
            await refreshProfile();
            resetOnboarding();
            const destination = getOnboardingCompletionRedirect(user, userType);
            performRedirect(destination, navigate);
        } catch {
            setError("Failed. Please try again.");
        }
    };

    const handleBuyCredits = async () => {
        setError("");
        try {
            const raw = await initiatePurchase.mutateAsync({
                credits: creditsToBuy,
                currency: (selectedCurrency || "USD") as BillingCurrency,
                affiliate_referral_code: getAffiliateReferralCode(),
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = (raw as any).data ?? raw;
            const paymentLink: string = data.paymentLink ?? (raw as any).data?.paymentLink;
            if (paymentLink) {
                window.location.href = paymentLink;
            } else {
                setError(data.error ?? "Failed to initiate payment. Please try again.");
            }
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { data?: { error?: string }; message?: string } } })
                ?.response?.data?.data?.error
                ?? (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                ?? "Failed to initiate payment. Please try again.";
            setError(msg);
        }
    };

    const handleSkipCredits = () => {
        goTo(S_WELCOME);
    };

    const isLoading =
        upsertOnboarding.isPending ||
        advanceStage.isPending ||
        updateProfile.isPending ||
        initiatePurchase.isPending;

    const [isSavingExit, setIsSavingExit] = useState(false);

    const handleSaveAndExit = async () => {
        setIsSavingExit(true);
        try {
            if (step === S_USERTYPE && userType) {
                await upsertOnboarding.mutateAsync({ userType });
            } else if (step === S_PROFILE) {
                await updateProfile.mutateAsync({
                    first_name: profile.firstName.trim(),
                    last_name: profile.lastName.trim(),
                    phone: profile.phone,
                });
                await upsertOnboarding.mutateAsync({
                    nationality: profile.nationality,
                    companyCode: profile.companyCode,
                });
            }
        } catch {
            // still navigate so user isn't trapped
        } finally {
            setIsSavingExit(false);
        }
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-background-primary flex flex-col lg:flex-row">
            {/* Mobile Top bar / Desktop Minimal Header */}
            <div className="px-6 sm:px-8 py-5 flex items-center justify-between lg:fixed lg:w-full lg:z-30 lg:bg-background-primary/80 lg:backdrop-blur-md lg:border-b lg:border-border-light/60">
                <Link
                    to="/"
                    className="text-heading tracking-tight text-xl font-serif font-medium"
                >
                    TMAG
                </Link>
                <div className="flex items-center gap-5">
                    {/* Mobile step counter */}
                    <span className="lg:hidden text-xs text-muted tabular-nums">
                        Step {step + 1} of {steps.length}
                    </span>
                    <button
                        type="button"
                        onClick={() => void handleSaveAndExit()}
                        disabled={isLoading || isSavingExit}
                        className="text-xs font-medium text-muted hover:text-heading transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {isSavingExit ? "Saving…" : "Save & exit"}
                    </button>
                </div>
            </div>

            {/* Desktop Sidebar Progress */}
            <div className="hidden lg:flex lg:w-80 lg:shrink-0 lg:flex-col lg:border-r lg:border-border-light/60 lg:bg-background-primary lg:pt-20">
                <div className="flex-1 px-6 py-8">
                    {/* Progress header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-heading">
                                Onboarding
                            </span>
                            <span className="text-sm font-bold text-accent">
                                Step {step + 1} of {steps.length}
                            </span>
                        </div>
                        <div className="h-2 rounded-full bg-border-light overflow-hidden">
                            <motion.div
                                className="h-full rounded-full bg-accent"
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${((step + 0.5) / steps.length) * 100}%`,
                                }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        </div>
                    </div>

                    {/* Steps list - vertical */}
                    <nav className="space-y-2">
                        {steps.map((s, i) => (
                            <div
                                key={s}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                                    i === step ?
                                        "bg-accent/10 border border-accent/20"
                                    : i < step ? "text-accent"
                                    : "text-muted"
                                }`}
                            >
                                <div
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                                        i < step ? "bg-accent text-white"
                                        : i === step ? "bg-heading text-white"
                                        : "bg-border-light text-muted"
                                    }`}
                                >
                                    {i < step ?
                                        <LucideCheck className="w-3.5 h-3.5" />
                                    :   i + 1}
                                </div>
                                <span
                                    className={`text-sm font-medium ${i === step ? "text-heading" : ""}`}
                                >
                                    {s}
                                </span>
                            </div>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Mobile Progress - horizontal */}
            <div className="lg:hidden px-6 sm:px-8 max-w-2xl mx-auto w-full pt-4">
                <div className="flex items-center gap-2">
                    {steps.map((s, i) => (
                        <div key={s} className="flex-1">
                            <div className="relative h-1.5 rounded-full overflow-hidden bg-border-light/60">
                                <motion.div
                                    className="absolute inset-y-0 left-0 rounded-full bg-accent"
                                    initial={{ width: 0 }}
                                    animate={{
                                        width:
                                            i < step ? "100%"
                                            : i === step ? "50%"
                                            : "0%",
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        ease: "easeOut",
                                    }}
                                />
                            </div>
                            <p
                                className={`text-[11px] mt-1.5 font-medium transition-colors duration-300 ${
                                    i <= step ? "text-accent" : "text-muted/50"
                                }`}
                            >
                                {i < step && (
                                    <LucideCheck className="w-3 h-3 inline -mt-0.5" />
                                )}{" "}
                                {s}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center px-6 pb-16 pt-4 lg:pt-20">
                <div className="w-full max-w-lg">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait" custom={direction}>
                        {/* ── Step: User Type ──────────── */}
                        {step === S_USERTYPE && (
                            <motion.div
                                key="step-usertype"
                                custom={direction}
                                variants={stepVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                            >
                                <motion.h1
                                    custom={0}
                                    variants={fadeUp}
                                    initial="hidden"
                                    animate="visible"
                                    className="text-4xl sm:text-5xl font-serif text-heading mb-3 leading-tight"
                                >
                                    How will you
                                    <br />
                                    use TMAG?
                                </motion.h1>
                                <motion.p
                                    custom={1}
                                    variants={fadeUp}
                                    initial="hidden"
                                    animate="visible"
                                    className="text-base text-body mb-10 leading-relaxed"
                                >
                                    This helps us tailor your experience.
                                </motion.p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        {
                                            type: "individual" as const,
                                            icon: LucideUser,
                                            title: "Individual",
                                            desc: "I'm planning personal or family travel.",
                                        },
                                        {
                                            type: "company" as const,
                                            icon: LucideBuilding2,
                                            title: "Company",
                                            desc: "I am a member of an organization.",
                                        },
                                    ].map((opt, i) => (
                                        <motion.button
                                            key={opt.type}
                                            custom={i + 2}
                                            variants={fadeUp}
                                            initial="hidden"
                                            animate="visible"
                                            type="button"
                                            onClick={() =>
                                                !isInvitedUser &&
                                                setUserType(opt.type)
                                            }
                                            disabled={
                                                isInvitedUser &&
                                                opt.type !== "company"
                                            }
                                            className={`p-7 rounded-2xl border-2 text-left transition-all duration-200 ${
                                                userType === opt.type ?
                                                    "border-accent bg-accent/5 shadow-sm"
                                                :   "border-border-light hover:border-border"
                                            } ${isInvitedUser && opt.type !== "company" ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                                        >
                                            <opt.icon
                                                className={`w-7 h-7 mb-4 transition-colors ${
                                                    userType === opt.type ?
                                                        "text-accent"
                                                    :   "text-muted"
                                                }`}
                                            />
                                            <h3 className="text-lg font-semibold text-heading mb-1">
                                                {opt.title}
                                            </h3>
                                            <p className="text-sm text-body">
                                                {opt.desc}
                                            </p>
                                        </motion.button>
                                    ))}
                                </div>

                                <motion.button
                                    custom={4}
                                    variants={fadeUp}
                                    initial="hidden"
                                    animate="visible"
                                    onClick={handleUserTypeNext}
                                    disabled={!userType || isLoading}
                                    className="w-full mt-8 py-3.5 rounded-2xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    {isLoading ?
                                        "Saving…"
                                    :   <>
                                            Continue{" "}
                                            <LucideArrowRight className="w-4 h-4" />
                                        </>
                                    }
                                </motion.button>
                            </motion.div>
                        )}

                        {/* ── Step: Profile ─────────────── */}
                        {step === S_PROFILE && (
                            <motion.div
                                key="step-profile"
                                custom={direction}
                                variants={stepVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                            >
                                <motion.h1
                                    custom={0}
                                    variants={fadeUp}
                                    initial="hidden"
                                    animate="visible"
                                    className="text-4xl sm:text-5xl font-serif text-heading mb-3 leading-tight"
                                >
                                    Tell us about
                                    <br />
                                    yourself.
                                </motion.h1>
                                <motion.p
                                    custom={1}
                                    variants={fadeUp}
                                    initial="hidden"
                                    animate="visible"
                                    className="text-base text-body mb-10 leading-relaxed"
                                >
                                    Basic info to personalize your plans.
                                </motion.p>

                                <motion.div
                                    custom={2}
                                    variants={fadeUp}
                                    initial="hidden"
                                    animate="visible"
                                    className="space-y-5"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                                First name
                                            </label>
                                            <input
                                                type="text"
                                                value={profile.firstName}
                                                onChange={(e) =>
                                                    setProfile({
                                                        ...profile,
                                                        firstName:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="Sarah"
                                                className="w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-3.5 text-base text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-colors duration-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                                Last name
                                            </label>
                                            <input
                                                type="text"
                                                value={profile.lastName}
                                                onChange={(e) =>
                                                    setProfile({
                                                        ...profile,
                                                        lastName:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="Kimani"
                                                className="w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-3.5 text-base text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-colors duration-200"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                            Phone (optional)
                                        </label>
                                        <input
                                            type="tel"
                                            value={profile.phone}
                                            onChange={(e) =>
                                                setProfile({
                                                    ...profile,
                                                    phone: e.target.value,
                                                })
                                            }
                                            placeholder="+1 (555) 123-4567"
                                            className="w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-3.5 text-base text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-colors duration-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                            Nationality
                                        </label>
                                        <CountryPicker
                                            value={profile.nationality}
                                            onChange={(name) =>
                                                setProfile({
                                                    ...profile,
                                                    nationality: name,
                                                })
                                            }
                                            inputClassName="w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-3.5 pr-10 text-base text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-colors duration-200"
                                            placeholder="United States"
                                        />
                                    </div>
                                    {userType === "company" && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                                opacity: 1,
                                                height: "auto",
                                            }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                                Company invite code
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={profile.companyCode}
                                                    onChange={(e) =>
                                                        !isInvitedUser &&
                                                        handleCompanyCodeChange(
                                                            e.target.value,
                                                        )
                                                    }
                                                    readOnly={isInvitedUser}
                                                    placeholder="TMA-XXXX"
                                                    className={`w-full border-2 rounded-2xl px-5 py-3.5 pr-12 text-base text-heading placeholder:text-muted/40 outline-none transition-colors duration-200 ${
                                                        isInvitedUser ?
                                                            "bg-button-secondary border-border-light/60 cursor-not-allowed"
                                                        : codeIsValid ?
                                                            "bg-white border-green-400 focus:border-green-500"
                                                        : codeIsInvalid ?
                                                            "bg-white border-red-400 focus:border-red-500"
                                                        :   "bg-white border-border-light/60 focus:border-accent"
                                                    }`}
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    {codeValidating && (
                                                        <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                                                    )}
                                                    {!codeValidating &&
                                                        codeIsValid && (
                                                            <LucideCheck className="w-4 h-4 text-green-500" />
                                                        )}
                                                    {!codeValidating &&
                                                        codeIsInvalid && (
                                                            <span className="text-red-500 text-lg leading-none">
                                                                ✕
                                                            </span>
                                                        )}
                                                </div>
                                            </div>
                                            {isInvitedUser && (
                                                <p className="mt-1.5 text-xs text-green-600">
                                                    Pre-verified — you were
                                                    invited to this company.
                                                </p>
                                            )}
                                            {!isInvitedUser &&
                                                codeIsInvalid && (
                                                    <p className="mt-1.5 text-xs text-red-500">
                                                        No company found with
                                                        this code.
                                                    </p>
                                                )}
                                            {!isInvitedUser && codeIsValid && (
                                                <p className="mt-1.5 text-xs text-green-600">
                                                    Company code verified.
                                                </p>
                                            )}
                                        </motion.div>
                                    )}
                                </motion.div>

                                <motion.div
                                    custom={3}
                                    variants={fadeUp}
                                    initial="hidden"
                                    animate="visible"
                                    className="flex gap-3 mt-8"
                                >
                                    <button
                                        onClick={() => goTo(S_USERTYPE)}
                                        disabled={isLoading}
                                        className="py-3.5 px-6 rounded-2xl bg-button-secondary text-heading font-semibold text-sm cursor-pointer hover:bg-border-light transition-colors duration-200 flex items-center gap-2 disabled:opacity-40"
                                    >
                                        <LucideArrowLeft className="w-4 h-4" />{" "}
                                        Back
                                    </button>
                                    <button
                                        onClick={handleProfileNext}
                                        disabled={
                                            isLoading ||
                                            (!isInvitedUser &&
                                                codeValidating) ||
                                            (!isInvitedUser &&
                                                userType === "company" &&
                                                profile.companyCode.trim()
                                                    .length > 0 &&
                                                !codeIsValid)
                                        }
                                        className="flex-1 py-3.5 rounded-2xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40"
                                    >
                                        {isLoading ?
                                            "Saving…"
                                        : codeValidating ?
                                            "Checking…"
                                        :   <>
                                                Continue{" "}
                                                <LucideArrowRight className="w-4 h-4" />
                                            </>
                                        }
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* ── Step: Welcome ─────────────── */}
                        {step === S_WELCOME && (
                            <motion.div
                                key="step-welcome"
                                custom={direction}
                                variants={stepVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                className="text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0, rotate: -20 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{
                                        delay: 0.1,
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 18,
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8"
                                >
                                    <LucideGift className="w-4 h-4 text-accent" />
                                    <span className="text-sm font-semibold text-accent">
                                        1 free advisory credit included
                                    </span>
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-4xl sm:text-5xl font-serif text-heading mb-4 leading-tight"
                                >
                                    You're ready to
                                    <br />
                                    travel smarter.
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-base text-body mb-10 leading-relaxed max-w-sm mx-auto"
                                >
                                    TMAG gives you intelligent travel health
                                    advisories tailored to your destination,
                                    history, and health needs.
                                </motion.p>

                                {/* Credit explanation */}
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35 }}
                                    className="mb-8 p-4 rounded-xl bg-accent/5 border border-accent/20 max-w-sm mx-auto"
                                >
                                    <p className="text-sm text-heading font-semibold mb-1">
                                        Your plan includes 1 free health report
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="space-y-3 mb-10 text-left max-w-sm mx-auto"
                                >
                                    {[
                                        {
                                            icon: LucideZap,
                                            label: "Smart Health Advisories",
                                            desc: "Personalised recommendations for every trip",
                                        },
                                        {
                                            icon: LucideShield,
                                            label: "Safety & Risk Alerts",
                                            desc: "Country-level health risks and precautions",
                                        },
                                        {
                                            icon: LucideActivity,
                                            label: "Vaccination Guidance",
                                            desc: "Required and recommended vaccines per destination",
                                        },
                                    ].map((feature, i) => (
                                        <motion.div
                                            key={feature.label}
                                            custom={i + 5}
                                            variants={fadeUp}
                                            initial="hidden"
                                            animate="visible"
                                            className="flex items-start gap-4 p-4 rounded-2xl bg-button-secondary"
                                        >
                                            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                                                <feature.icon className="w-4 h-4 text-accent" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-heading">
                                                    {feature.label}
                                                </p>
                                                <p className="text-xs text-muted mt-0.5">
                                                    {feature.desc}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>

                                <motion.button
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                    onClick={handleWelcomeNext}
                                    disabled={isLoading}
                                    className="w-full py-4 rounded-2xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40"
                                >
                                    {isLoading ?
                                        "Setting up…"
                                    :   <>
                                            Get started{" "}
                                            <LucideArrowRight className="w-4 h-4" />
                                        </>
                                    }
                                </motion.button>
                            </motion.div>
                        )}

                        {/* ── Step: Get Credits (paid individual plans — shown first, before User Type) ── */}
                        {step === S_CREDITS &&
                            isPaidIndividualPlan &&
                            (() => {
                                const plan = user?.user_credit_plan;
                                const isPremium = plan?.code === "PREMIUM";
                                const basePricePerCredit =
                                    selectedCurrency === "NGN" ?
                                        (plan?.basePriceNgn ?? 0)
                                    :   (plan?.basePriceUsd ?? 0);
                                const pricePerCredit =
                                    affiliateDiscountRate > 0 ?
                                        basePricePerCredit * (1 - affiliateDiscountRate / 100)
                                    :   basePricePerCredit;
                                const symbol =
                                    selectedCurrency === "NGN" ? "₦" : "$";
                                const total = pricePerCredit * creditsToBuy;

                                return (
                                    <motion.div
                                        key="step-credits"
                                        custom={direction}
                                        variants={stepVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        className="text-center"
                                    >
                                        <motion.div
                                            initial={{ scale: 0, rotate: -20 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{
                                                delay: 0.1,
                                                type: "spring",
                                                stiffness: 260,
                                                damping: 18,
                                            }}
                                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 ${isPremium ? "bg-amber-50 border border-amber-200" : "bg-accent/10 border border-accent/20"}`}
                                        >
                                            <LucideSparkles
                                                className={`w-4 h-4 ${isPremium ? "text-amber-600" : "text-accent"}`}
                                            />
                                            <span
                                                className={`text-sm font-semibold ${isPremium ? "text-amber-700" : "text-accent"}`}
                                            >
                                                {plan?.displayName ?? "Paid"}{" "}
                                                plan selected
                                            </span>
                                        </motion.div>

                                        <motion.h1
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="text-4xl sm:text-5xl font-serif text-heading mb-3 leading-tight"
                                        >
                                            Stock up on
                                            <br />
                                            credits.
                                        </motion.h1>

                                        <motion.p
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="text-base text-body mb-2 leading-relaxed max-w-sm mx-auto"
                                        >
                                            Buy credits now to start generating
                                            plans.
                                        </motion.p>

                                        {/* 1 credit = 1 plan — bold callout */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.35 }}
                                            className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 rounded-xl bg-background-secondary text-heading"
                                        >
                                            <LucideZap className="w-4 h-4 shrink-0" />
                                            <span className="text-sm font-bold tracking-tight">
                                                1 credit = 1 travel health plan
                                            </span>
                                        </motion.div>

                                        {/* Credit stepper */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="mb-3"
                                        >
                                            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
                                                How many credits?
                                            </p>
                                            <div className="flex items-center justify-center gap-5">
                                                <button
                                                    onClick={() =>
                                                        setCreditsToBuy(
                                                            Math.max(
                                                                1,
                                                                creditsToBuy -
                                                                    1,
                                                            ),
                                                        )
                                                    }
                                                    className="w-11 h-11 rounded-2xl border-2 border-border-light flex items-center justify-center text-heading hover:border-accent hover:text-accent transition-colors"
                                                >
                                                    <LucideMinus className="w-4 h-4" />
                                                </button>
                                                <div className="text-center min-w-[4rem]">
                                                    <span className="text-5xl font-serif text-heading tabular-nums">
                                                        {creditsToBuy}
                                                    </span>
                                                    <p className="text-xs text-muted mt-1">
                                                        {creditsToBuy === 1 ?
                                                            "credit"
                                                        :   "credits"}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        setCreditsToBuy(
                                                            Math.min(
                                                                100,
                                                                creditsToBuy +
                                                                    1,
                                                            ),
                                                        )
                                                    }
                                                    className="w-11 h-11 rounded-2xl border-2 border-border-light flex items-center justify-center text-heading hover:border-accent hover:text-accent transition-colors"
                                                >
                                                    <LucidePlus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </motion.div>

                                        {/* Price summary */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.45 }}
                                            className="mb-8"
                                        >
                                            <p className="text-sm text-muted">
                                                {symbol}
                                                {pricePerCredit.toLocaleString()}{" "}
                                                per credit
                                                {affiliateDiscountRate > 0 && (
                                                    <span className="text-accent font-semibold">
                                                        {" "}
                                                        · {affiliateDiscountRate}% affiliate discount
                                                    </span>
                                                )}
                                                {creditsToBuy > 1 && (
                                                    <span className="text-heading font-semibold">
                                                        {" "}
                                                        · {symbol}
                                                        {total.toLocaleString()}{" "}
                                                        total
                                                    </span>
                                                )}
                                            </p>
                                        </motion.div>

                                        {/* Actions */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="space-y-3"
                                        >
                                            <button
                                                onClick={handleBuyCredits}
                                                disabled={isLoading}
                                                className={`w-full py-4 rounded-2xl font-semibold text-sm cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 ${isPremium ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-dark hover:bg-darkest text-background-primary"}`}
                                            >
                                                {isLoading ?
                                                    "Processing…"
                                                :   <>
                                                        Buy {creditsToBuy}{" "}
                                                        {creditsToBuy === 1 ?
                                                            "credit"
                                                        :   "credits"}{" "}
                                                        — {symbol}
                                                        {total.toLocaleString()}{" "}
                                                        <LucideArrowRight className="w-4 h-4" />
                                                    </>
                                                }
                                            </button>
                                            <button
                                                onClick={handleSkipCredits}
                                                className="w-full py-3 text-sm cursor-pointer text-muted hover:text-heading transition-colors"
                                            >
                                                Skip for now — Continue
                                            </button>
                                        </motion.div>
                                    </motion.div>
                                );
                            })()}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;

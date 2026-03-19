import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LucideUser, LucideBuilding2, LucideArrowRight, LucideArrowLeft, LucideClipboardList, LucideSparkles, LucideCheck, LucideGift, LucideZap, LucideShield, LucideActivity } from "lucide-react";
import { useUpsertOnboarding, useAdvanceOnboardingStage, useUpdateProfile, useOnboarding, useValidateCompanyCode, useMyCompanies } from "../../api/hooks";
import { useOnboardingStore } from "../../context/OnboardingContext";
import { useAuth } from "../../context/AuthContext";
import { canAccessHR } from "../../lib/canAccessHr";
import CountryPicker from "../../components/CountryPicker";

const steps = ["User Type", "Profile", "Welcome", "Questionnaire"];

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

const Onboarding = () => {
    const navigate = useNavigate();
    const { user, refreshProfile } = useAuth();
    const { setUserType: storeSetUserType, reset: resetOnboarding } = useOnboardingStore();

    const { data: onboardingData } = useOnboarding();
    const { data: myCompanies } = useMyCompanies();

    // If user was invited (has a company membership already), prefill and lock fields
    const invitedCompany = myCompanies && myCompanies.length > 0 ? myCompanies[0] : null;
    const isInvitedUser = !!invitedCompany;

    const stage = user?.onboarding_stage ?? 2;
    const initialStep = stage >= 5 ? 3 : Math.min(Math.max(stage - 2, 0), 3);
    const [step, setStep] = useState(initialStep);
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
            goTo(1);
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
            goTo(2);
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

            if (canAccessHR(user)) {
                resetOnboarding();
                navigate("/hr");
            } else {
                goTo(3);
            }
        } catch {
            setError("Failed. Please try again.");
        }
    };

    const handleSkipQuestionnaire = async () => {
        resetOnboarding();
        await refreshProfile();
        navigate(userType === "company" ? "/hr" : "/dashboard");
    };

    const handleStartQuestionnaire = () => {
        resetOnboarding();
        navigate("/onboarding/questionnaire");
    };

    const isLoading =
        upsertOnboarding.isPending ||
        advanceStage.isPending ||
        updateProfile.isPending;

    return (
        <div className="min-h-screen bg-background-primary flex flex-col">
            {/* Top bar */}
            <div className="px-6 sm:px-8 py-5 flex items-center justify-between">
                <Link to="/" className="text-heading tracking-tight text-xl font-serif font-medium">
                    TMAG
                </Link>
                <span className="text-xs text-muted tabular-nums">
                    Step {step + 1} of {steps.length}
                </span>
            </div>

            {/* Progress */}
            <div className="px-6 sm:px-8 max-w-2xl mx-auto w-full">
                <div className="flex items-center gap-2">
                    {steps.map((s, i) => (
                        <div key={s} className="flex-1">
                            <div className="relative h-1.5 rounded-full overflow-hidden bg-border-light/60">
                                <motion.div
                                    className="absolute inset-y-0 left-0 rounded-full bg-accent"
                                    initial={{ width: 0 }}
                                    animate={{ width: i < step ? "100%" : i === step ? "50%" : "0%" }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                />
                            </div>
                            <p className={`text-[11px] mt-1.5 font-medium transition-colors duration-300 ${i <= step ? "text-accent" : "text-muted/50"
                                }`}>
                                {i < step && <LucideCheck className="w-3 h-3 inline -mt-0.5" />} {s}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center px-6 pb-16 pt-4">
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
                        {/* ── Step 0: User Type ──────────── */}
                        {step === 0 && (
                            <motion.div
                                key="step-0"
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
                                    How will you<br />use TMAG?
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
                                    {([
                                        { type: "individual" as const, icon: LucideUser, title: "Individual", desc: "I'm planning personal or family travel." },
                                        { type: "company" as const, icon: LucideBuilding2, title: "Company", desc: "I am a member of an organization." },
                                    ]).map((opt, i) => (
                                        <motion.button
                                            key={opt.type}
                                            custom={i + 2}
                                            variants={fadeUp}
                                            initial="hidden"
                                            animate="visible"
                                            type="button"
                                            onClick={() => !isInvitedUser && setUserType(opt.type)}
                                            disabled={isInvitedUser && opt.type !== "company"}
                                            className={`p-7 rounded-2xl border-2 text-left transition-all duration-200 ${userType === opt.type
                                                ? "border-accent bg-accent/5 shadow-sm"
                                                : "border-border-light hover:border-border"
                                                } ${isInvitedUser && opt.type !== "company" ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                                        >
                                            <opt.icon className={`w-7 h-7 mb-4 transition-colors ${userType === opt.type ? "text-accent" : "text-muted"
                                                }`} />
                                            <h3 className="text-lg font-semibold text-heading mb-1">{opt.title}</h3>
                                            <p className="text-sm text-body">{opt.desc}</p>
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
                                    {isLoading ? "Saving…" : <>Continue <LucideArrowRight className="w-4 h-4" /></>}
                                </motion.button>
                            </motion.div>
                        )}

                        {/* ── Step 1: Profile ─────────────── */}
                        {step === 1 && (
                            <motion.div
                                key="step-1"
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
                                    Tell us about<br />yourself.
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
                                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">First name</label>
                                            <input
                                                type="text"
                                                value={profile.firstName}
                                                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                                placeholder="Sarah"
                                                className="w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-3.5 text-base text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-colors duration-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Last name</label>
                                            <input
                                                type="text"
                                                value={profile.lastName}
                                                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                                placeholder="Kimani"
                                                className="w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-3.5 text-base text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-colors duration-200"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Phone (optional)</label>
                                        <input
                                            type="tel"
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            placeholder="+1 (555) 123-4567"
                                            className="w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-3.5 text-base text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-colors duration-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Nationality</label>
                                        <CountryPicker
                                            value={profile.nationality}
                                            onChange={(name) => setProfile({ ...profile, nationality: name })}
                                            inputClassName="w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-3.5 pr-10 text-base text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-colors duration-200"
                                            placeholder="United States"
                                        />
                                    </div>
                                    {userType === "company" && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Company invite code</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={profile.companyCode}
                                                    onChange={(e) => !isInvitedUser && handleCompanyCodeChange(e.target.value)}
                                                    readOnly={isInvitedUser}
                                                    placeholder="TMA-XXXX"
                                                    className={`w-full border-2 rounded-2xl px-5 py-3.5 pr-12 text-base text-heading placeholder:text-muted/40 outline-none transition-colors duration-200 ${
                                                        isInvitedUser
                                                            ? "bg-button-secondary border-border-light/60 cursor-not-allowed"
                                                            : codeIsValid
                                                            ? "bg-white border-green-400 focus:border-green-500"
                                                            : codeIsInvalid
                                                            ? "bg-white border-red-400 focus:border-red-500"
                                                            : "bg-white border-border-light/60 focus:border-accent"
                                                    }`}
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    {codeValidating && (
                                                        <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                                                    )}
                                                    {!codeValidating && codeIsValid && (
                                                        <LucideCheck className="w-4 h-4 text-green-500" />
                                                    )}
                                                    {!codeValidating && codeIsInvalid && (
                                                        <span className="text-red-500 text-lg leading-none">✕</span>
                                                    )}
                                                </div>
                                            </div>
                                            {isInvitedUser && (
                                                <p className="mt-1.5 text-xs text-green-600">Pre-verified — you were invited to this company.</p>
                                            )}
                                            {!isInvitedUser && codeIsInvalid && (
                                                <p className="mt-1.5 text-xs text-red-500">No company found with this code.</p>
                                            )}
                                            {!isInvitedUser && codeIsValid && (
                                                <p className="mt-1.5 text-xs text-green-600">Company code verified.</p>
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
                                        onClick={() => goTo(0)}
                                        disabled={isLoading}
                                        className="py-3.5 px-6 rounded-2xl bg-button-secondary text-heading font-semibold text-sm cursor-pointer hover:bg-border-light transition-colors duration-200 flex items-center gap-2 disabled:opacity-40"
                                    >
                                        <LucideArrowLeft className="w-4 h-4" /> Back
                                    </button>
                                    <button
                                        onClick={handleProfileNext}
                                        disabled={isLoading || (!isInvitedUser && codeValidating) || (!isInvitedUser && userType === "company" && profile.companyCode.trim().length > 0 && !codeIsValid)}
                                        className="flex-1 py-3.5 rounded-2xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40"
                                    >
                                        {isLoading ? "Saving…" : codeValidating ? "Checking…" : <>Continue <LucideArrowRight className="w-4 h-4" /></>}
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* ── Step 2: Welcome ─────────────── */}
                        {step === 2 && (
                            <motion.div
                                key="step-2"
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
                                    transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8"
                                >
                                    <LucideGift className="w-4 h-4 text-accent" />
                                    <span className="text-sm font-semibold text-accent">1 free advisory credit included</span>
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-4xl sm:text-5xl font-serif text-heading mb-4 leading-tight"
                                >
                                    You're ready to<br />travel smarter.
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-base text-body mb-10 leading-relaxed max-w-sm mx-auto"
                                >
                                    TMAG gives you AI-powered travel health advisories tailored to your destination, history, and health needs.
                                </motion.p>

                                {/* Credit explanation */}
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35 }}
                                    className="mb-8 p-4 rounded-xl bg-accent/5 border border-accent/20 max-w-sm mx-auto"
                                >
                                    <p className="text-sm text-heading font-semibold mb-1">Your free plan includes 1 health report</p>
                                    <p className="text-xs text-muted">Additional reports are ₦5,000 each. No subscriptions, no hidden fees.</p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="space-y-3 mb-10 text-left max-w-sm mx-auto"
                                >
                                    {[
                                        { icon: LucideZap, label: "AI Health Advisories", desc: "Personalised recommendations for every trip" },
                                        { icon: LucideShield, label: "Safety & Risk Alerts", desc: "Country-level health risks and precautions" },
                                        { icon: LucideActivity, label: "Vaccination Guidance", desc: "Required and recommended vaccines per destination" },
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
                                                <p className="text-sm font-semibold text-heading">{feature.label}</p>
                                                <p className="text-xs text-muted mt-0.5">{feature.desc}</p>
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
                                    {isLoading ? "Setting up…" : <>Get started <LucideArrowRight className="w-4 h-4" /></>}
                                </motion.button>
                            </motion.div>
                        )}

                        {/* ── Step 3: Questionnaire Invite ── */}
                        {step === 3 && (
                            <motion.div
                                key="step-3"
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
                                    transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
                                    className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mx-auto mb-8"
                                >
                                    <LucideClipboardList className="w-10 h-10 text-accent" />
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-4xl sm:text-5xl font-serif text-heading mb-4 leading-tight"
                                >
                                    One more thing
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-base text-body mb-4 leading-relaxed max-w-sm mx-auto"
                                >
                                    Would you like to complete our comprehensive travel health questionnaire? This helps our Intelligence System provide highly personalised recommendations.
                                </motion.p>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex items-center gap-2 justify-center mb-10"
                                >
                                    <LucideSparkles className="w-4 h-4 text-accent" />
                                    <span className="text-sm font-semibold text-accent">Takes about 5 minutes</span>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="space-y-3"
                                >
                                    <button
                                        onClick={handleStartQuestionnaire}
                                        className="w-full py-4 rounded-2xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        Yes, let's do it <LucideArrowRight className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={handleSkipQuestionnaire}
                                        className="w-full py-3.5 rounded-2xl text-muted font-medium text-sm cursor-pointer hover:text-heading hover:bg-button-secondary transition-all duration-200"
                                    >
                                        Skip for now, I'll do it later
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;

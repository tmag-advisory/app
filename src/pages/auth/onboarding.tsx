import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LucideUser, LucideBuilding2, LucideArrowRight, LucideArrowLeft } from "lucide-react";
import AnimateIn from "../../components/animations/AnimateIn";
import { useUpsertOnboarding, useAdvanceOnboardingStage, useUpdateProfile, useCreateHealthProfile, useOnboarding, useMyHealthProfile, useUpdateHealthProfile } from "../../api/hooks";
import { useOnboardingStore } from "../../context/OnboardingContext";
import { useAuth } from "../../context/AuthContext";

const steps = ["User Type", "Profile", "Health"];

const Onboarding = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { setUserType: storeSetUserType, reset: resetOnboarding } = useOnboardingStore();

    const { data: onboardingData } = useOnboarding();
    const { data: healthProfileData } = useMyHealthProfile();

    // Derive initial step from the user's onboarding_stage stored on the server:
    // stage 2 → step 0 (User Type), stage 3 → step 1 (Profile), stage 4 → step 2 (Health)
    const initialStep = Math.min(Math.max((user?.onboarding_stage ?? 2) - 2, 0), 2);
    const [step, setStep] = useState(initialStep);
    const [userType, setUserType] = useState<"individual" | "company" | null>(null);
    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        nationality: "",
        companyCode: "",
    });
    const [health, setHealth] = useState({
        conditions: "",
        medications: "",
        allergies: "",
    });
    const [error, setError] = useState("");

    // Populate state from fetched data
    useEffect(() => {
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
        if (onboardingData) {
            if (onboardingData.user_type) {
                setUserType(onboardingData.user_type as "individual" | "company");
            }
            setProfile(prev => ({
                ...prev,
                nationality: onboardingData.nationality || "",
                companyCode: onboardingData.company_code || "",
            }));
        }
    }, [onboardingData]);

    useEffect(() => {
        if (healthProfileData) {
            setHealth({
                conditions: healthProfileData.conditions || "",
                medications: healthProfileData.medications || "",
                allergies: healthProfileData.allergies || "",
            });
        }
    }, [healthProfileData]);

    const upsertOnboarding = useUpsertOnboarding();
    const advanceStage = useAdvanceOnboardingStage();
    const updateProfile = useUpdateProfile();
    const createHealthProfile = useCreateHealthProfile();
    const updateHealthProfile = useUpdateHealthProfile();

    const prev = () => { setError(""); setStep((s) => Math.max(s - 1, 0)); };

    // Step 0 → Step 1: save user type and advance stage to 3
    const handleUserTypeNext = async () => {
        if (!userType) return;
        setError("");
        try {
            storeSetUserType(userType);
            await upsertOnboarding.mutateAsync({ user_type: userType });
            await advanceStage.mutateAsync({ stage: 3 });
            setStep(1);
        } catch {
            setError("Failed to save. Please try again.");
        }
    };

    // Step 1 → Step 2: save profile details and advance stage to 4
    const handleProfileNext = async () => {
        setError("");
        try {
            const [firstName, ...rest] = profile.firstName.trim().split(" ");
            const lastName = rest.join(" ") || profile.lastName;
            await updateProfile.mutateAsync({
                first_name: firstName || profile.firstName,
                last_name: lastName,
                phone: profile.phone,
            });
            await upsertOnboarding.mutateAsync({
                nationality: profile.nationality,
                company_code: profile.companyCode,
            });
            await advanceStage.mutateAsync({ stage: 4 });
            setStep(2);
        } catch {
            setError("Failed to save profile. Please try again.");
        }
    };

    // Step 2: save health profile, complete onboarding and navigate
    const handleFinish = async () => {
        setError("");
        try {
            if (!user) {
                setError("User not found");
                return;
            }
            if (health.conditions || health.medications || health.allergies) {
                if (healthProfileData?.id) {
                    await updateHealthProfile.mutateAsync({
                        id: healthProfileData.id,
                        data: {
                            conditions: health.conditions,
                            medications: health.medications,
                            allergies: health.allergies,
                        }
                    });
                } else {
                    await createHealthProfile.mutateAsync({
                        conditions: health.conditions,
                        medications: health.medications,
                        allergies: health.allergies,
                        user_id: user?.id as number,
                    });
                }
            }
            await upsertOnboarding.mutateAsync({ complete: true });
            await advanceStage.mutateAsync({ stage: 5 });
            resetOnboarding();
            navigate(userType === "company" ? "/hr" : "/dashboard");
        } catch {
            setError("Failed to complete onboarding. Please try again.");
        }
    };

    const isLoading =
        upsertOnboarding.isPending ||
        advanceStage.isPending ||
        updateProfile.isPending ||
        createHealthProfile.isPending ||
        updateHealthProfile.isPending;

    return (
        <AnimateIn type="fade">
            {/* Progress bar */}
            <div className="flex items-center gap-2 mb-8">
                {steps.map((s, i) => (
                    <div key={s} className="flex-1">
                        <div className={`h-1 rounded-full transition-colors duration-300 ${i <= step ? "bg-accent" : "bg-border-light"}`} />
                        <p className={`text-xs mt-1.5 ${i <= step ? "text-accent font-semibold" : "text-muted"}`}>
                            {s}
                        </p>
                    </div>
                ))}
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                </div>
            )}

            {/* Step 1: User type */}
            {step === 0 && (
                <div>
                    <h1 className="text-3xl font-serif text-heading mb-2">
                        How will you use TMAG?
                    </h1>
                    <p className="text-sm text-body mb-8">
                        This helps us tailor your experience.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setUserType("individual")}
                            className={`p-6 rounded-2xl border-2 text-left cursor-pointer transition-all duration-200 ${userType === "individual" ? "border-accent bg-accent/5" : "border-border-light hover:border-border"}`}
                        >
                            <LucideUser className={`w-6 h-6 mb-3 ${userType === "individual" ? "text-accent" : "text-muted"}`} />
                            <h3 className="text-base font-semibold text-heading mb-1">Individual</h3>
                            <p className="text-xs text-body">I'm planning personal or family travel.</p>
                        </button>
                        <button
                            type="button"
                            onClick={() => setUserType("company")}
                            className={`p-6 rounded-2xl border-2 text-left cursor-pointer transition-all duration-200 ${userType === "company" ? "border-accent bg-accent/5" : "border-border-light hover:border-border"}`}
                        >
                            <LucideBuilding2 className={`w-6 h-6 mb-3 ${userType === "company" ? "text-accent" : "text-muted"}`} />
                            <h3 className="text-base font-semibold text-heading mb-1">Company</h3>
                            <p className="text-xs text-body">I manage travel for an organization.</p>
                        </button>
                    </div>
                    <button
                        onClick={handleUserTypeNext}
                        disabled={!userType || isLoading}
                        className="w-full mt-6 py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        {isLoading ? "Saving…" : <>Continue <LucideArrowRight className="w-4 h-4" /></>}
                    </button>
                </div>
            )}

            {/* Step 2: Profile */}
            {step === 1 && (
                <div>
                    <h1 className="text-3xl font-serif text-heading mb-2">
                        Tell us about yourself.
                    </h1>
                    <p className="text-sm text-body mb-8">
                        Basic info to personalize your plans.
                    </p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Full name</label>
                            <input
                                type="text"
                                value={profile.firstName}
                                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                placeholder="Sarah Kimani"
                                className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Phone (optional)</label>
                            <input
                                type="tel"
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                placeholder="+1 (555) 123-4567"
                                className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Nationality</label>
                            <input
                                type="text"
                                value={profile.nationality}
                                onChange={(e) => setProfile({ ...profile, nationality: e.target.value })}
                                placeholder="United States"
                                className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                            />
                        </div>
                        {userType === "company" && (
                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Company invite code</label>
                                <input
                                    type="text"
                                    value={profile.companyCode}
                                    onChange={(e) => setProfile({ ...profile, companyCode: e.target.value })}
                                    placeholder="TMAG-XXXX"
                                    className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={prev} disabled={isLoading} className="py-3 px-5 rounded-xl bg-button-secondary text-heading font-semibold text-sm cursor-pointer hover:bg-border-light transition-colors duration-200 flex items-center gap-2 disabled:opacity-40">
                            <LucideArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <button onClick={handleProfileNext} disabled={isLoading} className="flex-1 py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40">
                            {isLoading ? "Saving…" : <>Continue <LucideArrowRight className="w-4 h-4" /></>}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Health profile */}
            {step === 2 && (
                <div>
                    <h1 className="text-3xl font-serif text-heading mb-2">
                        Health profile <span className="text-muted text-lg">(optional)</span>
                    </h1>
                    <p className="text-sm text-body mb-8">
                        This helps our AI tailor recommendations. You can skip and fill this in later.
                    </p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Pre-existing conditions</label>
                            <textarea
                                value={health.conditions}
                                onChange={(e) => setHealth({ ...health, conditions: e.target.value })}
                                placeholder="e.g. Asthma, Diabetes Type 2"
                                rows={2}
                                className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200 resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Current medications</label>
                            <textarea
                                value={health.medications}
                                onChange={(e) => setHealth({ ...health, medications: e.target.value })}
                                placeholder="e.g. Metformin 500mg, Ventolin inhaler"
                                rows={2}
                                className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200 resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Allergies</label>
                            <textarea
                                value={health.allergies}
                                onChange={(e) => setHealth({ ...health, allergies: e.target.value })}
                                placeholder="e.g. Penicillin, Sulfa drugs"
                                rows={2}
                                className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200 resize-none"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={prev} disabled={isLoading} className="py-3 px-5 rounded-xl bg-button-secondary text-heading font-semibold text-sm cursor-pointer hover:bg-border-light transition-colors duration-200 flex items-center gap-2 disabled:opacity-40">
                            <LucideArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <button onClick={handleFinish} disabled={isLoading} className="flex-1 py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-all duration-200 disabled:opacity-40">
                            {isLoading ? "Finishing…" : "Finish setup"}
                        </button>
                    </div>
                </div>
            )}
        </AnimateIn>
    );
};

export default Onboarding;

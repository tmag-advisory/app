import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useOnboardingStore } from "../../context/OnboardingContext";
import { useCurrencyStore } from "../../stores/currencyStore";
import { useVerifyEmail, useResendVerificationEmail } from "../../api/hooks";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";
import { LucideLoader, LucideArrowLeft } from "lucide-react";
import GoogleSignInButton from "../../components/auth/GoogleSignInButton";
import type { BillingCurrency } from "../../api";
import { getAffiliateReferralCode } from "../../lib/affiliateTracking";

const planLabels: Record<string, { name: string; color: string }> = {
    ESSENTIAL: { name: "Essential", color: "bg-gray-100 text-gray-700" },
    STANDARD: { name: "Standard", color: "bg-accent/10 text-accent" },
    PREMIUM: { name: "Premium", color: "bg-amber-50 text-amber-700" },
};

const Register = () => {
    const navigate = useNavigate();
    const { register, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const { setStage } = useOnboardingStore();
    const { selectedCurrency } = useCurrencyStore();
    const [searchParams] = useSearchParams();
    const selectedPlan = searchParams.get("plan");
    const planInfo = selectedPlan && planLabels[selectedPlan] ? planLabels[selectedPlan] : null;
    const toastkey = "register";

    const [step, setStep] = useState<"form" | "verify">("form");
    const [registeredEmail, setRegisteredEmail] = useState("");

    // 6-digit code state
    const [digits, setDigits] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const verifyEmail = useVerifyEmail();
    const resendVerification = useResendVerificationEmail();

    useEffect(() => {
        setStage(0);
    }, [setStage]);

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        showPassword: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            e.preventDefault();

            toast.loading("Creating account...", { id: toastkey });
            setLoading(true);
            await register({
                email: form.email,
                password: form.password,
                first_name: form.firstName,
                last_name: form.lastName,
                username: String(
                    form.email.split("@")[0] + form.firstName
                ).toLowerCase(),
                planCode: selectedPlan ?? undefined,
                affiliate_referral_code: getAffiliateReferralCode(),
                billing_currency: selectedCurrency as BillingCurrency,
            });
            setRegisteredEmail(form.email);
            toast.success("Check your email for a verification code!", { id: toastkey });
            setStep("verify");
            setLoading(false);
        } catch (err) {
            setLoading(false);
            if (err instanceof AxiosError) {
                toast.error(err.response?.data.error, { id: toastkey });
            }
        }
    };

    const update = useCallback((field: string, value: string) => {
        setForm((f) => ({ ...f, [field]: value }));
    }, []);

    // Code input handlers
    const handleDigitChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newDigits = [...digits];
        newDigits[index] = value.slice(-1);
        setDigits(newDigits);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleDigitKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!pasted) return;
        const newDigits = [...digits];
        for (let i = 0; i < 6; i++) {
            newDigits[i] = pasted[i] || "";
        }
        setDigits(newDigits);
        const focusIndex = Math.min(pasted.length, 5);
        inputRefs.current[focusIndex]?.focus();
    };

    const handleVerify = async () => {
        const code = digits.join("");
        if (code.length !== 6) {
            toast.error("Please enter the full 6-digit code");
            return;
        }

        try {
            await verifyEmail.mutateAsync({ email: registeredEmail, code });
            setStage(2);
            await refreshProfile();
            toast.success("Email verified!");
            navigate(selectedPlan?.startsWith("FAMILY") ? "/dashboard" : "/onboarding");
        } catch (err) {
            if (err instanceof AxiosError) {
                toast.error(err.response?.data?.error || "Invalid code. Please try again.");
            }
        }
    };

    const handleResend = () => {
        resendVerification.mutate(
            { email: registeredEmail },
            {
                onSuccess: () => {
                    toast.success("New code sent! Check your email.");
                    setDigits(["", "", "", "", "", ""]);
                    inputRefs.current[0]?.focus();
                },
                onError: (err) => {
                    if (err instanceof AxiosError) {
                        toast.error(err.response?.data?.error || "Failed to resend code");
                    }
                },
            }
        );
    };

    // Auto-submit when all 6 digits are filled
    useEffect(() => {
        if (step === "verify" && digits.every((d) => d !== "")) {
            handleVerify();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [digits, step]);

    if (step === "verify") {
        return (
            <div>
                <button
                    type="button"
                    onClick={() => setStep("form")}
                    className="flex items-center gap-1 text-sm text-muted hover:text-heading mb-6 cursor-pointer transition-colors"
                >
                    <LucideArrowLeft className="w-4 h-4" />
                    Back
                </button>

                <h1 className="text-3xl md:text-4xl font-serif text-heading mb-2">
                    Verify your email.
                </h1>
                <p className="text-sm text-body mb-8">
                    We sent a 6-digit code to{" "}
                    <strong className="text-heading">{registeredEmail}</strong>
                </p>

                <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
                    {digits.map((digit, i) => (
                        <input
                            key={i}
                            ref={(el) => { inputRefs.current[i] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleDigitChange(i, e.target.value)}
                            onKeyDown={(e) => handleDigitKeyDown(i, e)}
                            className="w-12 h-14 text-center text-xl font-semibold text-heading bg-white border-2 border-border-light rounded-xl outline-none focus:border-accent transition-colors duration-200"
                            autoFocus={i === 0}
                        />
                    ))}
                </div>

                <button
                    type="button"
                    onClick={handleVerify}
                    disabled={verifyEmail.isPending || digits.some((d) => !d)}
                    className="w-full py-3 rounded-xl disabled:bg-gray-500 bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200"
                >
                    {verifyEmail.isPending ? (
                        <LucideLoader className="animate-spin block m-auto" scale={0.9} />
                    ) : (
                        "Verify & Continue"
                    )}
                </button>

                <div className="text-center mt-6">
                    <p className="text-sm text-body">
                        Didn't receive the code?{" "}
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendVerification.isPending}
                            className="text-accent font-medium hover:underline cursor-pointer disabled:opacity-50"
                        >
                            {resendVerification.isPending ? "Sending..." : "Resend code"}
                        </button>
                    </p>
                    <p className="text-sm text-body">
                        (Don't forget to check your spam folder!)
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl md:text-4xl font-serif text-heading mb-2">
                Create your account.
            </h1>
            {planInfo && (
                <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 ${planInfo.color}`}
                >
                    Selected plan: {planInfo.name}
                </div>
            )}

            <div className="flex gap-3 mb-6">
                <GoogleSignInButton
                    disabled={loading}
                    planCode={selectedPlan ?? undefined}
                />
            </div>

            <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-border-light" />
                <span className="text-xs text-muted uppercase tracking-wider">
                    or sign up with email
                </span>
                <div className="flex-1 h-px bg-border-light" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                            First name
                        </label>
                        <input
                            type="text"
                            value={form.firstName}
                            onChange={(e) =>
                                update("firstName", e.target.value)
                            }
                            placeholder="Sarah"
                            className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                            Last name
                        </label>
                        <input
                            type="text"
                            value={form.lastName}
                            onChange={(e) => update("lastName", e.target.value)}
                            placeholder="Kimani"
                            className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={form.showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={(e) => update("password", e.target.value)}
                            placeholder="Min. 8 characters"
                            className="w-full bg-white border border-border-light rounded-xl px-4 py-3 pr-11 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                            required
                        />
                        <button
                            type="button"
                            onClick={() =>
                                setForm((f) => ({
                                    ...f,
                                    showPassword: !f.showPassword,
                                }))
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-heading transition-colors"
                            aria-label={
                                form.showPassword ? "Hide password" : (
                                    "Show password"
                                )
                            }
                        >
                            {form.showPassword ?
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                    />
                                </svg>
                            :   <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                            }
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl disabled:bg-gray-500 bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200"
                >
                    {loading ?
                        <LucideLoader
                            className="animate-spin block m-auto"
                            scale={0.9}
                        />
                    :   "Create Account"}
                </button>
            </form>

            <p className="text-sm text-body text-center mt-6">
                Already have an account?{" "}
                <Link
                    to="/login"
                    className="text-accent font-medium hover:underline"
                >
                    Sign in
                </Link>
            </p>
        </div>
    );
};

export default Register;

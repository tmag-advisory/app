import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AnimateIn from "../../components/animations/AnimateIn";
import { useAuth } from "../../context/AuthContext";
import { useOnboardingStore } from "../../context/OnboardingContext";
import { useVerifyEmail, useResendVerificationEmail } from "../../api/hooks";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";
import { LucideLoader, LucideArrowLeft } from "lucide-react";

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);
    const { setStage } = useOnboardingStore();
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
        name: "",
        email: "",
        password: "",
        confirm: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            e.preventDefault();

            toast.loading("Creating account...", { id: toastkey });
            setLoading(true);
            await register({
                email: form.email,
                password: form.password,
                first_name: form.name.split(" ")[0],
                last_name: form.name.split(" ")[1] ?? form.name,
                username: String(
                    form.email.split("@")[0] + form.name.split(" ")[0]
                ).toLowerCase(),
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
            toast.success("Email verified!");
            navigate("/onboarding");
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
            <AnimateIn type="fade">
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
                </div>
            </AnimateIn>
        );
    }

    return (
        <AnimateIn type="fade">
            <h1 className="text-3xl md:text-4xl font-serif text-heading mb-2">
                Create your account.
            </h1>
            <p className="text-sm text-body mb-8">
                Start with a free travel health plan — no credit card required.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Full name
                    </label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        placeholder="Sarah Kimani"
                        className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                        required
                    />
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
                    <input
                        type="password"
                        value={form.password}
                        onChange={(e) => update("password", e.target.value)}
                        placeholder="Min. 8 characters"
                        className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Confirm password
                    </label>
                    <input
                        type="password"
                        value={form.confirm}
                        onChange={(e) => update("confirm", e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl disabled:bg-gray-500 bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200"
                >
                    {loading ? (
                        <LucideLoader className="animate-spin block m-auto" scale={0.9} />
                    ) : (
                        "Create Account"
                    )}
                </button>
            </form>

            <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-border-light" />
                <span className="text-xs text-muted uppercase tracking-wider">
                    or continue with
                </span>
                <div className="flex-1 h-px bg-border-light" />
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={() => navigate("/verify-email")}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-border-light text-heading text-sm font-semibold cursor-pointer hover:bg-button-secondary transition-colors duration-200"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Google
                </button>
                <button
                    type="button"
                    onClick={() => navigate("/verify-email")}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-border-light text-heading text-sm font-semibold cursor-pointer hover:bg-button-secondary transition-colors duration-200"
                >
                    <svg className="w-5 h-5" viewBox="0 0 23 23">
                        <path fill="#f35325" d="M1 1h10v10H1z" />
                        <path fill="#81bc06" d="M12 1h10v10H12z" />
                        <path fill="#05a6f0" d="M1 12h10v10H1z" />
                        <path fill="#ffba08" d="M12 12h10v10H12z" />
                    </svg>
                    Microsoft
                </button>
                <button
                    type="button"
                    onClick={() => navigate("/verify-email")}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-border-light text-heading text-sm font-semibold cursor-pointer hover:bg-button-secondary transition-colors duration-200"
                >
                    <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.52-3.23 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                    Apple
                </button>
            </div>

            <p className="text-sm text-body text-center mt-6">
                Already have an account?{" "}
                <Link
                    to="/login"
                    className="text-accent font-medium hover:underline"
                >
                    Sign in
                </Link>
            </p>
        </AnimateIn>
    );
};

export default Register;

import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LucideLoader2, LucideShieldCheck } from "lucide-react";
import AnimateIn from "../../components/animations/AnimateIn";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api";
import { navigateAfterAuth } from "../../lib/roleRedirect";
import type { AuthResponse, TwoFactorMethod } from "../../api/types";

interface LocationState {
    challenge_token?: string;
    two_factor_method?: TwoFactorMethod;
}

const RESEND_SECONDS = 30;

const TwoFactorVerify = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { completeAuthFromResponse } = useAuth();
    const state = (location.state ?? {}) as LocationState;
    const challengeToken = state.challenge_token;
    const method = state.two_factor_method ?? "EMAIL_OTP";

    const [code, setCode] = useState("");
    const [useBackup, setUseBackup] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendIn, setResendIn] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startResendTimer = () => {
        setResendIn(RESEND_SECONDS);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setResendIn((s) => {
                if (s <= 1 && timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                    return 0;
                }
                return s - 1;
            });
        }, 1000);
    };

    useEffect(() => {
        // The backend already sent the first EMAIL_OTP at login; start the cooldown.
        if (method === "EMAIL_OTP") startResendTimer();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!challengeToken) {
        return (
            <AnimateIn type="fade">
                <h1 className="text-2xl font-serif text-heading mb-2">Session expired</h1>
                <p className="text-sm text-body mb-6">
                    Your verification session has expired. Please sign in again.
                </p>
                <button
                    onClick={() => navigate("/login", { replace: true })}
                    className="w-full py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200"
                >
                    Back to sign in
                </button>
            </AnimateIn>
        );
    }

    const resend = async () => {
        if (resendIn > 0) return;
        try {
            await authApi.challenge2fa({ challenge_token: challengeToken });
            toast.success("A new code has been sent to your email");
            startResendTimer();
        } catch {
            toast.error("Could not resend the code. Please try again.");
        }
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const resp = await authApi.verify2fa({
                challenge_token: challengeToken,
                code: code.trim(),
                backup: useBackup,
            }) as AuthResponse;
            const user = completeAuthFromResponse(resp);
            if (resp.password_expired) {
                navigate("/change-password", { replace: true });
                return;
            }
            navigateAfterAuth(user, navigate);
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data;
            setError(msg?.message ?? msg?.error ?? "Invalid code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimateIn type="fade">
            <div className="flex items-center gap-2 mb-2">
                <LucideShieldCheck className="w-6 h-6 text-accent" aria-hidden="true" />
                <h1 className="text-2xl md:text-3xl font-serif text-heading">Two-factor verification</h1>
            </div>
            <p className="text-sm text-body mb-8 dark:text-black">
                {useBackup
                    ? "Enter one of your saved backup codes to continue."
                    : method === "TOTP"
                        ? "Enter the 6-digit code from your authenticator app."
                        : "Enter the 6-digit code we emailed you."}
            </p>

            {error && (
                <div role="alert" className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="verify-code" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        {useBackup ? "Backup code" : "Verification code"}
                    </label>
                    <input
                        id="verify-code"
                        type="text"
                        inputMode={useBackup ? "text" : "numeric"}
                        autoComplete="one-time-code"
                        value={code}
                        onChange={(e) =>
                            setCode(useBackup ? e.target.value.trim() : e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        placeholder={useBackup ? "Enter backup code" : "123456"}
                        aria-describedby={error ? "verify-code-error" : undefined}
                        className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-lg tracking-[0.3em] text-center text-heading placeholder:text-border placeholder:tracking-normal outline-none focus:border-accent transition-colors duration-200"
                        required
                    />
                    {error && (
                        <p id="verify-code-error" className="mt-2 text-xs text-red-600">
                            {error}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading || code.length === 0}
                    className="w-full py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading && <LucideLoader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                    Verify
                </button>
            </form>

            <div className="flex items-center justify-between mt-6 text-xs">
                <button
                    type="button"
                    onClick={() => {
                        setUseBackup((v) => !v);
                        setCode("");
                        setError("");
                    }}
                    className="text-accent font-medium hover:underline cursor-pointer"
                >
                    {useBackup ? "Use a verification code instead" : "Use a backup code"}
                </button>

                {method === "EMAIL_OTP" && !useBackup && (
                    <button
                        type="button"
                        onClick={resend}
                        disabled={resendIn > 0}
                        className="text-muted hover:text-heading disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
                    </button>
                )}
            </div>

            <div className="mt-6 pt-6 border-t border-border-light text-center">
                <button
                    onClick={() => navigate("/login", { replace: true })}
                    className="text-xs text-muted hover:text-heading transition-colors duration-200 cursor-pointer"
                >
                    ← Back to sign in
                </button>
            </div>
        </AnimateIn>
    );
};

export default TwoFactorVerify;

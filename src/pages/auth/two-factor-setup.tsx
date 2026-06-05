import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    LucideCopy,
    LucideDownload,
    LucideLoader2,
    LucideMail,
    LucideShieldCheck,
    LucideSmartphone,
    LucideTriangleAlert,
} from "lucide-react";
import AnimateIn from "../../components/animations/AnimateIn";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api";
import { navigateAfterAuth } from "../../lib/roleRedirect";
import type { AuthResponse, TwoFactorMethod, TwoFactorSetupResult } from "../../api/types";

type Step = "choose" | "save-codes" | "verify";

interface LocationState {
    challenge_token?: string;
    two_factor_method?: TwoFactorMethod;
}

function copyText(value: string, label: string) {
    navigator.clipboard
        ?.writeText(value)
        .then(() => toast.success(`${label} copied`))
        .catch(() => toast.error("Copy failed — copy manually"));
}

function downloadText(value: string, filename: string) {
    const blob = new Blob([value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

const TwoFactorSetup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { completeAuthFromResponse } = useAuth();
    const state = (location.state ?? {}) as LocationState;
    const challengeToken = state.challenge_token;

    const [step, setStep] = useState<Step>("choose");
    const [method, setMethod] = useState<TwoFactorMethod>(state.two_factor_method ?? "EMAIL_OTP");
    const [setupResult, setSetupResult] = useState<TwoFactorSetupResult | null>(null);
    const [acknowledged, setAcknowledged] = useState(false);
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    if (!challengeToken) {
        return (
            <AnimateIn type="fade">
                <h1 className="text-2xl font-serif text-heading mb-2">Session expired</h1>
                <p className="text-sm text-body mb-6">
                    Your two-factor setup session has expired. Please sign in again.
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

    const startSetup = async () => {
        setError("");
        setLoading(true);
        try {
            const result = await authApi.setup2fa({ challenge_token: challengeToken, method });
            setSetupResult(result);
            setStep("save-codes");
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data;
            setError(msg?.message ?? msg?.error ?? "Could not start two-factor setup. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const continueToVerify = async () => {
        setError("");
        // For EMAIL_OTP we must ask the backend to send the code before prompting for it.
        if (method === "EMAIL_OTP") {
            setLoading(true);
            try {
                await authApi.challenge2fa({ challenge_token: challengeToken });
                toast.success("Verification code sent to your email");
            } catch {
                toast.error("Could not send the email code. Try resending.");
            } finally {
                setLoading(false);
            }
        }
        setStep("verify");
    };

    const submitVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const resp = await authApi.verify2fa({ challenge_token: challengeToken, code: code.trim() }) as AuthResponse;
            const user = completeAuthFromResponse(resp);
            toast.success("Two-factor authentication enabled");
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

    const backupCodesText = setupResult ? setupResult.backupCodes.join("\n") : "";

    return (
        <AnimateIn type="fade">
            <div className="flex items-center gap-2 mb-2">
                <LucideShieldCheck className="w-6 h-6 text-accent" aria-hidden="true" />
                <h1 className="text-2xl md:text-3xl font-serif text-heading">Set up two-factor authentication</h1>
            </div>
            <p className="text-sm text-body mb-8">
                Your account requires a second verification step at sign in. Choose how you want to receive codes.
            </p>

            {error && (
                <div role="alert" className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                </div>
            )}

            {step === "choose" && (
                <div className="space-y-4">
                    <fieldset className="space-y-3">
                        <legend className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                            Verification method
                        </legend>
                        <label className="flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-colors duration-200 border-border-light/60 has-[:checked]:border-accent">
                            <input
                                type="radio"
                                name="method"
                                value="EMAIL_OTP"
                                checked={method === "EMAIL_OTP"}
                                onChange={() => setMethod("EMAIL_OTP")}
                                className="mt-1 accent-accent"
                            />
                            <span>
                                <span className="flex items-center gap-2 text-sm font-semibold text-heading">
                                    <LucideMail className="w-4 h-4" aria-hidden="true" /> Email codes
                                </span>
                                <span className="block text-xs text-muted mt-1">
                                    We email a 6-digit code each time you sign in.
                                </span>
                            </span>
                        </label>
                        <label className="flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-colors duration-200 border-border-light/60 has-[:checked]:border-accent">
                            <input
                                type="radio"
                                name="method"
                                value="TOTP"
                                checked={method === "TOTP"}
                                onChange={() => setMethod("TOTP")}
                                className="mt-1 accent-accent"
                            />
                            <span>
                                <span className="flex items-center gap-2 text-sm font-semibold text-heading">
                                    <LucideSmartphone className="w-4 h-4" aria-hidden="true" /> Authenticator app
                                </span>
                                <span className="block text-xs text-muted mt-1">
                                    Use Google Authenticator, Authy, or another TOTP app.
                                </span>
                            </span>
                        </label>
                    </fieldset>
                    <button
                        onClick={startSetup}
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading && <LucideLoader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                        Continue
                    </button>
                </div>
            )}

            {step === "save-codes" && setupResult && (
                <div className="space-y-5">
                    {method === "TOTP" && (
                        <div className="space-y-3">
                            <p className="text-sm text-body">
                                Add this account to your authenticator app. Scan or paste the setup URI below, or
                                enter the secret key manually.
                            </p>
                            {setupResult.otpauthUri && (
                                <div className="rounded-2xl border border-border-light/60 bg-background-primary p-4">
                                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                        Setup URI
                                    </p>
                                    <code className="block break-all text-xs text-heading">{setupResult.otpauthUri}</code>
                                    <button
                                        type="button"
                                        onClick={() => copyText(setupResult!.otpauthUri!, "Setup URI")}
                                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline cursor-pointer"
                                    >
                                        <LucideCopy className="w-3.5 h-3.5" aria-hidden="true" /> Copy URI
                                    </button>
                                </div>
                            )}
                            {setupResult.secret && (
                                <div className="rounded-2xl border-2 border-accent/40 bg-accent/5 p-4">
                                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                        Secret key
                                    </p>
                                    <code className="block break-all text-lg font-mono font-semibold text-heading tracking-wide">
                                        {setupResult.secret}
                                    </code>
                                    <button
                                        type="button"
                                        onClick={() => copyText(setupResult!.secret!, "Secret key")}
                                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline cursor-pointer"
                                    >
                                        <LucideCopy className="w-3.5 h-3.5" aria-hidden="true" /> Copy secret
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                            <LucideTriangleAlert className="w-4 h-4" aria-hidden="true" /> Save your backup codes now
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                            These codes are shown <strong>only once</strong>. Store them somewhere safe — each one lets
                            you sign in if you lose access to your {method === "TOTP" ? "authenticator" : "email"}.
                        </p>
                        <ul className="grid grid-cols-2 gap-2 mt-3" aria-label="Backup codes">
                            {setupResult.backupCodes.map((c) => (
                                <li
                                    key={c}
                                    className="font-mono text-sm text-heading bg-white rounded-lg px-3 py-2 border border-amber-200 text-center"
                                >
                                    {c}
                                </li>
                            ))}
                        </ul>
                        <div className="flex gap-2 mt-3">
                            <button
                                type="button"
                                onClick={() => copyText(backupCodesText, "Backup codes")}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 hover:underline cursor-pointer"
                            >
                                <LucideCopy className="w-3.5 h-3.5" aria-hidden="true" /> Copy all
                            </button>
                            <button
                                type="button"
                                onClick={() => downloadText(backupCodesText, "tmag-backup-codes.txt")}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 hover:underline cursor-pointer"
                            >
                                <LucideDownload className="w-3.5 h-3.5" aria-hidden="true" /> Download
                            </button>
                        </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={acknowledged}
                            onChange={(e) => setAcknowledged(e.target.checked)}
                            className="accent-accent"
                        />
                        <span className="text-sm text-body">I have saved my backup codes.</span>
                    </label>

                    <button
                        onClick={continueToVerify}
                        disabled={!acknowledged || loading}
                        className="w-full py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading && <LucideLoader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                        Continue to verification
                    </button>
                </div>
            )}

            {step === "verify" && (
                <form onSubmit={submitVerify} className="space-y-4">
                    <p className="text-sm text-body">
                        {method === "TOTP"
                            ? "Enter the 6-digit code from your authenticator app to finish enabling two-factor authentication."
                            : "Enter the 6-digit code we just emailed you to finish enabling two-factor authentication."}
                    </p>
                    <div>
                        <label htmlFor="setup-code" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                            Verification code
                        </label>
                        <input
                            id="setup-code"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="123456"
                            aria-describedby={error ? "setup-code-error" : undefined}
                            className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-lg tracking-[0.4em] text-center text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                            required
                        />
                        {error && (
                            <p id="setup-code-error" className="mt-2 text-xs text-red-600">
                                {error}
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={loading || code.length < 6}
                        className="w-full py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading && <LucideLoader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                        Verify & continue
                    </button>
                </form>
            )}
        </AnimateIn>
    );
};

export default TwoFactorSetup;

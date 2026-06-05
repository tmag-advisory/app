import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import QRCode from "qrcode";
import { LucideSmartphone, LucideMail, LucideCopy, LucideCheck, LucideDownload, LucideLoader2, LucideTriangleAlert, LucideEye, LucideEyeOff } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import { authApi } from "../../../api";
import type { TwoFactorMethod, TwoFactorSetupResult } from "../../../api/types";

interface TwoFactorSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

type SetupStep = "choose-method" | "setup" | "verify" | "backup-codes";

const TwoFactorSetupModal = ({ isOpen, onClose, onComplete }: TwoFactorSetupModalProps) => {
    const [step, setStep] = useState<SetupStep>("choose-method");
    const [method, setMethod] = useState<TwoFactorMethod>("TOTP");
    const [setupResult, setSetupResult] = useState<TwoFactorSetupResult | null>(null);
    const [verificationCode, setVerificationCode] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [settingUp, setSettingUp] = useState(false);
    const [codesCopied, setCodesCopied] = useState(false);
    const [showSecret, setShowSecret] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const codeInputRef = useRef<HTMLInputElement>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep("choose-method");
            setMethod("TOTP");
            setSetupResult(null);
            setVerificationCode("");
            setVerifying(false);
            setSettingUp(false);
            setCodesCopied(false);
            setShowSecret(false);
            setQrDataUrl(null);
        }
    }, [isOpen]);

    // Generate QR code when setup result is available
    useEffect(() => {
        if (setupResult?.otpauthUri) {
            QRCode.toDataURL(setupResult.otpauthUri, {
                width: 240,
                margin: 2,
                color: { dark: "#1a1a2e", light: "#ffffff" },
            })
                .then((url) => setQrDataUrl(url))
                .catch(() => setQrDataUrl(null));
        }
    }, [setupResult?.otpauthUri]);

    // Focus the code input when we reach verify step
    useEffect(() => {
        if (step === "verify" && codeInputRef.current) {
            codeInputRef.current.focus();
        }
    }, [step]);

    const handleStartSetup = async () => {
        if (!method) return;
        setSettingUp(true);
        try {
            const result = await authApi.setup2fa({ method });
            setSetupResult(result);
            if (method === "TOTP") {
                setStep("verify");
            } else {
                // For EMAIL_OTP, trigger the challenge
                // The backend sends the OTP when setup happens
                setStep("verify");
                toast.success("A verification code has been sent to your email");
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to set up two-factor authentication";
            toast.error(msg);
        } finally {
            setSettingUp(false);
        }
    };

    const handleVerify = async () => {
        if (!verificationCode || verificationCode.length < 4) {
            toast.error("Please enter a valid verification code");
            return;
        }
        setVerifying(true);
        try {
            // Settings flow: no challenge_token needed; the backend picks up the authenticated user
            await authApi.verify2fa({ challenge_token: "", code: verificationCode, backup: false });
            toast.success("Two-factor authentication verified");
            if (setupResult?.backupCodes && setupResult.backupCodes.length > 0) {
                setStep("backup-codes");
            } else {
                onComplete();
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Invalid verification code";
            toast.error(msg);
        } finally {
            setVerifying(false);
        }
    };

    const copyCodes = async () => {
        if (!setupResult?.backupCodes) return;
        try {
            await navigator.clipboard.writeText(setupResult.backupCodes.join("\n"));
            setCodesCopied(true);
            setTimeout(() => setCodesCopied(false), 3000);
        } catch {
            toast.error("Could not copy to clipboard");
        }
    };

    const downloadCodes = () => {
        if (!setupResult?.backupCodes) return;
        const blob = new Blob([setupResult.backupCodes.join("\n")], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "tmag-backup-codes.txt";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleClose = useCallback(() => {
        if (!verifying && !settingUp) {
            onClose();
        }
    }, [verifying, settingUp, onClose]);

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Set up two-factor authentication">
            <div className="space-y-5">
                {step === "choose-method" && (
                    <>
                        <p className="text-sm text-muted">
                            Choose how you'd like to receive verification codes. You can change this later.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => setMethod("TOTP")}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                                    method === "TOTP"
                                        ? "border-accent bg-accent/5"
                                        : "border-border-light hover:border-border-dark"
                                }`}
                            >
                                <div className={`p-2.5 rounded-lg ${method === "TOTP" ? "bg-accent text-white" : "bg-gray-100 text-muted"}`}>
                                    <LucideSmartphone className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-heading">Authenticator app</p>
                                    <p className="text-xs text-muted mt-0.5">
                                        Use Google Authenticator, Microsoft Authenticator, or similar app
                                    </p>
                                </div>
                            </button>

                            <button
                                onClick={() => setMethod("EMAIL_OTP")}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                                    method === "EMAIL_OTP"
                                        ? "border-accent bg-accent/5"
                                        : "border-border-light hover:border-border-dark"
                                }`}
                            >
                                <div className={`p-2.5 rounded-lg ${method === "EMAIL_OTP" ? "bg-accent text-white" : "bg-gray-100 text-muted"}`}>
                                    <LucideMail className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-heading">Email one-time code</p>
                                    <p className="text-xs text-muted mt-0.5">
                                        Receive verification codes via email
                                    </p>
                                </div>
                            </button>
                        </div>

                        <button
                            onClick={handleStartSetup}
                            disabled={settingUp || !method}
                            className="w-full text-sm font-semibold px-4 py-2.5 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {settingUp ? <LucideLoader2 className="w-4 h-4 animate-spin" /> : null}
                            Continue
                        </button>
                    </>
                )}

                {step === "verify" && method === "TOTP" && (
                    <>
                        <p className="text-sm text-muted">
                            Scan this QR code with your authenticator app, or enter the secret key manually.
                        </p>

                        {/* QR Code */}
                        <div className="flex justify-center">
                            {qrDataUrl ? (
                                <img
                                    src={qrDataUrl}
                                    alt="TOTP QR code"
                                    className="rounded-xl border border-border-light"
                                    width={240}
                                    height={240}
                                />
                            ) : (
                                <div className="w-[240px] h-[240px] flex items-center justify-center rounded-xl border border-border-light bg-gray-50">
                                    <LucideLoader2 className="w-6 h-6 animate-spin text-muted" />
                                </div>
                            )}
                        </div>

                        {/* Manual setup key */}
                        {setupResult?.secret && (
                            <div className="p-3 rounded-lg bg-gray-50 border border-border-light">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs font-semibold text-muted">Manual setup key</p>
                                    <button
                                        onClick={() => setShowSecret(!showSecret)}
                                        className="text-xs text-accent hover:text-accent/80 cursor-pointer flex items-center gap-1"
                                    >
                                        {showSecret ? <LucideEyeOff className="w-3 h-3" /> : <LucideEye className="w-3 h-3" />}
                                        {showSecret ? "Hide" : "Show"}
                                    </button>
                                </div>
                                <code className="text-xs font-mono bg-white rounded px-2 py-1.5 block break-all select-all">
                                    {showSecret ? setupResult.secret : setupResult.secret.replace(/./g, "•")}
                                </code>
                            </div>
                        )}

                        {/* Verification code input */}
                        <div>
                            <label htmlFor="verify-code" className="block text-sm font-semibold text-heading mb-1.5">
                                Enter the 6-digit code from your authenticator app
                            </label>
                            <input
                                ref={codeInputRef}
                                id="verify-code"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                onKeyDown={(e) => { if (e.key === "Enter") void handleVerify(); }}
                                className="w-full rounded-lg border border-border-light px-3 py-2.5 text-sm text-center text-lg tracking-[0.3em] font-mono focus:outline-none focus:ring-2 focus:ring-accent/40"
                                placeholder="000000"
                            />
                        </div>

                        <button
                            onClick={handleVerify}
                            disabled={verifying || verificationCode.length < 6}
                            className="w-full text-sm font-semibold px-4 py-2.5 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {verifying ? <LucideLoader2 className="w-4 h-4 animate-spin" /> : null}
                            Verify and enable
                        </button>
                    </>
                )}

                {step === "verify" && method === "EMAIL_OTP" && (
                    <>
                        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                            <p className="text-sm text-blue-800">
                                A verification code has been sent to your email. Please check your inbox and enter the code below.
                            </p>
                        </div>

                        <div>
                            <label htmlFor="verify-email-code" className="block text-sm font-semibold text-heading mb-1.5">
                                Enter the code from your email
                            </label>
                            <input
                                ref={codeInputRef}
                                id="verify-email-code"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                onKeyDown={(e) => { if (e.key === "Enter") void handleVerify(); }}
                                className="w-full rounded-lg border border-border-light px-3 py-2.5 text-sm text-center text-lg tracking-[0.3em] font-mono focus:outline-none focus:ring-2 focus:ring-accent/40"
                                placeholder="000000"
                            />
                        </div>

                        <button
                            onClick={handleVerify}
                            disabled={verifying || verificationCode.length < 6}
                            className="w-full text-sm font-semibold px-4 py-2.5 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {verifying ? <LucideLoader2 className="w-4 h-4 animate-spin" /> : null}
                            Verify and enable
                        </button>
                    </>
                )}

                {step === "backup-codes" && setupResult?.backupCodes && (
                    <>
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                            <LucideTriangleAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800">
                                Save these backup codes in a secure place. Each code can only be used once.
                                If you lose access to your authenticator app or email, you'll need these to sign in.
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-gray-50 border border-border-light">
                            <div className="grid grid-cols-2 gap-1.5">
                                {setupResult.backupCodes.map((code, i) => (
                                    <code key={i} className="text-xs font-mono bg-white rounded px-2 py-1.5 text-center select-all">
                                        {code}
                                    </code>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={copyCodes}
                                className="flex-1 text-xs font-semibold px-4 py-2.5 rounded-lg border border-border-light text-muted hover:text-heading transition-colors cursor-pointer flex items-center justify-center gap-2"
                            >
                                {codesCopied ? <LucideCheck className="w-3.5 h-3.5" /> : <LucideCopy className="w-3.5 h-3.5" />}
                                {codesCopied ? "Copied" : "Copy codes"}
                            </button>
                            <button
                                onClick={downloadCodes}
                                className="flex-1 text-xs font-semibold px-4 py-2.5 rounded-lg border border-border-light text-muted hover:text-heading transition-colors cursor-pointer flex items-center justify-center gap-2"
                            >
                                <LucideDownload className="w-3.5 h-3.5" />
                                Download
                            </button>
                        </div>

                        <button
                            onClick={onComplete}
                            className="w-full text-sm font-semibold px-4 py-2.5 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors cursor-pointer"
                        >
                            Done — enable two-factor authentication
                        </button>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default TwoFactorSetupModal;

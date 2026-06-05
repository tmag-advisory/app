import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { LucideShieldCheck, LucideLoader2, LucideSmartphone, LucideMail, LucideKeyRound, LucideCopy, LucideCheck, LucideTriangleAlert, LucideLock } from "lucide-react";
import { DASHBOARD_GLASS_SURFACE } from "../../../components/dashboard/dashboardChrome";
import { cn } from "../../../lib/utils";
import Modal from "../../../components/ui/Modal";
import TwoFactorSetupModal from "./TwoFactorSetupModal";
import { useAuth } from "../../../context/AuthContext";
import { authApi } from "../../../api";
import { useUpdateProfilePassword } from "../../../api/hooks";

const SecurityTab = () => {
    const { user, refreshProfile } = useAuth();
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [twoFactorMethod, setTwoFactorMethod] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Self-disable
    const [disableOpen, setDisableOpen] = useState(false);
    const [disablePassword, setDisablePassword] = useState("");
    const [disabling, setDisabling] = useState(false);

    // Setup modal
    const [setupOpen, setSetupOpen] = useState(false);

    // Backup codes
    const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
    const [regenerating, setRegenerating] = useState(false);
    const [codesCopied, setCodesCopied] = useState(false);

    // Password change
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const updatePassword = useUpdateProfilePassword();

    useEffect(() => {
        if (user) {
            setTwoFactorEnabled(!!user.two_factor_enabled);
            setTwoFactorMethod(user.two_factor_method ?? null);
            setLoading(false);
        }
    }, [user]);

    const handleDisable = async () => {
        if (!disablePassword) {
            toast.error("Please enter your current password");
            return;
        }
        setDisabling(true);
        try {
            await authApi.selfDisable2fa({ current_password: disablePassword });
            toast.success("Two-factor authentication disabled");
            setDisableOpen(false);
            setDisablePassword("");
            setTwoFactorEnabled(false);
            setTwoFactorMethod(null);
            await refreshProfile();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to disable 2FA";
            toast.error(msg);
        } finally {
            setDisabling(false);
        }
    };

    const handleSetupComplete = async () => {
        setSetupOpen(false);
        setTwoFactorEnabled(true);
        await refreshProfile();
    };

    const handleRegenerateCodes = async () => {
        setRegenerating(true);
        try {
            const result = await authApi.regenerateBackupCodes();
            setBackupCodes(result.backup_codes);
            setCodesCopied(false);
            toast.success("New backup codes generated");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to regenerate backup codes";
            toast.error(msg);
        } finally {
            setRegenerating(false);
        }
    };

    const copyBackupCodes = async () => {
        if (!backupCodes) return;
        try {
            await navigator.clipboard.writeText(backupCodes.join("\n"));
            setCodesCopied(true);
            setTimeout(() => setCodesCopied(false), 3000);
        } catch {
            toast.error("Could not copy to clipboard");
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
                current_password: passwordForm.currentPassword,
                new_password: passwordForm.newPassword,
            });
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            toast.success("Password updated successfully");
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                ?? (err instanceof Error ? err.message : "Failed to update password");
            toast.error(msg);
        }
    };

    const methodLabel = (method: string | null) => {
        switch (method) {
            case "TOTP": return "Authenticator app";
            case "EMAIL_OTP": return "Email one-time code";
            default: return method || "\u2014";
        }
    };

    const methodIcon = (method: string | null) => {
        switch (method) {
            case "TOTP": return <LucideSmartphone className="w-5 h-5" />;
            case "EMAIL_OTP": return <LucideMail className="w-5 h-5" />;
            default: return <LucideKeyRound className="w-5 h-5" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LucideLoader2 className="w-6 h-6 animate-spin text-muted" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl">
            {/* 2FA Status */}
            <div className={cn(DASHBOARD_GLASS_SURFACE, "p-6 md:p-8")}>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-base font-semibold text-heading flex items-center gap-2">
                            <LucideShieldCheck className="w-5 h-5 text-accent" />
                            Two-factor authentication
                        </h3>
                        <p className="text-sm text-muted mt-1">
                            Add an extra layer of security to your account. Once enabled,
                            you'll need a verification code in addition to your password to sign in.
                        </p>
                    </div>
                </div>

                {twoFactorEnabled ? (
                    <div className="mt-5 space-y-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                            <LucideShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-emerald-800">Two-factor authentication is enabled</p>
                                <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1.5">
                                    {methodIcon(twoFactorMethod)}
                                    Method: {methodLabel(twoFactorMethod)}
                                </p>
                            </div>
                        </div>

                        {backupCodes ? (
                            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-semibold text-amber-800">Your backup codes</p>
                                    <button
                                        onClick={copyBackupCodes}
                                        className="text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors cursor-pointer flex items-center gap-1"
                                    >
                                        {codesCopied ? (
                                            <><LucideCheck className="w-3.5 h-3.5" /> Copied</>
                                        ) : (
                                            <><LucideCopy className="w-3.5 h-3.5" /> Copy all</>
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-amber-700 mb-3">
                                    Each code can only be used once. Store them in a safe place.
                                </p>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {backupCodes.map((code, i) => (
                                        <code key={i} className="text-xs font-mono bg-white/60 rounded px-2 py-1 text-amber-900">
                                            {code}
                                        </code>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        <div className="flex flex-wrap gap-3 pt-2">
                            <button
                                onClick={handleRegenerateCodes}
                                disabled={regenerating}
                                className="text-xs font-semibold px-4 py-2 rounded-lg border border-border-light text-muted hover:text-heading hover:border-border-dark transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                            >
                                {regenerating ? <LucideLoader2 className="w-3.5 h-3.5 animate-spin" /> : <LucideKeyRound className="w-3.5 h-3.5" />}
                                Regenerate backup codes
                            </button>
                            <button
                                onClick={() => setDisableOpen(true)}
                                className="text-xs font-semibold px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                                Disable two-factor authentication
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-5">
                        <div className="p-4 rounded-xl bg-gray-50 border border-border-light">
                            <p className="text-sm text-muted mb-3">
                                Two-factor authentication is currently disabled. We recommend enabling it
                                to protect your account from unauthorized access.
                            </p>
                            <button
                                onClick={() => setSetupOpen(true)}
                                className="text-xs font-semibold px-4 py-2.5 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors cursor-pointer flex items-center gap-2"
                            >
                                <LucideShieldCheck className="w-4 h-4" />
                                Set up two-factor authentication
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Password change */}
            <div className={cn(DASHBOARD_GLASS_SURFACE, "p-6 md:p-8 max-w-2xl")}>
                <form onSubmit={handlePasswordSubmit}>
                    <h3 className="text-base font-semibold text-heading mb-6 flex items-center gap-2">
                        <LucideLock className="w-5 h-5 text-muted" />
                        Change password
                    </h3>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2" htmlFor="current-password">
                                Current password
                            </label>
                            <input
                                id="current-password"
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                placeholder="**** ****"
                                className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2" htmlFor="new-password">
                                New password
                            </label>
                            <input
                                id="new-password"
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                placeholder="Min. 8 characters"
                                className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2" htmlFor="confirm-password">
                                Confirm new password
                            </label>
                            <input
                                id="confirm-password"
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                placeholder="**** ****"
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
                            {updatePassword.isPending && (
                                <LucideLoader2 className="w-3 h-3 animate-spin" />
                            )}
                            Update password
                        </button>
                    </div>
                </form>
            </div>

            {/* Disable confirmation modal */}
            <Modal isOpen={disableOpen} onClose={() => { if (!disabling) { setDisableOpen(false); setDisablePassword(""); } }} title="Disable two-factor authentication">
                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-200">
                        <LucideTriangleAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">
                            This will make your account less secure. We strongly recommend keeping
                            two-factor authentication enabled.
                        </p>
                    </div>
                    <div>
                        <label htmlFor="disable-password-input" className="block text-sm font-semibold text-heading mb-1.5">
                            Enter your current password to confirm
                        </label>
                        <input
                            id="disable-password-input"
                            type="password"
                            value={disablePassword}
                            onChange={(e) => setDisablePassword(e.target.value)}
                            className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                            placeholder="Current password"
                        />
                    </div>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => { setDisableOpen(false); setDisablePassword(""); }}
                            disabled={disabling}
                            className="text-xs font-semibold px-4 py-2 rounded-lg border border-border-light text-muted hover:text-heading transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDisable}
                            disabled={disabling || !disablePassword}
                            className="text-xs font-semibold px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                        >
                            {disabling ? <LucideLoader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            Disable
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Setup modal */}
            <TwoFactorSetupModal
                isOpen={setupOpen}
                onClose={() => setSetupOpen(false)}
                onComplete={handleSetupComplete}
            />
        </div>
    );
};

export default SecurityTab;

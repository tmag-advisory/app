import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LucideLoader2, LucideKeyRound } from "lucide-react";
import AnimateIn from "../../components/animations/AnimateIn";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api";
import { navigateAfterAuth } from "../../lib/roleRedirect";

const ChangePassword = () => {
    const navigate = useNavigate();
    const { user, passwordExpired, clearPasswordExpired } = useAuth();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
        setLoading(true);
        try {
            await authApi.changePassword({ current_password: currentPassword, new_password: newPassword });
            clearPasswordExpired();
            toast.success("Password updated");
            if (user) {
                navigateAfterAuth(user, navigate);
            } else {
                navigate("/login", { replace: true });
            }
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data;
            setError(msg?.message ?? msg?.error ?? "Could not change your password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimateIn type="fade">
            <div className="flex items-center gap-2 mb-2">
                <LucideKeyRound className="w-6 h-6 text-accent" aria-hidden="true" />
                <h1 className="text-2xl md:text-3xl font-serif text-heading">
                    {passwordExpired ? "Update your password" : "Change password"}
                </h1>
            </div>
            <p className="text-sm text-body mb-8">
                {passwordExpired
                    ? "Your password has expired. Choose a new password to continue."
                    : "Choose a new password for your account."}
            </p>

            {error && (
                <div role="alert" className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="cp-current" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Current password
                    </label>
                    <input
                        id="cp-current"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="cp-new" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        New password
                    </label>
                    <input
                        id="cp-new"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        autoComplete="new-password"
                        aria-describedby={error ? "cp-error" : undefined}
                        className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="cp-confirm" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Confirm new password
                    </label>
                    <input
                        id="cp-confirm"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        aria-describedby={error ? "cp-error" : undefined}
                        className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                        required
                    />
                </div>
                {error && (
                    <p id="cp-error" className="text-xs text-red-600">
                        {error}
                    </p>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading && <LucideLoader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                    Update password
                </button>
            </form>
        </AnimateIn>
    );
};

export default ChangePassword;

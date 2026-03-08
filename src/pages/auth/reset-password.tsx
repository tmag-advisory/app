import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { LucideArrowLeft, LucideEye, LucideEyeOff, LucideCheckCircle2 } from "lucide-react";
import AnimateIn from "../../components/animations/AnimateIn";
import { useResetPassword } from "../../api/hooks";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [validationError, setValidationError] = useState("");

    const { mutate: resetPassword, isPending, isSuccess, isError, error } = useResetPassword();

    useEffect(() => {
        if (!token || !email) {
            navigate("/forgot-password");
        }
    }, [token, email, navigate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError("");

        if (password.length < 8) {
            setValidationError("Password must be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setValidationError("Passwords do not match.");
            return;
        }

        if (token && email) {
            resetPassword({
                email,
                token,
                new_password: password,
            });
        }
    };

    if (isSuccess) {
        return (
            <AnimateIn type="fade" className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                    <LucideCheckCircle2 className="w-8 h-8 text-accent" />
                </div>
                <h1 className="text-3xl font-serif text-heading mb-2">
                    Password Reset!
                </h1>
                <p className="text-sm text-body mb-8">
                    Your password has been successfully reset. You can now sign in with your new password.
                </p>
                <Link
                    to="/login"
                    className="inline-block w-full py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200"
                >
                    Sign in
                </Link>
            </AnimateIn>
        );
    }

    return (
        <AnimateIn type="fade">
            <Link to="/login" className="inline-flex items-center gap-1 text-xs text-muted hover:text-heading transition-colors duration-200 mb-8">
                <LucideArrowLeft className="w-3 h-3" /> Back to sign in
            </Link>
            <h1 className="text-3xl md:text-4xl font-serif text-heading mb-2">
                Reset password
            </h1>
            <p className="text-sm text-body mb-8">
                Please enter your new password below.
            </p>

            {(isError || validationError) && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    {validationError || (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Something went wrong. Please try again."}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-heading transition-colors"
                        >
                            {showPassword ? <LucideEyeOff className="w-4 h-4" /> : <LucideEye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Confirm New Password
                    </label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? "Resetting…" : "Reset password"}
                </button>
            </form>
        </AnimateIn>
    );
};

export default ResetPassword;

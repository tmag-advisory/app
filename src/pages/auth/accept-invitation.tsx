import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { LucideEye, LucideEyeOff, LucideCheckCircle2, LucideShieldCheck } from "lucide-react";
import AnimateIn from "../../components/animations/AnimateIn";
import { useAcceptInvitation } from "../../api/hooks";
import { setAuthCookie } from "../../api/axios";

const AcceptInvitation = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [validationError, setValidationError] = useState("");

    const { mutate: acceptInvitation, isPending, isSuccess, isError, error, data } = useAcceptInvitation();

    useEffect(() => {
        if (!token) {
            navigate("/login");
        }
    }, [token, navigate]);

    useEffect(() => {
        if (isSuccess && data) {
            // Store the JWT, then redirect to onboarding
            setAuthCookie(data.accessToken, data.exp);
            const timer = setTimeout(() => {
                window.location.href = "/onboarding";
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isSuccess, data]);

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

        if (token) {
            acceptInvitation({ token, new_password: password });
        }
    };

    if (isSuccess) {
        return (
            <AnimateIn type="fade" className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                    <LucideCheckCircle2 className="w-8 h-8 text-accent" />
                </div>
                <h1 className="text-3xl font-serif text-heading mb-2">
                    Welcome aboard!
                </h1>
                <p className="text-sm text-body mb-8">
                    Your account is set up. Redirecting you to complete your profile...
                </p>
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
            </AnimateIn>
        );
    }

    return (
        <AnimateIn type="fade">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <LucideShieldCheck className="w-5 h-5 text-accent" />
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-serif text-heading">
                        Set your password
                    </h1>
                    <p className="text-xs text-muted">
                        You've been invited to join TMAG
                    </p>
                </div>
            </div>

            <p className="text-sm text-body mb-8">
                Create a password to activate your account and start planning safer travel.
            </p>

            {(isError || validationError) && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    {validationError || (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Something went wrong. The invitation may have expired."}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 8 characters"
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
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat your password"
                        className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? "Setting up your account..." : "Activate account"}
                </button>
            </form>

            <p className="text-xs text-muted mt-6 text-center">
                Already have an account? <Link to="/login" className="text-accent hover:underline">Sign in</Link>
            </p>
        </AnimateIn>
    );
};

export default AcceptInvitation;

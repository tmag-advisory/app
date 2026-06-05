import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AnimateIn from "../../components/animations/AnimateIn";
import GoogleSignInButton from "../../components/auth/GoogleSignInButton";
import { navigateAfterAuth } from "../../lib/roleRedirect";

const RedirectModal = ({
    message,
    redirectUrl,
    onClose,
}: {
    message: string;
    redirectUrl: string;
    onClose: () => void;
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
            </div>
            <h2 className="text-xl font-serif text-heading mb-3">
                Wrong Portal
            </h2>
            <p className="text-sm text-body mb-6">
                {message}
            </p>
            <p className="text-xs text-muted mb-6">
                For security purposes, please always log in directly from your dedicated portal.
            </p>
            <div className="flex flex-col gap-3">
                <a
                    href={redirectUrl}
                    className="w-full py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors duration-200 text-center"
                >
                    Go to the correct login page
                </a>
                <button
                    onClick={onClose}
                    className="w-full py-3 rounded-xl border border-border-light text-sm font-medium text-heading hover:bg-background-primary transition-colors duration-200"
                >
                    Stay here
                </button>
            </div>
        </div>
    </div>
);

const Login = () => {
    const { login, completeAuthFromResponse, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [redirectModal, setRedirectModal] = useState<{ message: string; url: string } | null>(null);

    // Logout and clean up when redirect modal is dismissed so the user session is clear
    const handleCloseModal = useCallback(async () => {
        setRedirectModal(null);
        try {
            await logout();
        } catch {
            // ignore
        }
    }, [logout]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const resp = await login({ email, password });

            // Branch on the 2FA flags BEFORE any session is established.
            if (resp.two_factor_setup_required) {
                navigate("/2fa-setup", {
                    state: { challenge_token: resp.challenge_token, two_factor_method: resp.two_factor_method },
                });
                return;
            }
            if (resp.two_factor_required) {
                navigate("/2fa-verify", {
                    state: { challenge_token: resp.challenge_token, two_factor_method: resp.two_factor_method },
                });
                return;
            }

            // Token present — establish the session.
            const user = completeAuthFromResponse(resp);

            // If the backend says this user should log in from a different app, show a modal
            if (user.redirect_to) {
                setRedirectModal({
                    message: user.redirect_message ?? "This account requires a different portal.",
                    url: user.redirect_to,
                });
                return;
            }

            // Forced password change takes priority over the normal landing page.
            if (resp.password_expired) {
                navigate("/change-password", { replace: true });
                return;
            }

            navigateAfterAuth(user, navigate, searchParams.get("redirect"));
        } catch (err: unknown) {
            const errData = (err as { response?: { data?: { error?: string; message?: string }; status?: number } })?.response;
            if (errData?.status === 403 && errData?.data?.error === "email_not_verified") {
                navigate(`/verify-email?email=${encodeURIComponent(email)}`);
                return;
            }
            const msg = errData?.data?.error ?? "Invalid email or password";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // Close modal on Escape key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && redirectModal) {
                handleCloseModal();
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [redirectModal, handleCloseModal]);

    return (
        <AnimateIn type="fade">
            <h1 className="text-3xl md:text-4xl font-serif text-heading mb-2">
                Welcome back.
            </h1>
            <p className="text-sm text-body mb-8">
                Sign in to access your travel health plans.
            </p>

            {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                        required
                    />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded accent-accent" />
                        <span className="text-xs text-muted">Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="text-xs text-accent font-medium hover:underline">
                        Forgot password?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Signing in…" : "Sign in"}
                </button>
            </form>

            <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-border-light" />
                <span className="text-xs text-muted uppercase tracking-wider">or continue with</span>
                <div className="flex-1 h-px bg-border-light" />
            </div>

            <div className="flex gap-3">
                <GoogleSignInButton disabled={loading} />
            </div>

            <p className="text-sm text-body text-center mt-6">
                Don't have an account?{" "}
                <Link to="/pricing" className="text-accent font-medium hover:underline">
                    Get Started now!
                </Link>
            </p>

            <div className="mt-6 pt-6 border-t border-border-light text-center">
                <Link to="/" className="text-xs text-muted hover:text-heading transition-colors duration-200">
                    ← Back to home
                </Link>
            </div>

            {/* Redirect Modal */}
            {redirectModal && (
                <RedirectModal
                    message={redirectModal.message}
                    redirectUrl={redirectModal.url}
                    onClose={handleCloseModal}
                />
            )}
        </AnimateIn>
    );
};

export default Login;

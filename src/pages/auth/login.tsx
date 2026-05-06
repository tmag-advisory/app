import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AnimateIn from "../../components/animations/AnimateIn";
import GoogleSignInButton from "../../components/auth/GoogleSignInButton";
import { getPostAuthRedirect, performRedirect } from "../../lib/roleRedirect";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const user = await login({ email, password });
            const stage = user.onboarding_stage;
            const redirect = searchParams.get("redirect");
            if (redirect?.startsWith("/") && !redirect.startsWith("//")) {
                navigate(redirect, { replace: true });
                return;
            }
            if (stage > 4) {
                performRedirect(getPostAuthRedirect(user), navigate);
            } else if (!user.is_verified) {
                navigate(`/verify-email?email=${encodeURIComponent(email)}`);
            } else {
                navigate("/onboarding");
            }
        } catch (err: unknown) {
            const errData = (err as { response?: { data?: { error?: string; message?: string }; status?: number } })?.response;
            if (errData?.status === 403 && errData?.data?.error === "email_not_verified") {
                navigate(`/verify-email?email=${encodeURIComponent(email)}`);
                return;
            }
            const msg = errData?.data?.message ?? "Invalid email or password";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

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
        </AnimateIn>
    );
};

export default Login;

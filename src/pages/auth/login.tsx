import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AnimateIn from "../../components/animations/AnimateIn";
import { canAccessHR } from "../../lib/canAccessHr";
import GoogleSignInButton from "../../components/auth/GoogleSignInButton";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
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
            if (stage > 4) {
                navigate(canAccessHR(user) ? "/hr" : "/dashboard");
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
                <button
                    type="button"
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
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-border-light text-heading text-sm font-semibold cursor-pointer hover:bg-button-secondary transition-colors duration-200"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.52-3.23 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                    Apple
                </button>
            </div>

            <p className="text-sm text-body text-center mt-6">
                Don't have an account?{" "}
                <Link to="/register" className="text-accent font-medium hover:underline">
                    Start free — your first plan costs nothing.
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

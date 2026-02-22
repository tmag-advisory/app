import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore, MOCK_INDIVIDUAL, MOCK_HR_ADMIN } from "../../stores/authStore";

const Login = () => {
    const login = useAuthStore((s) => s.login);
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock: email containing "hr" or "company" logs in as HR
        const user = email.toLowerCase().includes("hr") || email.toLowerCase().includes("company")
            ? MOCK_HR_ADMIN
            : MOCK_INDIVIDUAL;
        login(user);
        navigate(user.type === "company" ? "/hr" : "/dashboard");
    };

    return (
        <div>
            <h1 className="text-3xl md:text-4xl font-serif text-heading mb-2">
                Welcome back.
            </h1>
            <p className="text-sm text-body mb-8">
                Sign in to access your travel health plans.
            </p>

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
                    className="w-full py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200"
                >
                    Sign in
                </button>
            </form>

            <p className="text-sm text-body text-center mt-6">
                Don't have an account?{" "}
                <Link to="/register" className="text-accent font-medium hover:underline">
                    Create one
                </Link>
            </p>

            {/* Preview helper */}
            <div className="mt-8 border-t border-border-light pt-6">
                <p className="text-xs text-muted text-center mb-3">Quick preview login</p>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => { login(MOCK_INDIVIDUAL); navigate("/dashboard"); }}
                        className="flex-1 py-2.5 rounded-xl bg-button-secondary text-heading text-xs font-semibold cursor-pointer hover:bg-border-light transition-colors duration-200"
                    >
                        Individual User
                    </button>
                    <button
                        type="button"
                        onClick={() => { login(MOCK_HR_ADMIN); navigate("/hr"); }}
                        className="flex-1 py-2.5 rounded-xl bg-button-secondary text-heading text-xs font-semibold cursor-pointer hover:bg-border-light transition-colors duration-200"
                    >
                        HR Admin
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AnimateIn from "../../components/animations/AnimateIn";

const Register = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        navigate("/verify-email");
    };

    const update = (field: string, value: string) =>
        setForm((f) => ({ ...f, [field]: value }));

    return (
        <AnimateIn type="fade">
            <h1 className="text-3xl md:text-4xl font-serif text-heading mb-2">
                Create your account.
            </h1>
            <p className="text-sm text-body mb-8">
                Start with a free travel health plan — no credit card required.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Full name
                    </label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        placeholder="Sarah Kimani"
                        className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
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
                        value={form.password}
                        onChange={(e) => update("password", e.target.value)}
                        placeholder="Min. 8 characters"
                        className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Confirm password
                    </label>
                    <input
                        type="password"
                        value={form.confirm}
                        onChange={(e) => update("confirm", e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200"
                >
                    Create account
                </button>
            </form>

            <p className="text-sm text-body text-center mt-6">
                Already have an account?{" "}
                <Link to="/login" className="text-accent font-medium hover:underline">
                    Sign in
                </Link>
            </p>
        </AnimateIn>
    );
};

export default Register;

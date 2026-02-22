import { useState } from "react";
import { Link } from "react-router-dom";
import { LucideArrowLeft } from "lucide-react";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSent(true);
    };

    if (sent) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl">✉️</span>
                </div>
                <h1 className="text-3xl font-serif text-heading mb-2">
                    Check your email.
                </h1>
                <p className="text-sm text-body mb-8">
                    We sent a password reset link to <strong className="text-heading">{email}</strong>. It expires in 1 hour.
                </p>
                <Link to="/login" className="text-sm text-accent font-medium hover:underline">
                    Back to sign in
                </Link>
            </div>
        );
    }

    return (
        <div>
            <Link to="/login" className="inline-flex items-center gap-1 text-xs text-muted hover:text-heading transition-colors duration-200 mb-8">
                <LucideArrowLeft className="w-3 h-3" /> Back to sign in
            </Link>
            <h1 className="text-3xl md:text-4xl font-serif text-heading mb-2">
                Forgot password?
            </h1>
            <p className="text-sm text-body mb-8">
                Enter your email and we'll send you a link to reset it.
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
                <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200"
                >
                    Send reset link
                </button>
            </form>
        </div>
    );
};

export default ForgotPassword;

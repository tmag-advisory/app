import { Link } from "react-router-dom";

const EmailVerification = () => {
    return (
        <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">📬</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-heading mb-2">
                Verify your email.
            </h1>
            <p className="text-sm text-body mb-8 max-w-sm mx-auto">
                We've sent a verification link to your email address. Click
                it to activate your account and start your onboarding.
            </p>

            <div className="bg-button-secondary rounded-2xl p-6 mb-6">
                <p className="text-xs text-muted mb-3">Didn't receive the email?</p>
                <button
                    className="text-sm text-accent font-semibold hover:underline cursor-pointer"
                >
                    Resend verification email
                </button>
            </div>

            {/* Preview shortcut */}
            <Link
                to="/onboarding"
                className="inline-block py-3 px-6 rounded-xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors duration-200"
            >
                Skip to onboarding (preview)
            </Link>
        </div>
    );
};

export default EmailVerification;

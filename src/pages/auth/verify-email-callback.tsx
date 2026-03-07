import { useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import AnimateIn from "../../components/animations/AnimateIn";
import { useVerifyEmail, useAdvanceOnboardingStage } from "../../api/hooks";

const VerifyEmailCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token") ?? "";

    const { isSuccess, isError, isPending, error } = useVerifyEmail(token);
    const advanceStage = useAdvanceOnboardingStage();

    // On success: advance onboarding stage to 2 (User Type) then go to onboarding
    useEffect(() => {
        if (!isSuccess) return;
        advanceStage.mutate(
            { stage: 2 },
            { onSettled: () => navigate("/onboarding") },
        );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSuccess]);

    if (!token) {
        return (
            <AnimateIn type="fade" className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl">⚠️</span>
                </div>
                <h1 className="text-3xl font-serif text-heading mb-2">Invalid link.</h1>
                <p className="text-sm text-body mb-8">
                    This verification link is missing its token. Please check your email and try again.
                </p>
                <Link to="/verify-email" className="text-sm text-accent font-medium hover:underline">
                    Resend verification email
                </Link>
            </AnimateIn>
        );
    }

    if (isPending) {
        return (
            <AnimateIn type="fade" className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <span className="text-2xl">⏳</span>
                </div>
                <h1 className="text-3xl font-serif text-heading mb-2">Verifying…</h1>
                <p className="text-sm text-body">Please wait while we verify your email.</p>
            </AnimateIn>
        );
    }

    if (isError) {
        const msg =
            (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error
            ?? (error as { response?: { data?: { message?: string } } })?.response?.data?.message
            ?? "This link may have expired or already been used.";

        return (
            <AnimateIn type="fade" className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl">❌</span>
                </div>
                <h1 className="text-3xl font-serif text-heading mb-2">Verification failed.</h1>
                <p className="text-sm text-body mb-8">{msg}</p>
                <Link
                    to="/verify-email"
                    className="inline-block py-3 px-6 rounded-xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors duration-200"
                >
                    Resend verification email
                </Link>
            </AnimateIn>
        );
    }

    return (
        <AnimateIn type="fade" className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">✅</span>
            </div>
            <h1 className="text-3xl font-serif text-heading mb-2">Email verified!</h1>
            <p className="text-sm text-body mb-8">
                Your account is now active. Taking you to setup…
            </p>
        </AnimateIn>
    );
};

export default VerifyEmailCallback;

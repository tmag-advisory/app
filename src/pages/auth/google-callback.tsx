import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AnimateIn from "../../components/animations/AnimateIn";
import { LucideLoader } from "lucide-react";
import api from "../../api/axios";
import { getPostAuthRedirect, performRedirect } from "../../lib/roleRedirect";
import { getAffiliateReferralCode } from "../../lib/affiliateTracking";

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

const GoogleCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setAuthFromResponse, logout } = useAuth();
    const [error, setError] = useState("");
    const [redirectModal, setRedirectModal] = useState<{ message: string; url: string } | null>(null);

    const handleCloseModal = useCallback(async () => {
        setRedirectModal(null);
        try {
            await logout();
        } catch {
            // ignore
        }
    }, [logout]);

    useEffect(() => {
        const code = searchParams.get("code");
        const errorParam = searchParams.get("error");

        if (errorParam) {
            setError("Google sign-in was cancelled or failed.");
            return;
        }

        if (!code) {
            setError("Missing authorization code.");
            return;
        }

        let cancelled = false;

        const exchangeCode = async () => {
            try {
                const pendingPlan = sessionStorage.getItem("pending_plan_code");
                if (pendingPlan) sessionStorage.removeItem("pending_plan_code");

                const res = await api.post("/auth/google/callback", {
                    code,
                    planCode: pendingPlan ?? undefined,
                    affiliate_referral_code: getAffiliateReferralCode(),
                });
                const d = res.data.data;

                if (cancelled) return;

                const user = setAuthFromResponse(d);

                // If the backend says this user should log in from a different app, show a modal
                if (user.redirect_to) {
                    setRedirectModal({
                        message: user.redirect_message ?? "This account requires a different portal.",
                        url: user.redirect_to,
                    });
                    return;
                }

                const stage = user.onboarding_stage;

                if (stage > 4) {
                    performRedirect(getPostAuthRedirect(user), navigate, true);
                } else {
                    navigate("/onboarding", { replace: true });
                }
            } catch {
                if (!cancelled) {
                    setError("Google sign-in failed. Please try again.");
                }
            }
        };

        exchangeCode();

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (error) {
        return (
            <AnimateIn type="fade">
                <h1 className="text-3xl md:text-4xl font-serif text-heading mb-2">
                    Something went wrong.
                </h1>
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mt-4">
                    {error}
                </div>
                <button
                    onClick={() => navigate("/login")}
                    className="w-full py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200 mt-4"
                >
                    Back to login
                </button>
            </AnimateIn>
        );
    }

    return (
        <AnimateIn type="fade">
            {redirectModal && (
                <RedirectModal
                    message={redirectModal.message}
                    redirectUrl={redirectModal.url}
                    onClose={handleCloseModal}
                />
            )}
            {!redirectModal && (
                <>
                    <h1 className="text-3xl md:text-4xl font-serif text-heading mb-2">
                        Signing you in…
                    </h1>
                    <p className="text-sm text-body mb-8">
                        Please wait while we complete your Google sign-in.
                    </p>
                    <div className="flex justify-center py-8">
                        <LucideLoader className="animate-spin text-accent" size={32} />
                    </div>
                </>
            )}
        </AnimateIn>
    );
};

export default GoogleCallback;

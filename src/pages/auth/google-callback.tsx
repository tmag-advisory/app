import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AnimateIn from "../../components/animations/AnimateIn";
import { LucideLoader } from "lucide-react";
import api from "../../api/axios";
import { getPostAuthRedirect, performRedirect } from "../../lib/roleRedirect";

const GoogleCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setAuthFromResponse } = useAuth();
    const [error, setError] = useState("");

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
                const res = await api.post("/auth/google/callback", { code });
                const d = res.data.data;

                if (cancelled) return;

                const user = setAuthFromResponse(d);
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
            <h1 className="text-3xl md:text-4xl font-serif text-heading mb-2">
                Signing you in…
            </h1>
            <p className="text-sm text-body mb-8">
                Please wait while we complete your Google sign-in.
            </p>
            <div className="flex justify-center py-8">
                <LucideLoader className="animate-spin text-accent" size={32} />
            </div>
        </AnimateIn>
    );
};

export default GoogleCallback;

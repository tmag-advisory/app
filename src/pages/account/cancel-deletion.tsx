import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { LucideCheckCircle2, LucideLoader2, LucideXCircle } from "lucide-react";
import AnimateIn from "../../components/animations/AnimateIn";
import SEOHead from "../../lib/seo";
import { accountApi } from "../../api";

type Status = "loading" | "success" | "expired" | "error" | "missing";

const CancelDeletion = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<Status>(token ? "loading" : "missing");
    const ran = useRef(false);

    useEffect(() => {
        if (!token || ran.current) return;
        ran.current = true;
        accountApi
            .cancelDeletion(token)
            .then(() => setStatus("success"))
            .catch((err: unknown) => {
                const code = (err as { response?: { status?: number } })?.response?.status;
                setStatus(code === 410 || code === 400 || code === 404 ? "expired" : "error");
            });
    }, [token]);

    return (
        <main>
            <SEOHead
                title="Cancel account deletion — Travel Medicine Advisory Global"
                description="Cancel a pending account deletion request."
                path="/account/cancel-deletion"
                robots="noindex, nofollow"
            />
            <section className="px-8 lg:px-16 pt-24 pb-32 max-w-xl mx-auto">
                <AnimateIn type="fade">
                    <div role="status" aria-live="polite" className="text-center">
                        {status === "loading" && (
                            <>
                                <LucideLoader2 className="w-10 h-10 mx-auto text-accent animate-spin mb-6" aria-hidden="true" />
                                <h1 className="text-2xl font-serif text-heading mb-2">Cancelling your deletion request…</h1>
                                <p className="text-sm text-muted">Please wait a moment.</p>
                            </>
                        )}

                        {status === "success" && (
                            <>
                                <LucideCheckCircle2 className="w-12 h-12 mx-auto text-green-600 mb-6" aria-hidden="true" />
                                <h1 className="text-2xl md:text-3xl font-serif text-heading mb-3">Your account is safe</h1>
                                <p className="text-sm text-body mb-8">
                                    Your account deletion request has been cancelled and your account has been
                                    restored. You can sign in again as usual.
                                </p>
                                <Link
                                    to="/login"
                                    className="inline-block py-3 px-6 rounded-xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors duration-200"
                                >
                                    Sign in
                                </Link>
                            </>
                        )}

                        {status === "expired" && (
                            <>
                                <LucideXCircle className="w-12 h-12 mx-auto text-amber-600 mb-6" aria-hidden="true" />
                                <h1 className="text-2xl md:text-3xl font-serif text-heading mb-3">This link is no longer valid</h1>
                                <p className="text-sm text-body mb-8">
                                    The cancellation link has expired or has already been used. If your 7-day grace
                                    period has passed, the deletion may already be in progress. Contact support if you
                                    need help.
                                </p>
                                <Link
                                    to="/contact"
                                    className="inline-block py-3 px-6 rounded-xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors duration-200"
                                >
                                    Contact support
                                </Link>
                            </>
                        )}

                        {(status === "error" || status === "missing") && (
                            <>
                                <LucideXCircle className="w-12 h-12 mx-auto text-red-600 mb-6" aria-hidden="true" />
                                <h1 className="text-2xl md:text-3xl font-serif text-heading mb-3">Something went wrong</h1>
                                <p className="text-sm text-body mb-8">
                                    {status === "missing"
                                        ? "This page needs a valid cancellation link from your email."
                                        : "We couldn't cancel your deletion request. Please try the link from your email again, or contact support."}
                                </p>
                                <Link
                                    to="/contact"
                                    className="inline-block py-3 px-6 rounded-xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors duration-200"
                                >
                                    Contact support
                                </Link>
                            </>
                        )}
                    </div>
                </AnimateIn>
            </section>
        </main>
    );
};

export default CancelDeletion;

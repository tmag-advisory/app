import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../api/hooks";
import { useVerifyCreditPurchase } from "../../api/hooks";
import { LucideCheckCircle, LucideXCircle, LucideLoader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type PaymentStatus = "verifying" | "success" | "failed";

const ease = [0.25, 0.1, 0.25, 1] as const;

const PaymentCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { mutateAsync: verifyPurchase } = useVerifyCreditPurchase();
    const [status, setStatus] = useState<PaymentStatus>("verifying");
    const [creditsPurchased, setCreditsPurchased] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const hasVerified = useRef(false);

    const txRef = searchParams.get("tx_ref");
    const transactionId = searchParams.get("transaction_id") || undefined;

    useEffect(() => {
        if (hasVerified.current) return;

        const verifyPayment = async () => {
            if (!txRef) {
                setStatus("failed");
                setErrorMessage("Missing transaction reference");
                return;
            }

            hasVerified.current = true;

            try {
                const result = await verifyPurchase({
                    txRef,
                    transactionId,
                });

                if (result?.success && result?.purchase?.status === "completed") {
                    const credits = result.purchase?.creditsPurchased || 0;
                    setCreditsPurchased(credits);
                    setStatus("success");

                    sessionStorage.setItem("paymentSuccess", JSON.stringify({
                        success: true,
                        credits,
                        txRef,
                        timestamp: Date.now()
                    }));

                    // Invalidate queries to refetch profile (server updated credits and onboarding_stage)
                    queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
                    queryClient.invalidateQueries({ queryKey: queryKeys.creditPurchases.all });

                    const redirectTo = searchParams.get("redirect") || "settings";
                    setTimeout(() => {
                        if (redirectTo === "settings") {
                            navigate("/dashboard/settings", { replace: true });
                        } else {
                            navigate("/onboarding?step=welcome", { replace: true });
                        }
                    }, 3000);
                } else {
                    setStatus("failed");
                    setErrorMessage(
                        result?.purchase?.failedReason ||
                        (result?.purchase?.status === "failed" ? "Payment failed" : "Payment was not completed")
                    );
                }
            } catch (error: any) {
                setStatus("failed");
                setErrorMessage(
                    error?.response?.data?.error ||
                    error?.response?.data?.message ||
                    "Failed to verify payment"
                );
            }
        };

        verifyPayment();
    }, [txRef, transactionId]);

    return (
        <div className="min-h-screen bg-background-primary flex flex-col">
            {/* Top bar */}
            <div className="px-8 py-5">
                <Link to="/" className="text-heading tracking-tight text-xl font-serif font-medium">
                    TMAG
                </Link>
            </div>

            {/* Centered content */}
            <div className="flex-1 flex items-center justify-center px-6 pb-16">
                <div className="w-full max-w-md">
                    <AnimatePresence mode="wait">
                        {/* Verifying state */}
                        {status === "verifying" && (
                            <motion.div
                                key="verifying"
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16, scale: 0.97 }}
                                transition={{ duration: 0.5, ease }}
                                className="text-center"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6"
                                >
                                    <LucideLoader2 className="w-7 h-7 text-accent" />
                                </motion.div>
                                <h1 className="text-3xl md:text-4xl font-serif text-heading mb-3">
                                    Verifying payment
                                </h1>
                                <p className="text-sm text-body mb-6">
                                    Please wait while we confirm your transaction...
                                </p>
                                {txRef && (
                                    <p className="text-xs text-muted font-mono">
                                        Ref: {txRef}
                                    </p>
                                )}
                            </motion.div>
                        )}

                        {/* Success state */}
                        {status === "success" && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, ease }}
                                className="text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                                    className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6"
                                >
                                    <LucideCheckCircle className="w-7 h-7 text-accent" />
                                </motion.div>
                                <motion.h1
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.2, ease }}
                                    className="text-3xl md:text-4xl font-serif text-heading mb-3"
                                >
                                    Payment successful
                                </motion.h1>
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.35, ease }}
                                    className="bg-white rounded-2xl border border-border-light/50 p-6 mb-6"
                                >
                                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Credits added</p>
                                    <motion.p
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.5 }}
                                        className="text-4xl font-serif text-accent font-medium"
                                    >
                                        +{creditsPurchased}
                                    </motion.p>
                                </motion.div>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.4, delay: 0.6, ease }}
                                    className="text-sm text-body"
                                >
                                    Your credits have been added to your account. Redirecting...
                                </motion.p>
                            </motion.div>
                        )}

                        {/* Failed state */}
                        {status === "failed" && (
                            <motion.div
                                key="failed"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, ease }}
                                className="text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                                    className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6"
                                >
                                    <LucideXCircle className="w-7 h-7 text-red-500" />
                                </motion.div>
                                <motion.h1
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.2, ease }}
                                    className="text-3xl md:text-4xl font-serif text-heading mb-3"
                                >
                                    Payment failed
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.4, delay: 0.3, ease }}
                                    className="text-sm text-body mb-2"
                                >
                                    {errorMessage || "We couldn't verify your payment. Please try again or contact support."}
                                </motion.p>
                                {txRef && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3, delay: 0.35, ease }}
                                        className="text-xs text-muted font-mono mb-8"
                                    >
                                        Ref: {txRef}
                                    </motion.p>
                                )}
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.4, ease }}
                                    className="flex flex-col gap-3"
                                >
                                    <button
                                        onClick={() => {
                                            const redirectTo = searchParams.get("redirect");
                                            if (redirectTo === "onboarding") {
                                                navigate("/onboarding?step=welcome");
                                            } else {
                                                navigate("/dashboard/settings");
                                            }
                                        }}
                                        className="w-full py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200"
                                    >
                                        Try again
                                    </button>
                                    <button
                                        onClick={() => navigate(searchParams.get("redirect") === "onboarding" ? "/onboarding?step=welcome" : "/dashboard")}
                                        className="w-full py-3 rounded-xl bg-button-secondary text-heading font-semibold text-sm cursor-pointer hover:bg-border-light transition-colors duration-200"
                                    >
                                        Go {searchParams.get("redirect") === "onboarding" ? "to onboarding" : "to dashboard"}
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default PaymentCallback;

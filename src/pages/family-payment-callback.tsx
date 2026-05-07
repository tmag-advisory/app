import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { queryKeys } from "../api/hooks";
import { LucideCheckCircle, LucideXCircle, LucideUsers, LucideLoader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type PaymentStatus = "verifying" | "success" | "failed";

const ease = [0.25, 0.1, 0.25, 1] as const;

const FamilyPaymentCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { refreshProfile } = useAuth();
    const [status, setStatus] = useState<PaymentStatus>("verifying");
    const [purchaseInfo, setPurchaseInfo] = useState<{
        packageType: string;
        tripsAllowed: number;
        amount: string;
    } | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const hasVerified = useRef(false);

    const success = searchParams.get("success");
    const txRef = searchParams.get("tx_ref");
    const packageType = searchParams.get("packageType");
    const tripsAllowed = searchParams.get("tripsAllowed");
    const amount = searchParams.get("amount");
    const errorParam = searchParams.get("error");

    useEffect(() => {
        if (hasVerified.current) return;

        const handleResult = async () => {
            hasVerified.current = true;

            if (success === "true" && txRef) {
                setStatus("success");
                setPurchaseInfo({
                    packageType: packageType || "STANDARD",
                    tripsAllowed: parseInt(tripsAllowed || "1", 10),
                    amount: amount || "$0",
                });

                await queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
                await queryClient.invalidateQueries({ queryKey: queryKeys.familyPackagePurchases.all });
                await refreshProfile();

                sessionStorage.setItem("familyPaymentSuccess", JSON.stringify({
                    success: true,
                    packageType,
                    tripsAllowed: parseInt(tripsAllowed || "1", 10),
                    amount,
                    txRef,
                    timestamp: Date.now(),
                }));

                setTimeout(() => {
                    navigate("/dashboard", { replace: true });
                }, 4000);
            } else {
                setStatus("failed");
                setErrorMessage(
                    errorParam?.replace(/%20/g, " ") ||
                    "Payment was not completed successfully."
                );
            }
        };

        handleResult();
    }, [success, txRef]);

    const packageDisplayName = "Family Plan";

    return (
        <div className="min-h-screen bg-background-primary flex flex-col">
            <div className="px-8 py-5">
                <Link to="/" className="text-heading tracking-tight text-xl font-serif font-medium">
                    TMAG
                </Link>
            </div>

            <div className="flex-1 flex items-center justify-center px-6 pb-16">
                <div className="w-full max-w-md">
                    <AnimatePresence mode="wait">
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
                                    Please wait while we confirm your family plan purchase...
                                </p>
                                {txRef && (
                                    <p className="text-xs text-muted font-mono">
                                        Ref: {txRef}
                                    </p>
                                )}
                            </motion.div>
                        )}

                        {status === "success" && purchaseInfo && (
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
                                    Family Plan activated!
                                </motion.h1>
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.35, ease }}
                                    className="bg-white rounded-2xl border border-border-light/50 p-6 mb-6"
                                >
                                    <div className="flex items-center justify-center gap-3 mb-3">
                                        <LucideUsers className="w-5 h-5 text-accent" />
                                        <p className="text-lg font-serif font-semibold text-heading">{packageDisplayName}</p>
                                    </div>
                                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Plan includes</p>
                                    <p className="text-2xl font-serif text-accent font-medium">
                                        {purchaseInfo.tripsAllowed} Trip{purchaseInfo.tripsAllowed > 1 ? "s" : ""}
                                    </p>
                                    <p className="text-sm text-muted mt-1">
                                        {purchaseInfo.amount} — fully paid
                                    </p>
                                </motion.div>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.4, delay: 0.6, ease }}
                                    className="text-sm text-body"
                                >
                                    Your family plan is now active. Redirecting to your dashboard...
                                </motion.p>
                            </motion.div>
                        )}

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
                                    {errorMessage}
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
                                        onClick={() => navigate("/pricing")}
                                        className="w-full py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200"
                                    >
                                        Try again
                                    </button>
                                    <button
                                        onClick={() => navigate("/dashboard")}
                                        className="w-full py-3 rounded-xl bg-button-secondary text-heading font-semibold text-sm cursor-pointer hover:bg-border-light transition-colors duration-200"
                                    >
                                        Go to dashboard
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

export default FamilyPaymentCallback;

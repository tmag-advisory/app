import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useHrVerifyCreditPurchase } from "../../api/hooks";
import { LucideCheckCircle, LucideXCircle, LucideLoader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { DASHBOARD_GLASS_SURFACE } from "../../components/dashboard/dashboardChrome";

type PaymentStatus = "verifying" | "success" | "failed";

const HRPaymentCallback = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<PaymentStatus>("verifying");
    const [creditsPurchased, setCreditsPurchased] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const verifyPurchase = useHrVerifyCreditPurchase();

    const txRef = searchParams.get("tx_ref");
    const flwStatus = searchParams.get("status");
    const transactionId = searchParams.get("transaction_id");

    useEffect(() => {
        const verifyPayment = async () => {
            if (!txRef) {
                setStatus("failed");
                setErrorMessage("Missing transaction reference");
                return;
            }

            if (flwStatus && flwStatus !== "successful" && flwStatus !== "completed") {
                setStatus("failed");
                setErrorMessage(
                    flwStatus === "cancelled"
                        ? "Payment was cancelled"
                        : "Payment was not completed"
                );
                return;
            }

            try {
                const result = await verifyPurchase.mutateAsync({
                    txRef,
                    transactionId: transactionId || undefined,
                });

                if (result?.success && result?.purchase?.status === "completed") {
                    setCreditsPurchased(result.purchase?.creditsPurchased || 0);
                    setStatus("success");
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
    }, [txRef, flwStatus, transactionId]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-6">
            <div className="w-full max-w-md">
                {status === "verifying" && (
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                            <LucideLoader2 className="w-7 h-7 text-accent animate-spin" />
                        </div>
                        <h1 className="text-2xl font-serif text-heading mb-3">
                            Verifying payment
                        </h1>
                        <p className="text-sm text-muted mb-4">
                            Please wait while we confirm your transaction...
                        </p>
                        {txRef && (
                            <p className="text-xs text-muted font-mono">
                                Ref: {txRef}
                            </p>
                        )}
                    </div>
                )}

                {status === "success" && (
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-6">
                            <LucideCheckCircle className="w-7 h-7 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-serif text-heading mb-3">
                            Payment successful
                        </h1>
                        <div className={cn(DASHBOARD_GLASS_SURFACE, "p-6 mb-6")}>
                            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                Credits added
                            </p>
                            <p className="text-4xl font-serif text-accent font-medium">
                                +{creditsPurchased}
                            </p>
                        </div>
                        <p className="text-sm text-muted mb-6">
                            Your credits have been added to your company account.
                        </p>
                        <Link
                            to="/hr/billing"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors"
                        >
                            Back to Billing
                        </Link>
                    </div>
                )}

                {status === "failed" && (
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
                            <LucideXCircle className="w-7 h-7 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-serif text-heading mb-3">
                            Payment failed
                        </h1>
                        <p className="text-sm text-muted mb-2">
                            {errorMessage || "We couldn't verify your payment. Please try again."}
                        </p>
                        {txRef && (
                            <p className="text-xs text-muted font-mono mb-6">
                                Ref: {txRef}
                            </p>
                        )}
                        <div className="flex flex-col gap-3">
                            <Link
                                to="/hr/billing"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors"
                            >
                                Try Again
                            </Link>
                            <Link
                                to="/hr"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-button-secondary text-heading font-semibold text-sm hover:bg-border-light transition-colors"
                            >
                                Go to Dashboard
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HRPaymentCallback;

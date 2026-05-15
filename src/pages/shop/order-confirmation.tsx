import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useVerifyEbookOrder, useEbookOrderStatus } from "../../api/hooks";
import {
    LucideCheckCircle2, LucideLoader2, LucideXCircle,
    LucideBookOpen, LucideMail, LucideArrowRight
} from "lucide-react";
import SEOHead from "../../lib/seo";

export default function EbookOrderConfirmationPage() {
    const [searchParams] = useSearchParams();
    const txRef = searchParams.get("txRef") ?? "";
    const transactionId = searchParams.get("transaction_id") ?? searchParams.get("transactionId") ?? "";
    const status = searchParams.get("status") ?? "";

    const [verified, setVerified] = useState(false);
    const { mutate: verifyOrder, isPending: isVerifying } = useVerifyEbookOrder();
    const { data: orderData, isLoading: isLoadingStatus } = useEbookOrderStatus(txRef, verified || status === "successful");

    useEffect(() => {
        if (!txRef) return;
        verifyOrder(
            { txRef, transactionId: transactionId || undefined },
            { onSuccess: () => setVerified(true), onError: () => setVerified(true) }
        );
    }, [txRef, transactionId, verifyOrder]);

    const isLoading = isVerifying || isLoadingStatus;
    const order = orderData;
    const isSuccess = order?.status === "completed";
    const isFailed = order?.status === "failed" || (status === "cancelled");

    if (!txRef) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-primary">
                <div className="text-center">
                    <LucideXCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="font-serif text-2xl text-heading mb-2">Invalid link</h2>
                    <p className="text-muted mb-6">No order reference found.</p>
                    <Link to="/shop" className="text-accent underline">← Back to shop</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-primary flex items-center justify-center px-4 py-12">
            <SEOHead title="Order Confirmation — Travel Medicine Advisory Global" path="/shop/order-confirmation" robots="noindex, follow" />
            <div className="max-w-md w-full">
                {isLoading ? (
                    <div className="bg-white rounded-3xl border border-border-light p-12 text-center">
                        <LucideLoader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" />
                        <p className="text-body font-medium">Confirming your order…</p>
                        <p className="text-xs text-muted mt-1">This usually takes a few seconds</p>
                    </div>
                ) : isSuccess ? (
                    <div className="bg-white rounded-3xl border border-border-light overflow-hidden">
                        {/* Success header */}
                        <div className="bg-gradient-to-br from-accent to-accent/80 p-8 text-center">
                            <LucideCheckCircle2 className="w-14 h-14 text-white mx-auto mb-3" />
                            <h1 className="font-serif text-2xl text-white font-semibold">Purchase Successful!</h1>
                            <p className="text-white/80 text-sm mt-1">Your ebook is on its way to your inbox</p>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Order details */}
                            {order && (
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted">Ebook</span>
                                        <span className="font-medium text-heading">{order.ebookTitle}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted">Edition</span>
                                        <span className="text-heading">{order.versionLabel}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted">Amount paid</span>
                                        <span className="font-semibold text-heading">
                                            {order.currencySymbol}{(order.amountPaid ?? order.amount).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted">Order reference</span>
                                        <span className="font-mono text-xs text-muted">{order.txRef}</span>
                                    </div>
                                </div>
                            )}

                            {/* Email notice */}
                            <div className="bg-background-primary rounded-2xl p-4 flex gap-3">
                                <LucideMail className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-heading">Check your email</p>
                                    <p className="text-xs text-muted mt-0.5">
                                        A download link has been sent to{" "}
                                        <strong>{order?.buyerEmail}</strong>.
                                        Check your spam folder if you don't see it within 5 minutes.
                                    </p>
                                </div>
                            </div>

                            {/* CTAs */}
                            <div className="space-y-3">
                                {order && !order.isGuest && (
                                    <Link to="/dashboard/my-ebooks"
                                        className="flex items-center justify-center gap-2 w-full py-3 bg-dark text-white text-sm font-semibold rounded-xl hover:bg-darkest transition-colors">
                                        <LucideBookOpen className="w-4 h-4" />
                                        View in My Ebooks
                                        <LucideArrowRight className="w-4 h-4" />
                                    </Link>
                                )}
                                <Link to="/shop"
                                    className="flex items-center justify-center w-full py-3 border border-border-light text-sm text-heading font-medium rounded-xl hover:bg-background-primary transition-colors">
                                    Back to Shop
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : isFailed ? (
                    <div className="bg-white rounded-3xl border border-border-light overflow-hidden">
                        <div className="bg-gradient-to-br from-red-500 to-red-600 p-8 text-center">
                            <LucideXCircle className="w-14 h-14 text-white mx-auto mb-3" />
                            <h1 className="font-serif text-2xl text-white font-semibold">Payment Failed</h1>
                            <p className="text-white/80 text-sm mt-1">Your payment could not be processed</p>
                        </div>
                        <div className="p-8 space-y-4">
                            <p className="text-sm text-body">
                                Don't worry — you have not been charged. Please try again or use a different payment method.
                            </p>
                            <Link to="/shop"
                                className="flex items-center justify-center w-full py-3 bg-dark text-white text-sm font-semibold rounded-xl hover:bg-darkest transition-colors">
                                Try Again
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-border-light p-8 text-center">
                        <LucideLoader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
                        <p className="text-sm text-muted">Checking payment status...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LucideCheck, LucideX, LucideLoader2 } from "lucide-react";
import Button from "../../components/ui/Button";
import AnimateIn from "../../components/animations/AnimateIn";
import { companyOnboardingApi } from "../../api/api";

const CompanyOnboardingCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [message, setMessage] = useState("");

  const txRef = searchParams.get("tx_ref");
  const flwStatus = searchParams.get("status");
  const transactionId = searchParams.get("transaction_id");

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      if (!txRef) {
        setStatus("failed");
        setMessage("Missing transaction reference.");
        return;
      }

      if (flwStatus && flwStatus !== "successful" && flwStatus !== "completed") {
        setStatus("failed");
        setMessage(
          flwStatus === "cancelled"
            ? "Payment was cancelled."
            : "Payment was not completed. Please try again."
        );
        return;
      }

      try {
        const data = await companyOnboardingApi.verifyPayment(txRef, transactionId || undefined);

        if (cancelled) return;

        if (data.status === "pending_approval" || data.paymentStatus === "completed") {
          setStatus("success");
          setMessage(
            `Payment verified! Your registration for "${data.companyName}" has been submitted for approval. ` +
            "We will notify you via email once it's approved."
          );
        } else {
          setStatus("failed");
          setMessage(`Payment verification returned status: ${data.paymentStatus || data.status}. Please contact support.`);
        }
      } catch (err: any) {
        if (cancelled) return;
        console.error("Payment verification error:", err);
        const errMsg = err?.response?.data?.message || err?.message || "Unknown error";
        setStatus("failed");
        setMessage(`Verification failed: ${errMsg}. Please contact support with your transaction reference.`);
      }
    };

    verify();
    return () => { cancelled = true; };
  }, [txRef, flwStatus, transactionId]);

  return (
    <main className="min-h-screen bg-background-primary flex items-center justify-center px-6">
      <AnimateIn className="max-w-md w-full text-center">
        {status === "verifying" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <LucideLoader2 className="w-12 h-12 animate-spin text-accent mx-auto" />
            <div>
              <h2 className="text-2xl font-serif text-heading mb-2">Verifying payment...</h2>
              <p className="text-sm text-body">Please wait while we confirm your transaction.</p>
              {txRef && <p className="text-xs text-muted font-mono mt-2">Ref: {txRef}</p>}
            </div>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
              <LucideCheck className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-serif text-heading mb-2">Payment Successful!</h2>
              <p className="text-sm text-body leading-relaxed">{message}</p>
            </div>
            <div className="bg-button-secondary rounded-2xl p-4 text-sm text-body">
              <p>What happens next:</p>
              <ul className="mt-2 space-y-1.5 text-left list-disc list-inside">
                <li>Our team will review your registration</li>
                <li>You'll receive an email once approved</li>
                <li>Team members will get invitation emails to access their dashboards</li>
              </ul>
            </div>
            <Button variant="primary" onClick={() => navigate("/")} className="w-full">
              Back to Home
            </Button>
          </motion.div>
        )}

        {status === "failed" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <LucideX className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-serif text-heading mb-2">Payment Issue</h2>
              <p className="text-sm text-body">{message}</p>
              {txRef && <p className="text-xs text-muted font-mono mt-2">Ref: {txRef}</p>}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => navigate("/company-onboarding")} className="flex-1">
                Try Again
              </Button>
              <Button variant="primary" onClick={() => navigate("/")} className="flex-1">
                Go Home
              </Button>
            </div>
          </motion.div>
        )}
      </AnimateIn>
    </main>
  );
};

export default CompanyOnboardingCallback;

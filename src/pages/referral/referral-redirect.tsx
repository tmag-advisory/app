import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LucideLoader } from "lucide-react";
import { trackAffiliateReferral } from "../../lib/affiliateTracking";

const ReferralRedirect = () => {
    const { shortCode } = useParams<{ shortCode: string }>();
    const [error, setError] = useState("");

    useEffect(() => {
        if (!shortCode) {
            setError("Referral link is missing.");
            return;
        }

        let cancelled = false;
        const track = async () => {
            try {
                const data = await trackAffiliateReferral(shortCode);
                if (!cancelled) {
                    window.location.assign(data.destination_url || "/pricing");
                }
            } catch {
                if (!cancelled) {
                    setError("This referral link is invalid or expired.");
                }
            }
        };

        void track();
        return () => {
            cancelled = true;
        };
    }, [shortCode]);

    if (error) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-background-primary">
                <h1 className="text-3xl font-serif text-heading mb-3">Referral link unavailable.</h1>
                <p className="text-sm text-body mb-6">{error}</p>
                <Link to="/pricing" className="text-sm font-semibold text-accent hover:underline">
                    View pricing
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-background-primary">
            <LucideLoader className="w-8 h-8 animate-spin text-accent mb-4" />
            <h1 className="text-3xl font-serif text-heading mb-2">Applying affiliate discount…</h1>
            <p className="text-sm text-body">You’ll be redirected in a moment.</p>
        </main>
    );
};

export default ReferralRedirect;

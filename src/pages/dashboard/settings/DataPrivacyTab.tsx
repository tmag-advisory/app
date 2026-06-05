import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LucideExternalLink, LucideDownload, LucideLoader2, LucideTriangleAlert } from "lucide-react";
import { DASHBOARD_GLASS_SURFACE } from "../../../components/dashboard/dashboardChrome";
import { cn } from "../../../lib/utils";
import Modal from "../../../components/ui/Modal";
import { useAuth } from "../../../context/AuthContext";
import { accountApi, privacyApi } from "../../../api";

const DataPrivacyTab = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const downloadPolicy = async () => {
        setDownloading(true);
        try {
            const policy = await privacyApi.getCurrent();
            const header = `Privacy Policy — version ${policy.version}\nEffective: ${policy.effective_date}\n\n`;
            const blob = new Blob([header + policy.content], { type: "text/markdown;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `tmag-privacy-policy-${policy.version}.md`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch {
            toast.error("Could not download the privacy policy.");
        } finally {
            setDownloading(false);
        }
    };

    const requestDeletion = async () => {
        setDeleting(true);
        try {
            await accountApi.requestDeletion();
            setConfirmOpen(false);
            toast.success("Account deletion requested. Check your email to cancel within 7 days.");
            await logout();
            navigate("/", { replace: true });
        } catch (err: unknown) {
            const data = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data;
            toast.error(data?.message ?? data?.error ?? "Could not submit the deletion request.");
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Privacy policy */}
            <div className={cn(DASHBOARD_GLASS_SURFACE, "p-6 md:p-8")}>
                <h2 className="text-base font-semibold text-heading mb-2">Privacy policy</h2>
                <p className="text-sm text-muted mb-5">
                    Review how we collect, use, and protect your data, or download a copy for your records.
                </p>
                <div className="flex flex-wrap gap-3">
                    <Link
                        to="/privacy"
                        className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-button-secondary text-heading font-semibold text-sm hover:bg-button-secondary/70 transition-colors duration-200"
                    >
                        <LucideExternalLink className="w-4 h-4" aria-hidden="true" /> View privacy policy
                    </Link>
                    <button
                        type="button"
                        onClick={downloadPolicy}
                        disabled={downloading}
                        className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl border border-border-light text-heading font-semibold text-sm hover:bg-background-primary transition-colors duration-200 disabled:opacity-50 cursor-pointer"
                    >
                        {downloading ? (
                            <LucideLoader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        ) : (
                            <LucideDownload className="w-4 h-4" aria-hidden="true" />
                        )}
                        Download
                    </button>
                </div>
            </div>

            {/* Danger zone */}
            <div className="rounded-2xl border-2 border-red-200 bg-red-50/50 p-6 md:p-8">
                <h2 className="flex items-center gap-2 text-base font-semibold text-red-700 mb-2">
                    <LucideTriangleAlert className="w-5 h-5" aria-hidden="true" /> Delete my account
                </h2>
                <p className="text-sm text-body mb-2">
                    Requesting deletion locks your account immediately and starts a <strong>7-day grace period</strong>.
                    We'll email you a cancellation link — use it any time within those 7 days to restore your account.
                </p>
                <p className="text-sm text-body mb-5">
                    After the grace period and final review, your personal data is permanently removed. This cannot be
                    undone.
                </p>
                <button
                    type="button"
                    onClick={() => setConfirmOpen(true)}
                    className="py-2.5 px-5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors duration-200 cursor-pointer"
                >
                    Delete my account
                </button>
            </div>

            <Modal
                isOpen={confirmOpen}
                onClose={() => !deleting && setConfirmOpen(false)}
                title="Delete your account?"
                describedById="delete-account-desc"
            >
                <p id="delete-account-desc" className="text-sm text-body mb-6">
                    Your account will be locked right away and scheduled for deletion. You'll have 7 days to cancel via
                    the link we email you. After that, your data is permanently removed. You'll be signed out now.
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => setConfirmOpen(false)}
                        disabled={deleting}
                        className="py-2.5 px-4 rounded-xl border border-border-light text-heading font-semibold text-sm hover:bg-background-primary transition-colors duration-200 disabled:opacity-50 cursor-pointer"
                    >
                        Keep my account
                    </button>
                    <button
                        type="button"
                        onClick={requestDeletion}
                        disabled={deleting}
                        className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 cursor-pointer"
                    >
                        {deleting && <LucideLoader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                        Yes, delete my account
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default DataPrivacyTab;

import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import familyTripApi from "../../api/familyTrip";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import {DashboardAmbientBackground} from "../../components/dashboard/dashboardChrome";
import type {FamilyTripResponse} from "../../api/types";
import {
    LucideArrowRight,
    LucideCalendar,
    LucideCreditCard,
    LucideDownload,
    LucideLoader2,
    LucideMapPin,
    LucideUsers
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";

export default function FamilyTripView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [trip, setTrip] = useState<FamilyTripResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    // const [visibleCodes, setVisibleCodes] = useState<Record<number, boolean>>({});
    const [familyPlan, setFamilyPlan] = useState<{ id: number; status: string } | null>(null);
    const [familyPlanLoading, setFamilyPlanLoading] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const res = await familyTripApi.getById(Number(id));
                setTrip(res.data.data);
            } catch (err) {
                toast.error("Failed to load family trip details");
                navigate("/dashboard/plans");
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchTrip();
    }, [id, navigate]);

    useEffect(() => {
        if (!trip?.familyPlanId) return;
        const fetchFamilyPlan = async () => {
            setFamilyPlanLoading(true);
            try {
                const res = await familyTripApi.getFamilyPlan(trip.id);
                if (res.data.data) {
                    setFamilyPlan({ id: (res.data.data as any).id, status: (res.data.data as any).status });
                }
            } catch {
                // silently ignore
            } finally {
                setFamilyPlanLoading(false);
            }
        };
        fetchFamilyPlan();
    }, [trip?.familyPlanId]);

    const handleDownloadPdf = async () => {
        if (!trip) return;
        setDownloadingPdf(true);
        try {
            const res = await familyTripApi.downloadFamilyPdf(trip.id);
            const url = URL.createObjectURL(res.data as Blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "family-travel-health-plan.pdf";
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            toast.error("Failed to download PDF");
        } finally {
            setDownloadingPdf(false);
        }
    };

    // const handleRegenerateCode = async (memberId: number) => {
    //     try {
    //         const res = await familyTripApi.regenerateCode(Number(id), memberId);
    //         const newCode = res?.data?.data?.loginCode;
    //         if (newCode && trip) {
    //             setTrip({
    //                 ...trip,
    //                 members: trip.members.map((m) =>
    //                     m.id === memberId ? { ...m, loginCode: newCode } : m
    //                 ),
    //             });
    //         }
    //         toast.success("Access code regenerated and emailed to member");
    //     } catch (err) {
    //         toast.error("Failed to regenerate code");
    //     }
    // };
    //
    // const toggleCodeVisibility = (memberId: number) => {
    //     setVisibleCodes((prev) => ({ ...prev, [memberId]: !prev[memberId] }));
    // };
    //
    // const copyCode = (code: string) => {
    //     navigator.clipboard.writeText(code);
    //     toast.success("Code copied to clipboard");
    // };

    if (isLoading) return <div className="p-8 text-center text-muted">Loading...</div>;
    if (!trip) return null;

    return (
        <div className="relative min-h-screen font-sans">
            <DashboardAmbientBackground />
            <DashboardHeader title="Family Trip Details" />

            <div className="relative z-10 max-w-7xl mx-auto px-2 pb-14 md:px-6 pt-8">
                <div className="bg-white rounded-3xl shadow-[0_4px_16px_-6px_rgba(10,20,18,0.06)] border border-border-light overflow-hidden">
                    {/* Header */}
                    <div className="bg-background-secondary border-b border-border-light p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${trip.status === 'SUBMITTED' ? 'bg-accent/10 text-accent' : 'bg-emerald-50 text-emerald-700'}`}>
                                    {trip.status}
                                </span>
                                <span className="text-sm font-medium text-muted">Trip #{trip.id}</span>
                            </div>
                            <h2 className="text-2xl font-serif text-heading flex items-center gap-2">
                                <LucideMapPin className="w-6 h-6 text-accent" />
                                {trip.destination}, {trip.country}
                            </h2>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-body bg-white px-4 py-3 rounded-xl border border-border-light shadow-sm">
                            <div className="flex items-center gap-2">
                                <LucideCalendar className="w-4 h-4 text-muted" />
                                <span>{trip.duration} days</span>
                            </div>
                            <div className="w-px h-4 bg-border-light" />
                            <div className="flex items-center gap-2">
                                <LucideCreditCard className="w-4 h-4 text-muted" />
                                <span>
                                    {trip.currency === "NGN" ? "₦" : "$"}
                                    {(trip.totalFiatCost / 100).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Members */}
                    <div className="p-6 md:p-8">
                        {(trip.familyPlanId || familyPlanLoading) && (
                            <div className="mb-6 p-5 border border-accent/20 rounded-2xl bg-accent/5">
                                <div className="flex items-center justify-between flex-wrap gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-heading">Family Travel Health Plan</p>
                                        <p className="text-xs text-muted mt-0.5">
                                            {familyPlanLoading ? "Loading..." :
                                             familyPlan?.status === "COMPLETED" ? "Plan ready" :
                                             familyPlan?.status === "PROCESSING" ? "Generating..." :
                                             familyPlan?.status === "QUEUED" ? "Queued for generation" :
                                             familyPlan?.status === "FAILED" ? "Generation failed" :
                                             "Pending"}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {familyPlan?.status === "COMPLETED" && (
                                            <>
                                                <Button
                                                    variant="secondary"
                                                    onClick={handleDownloadPdf}
                                                    disabled={downloadingPdf}
                                                    icon={downloadingPdf ? <LucideLoader2 className="w-4 h-4 animate-spin" /> : <LucideDownload className="w-4 h-4" />}
                                                >
                                                    Download PDF
                                                </Button>
                                                <Button
                                                    variant="primary"
                                                    onClick={() => navigate(`/dashboard/family-trip/${trip.id}/plan`)}
                                                    icon={<LucideArrowRight className="w-4 h-4" />}
                                                    className="bg-dark text-background-primary hover:bg-darkest"
                                                >
                                                    View Plan
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <h3 className="text-xl font-serif text-heading mb-6 flex items-center gap-2">
                            <LucideUsers className="w-5 h-5 text-muted" />
                            Family Members ({trip.members.length})
                        </h3>

                        <div className="grid gap-4">
                            {trip.members.map((member) => (
                                <div key={member.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 border border-border-light rounded-2xl hover:border-accent hover:shadow-[0_4px_16px_-6px_rgba(42,122,106,0.15)] transition-all bg-white group">
                                    <div className="flex items-start gap-4 mb-4 md:mb-0">
                                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                            <span className="text-accent font-serif font-bold text-sm">
                                                {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-heading text-lg">
                                                {member.firstName} {member.lastName}
                                            </h4>
                                            <p className="text-sm text-muted flex items-center gap-2">
                                                <span className="capitalize font-medium">{member.relationship.toLowerCase()}</span>
                                                <span className="text-border-light">&bull;</span>
                                                <span>{member.ageAtDeparture} years old</span>
                                                {member.memberEmail && (
                                                    <>
                                                        <span className="text-border-light">&bull;</span>
                                                        <span>{member.memberEmail}</span>
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1">Status</p>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${member.questionnaireStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-gold/10 text-gold-dark'}`}>
                                                {member.questionnaireStatus}
                                            </span>
                                        </div>

                                        {member.loginCode && (
                                            <>
                                                <div className="h-10 w-px bg-border-light" />
                                                {/*<div className="flex flex-col items-end gap-1">
                                                    <p className="text-[10px] uppercase tracking-wider text-muted font-semibold">Access Code</p>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-mono text-sm font-semibold text-heading bg-background-secondary border border-border-light px-2.5 py-1 rounded-lg tracking-widest">
                                                            {visibleCodes[member.id] ? member.loginCode : "••••••"}
                                                        </span>
                                                        <button
                                                            onClick={() => toggleCodeVisibility(member.id)}
                                                            className="p-1.5 rounded-lg hover:bg-background-secondary transition-colors text-muted hover:text-heading"
                                                            title={visibleCodes[member.id] ? "Hide code" : "Show code"}
                                                        >
                                                            {visibleCodes[member.id] ? <LucideEyeOff className="w-3.5 h-3.5" /> : <LucideEye className="w-3.5 h-3.5" />}
                                                        </button>
                                                        <button
                                                            onClick={() => member.loginCode && copyCode(member.loginCode)}
                                                            className="p-1.5 rounded-lg hover:bg-background-secondary transition-colors text-muted hover:text-heading"
                                                            title="Copy code"
                                                        >
                                                            <LucideCopy className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>*/}
                                            </>
                                        )}

                                        {/*<div className="h-10 w-px bg-border-light" />*/}

                                        {/*<button
                                            onClick={() => handleRegenerateCode(member.id)}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-heading bg-white border border-border-light rounded-xl hover:bg-background-secondary transition-colors group-hover:border-accent/30"
                                        >
                                            <LucideRefreshCw className="w-4 h-4 text-muted group-hover:text-accent" />
                                            Regenerate Code
                                        </button>*/}

                                        {!trip.familyPlanId && member.travelPlanId && (
                                            <Button
                                                variant="primary"
                                                onClick={() => navigate(`/dashboard/plans/${member.travelPlanId}`)}
                                                className="bg-dark text-background-primary hover:bg-darkest"
                                                icon={<LucideArrowRight className="w-4 h-4" />}
                                            >
                                                View Plan
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

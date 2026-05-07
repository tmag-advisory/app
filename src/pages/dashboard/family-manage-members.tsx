import { useEffect, useState } from "react";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import { cn } from "../../lib/utils";
import { DASHBOARD_GLASS_SURFACE } from "../../components/dashboard/dashboardChrome";
import familyTripApi from "../../api/familyTrip";
import type { FamilyTripResponse } from "../../api/types";
import {
    LucideUsers,
    LucideLoader2,
    LucideCopy,
    LucideCheck,
    LucideRefreshCw,
    LucideMail,
    LucideArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function FamilyManageMembers() {
    const [trips, setTrips] = useState<FamilyTripResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [regeneratingId, setRegeneratingId] = useState<{ tripId: number; memberId: number } | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        setIsLoading(true);
        try {
            const res = await familyTripApi.list();
            setTrips(res.data.data ?? []);
        } catch (err) {
            console.error("Failed to fetch family trips", err);
            toast.error("Could not load family members");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerateCode = async (tripId: number, memberId: number) => {
        setRegeneratingId({ tripId, memberId });
        try {
            const res = await familyTripApi.regenerateCode(tripId, memberId);
            const newCode = res.data.data?.loginCode;
            if (newCode) {
                toast.success("New login code generated");
                // Refresh to get updated codes
                await fetchTrips();
            }
        } catch (err) {
            toast.error("Failed to regenerate code");
        } finally {
            setRegeneratingId(null);
        }
    };

    const copyToClipboard = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            toast.error("Failed to copy");
        }
    };

    const allMembers = trips.flatMap(trip =>
        trip.members.map(member => ({
            ...member,
            tripId: trip.id,
            tripDestination: trip.destination,
            tripCountry: trip.country,
            tripStatus: trip.status,
        }))
    );

    return (
        <div>
            <DashboardHeader title="Manage Family Members" />

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <LucideLoader2 className="w-6 h-6 text-accent animate-spin" />
                </div>
            ) : allMembers.length === 0 ? (
                <div className={cn(DASHBOARD_GLASS_SURFACE, "p-12 text-center")}>
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                        <LucideUsers className="w-8 h-8 text-accent" />
                    </div>
                    <p className="text-sm font-semibold text-heading mb-2">No family members yet</p>
                    <p className="text-xs text-muted mb-6 max-w-sm mx-auto">
                        Create a family trip and add members to see them here. Each member will get a login code to access their personalized travel health plan.
                    </p>
                    <Link
                        to="/dashboard/family-trip"
                        className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors duration-200"
                    >
                        <LucideArrowRight className="w-4 h-4" />
                        Create a family trip
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Summary card */}
                    <div className={cn(DASHBOARD_GLASS_SURFACE, "p-5")}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                                <LucideUsers className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-heading">
                                    {allMembers.length} family member{allMembers.length !== 1 ? "s" : ""} across {trips.length} trip{trips.length !== 1 ? "s" : ""}
                                </p>
                                <p className="text-xs text-muted">
                                    {allMembers.filter(m => m.loginCode).length} with active login codes
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Members grouped by trip */}
                    {trips.map((trip) => (
                        <div key={trip.id} className={cn(DASHBOARD_GLASS_SURFACE, "overflow-hidden")}>
                            {/* Trip header */}
                            <div className="px-5 py-4 border-b border-border-light/50 flex items-center justify-between">
                                <div>
                                    <Link
                                        to={`/dashboard/family-trip/${trip.id}`}
                                        className="text-sm font-semibold text-heading hover:text-accent transition-colors"
                                    >
                                        {trip.destination}
                                    </Link>
                                    <p className="text-xs text-muted mt-0.5">
                                        {trip.country} · {trip.duration} days · {trip.status}
                                    </p>
                                </div>
                                <span className={cn(
                                    "text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full",
                                    trip.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" :
                                    trip.status === "DRAFT" ? "bg-amber-50 text-amber-700" :
                                    "bg-slate-100 text-muted"
                                )}>
                                    {trip.status}
                                </span>
                            </div>

                            {/* Members table */}
                            <div className="divide-y divide-border-light/30">
                                {trip.members.map((member) => (
                                    <div key={member.id} className="px-5 py-4 flex items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-heading">
                                                    {member.firstName} {member.lastName}
                                                </p>
                                                <span className="text-[10px] text-muted capitalize bg-slate-100 px-2 py-0.5 rounded-full">
                                                    {member.relationship.toLowerCase()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                                {member.memberEmail && (
                                                    <span className="text-xs text-muted flex items-center gap-1">
                                                        <LucideMail className="w-3 h-3" />
                                                        {member.memberEmail}
                                                    </span>
                                                )}
                                                <span className={cn(
                                                    "text-[10px] font-medium px-2 py-0.5 rounded-full",
                                                    member.questionnaireStatus === "COMPLETE"
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-amber-50 text-amber-700"
                                                )}>
                                                    {member.questionnaireStatus === "COMPLETE" ? "Health info complete" : "Health info pending"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Login code */}
                                        <div className="flex items-center gap-3 shrink-0">
                                            {member.loginCode ? (
                                                <div className="flex items-center gap-2">
                                                    <code className="text-xs font-mono font-semibold bg-slate-100 px-2.5 py-1.5 rounded-lg text-heading tracking-wider">
                                                        {member.loginCode}
                                                    </code>
                                                    <button
                                                        onClick={() => copyToClipboard(member.loginCode!, `code-${member.id}`)}
                                                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                                        title="Copy login code"
                                                    >
                                                        {copiedId === `code-${member.id}` ? (
                                                            <LucideCheck className="w-3.5 h-3.5 text-accent" />
                                                        ) : (
                                                            <LucideCopy className="w-3.5 h-3.5 text-muted hover:text-heading" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleRegenerateCode(trip.id, member.id)}
                                                        disabled={regeneratingId?.tripId === trip.id && regeneratingId?.memberId === member.id}
                                                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40"
                                                        title="Regenerate login code"
                                                    >
                                                        <LucideRefreshCw className={cn(
                                                            "w-3.5 h-3.5 text-muted hover:text-heading",
                                                            regeneratingId?.tripId === trip.id && regeneratingId?.memberId === member.id && "animate-spin"
                                                        )} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleRegenerateCode(trip.id, member.id)}
                                                    disabled={regeneratingId?.tripId === trip.id && regeneratingId?.memberId === member.id}
                                                    className="text-xs text-accent font-medium hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-40"
                                                >
                                                    <LucideRefreshCw className={cn(
                                                        "w-3 h-3",
                                                        regeneratingId?.tripId === trip.id && regeneratingId?.memberId === member.id && "animate-spin"
                                                    )} />
                                                    Generate code
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

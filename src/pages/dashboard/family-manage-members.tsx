import React, { useEffect, useState } from "react";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import { cn } from "../../lib/utils";
import { DASHBOARD_GLASS_SURFACE } from "../../components/dashboard/dashboardChrome";
import PaginationFooter from "../../components/dashboard/PaginationFooter";
import familyTripApi from "../../api/familyTrip";
import type { FamilyTripResponse, Pagination } from "../../api/types";
import {
    LucideUsers,
    LucideLoader2,
    LucideCopy,
    LucideCheck,
    LucideRefreshCw,
    LucideMail,
    LucideArrowRight,
    LucideMapPin,
    LucideEye,
    LucideFileText,
    LucideKeyRound,
    LucideClipboardCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
    return (
        <div className={cn(DASHBOARD_GLASS_SURFACE, "p-4")}>
            <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                    {icon}
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted">{label}</span>
            </div>
            <p className="text-2xl font-serif text-heading">{value}</p>
        </div>
    );
}

export default function FamilyManageMembers() {
    const [trips, setTrips] = useState<FamilyTripResponse[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    const [regeneratingId, setRegeneratingId] = useState<{ tripId: number; memberId: number } | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        fetchTrips();
    }, [page, perPage]);

    const fetchTrips = async () => {
        setIsLoading(true);
        try {
            const res = await familyTripApi.list({ page, per_page: perPage });
            const paginated = res.data.data;
            setTrips(paginated?.data ?? []);
            setPagination(paginated?.pagination ?? null);
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
            ) : (pagination?.total ?? 0) === 0 ? (
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
                    {/* Stats grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatCard
                            icon={<LucideMapPin className="w-4 h-4 text-accent" />}
                            label="Total trips"
                            value={pagination?.total ?? trips.length}
                        />
                        <StatCard
                            icon={<LucideUsers className="w-4 h-4 text-accent" />}
                            label="Members on page"
                            value={allMembers.length}
                        />
                        <StatCard
                            icon={<LucideKeyRound className="w-4 h-4 text-accent" />}
                            label="Active codes (page)"
                            value={allMembers.filter(m => m.loginCode).length}
                        />
                        <StatCard
                            icon={<LucideClipboardCheck className="w-4 h-4 text-accent" />}
                            label="Health info complete (page)"
                            value={allMembers.filter(m => m.questionnaireStatus === "COMPLETE").length}
                        />
                    </div>

                    {/* Members grouped by trip */}
                    {trips.map((trip) => {
                        const completed = trip.members.filter(m => m.questionnaireStatus === "COMPLETE").length;
                        return (
                        <div key={trip.id} className={cn(DASHBOARD_GLASS_SURFACE, "overflow-hidden")}>
                            {/* Trip header */}
                            <div className="px-5 py-4 md:px-6 md:py-5 border-b border-border-light/50 bg-background-secondary/40">
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={cn(
                                                "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full",
                                                trip.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" :
                                                trip.status === "DRAFT" ? "bg-amber-50 text-amber-700" :
                                                trip.status === "SUBMITTED" ? "bg-accent/10 text-accent" :
                                                "bg-slate-100 text-muted"
                                            )}>
                                                {trip.status}
                                            </span>
                                            <span className="text-[10px] text-muted">Trip #{trip.id}</span>
                                        </div>
                                        <Link
                                            to={`/dashboard/family-trip/${trip.id}`}
                                            className="group inline-flex items-center gap-1.5 text-base font-serif text-heading hover:text-accent transition-colors"
                                        >
                                            <LucideMapPin className="w-4 h-4 text-accent" />
                                            <span className="truncate">{trip.destination}, {trip.country}</span>
                                        </Link>
                                        <p className="text-xs text-muted mt-1">
                                            {trip.duration} days · {trip.members.length} member{trip.members.length !== 1 ? "s" : ""} · {completed}/{trip.members.length} health info complete
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <Link
                                            to={`/dashboard/family-trip/${trip.id}`}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-heading bg-white border border-border-light rounded-lg hover:border-accent/40 hover:bg-background-secondary transition-colors"
                                        >
                                            <LucideEye className="w-3.5 h-3.5" />
                                            View trip
                                        </Link>
                                        {trip.familyPlanId && (
                                            <Link
                                                to={`/dashboard/family-trip/${trip.id}/plan`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors"
                                            >
                                                <LucideFileText className="w-3.5 h-3.5" />
                                                View plan
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Members list */}
                            <div className="divide-y divide-border-light/30">
                                {trip.members.map((member) => {
                                    const initials = `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`.toUpperCase();
                                    const regenerating = regeneratingId?.tripId === trip.id && regeneratingId?.memberId === member.id;
                                    return (
                                    <div key={member.id} className="px-5 py-4 md:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-background-secondary/30 transition-colors">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                                <span className="text-accent font-serif font-bold text-xs">{initials}</span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-semibold text-heading">
                                                        {member.firstName} {member.lastName}
                                                    </p>
                                                    <span className="text-[10px] text-muted capitalize bg-slate-100 px-2 py-0.5 rounded-full">
                                                        {member.relationship.toLowerCase()}
                                                    </span>
                                                    <span className={cn(
                                                        "text-[10px] font-medium px-2 py-0.5 rounded-full",
                                                        member.questionnaireStatus === "COMPLETE"
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : "bg-amber-50 text-amber-700"
                                                    )}>
                                                        {member.questionnaireStatus === "COMPLETE" ? "Health info complete" : "Health info pending"}
                                                    </span>
                                                </div>
                                                {member.memberEmail && (
                                                    <span className="text-xs text-muted ring flex items-center gap-1 mt-1">
                                                        <LucideMail className="w-3 h-3" />
                                                        {member.memberEmail}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Login code */}
                                        {/*<div className="flex items-center gap-2 shrink-0 md:pl-4">
                                            {member.loginCode ? (
                                                <>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[9px] uppercase tracking-wider text-muted font-semibold mb-0.5">Access code</span>
                                                        <code className="text-xs font-mono font-semibold bg-slate-100 px-2.5 py-1 rounded-lg text-heading tracking-widest">
                                                            {member.loginCode}
                                                        </code>
                                                    </div>
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
                                                        disabled={regenerating}
                                                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40"
                                                        title="Regenerate login code"
                                                    >
                                                        <LucideRefreshCw className={cn(
                                                            "w-3.5 h-3.5 text-muted hover:text-heading",
                                                            regenerating && "animate-spin"
                                                        )} />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => handleRegenerateCode(trip.id, member.id)}
                                                    disabled={regenerating}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-accent font-medium border border-accent/30 rounded-lg hover:bg-accent/5 transition-colors cursor-pointer disabled:opacity-40"
                                                >
                                                    <LucideRefreshCw className={cn("w-3 h-3", regenerating && "animate-spin")} />
                                                    Generate code
                                                </button>
                                            )}
                                        </div>*/}
                                    </div>
                                    );
                                })}
                            </div>
                        </div>
                        );
                    })}

                    {pagination && pagination.total > 0 && (
                        <div className={cn(DASHBOARD_GLASS_SURFACE, "overflow-hidden")}>
                            <PaginationFooter
                                page={pagination.page}
                                pageSize={pagination.pageSize}
                                total={pagination.total}
                                totalPages={pagination.totalPages}
                                onPageChange={setPage}
                                onPageSizeChange={(size) => {
                                    setPerPage(size);
                                    setPage(1);
                                }}
                                className="border-t-0"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

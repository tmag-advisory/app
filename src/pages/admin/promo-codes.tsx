import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { LucideLoader, LucideTag } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getPromoStats } from "../../api/promoCodes";

const ADMIN_ROLES = ["superadmin", "admin"];

const PromoCodesAdmin = () => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;
    if (!ADMIN_ROLES.includes(user.extend.role_name.toLowerCase())) {
        return <Navigate to="/unauthorized" replace />;
    }

    const { data, isLoading, error } = useQuery({
        queryKey: ["admin", "promo-codes", "stats"],
        queryFn: getPromoStats,
        refetchInterval: 60_000,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LucideLoader className="h-6 w-6 animate-spin text-muted" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6">
                <div className="max-w-md text-center">
                    <p className="text-sm text-red-600">
                        Couldn't load promo code stats. Make sure the backend exposes
                        <code className="mx-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs">GET /admin/promo-codes/stats</code>.
                    </p>
                </div>
            </div>
        );
    }

    const pct = (n: number, d: number) => (d === 0 ? 0 : Math.round((n / d) * 100));

    return (
        <div className="min-h-screen bg-background-primary px-6 py-10 md:px-12">
            <header className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-widest text-muted">Soft launch</p>
                    <h1 className="mt-1 text-3xl md:text-4xl font-serif text-heading">
                        Promo code tracking
                    </h1>
                    <p className="mt-2 text-sm text-body">
                        Live redemption counts and conversion by source.
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-xs uppercase tracking-widest text-muted">Total redeemed</div>
                    <div className="text-3xl font-semibold text-heading">
                        {data.totals.redeemed}
                        <span className="text-base font-normal text-muted"> / {data.totals.cap}</span>
                    </div>
                </div>
            </header>

            {/* Per-code cards */}
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-10">
                {data.codes.map((c) => {
                    const percent = pct(c.redeemed, c.cap);
                    const expired = new Date(c.expires_at).getTime() < Date.now();
                    const exhausted = c.redeemed >= c.cap;
                    const statusLabel =
                        !c.active ? "Inactive"
                        : expired ? "Expired"
                        : exhausted ? "Cap reached"
                        : "Active";
                    const statusColor =
                        statusLabel === "Active" ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700";
                    return (
                        <article
                            key={c.code}
                            className="rounded-2xl border border-border-light bg-white p-5"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <LucideTag className="h-4 w-4 text-muted" />
                                        <h2 className="font-semibold text-heading tracking-wide">{c.code}</h2>
                                    </div>
                                    <p className="mt-1 text-xs text-muted capitalize">
                                        {c.audience} · Free {c.tier.toLowerCase()} tier
                                        {!c.listed && " · unlisted"}
                                    </p>
                                </div>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor}`}>
                                    {statusLabel}
                                </span>
                            </div>

                            <div className="mt-4">
                                <div className="flex items-baseline justify-between text-sm">
                                    <span className="font-semibold text-heading">
                                        {c.redeemed} / {c.cap}
                                    </span>
                                    <span className="text-muted">{c.remaining} left</span>
                                </div>
                                <div className="mt-2 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                                    <div
                                        className="h-full bg-accent rounded-full transition-all"
                                        style={{ width: `${Math.min(100, percent)}%` }}
                                    />
                                </div>
                            </div>

                            <p className="mt-3 text-xs text-muted">
                                Expires {new Date(c.expires_at).toLocaleDateString()}
                            </p>
                        </article>
                    );
                })}
            </section>

            {/* Recent redemptions */}
            <section className="rounded-2xl border border-border-light bg-white">
                <header className="px-5 py-4 border-b border-border-light">
                    <h2 className="font-semibold text-heading">Recent redemptions</h2>
                </header>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs uppercase tracking-wider text-muted">
                            <tr>
                                <th className="text-left px-5 py-3">When</th>
                                <th className="text-left px-5 py-3">Code</th>
                                <th className="text-left px-5 py-3">User</th>
                                <th className="text-left px-5 py-3">Source</th>
                                <th className="text-left px-5 py-3">Tier</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.recent_redemptions.length === 0 ?
                                <tr>
                                    <td colSpan={5} className="px-5 py-8 text-center text-muted">
                                        No redemptions yet.
                                    </td>
                                </tr>
                            :   data.recent_redemptions.map((r) => (
                                    <tr key={r.id} className="border-t border-border-light">
                                        <td className="px-5 py-3 text-body">
                                            {new Date(r.redeemed_at).toLocaleString()}
                                        </td>
                                        <td className="px-5 py-3 font-medium text-heading">{r.code}</td>
                                        <td className="px-5 py-3 text-body">{r.user_email ?? "—"}</td>
                                        <td className="px-5 py-3 text-body">{r.source}</td>
                                        <td className="px-5 py-3 capitalize text-body">
                                            {r.tier_granted.toLowerCase()}
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default PromoCodesAdmin;

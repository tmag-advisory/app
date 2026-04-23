import type { ReactNode } from "react";
import type { DashboardAnalyticsDto } from "../../api/types";
import { LucideLoader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { DASHBOARD_GLASS_SURFACE } from "./dashboardChrome";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
} from "recharts";

const COLORS = ["#2a7a6a", "#c4953a", "#2a1e14", "#7a6a5a", "#b0a090", "#8a7968", "#5a8a7a", "#d4c4b4"];

const tooltipProps = {
    contentStyle: {
        backgroundColor: "#fffdf9",
        border: "1px solid #e8ddd3",
        borderRadius: "8px",
        fontSize: "12px",
    },
};

function formatStatusLabel(s: string): string {
    if (!s) return "—";
    const lower = s.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function hasPositiveCount(items: { count: number }[]): boolean {
    return items.some((i) => i.count > 0);
}

type DashboardAnalyticsChartsProps = {
    data: DashboardAnalyticsDto | undefined;
    isLoading: boolean;
    /** Company / HR scope includes credit-request chart and top-employees table */
    variant: "company" | "individual";
};

const ChartCard = ({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) => (
    <div
        className={cn(
            DASHBOARD_GLASS_SURFACE,
            "p-4 sm:p-5 flex flex-col min-h-[280px]",
        )}
    >
        <div className="mb-3">
            <h3 className="text-base font-semibold text-heading">{title}</h3>
            {description ? <p className="text-xs text-muted mt-0.5">{description}</p> : null}
        </div>
        <div className="flex-1 min-h-[220px] w-full">{children}</div>
    </div>
);

const DashboardAnalyticsCharts = ({ data, isLoading, variant }: DashboardAnalyticsChartsProps) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className={cn(
                            DASHBOARD_GLASS_SURFACE,
                            "p-8 flex items-center justify-center min-h-[280px]",
                        )}
                    >
                        <LucideLoader2 className="w-8 h-8 text-accent animate-spin" />
                    </div>
                ))}
            </div>
        );
    }

    if (!data) {
        return null;
    }

    const statusData = data.plansByStatus.map((d) => ({ ...d, name: formatStatusLabel(d.name) }));
    const creditData = data.creditRequestsByStatus.map((d) => ({ ...d, name: formatStatusLabel(d.name) }));

    return (
        <div className="space-y-4 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Plans by status" description="All travel plans in this scope">
                    {hasPositiveCount(statusData) ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    dataKey="count"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={52}
                                    outerRadius={80}
                                    paddingAngle={2}
                                >
                                    {statusData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#fffdf9" strokeWidth={1} />
                                    ))}
                                </Pie>
                                <Tooltip {...tooltipProps} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-sm text-muted flex items-center justify-center h-full min-h-[200px]">
                            No plan data yet — create a plan to see this chart.
                        </p>
                    )}
                </ChartCard>

                <ChartCard title="Plans created" description="Last six months">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.plansCreatedLastSixMonths} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e8ddd3" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#7a6a5a" }} axisLine={false} tickLine={false} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#7a6a5a" }} axisLine={false} tickLine={false} width={32} />
                            <Tooltip {...tooltipProps} />
                            <Bar dataKey="count" fill="#2a7a6a" radius={[6, 6, 0, 0]} maxBarSize={36} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Top destinations" description="By number of plans">
                    {hasPositiveCount(data.topDestinations) ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={data.topDestinations}
                                margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e8ddd3" horizontal={false} />
                                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: "#7a6a5a" }} axisLine={false} tickLine={false} />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={108}
                                    tick={{ fontSize: 10, fill: "#3d2c1e" }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip {...tooltipProps} />
                                <Bar dataKey="count" fill="#c4953a" radius={[0, 6, 6, 0]} maxBarSize={22} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-sm text-muted flex items-center justify-center h-full min-h-[200px]">
                            Destination breakdown will appear once plans exist.
                        </p>
                    )}
                </ChartCard>

                {variant === "company" && (
                    <ChartCard title="Credit requests" description="By current status">
                        {hasPositiveCount(creditData) ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={creditData}
                                        dataKey="count"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={48}
                                        outerRadius={76}
                                        paddingAngle={2}
                                    >
                                        {creditData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} stroke="#fffdf9" strokeWidth={1} />
                                        ))}
                                    </Pie>
                                    <Tooltip {...tooltipProps} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-sm text-muted flex items-center justify-center h-full min-h-[200px]">
                                No credit requests yet.
                            </p>
                        )}
                    </ChartCard>
                )}
            </div>

            {variant === "company" && data.topEmployeesByPlans.length > 0 ? (
                <div className={cn(DASHBOARD_GLASS_SURFACE, "overflow-hidden")}>
                    <div className="px-4 sm:px-6 py-4 border-b border-border-light/50">
                        <h3 className="text-base font-semibold text-heading">Team — plans generated</h3>
                        <p className="text-xs text-muted mt-0.5">From usage report data</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-wider text-muted border-b border-border-light/50 bg-button-secondary/40">
                                    <th className="px-4 sm:px-6 py-3 font-semibold">Team member</th>
                                    <th className="px-4 py-3 font-semibold text-right">Plans</th>
                                    <th className="px-4 sm:px-6 py-3 font-semibold text-right">Credits used</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light/50">
                                {data.topEmployeesByPlans.map((row, idx) => (
                                    <tr key={`${row.name}-${idx}`} className="hover:bg-background-secondary/40 transition-colors">
                                        <td className="px-4 sm:px-6 py-3 font-medium text-heading">{row.name}</td>
                                        <td className="px-4 py-3 text-right tabular-nums text-heading">{row.plansGenerated}</td>
                                        <td className="px-4 sm:px-6 py-3 text-right tabular-nums text-muted">{row.creditsUsed}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default DashboardAnalyticsCharts;

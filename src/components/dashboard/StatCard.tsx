import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { DASHBOARD_GLASS_SURFACE } from "./dashboardChrome";

interface StatCardProps {
    label: string;
    value: string | number;
    icon?: ReactNode;
    detail?: string;
    accent?: boolean;
}

const StatCard = ({ label, value, icon, detail, accent }: StatCardProps) => {
    return (
        <div
            className={cn(
                DASHBOARD_GLASS_SURFACE,
                "p-4 sm:p-6 flex flex-col gap-3",
            )}
        >
            <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-muted font-semibold">
                    {label}
                </span>
                {icon && (
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent ? "bg-accent/10 text-accent" : "bg-button-secondary text-heading"}`}>
                        {icon}
                    </div>
                )}
            </div>
            <span className="text-2xl sm:text-3xl font-serif text-heading">{value}</span>
            {detail && (
                <span className="text-xs text-muted">{detail}</span>
            )}
        </div>
    );
};

export default StatCard;

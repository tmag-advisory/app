import { useAuth } from "../../context/AuthContext";
import { usePlanStore } from "../../stores/planStore";
import { LucideCoins, LucideMenu } from "lucide-react";
import { useSidebarStore } from "../../stores/sidebarStore";
import { canAccessHR } from "../../lib/canAccessHr";
import { cn } from "../../lib/utils";

const DashboardHeader = ({ title }: { title: string }) => {
    const { user } = useAuth();
    const toggle = useSidebarStore((s) => s.toggle);
    const selectedCompany = usePlanStore((s) => s.selectedCompany);

    const isHR = canAccessHR(user);
    const company = isHR ? selectedCompany() : null;
    
    // For HR view, show company credits. For individual view, show user credits.
    const credits = isHR ? (company ? company.totalCredits - company.usedCredits : 0) : (user?.credits ?? 0);

    const chipCls =
        "rounded-xl border border-border-light/55 bg-white/75 px-3 py-2 backdrop-blur-md shadow-[0_1px_3px_rgba(10,20,18,0.04),0_6px_20px_-14px_rgba(10,20,18,0.06)]";

    return (
        <header className="flex items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3 min-w-0">
                <button
                    onClick={toggle}
                    className={cn(
                        chipCls,
                        "lg:hidden p-2 text-heading transition-colors duration-150 cursor-pointer shrink-0 hover:border-accent/25",
                    )}
                >
                    <LucideMenu className="w-5 h-5" />
                </button>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-heading tracking-tight truncate">
                    {title}
                </h1>
            </div>
            <div className="flex items-center gap-3 shrink-0">
                <div
                    className={cn(
                        chipCls,
                        "flex items-center gap-2 sm:px-4",
                    )}
                >
                    <LucideCoins className="w-4 h-4 text-accent" />
                    <span className="text-sm font-semibold text-heading tabular-nums">
                        {credits}
                    </span>
                    <span className="text-xs text-muted hidden sm:inline">credits</span>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;

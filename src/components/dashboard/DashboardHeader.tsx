import { useAuth } from "../../context/AuthContext";
import { usePlanStore } from "../../stores/planStore";
import { LucideCoins, LucideMenu } from "lucide-react";
import { useSidebarStore } from "../../stores/sidebarStore";
import { canAccessHR } from "../../lib/canAccessHr";

const DashboardHeader = ({ title }: { title: string }) => {
    const { user } = useAuth();
    const toggle = useSidebarStore((s) => s.toggle);
    const selectedCompany = usePlanStore((s) => s.selectedCompany);

    const isHR = canAccessHR(user);
    const company = isHR ? selectedCompany() : null;
    
    // For HR view, show company credits. For individual view, show user credits.
    const credits = isHR ? (company ? company.totalCredits - company.usedCredits : 0) : (user?.credits ?? 0);

    return (
        <header className="flex items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3 min-w-0">
                <button
                    onClick={toggle}
                    className="lg:hidden p-2 rounded-xl bg-button-secondary text-heading hover:bg-border-light transition-colors duration-150 cursor-pointer shrink-0"
                >
                    <LucideMenu className="w-5 h-5" />
                </button>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-heading truncate">
                    {title}
                </h1>
            </div>
            <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2 bg-button-secondary rounded-xl px-3 sm:px-4 py-2">
                    <LucideCoins className="w-4 h-4 text-accent" />
                    <span className="text-sm font-semibold text-heading">
                        {credits}
                    </span>
                    <span className="text-xs text-muted hidden sm:inline">credits</span>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;

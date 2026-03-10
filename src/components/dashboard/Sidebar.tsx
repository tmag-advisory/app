import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePlanStore } from "../../stores/planStore";
import { cn } from "../../lib/utils";
import type { ReactNode } from "react";
import {
    LucideLayoutDashboard,
    LucidePlusCircle,
    LucideFileText,
    LucideSettings,
    LucideUsers,
    LucideInbox,
    LucideBarChart3,
    LucideCreditCard,
    LucideLogOut,
    LucideX,
    LucideChevronsUpDown,
    LucideBuilding2,
} from "lucide-react";

interface NavItem {
    label: string;
    href: string;
    icon: ReactNode;
}

const individualNav: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: <LucideLayoutDashboard className="w-4 h-4" /> },
    { label: "Create Plan", href: "/dashboard/create-plan", icon: <LucidePlusCircle className="w-4 h-4" /> },
    { label: "My Plans", href: "/dashboard/plans", icon: <LucideFileText className="w-4 h-4" /> },
    { label: "Settings", href: "/dashboard/settings", icon: <LucideSettings className="w-4 h-4" /> },
];

const hrNav: NavItem[] = [
    { label: "Dashboard", href: "/hr", icon: <LucideLayoutDashboard className="w-4 h-4" /> },
    { label: "Employees", href: "/hr/employees", icon: <LucideUsers className="w-4 h-4" /> },
    { label: "Create Plan", href: "/hr/create-plan", icon: <LucidePlusCircle className="w-4 h-4" /> },
    { label: "Travel Requests", href: "/hr/travel-requests", icon: <LucideInbox className="w-4 h-4" /> },
    { label: "Reports", href: "/hr/reports", icon: <LucideBarChart3 className="w-4 h-4" /> },
    { label: "Billing", href: "/hr/billing", icon: <LucideCreditCard className="w-4 h-4" /> },
];

// ─── Company Switcher ────────────────────────────────────────

import type { Company } from "../../stores/planStore";
import { useState } from "react";
import { useSidebarStore } from "../../stores/sidebarStore";
import { canAccessHR } from "../../lib/canAccessHr";
import { useMyCompanies } from "../../api/hooks";

const CompanySwitcher = ({
    companies,
    currentCompany,
    onSelect,
}: {
    companies: Company[];
    currentCompany: Company | undefined;
    onSelect: (id: string) => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="px-3 py-3 border-b border-white/6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/6 transition-colors duration-150 cursor-pointer"
            >
                <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                    <LucideBuilding2 className="w-3.5 h-3.5 text-accent" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-white truncate">
                        {currentCompany?.name ?? "Select company"}
                    </p>
                    <p className="text-[10px] text-white/30 capitalize">
                        {currentCompany?.plan} plan
                    </p>
                </div>
                {companies?.length > 1 && (
                    <LucideChevronsUpDown className="w-3.5 h-3.5 text-white/30 shrink-0" />
                )}
            </button>

            {isOpen && companies.length > 1 && (
                <div className="mt-1 space-y-0.5">
                    {companies && companies.length > 1 && companies.map((company) => (
                        <button
                            key={company.id}
                            onClick={() => {
                                onSelect(company.id);
                                setIsOpen(false);
                            }}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors duration-150 cursor-pointer",
                                company.id === currentCompany?.id
                                    ? "bg-white/10 text-white"
                                    : "text-white/50 hover:text-white hover:bg-white/4",
                            )}
                        >
                            <div className={cn(
                                "w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0",
                                company.id === currentCompany?.id
                                    ? "bg-accent text-white"
                                    : "bg-white/10 text-white/50",
                            )}>
                                {company.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{company.name}</p>
                                <p className="text-[10px] text-white/30">{company.industry}</p>
                            </div>
                            {company.id === currentCompany?.id && (
                                <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { open, close } = useSidebarStore();
    const { companies, selectedCompanyId, selectCompany, setCompanies } = usePlanStore();

    const isHR = canAccessHR(user);
    const navItems = isHR ? hrNav : individualNav;

    const { data: myCompanies, isSuccess } = useMyCompanies({ enabled: isHR });

    // Sync API companies into planStore and auto-select on load
    useEffect(() => {
        if (!isSuccess || !myCompanies || myCompanies.length === 0) return;
        const mapped: Company[] = myCompanies.map((c) => ({
            id: String(c.id),
            name: c.name,
            industry: c.industry ?? "",
            totalCredits: c.total_credits ?? 0,
            usedCredits: c.used_credits ?? 0,
            employeeCount: c.employee_count ?? 0,
            plan: (c.plan as Company["plan"]) ?? "starter",
        }));
        setCompanies(mapped);
        if (!selectedCompanyId || !mapped.some((c) => c.id === selectedCompanyId)) {
            selectCompany(mapped[0].id);
        }
    }, [isSuccess, myCompanies]);

    const currentCompany = companies.find((c) => c.id === selectedCompanyId) ?? companies[0];

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    // Close sidebar on route change (mobile)
    useEffect(() => {
        close();
    }, [location.pathname, close]);

    const isActive = (href: string) => {
        if (href === "/dashboard" || href === "/hr") {
            return location.pathname === href;
        }
        return location.pathname.startsWith(href);
    };

    return (
        <>
            {/* Mobile overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={close}
                />
            )}

            <aside
                className={cn(
                    "fixed top-0 left-0 h-screen w-64 bg-darkest text-white flex flex-col z-50 transition-transform duration-300",
                    open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                )}
            >
                {/* Logo + close button */}
                <div className="flex items-center justify-between px-6 py-6 border-b border-white/6">
                    <Link to="/" className="text-xl font-serif font-medium tracking-tight">
                        TMAG
                    </Link>
                    <button
                        onClick={close}
                        className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors duration-150 cursor-pointer"
                    >
                        <LucideX className="w-4 h-4 text-white/50" />
                    </button>
                </div>

                {/* Company switcher (HR only) */}
                {isHR && companies.length > 0 && (
                    <CompanySwitcher
                        companies={companies}
                        currentCompany={currentCompany}
                        onSelect={selectCompany}
                    />
                )}

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150",
                                isActive(item.href)
                                    ? "bg-white/10 text-white"
                                    : "text-white/45 hover:text-white hover:bg-white/4",
                            )}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* User info + logout */}
                <div className="px-4 py-4 border-t border-white/6">
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold text-white/70">
                            {user?.first_name?.charAt(0) ?? "?"}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {user ? `${user.first_name} ${user.last_name}` : ""}
                            </p>
                            <p className="text-xs text-white/30 truncate">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/4 transition-colors duration-150 cursor-pointer"
                    >
                        <LucideLogOut className="w-4 h-4" />
                        Sign out
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;

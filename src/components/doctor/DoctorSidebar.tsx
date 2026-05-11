import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSidebarStore } from "../../stores/sidebarStore";
import { cn } from "../../lib/utils";
import {
    LucideLayoutDashboard,
    LucideClipboardList,
    LucideCheckCircle,
    LucideStethoscope,
    LucideLogOut,
    LucideX,
    LucideMenu,
    LucideUser,
} from "lucide-react";

const navItems = [
    { path: "/doctor", label: "Dashboard", icon: <LucideLayoutDashboard className="w-4 h-4" /> },
    { path: "/doctor/pending", label: "Pending Validations", icon: <LucideClipboardList className="w-4 h-4" /> },
    { path: "/doctor/validated", label: "Validated Plans", icon: <LucideCheckCircle className="w-4 h-4" /> },
    { path: "/doctor/profile", label: "Profile", icon: <LucideUser className="w-4 h-4" /> },
];

const DoctorSidebar = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const { open, toggle, close } = useSidebarStore();

    useEffect(() => {
        close();
    }, [location.pathname, close]);

    const isActive = (path: string) => {
        if (path === "/doctor") return location.pathname === "/doctor";
        return location.pathname.startsWith(path);
    };

    return (
        <>
            {/* Mobile toggle button */}
            <button
                onClick={toggle}
                className="fixed top-4 left-4 z-60 lg:hidden p-2 rounded-xl bg-darkest text-white/70 hover:text-white shadow-lg transition-colors duration-150"
            >
                <LucideMenu className="w-5 h-5" />
            </button>

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
                {/* Logo */}
                <div className="flex items-center justify-between px-6 py-6 border-b border-white/6">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                            <LucideStethoscope className="w-3.5 h-3.5 text-accent" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white leading-tight">Doctor Portal</p>
                            <p className="text-[10px] text-white/30">TMAG Validation</p>
                        </div>
                    </div>
                    <button
                        onClick={close}
                        className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors duration-150 cursor-pointer"
                    >
                        <LucideX className="w-4 h-4 text-white/50" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150",
                                isActive(item.path)
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
                                Dr. {user?.first_name} {user?.last_name}
                            </p>
                            <p className="text-xs text-white/30 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => logout()}
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

export default DoctorSidebar;

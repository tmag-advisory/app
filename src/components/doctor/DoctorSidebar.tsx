import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    ClipboardList,
    CheckCircle,
    Stethoscope,
    Menu,
    X,
    ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface NavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { path: "/doctor", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { path: "/doctor/pending", label: "Pending Validations", icon: <ClipboardList size={20} /> },
    { path: "/doctor/validated", label: "Validated Plans", icon: <CheckCircle size={20} /> },
];

const DoctorSidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const location = useLocation();
    const { user, logout } = useAuth();

    const isActive = (path: string) => {
        if (path === "/doctor") return location.pathname === "/doctor";
        return location.pathname.startsWith(path);
    };

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-60 lg:hidden p-2 rounded-lg bg-black shadow-md border border-gray-200"
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 z-[55] lg:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ x: isOpen ? 0 : -280 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 left-0 z-[56] h-screen w-64 bg-white border-r border-gray-200 flex flex-col lg:translate-x-0"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#008080] flex items-center justify-center text-white">
                            <Stethoscope size={20} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 leading-tight">Doctor Portal</h1>
                            <p className="text-xs text-gray-500">TMAG Validation</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(item.path)
                                    ? "bg-[#008080]/10 text-[#008080]"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            {item.icon}
                            <span className="flex-1">{item.label}</span>
                            {isActive(item.path) && <ChevronRight size={16} />}
                        </NavLink>
                    ))}
                </nav>

                {/* User */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-[#008080]/10 flex items-center justify-center text-[#008080] text-sm font-bold">
                            {user?.first_name?.[0]}{user?.last_name?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                Dr. {user?.first_name} {user?.last_name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="w-full py-2 px-4 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </motion.aside>
        </>
    );
};

export default DoctorSidebar;

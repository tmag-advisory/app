import { Outlet, Link } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import { useMyCompanies } from "../api/hooks";
import { useAuth } from "../context/AuthContext";
import {
    LucideBuilding2,
    LucideLoader2,
    LucideMailQuestion,
} from "lucide-react";

const HRDashboardLayout = () => {
    const { canAccessHR } = useAuth();
    const {
        data: myCompanies,
        isLoading,
        isSuccess,
    } = useMyCompanies({ enabled: canAccessHR });

    const hasCompany = isSuccess && myCompanies && myCompanies.length > 0;

    // Still loading — show spinner
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background-primary flex items-center justify-center">
                <LucideLoader2 className="w-6 h-6 text-accent animate-spin" />
            </div>
        );
    }

    // Loaded but no companies
    if (isSuccess && !hasCompany) {
        return (
            <div className="min-h-screen bg-background-primary flex items-center justify-center px-6">
                <div className="max-w-md text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-6">
                        <LucideBuilding2 className="w-8 h-8 text-gold" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-serif text-heading mb-3">
                        No company linked
                    </h1>
                    <p className="text-sm text-body leading-relaxed mb-6">
                        Your account doesn't have a company associated with it
                        yet. You need to be linked to a company before you can
                        access the HR dashboard and manage employees, travel
                        requests, and billing.
                    </p>
                    <div className="bg-button-secondary rounded-2xl p-5 mb-8 text-left">
                        <div className="flex items-start gap-3">
                            <LucideMailQuestion className="w-5 h-5 text-muted mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-heading mb-1">
                                    What to do next
                                </p>
                                <ul className="text-sm text-body space-y-1.5">
                                    <li>
                                        Contact your system administrator to
                                        link your account to a company.
                                    </li>
                                    <li>
                                        If you're a new company, reach out to
                                        TMAG support to get set up.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a
                            href="mailto:support@travelmedicine.global"
                            className="py-3 px-6 rounded-xl bg-dark text-background-primary font-semibold text-sm  transition-colors duration-200"
                        >
                            Contact support
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-primary">
            <Sidebar />
            <main className="lg:ml-64 px-4 sm:px-6 lg:px-12 py-6 sm:py-8 max-w-7xl">
                <Outlet />
            </main>
        </div>
    );
};

export default HRDashboardLayout;

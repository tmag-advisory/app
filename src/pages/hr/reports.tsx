import { usePlanStore } from "../../stores/planStore";
import { useTravelPlans, useEmployees, useTravelRequests } from "../../api/hooks";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import { LucideDownload, LucideFileText, LucideBarChart3, LucideShieldCheck, LucideLoader2 } from "lucide-react";

const Reports = () => {
    const { selectedCompanyId } = usePlanStore();
    const companyIdNum = selectedCompanyId ? parseInt(selectedCompanyId) : undefined;

    const { data: plansData, isLoading: plansLoading } = useTravelPlans({ companyId: companyIdNum });
    const { data: employeesData, isLoading: employeesLoading } = useEmployees({ companyId: companyIdNum });
    const { data: requestsData, isLoading: requestsLoading } = useTravelRequests({ companyId: companyIdNum });

    const plans = plansData?.data || [];
    const employees = employeesData?.data || [];
    const travelRequests = requestsData?.data || [];

    const isLoading = plansLoading || employeesLoading || requestsLoading;

    const reportTypes = [
        {
            icon: <LucideBarChart3 className="w-5 h-5" />,
            title: "Usage report",
            description: "Credit usage, plans generated, and employee activity for the current period.",
            format: "CSV / PDF",
        },
        {
            icon: <LucideFileText className="w-5 h-5" />,
            title: "Plan history export",
            description: "All generated travel health plans with destination, risk scores, and dates.",
            format: "CSV / PDF",
        },
        {
            icon: <LucideShieldCheck className="w-5 h-5" />,
            title: "Compliance documentation",
            description: "Duty-of-care audit trail with timestamped plan delivery and employee acknowledgments.",
            format: "PDF",
        },
    ];

    return (
        <div>
            <DashboardHeader title="Reports & exports" />

            {/* Summary stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-2xl border border-border-light/50 p-5 text-center">
                    {isLoading ? (
                        <LucideLoader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                        <span className="text-2xl font-serif text-heading block">{plansData?.pagination.total ?? 0}</span>
                    )}
                    <span className="text-xs text-muted">Total plans</span>
                </div>
                <div className="bg-white rounded-2xl border border-border-light/50 p-5 text-center">
                    {isLoading ? (
                        <LucideLoader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                        <span className="text-2xl font-serif text-heading block">{employeesData?.pagination.total ?? 0}</span>
                    )}
                    <span className="text-xs text-muted">Employees</span>
                </div>
                <div className="bg-white rounded-2xl border border-border-light/50 p-5 text-center">
                    {isLoading ? (
                        <LucideLoader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                        <span className="text-2xl font-serif text-heading block">{travelRequests.filter((r) => r.status === "completed").length}</span>
                    )}
                    <span className="text-xs text-muted">Completed trips</span>
                </div>
                <div className="bg-white rounded-2xl border border-border-light/50 p-5 text-center">
                    {isLoading ? (
                        <LucideLoader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                        <span className="text-2xl font-serif text-heading block">{employees.reduce((s, e) => s + (e.creditsUsed || 0), 0)}</span>
                    )}
                    <span className="text-xs text-muted">Credits used</span>
                </div>
            </div>

            {/* Report cards */}
            <div className="space-y-4">
                {reportTypes.map((report) => (
                    <div
                        key={report.title}
                        className="bg-white rounded-2xl border border-border-light/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-dark text-background-primary flex items-center justify-center shrink-0">
                                {report.icon}
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-heading mb-1">{report.title}</h3>
                                <p className="text-xs text-body leading-relaxed">{report.description}</p>
                                <p className="text-xs text-muted mt-1">Format: {report.format}</p>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-button-secondary text-heading text-sm font-semibold hover:bg-border-light transition-colors duration-200 cursor-pointer shrink-0">
                            <LucideDownload className="w-4 h-4" /> Export
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reports;

import { useState } from "react";
import { usePlanStore } from "../../stores/planStore";
import { useTravelPlans, useEmployees, useUsageReport, usePlanHistory, useComplianceReport } from "../../api/hooks";
import { reportsApi } from "../../api/api";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import { LucideDownload, LucideFileText, LucideBarChart3, LucideShieldCheck, LucideLoader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { DASHBOARD_GLASS_SURFACE } from "../../components/dashboard/dashboardChrome";

const Reports = () => {
    const { selectedCompanyId } = usePlanStore();
    const companyIdNum = selectedCompanyId ? parseInt(selectedCompanyId) : undefined;

    const { data: plansData, isLoading: plansLoading } = useTravelPlans({ companyId: companyIdNum });
    const { data: employeesData, isLoading: employeesLoading } = useEmployees({ companyId: companyIdNum });

    useUsageReport(companyIdNum);
    usePlanHistory(companyIdNum);
    useComplianceReport(companyIdNum);

    const [exporting, setExporting] = useState<string | null>(null);

    const isLoading = plansLoading || employeesLoading;

    const employees = employeesData?.data || [];

    const handleExportUsageCsv = async () => {
        setExporting("usage");
        try {
            const response = await reportsApi.getUsageReportCsv(companyIdNum);
            downloadCsv(response.data, "usage-report.csv");
        } catch (error) {
            console.error("Failed to export usage report:", error);
        } finally {
            setExporting(null);
        }
    };

    const handleExportPlanHistoryCsv = async () => {
        setExporting("plans");
        try {
            const response = await reportsApi.getPlanHistoryCsv(companyIdNum);
            downloadCsv(response.data, "plan-history.csv");
        } catch (error) {
            console.error("Failed to export plan history:", error);
        } finally {
            setExporting(null);
        }
    };

    const handleExportComplianceCsv = async () => {
        setExporting("compliance");
        try {
            const response = await reportsApi.getComplianceReportCsv(companyIdNum);
            downloadCsv(response.data, "compliance-report.csv");
        } catch (error) {
            console.error("Failed to export compliance report:", error);
        } finally {
            setExporting(null);
        }
    };

    const downloadCsv = (data: string, filename: string) => {
        const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const reportTypes = [
        {
            id: "usage",
            icon: <LucideBarChart3 className="w-5 h-5" />,
            title: "Usage report",
            description: "Credit usage, plans generated, and employee activity for the current period.",
            format: "CSV",
            onExport: handleExportUsageCsv,
            loading: exporting === "usage",
        },
        {
            id: "plans",
            icon: <LucideFileText className="w-5 h-5" />,
            title: "Plan history export",
            description: "All generated travel health plans with destination, risk scores, and dates.",
            format: "CSV",
            onExport: handleExportPlanHistoryCsv,
            loading: exporting === "plans",
        },
        {
            id: "compliance",
            icon: <LucideShieldCheck className="w-5 h-5" />,
            title: "Compliance documentation",
            description: "Duty-of-care audit trail with timestamped plan delivery and employee acknowledgments.",
            format: "CSV",
            onExport: handleExportComplianceCsv,
            loading: exporting === "compliance",
        },
    ];

    return (
        <div>
            <DashboardHeader title="Reports & exports" />

            {/* Summary stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className={cn(DASHBOARD_GLASS_SURFACE, "p-5 text-center")}>
                    {isLoading ? (
                        <LucideLoader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                        <span className="text-2xl font-serif text-heading block">{plansData?.pagination.total ?? 0}</span>
                    )}
                    <span className="text-xs text-muted">Total plans</span>
                </div>
                <div className={cn(DASHBOARD_GLASS_SURFACE, "p-5 text-center")}>
                    {isLoading ? (
                        <LucideLoader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                        <span className="text-2xl font-serif text-heading block">{employeesData?.pagination.total ?? 0}</span>
                    )}
                    <span className="text-xs text-muted">Employees</span>
                </div>
                <div className={cn(DASHBOARD_GLASS_SURFACE, "p-5 text-center")}>
                    {isLoading ? (
                        <LucideLoader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                        <span className="text-2xl font-serif text-heading block">{plansData?.pagination.total ?? 0}</span>
                    )}
                    <span className="text-xs text-muted">Travel plans</span>
                </div>
                <div className={cn(DASHBOARD_GLASS_SURFACE, "p-5 text-center")}>
                    {isLoading ? (
                        <LucideLoader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                        <span className="text-2xl font-serif text-heading block">{employees.reduce((s: number, e: { creditsUsed?: number }) => s + (e.creditsUsed || 0), 0)}</span>
                    )}
                    <span className="text-xs text-muted">Credits used</span>
                </div>
            </div>

            {/* Report cards */}
            <div className="space-y-4">
                {reportTypes.map((report) => (
                    <div
                        key={report.id}
                        className={cn(
                            DASHBOARD_GLASS_SURFACE,
                            "p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                        )}
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
                        <button
                            onClick={report.onExport}
                            disabled={report.loading}
                            className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-button-secondary text-heading text-sm font-semibold hover:bg-border-light transition-colors duration-200 cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {report.loading ? (
                                <LucideLoader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <LucideDownload className="w-4 h-4" />
                            )}
                            {report.loading ? "Exporting..." : "Export"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reports;
import { useParams, useNavigate } from "react-router-dom";
import { useEmployee, useTravelPlans } from "../../api/hooks";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import { LucideArrowLeft, LucideLoader2, LucideMapPin, LucideCoins, LucideClipboardList } from "lucide-react";

const EmployeeDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const employeeId = id ? parseInt(id) : 0;

    const { data: employee, isLoading } = useEmployee(employeeId);
    const { data: plansData } = useTravelPlans({ companyId: employee?.companyId });

    const employeePlans = (plansData?.data || []).filter(
        (p) => p.employeeId === employeeId
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <LucideLoader2 className="w-6 h-6 text-accent animate-spin" />
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="text-center py-24">
                <p className="text-sm text-muted">Employee not found.</p>
                <button onClick={() => navigate("/hr/employees")} className="mt-4 text-sm text-accent hover:underline">
                    Back to employees
                </button>
            </div>
        );
    }

    const creditUsagePercent = employee.creditsAllocated > 0
        ? Math.round((employee.creditsUsed / employee.creditsAllocated) * 100)
        : 0;

    return (
        <div>
            <DashboardHeader title="Employee profile" />

            <button
                onClick={() => navigate("/hr/employees")}
                className="flex items-center gap-1.5 text-xs text-muted hover:text-heading transition-colors mb-6 cursor-pointer"
            >
                <LucideArrowLeft className="w-3.5 h-3.5" /> Back to employees
            </button>

            {/* Profile header */}
            <div className="bg-white rounded-2xl border border-border-light/50 p-6 mb-6">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-button-secondary flex items-center justify-center text-xl font-semibold text-heading shrink-0">
                        {employee.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-serif text-heading">{employee.name}</h2>
                        <p className="text-sm text-muted">{employee.email}</p>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-body bg-button-secondary px-2.5 py-1 rounded-full">{employee.department}</span>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                employee.status === "active" ? "text-accent bg-accent/10" : "text-muted bg-button-secondary"
                            }`}>
                                {employee.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-border-light/50 p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                            <LucideCoins className="w-4 h-4 text-accent" />
                        </div>
                        <span className="text-xs font-semibold text-muted uppercase tracking-wider">Credits</span>
                    </div>
                    <p className="text-2xl font-serif text-heading">{employee.creditsUsed} <span className="text-sm text-muted font-sans">/ {employee.creditsAllocated}</span></p>
                    <div className="mt-2 h-1.5 rounded-full bg-border-light/60 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-accent transition-all duration-500"
                            style={{ width: `${Math.min(creditUsagePercent, 100)}%` }}
                        />
                    </div>
                    <p className="text-xs text-muted mt-1">{creditUsagePercent}% used</p>
                </div>

                <div className="bg-white rounded-2xl border border-border-light/50 p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                            <LucideClipboardList className="w-4 h-4 text-accent" />
                        </div>
                        <span className="text-xs font-semibold text-muted uppercase tracking-wider">Plans</span>
                    </div>
                    <p className="text-2xl font-serif text-heading">{employee.plansGenerated}</p>
                    <p className="text-xs text-muted mt-1">Travel plans generated</p>
                </div>

                <div className="bg-white rounded-2xl border border-border-light/50 p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                            <LucideMapPin className="w-4 h-4 text-accent" />
                        </div>
                        <span className="text-xs font-semibold text-muted uppercase tracking-wider">Destinations</span>
                    </div>
                    <p className="text-2xl font-serif text-heading">{employeePlans.length}</p>
                    <p className="text-xs text-muted mt-1">Trips planned</p>
                </div>
            </div>

            {/* Recent plans */}
            <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-border-light/50">
                    <h3 className="text-base font-semibold text-heading">Recent travel plans</h3>
                </div>
                {employeePlans.length > 0 ? (
                    <div className="divide-y divide-border-light/50">
                        {employeePlans.slice(0, 10).map((plan) => (
                            <div key={plan.id} className="flex items-center justify-between px-6 py-4 gap-3">
                                <div>
                                    <p className="text-sm font-medium text-heading">{plan.destination}</p>
                                    <p className="text-xs text-muted">{plan.purpose} &middot; {plan.duration} days</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                        plan.status === "active" ? "text-accent bg-accent/10"
                                            : plan.status === "flagged" ? "text-gold bg-gold/10"
                                            : "text-muted bg-button-secondary"
                                    }`}>
                                        {plan.status}
                                    </span>
                                    <p className="text-[10px] text-muted mt-1">{new Date(plan.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="px-6 py-12 text-center">
                        <p className="text-sm text-muted">No travel plans yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeDetail;

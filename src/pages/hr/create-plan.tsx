import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlanStore } from "../../stores/planStore";
import { useCreateTravelPlan, useEmployees } from "../../api/hooks";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import { DASHBOARD_GLASS_SURFACE, DashboardAmbientBackground } from "../../components/dashboard/dashboardChrome";
import {
    LucideCheck,
    LucideUserCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import PlanQuestionnaireFlow, { type QuestionnairePlanPayload } from "../../components/plan/PlanQuestionnaireFlow";

const HRCreatePlan = () => {
    const navigate = useNavigate();
    const { selectedCompanyId, selectedCompany } = usePlanStore();
    const company = selectedCompany();
    const companyIdNum = selectedCompanyId ? parseInt(selectedCompanyId, 10) : undefined;

    const { data: employeesData } = useEmployees({ companyId: companyIdNum });
    const employees = (employeesData?.data || []).filter((e) => e.status === "active");
    const credits = company ? company.totalCredits - company.usedCredits : 0;

    const createPlan = useCreateTravelPlan();

    const [employeeId, setEmployeeId] = useState("");

    const selectedEmployee = employees.find((e) => String(e.id) === employeeId);

    const verifyTopSlot = useMemo(() => {
        if (!selectedEmployee) return null;
        return (
            <div className="rounded-xl border border-border-light/60 bg-background-primary/60 p-3.5">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-accent mb-1">Employee</p>
                <p className="text-sm text-heading font-medium">{selectedEmployee.name}</p>
                <p className="text-xs text-muted">{selectedEmployee.email}</p>
            </div>
        );
    }, [selectedEmployee]);

    const handleSubmit = async (payload: QuestionnairePlanPayload) => {
        if (credits <= 0) {
            toast.error("Company has no remaining credits.");
            return;
        }
        if (!employeeId) {
            toast.error("Select an employee first.");
            return;
        }
        try {
            await createPlan.mutateAsync({
                destination: payload.destination,
                country: payload.country,
                duration: payload.duration,
                purpose: payload.purpose,
                tripType: payload.tripType,
                tripDetailsJson: payload.tripDetailsJson,
                medicalConsiderations: payload.medicalConsiderations,
                questionnaireResponses: JSON.stringify(payload.questionnaireResponses),
                companyId: companyIdNum,
                employeeId: parseInt(employeeId, 10),
                status: "completed",
                riskScore: 1,
                vaccinations: "[]",
                healthAlerts: "[]",
                safetyAdvisories: "[]",
                medications: "[]",
                waterFood: "[]",
                emergencyContacts: "[]",
            });
            navigate("/hr/create-plan");
            toast.success("Plan generated for employee!");
        } catch {
            toast.error("Failed to generate plan.");
        }
    };

    return (
        <div className="relative">
            <DashboardAmbientBackground />
            <DashboardHeader title="Create plan for employee" />
            {!employeeId ? (
                <div className={`relative z-10 max-w-2xl mx-auto px-6 ${DASHBOARD_GLASS_SURFACE} p-8 md:p-10`}>
                    <div className="mb-8">
                        <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-accent mb-2">Employee Selection</p>
                        <h2 className="text-3xl md:text-4xl font-serif text-heading mb-3 tracking-tight">Who is this plan for?</h2>
                        <p className="text-sm md:text-base text-muted leading-relaxed">
                            Choose an active employee first. After selection, you'll complete the same detailed questionnaire flow used in onboarding.
                        </p>
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        {employees.length === 0 ? (
                            <p className="text-sm text-muted py-6 text-center">No active employees found.</p>
                        ) : (
                            employees.map((emp) => (
                                <button
                                    key={emp.id}
                                    type="button"
                                    onClick={() => setEmployeeId(String(emp.id))}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${employeeId === String(emp.id)
                                            ? "border-accent bg-accent/5"
                                            : "border-border-light bg-background-primary hover:border-border-light/80"
                                        }`}
                                >
                                    <div
                                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${employeeId === String(emp.id) ? "bg-accent/10" : "bg-border-light/30"
                                            }`}
                                    >
                                        <LucideUserCircle
                                            className={`w-5 h-5 ${employeeId === String(emp.id) ? "text-accent" : "text-muted"}`}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-semibold truncate ${employeeId === String(emp.id) ? "text-heading" : "text-body"}`}>
                                            {emp.name} ({emp.email})
                                        </p>
                                        <p className="text-xs text-muted truncate">{emp.department}</p>
                                    </div>
                                    {employeeId === String(emp.id) && (
                                        <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0">
                                            <LucideCheck className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                <div className="relative z-10 max-w-5xl mx-auto space-y-8">
                    <div className={`${DASHBOARD_GLASS_SURFACE} p-8 md:p-10`}>
                        <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-accent mb-2">HR Advisory Builder</p>
                        <h2 className="text-3xl md:text-4xl font-serif text-heading leading-tight mb-3">
                            Prepare a high-context plan for this traveller
                        </h2>
                        <p className="text-sm md:text-base text-muted leading-relaxed">
                            Complete each questionnaire section carefully, then verify all answers before generating.
                            This helps produce safer, more personalised guidance for the selected employee.
                        </p>
                    </div>

                    <div className={DASHBOARD_GLASS_SURFACE}>
                        <div className="p-4 md:p-12 lg:p-14">
                            <PlanQuestionnaireFlow
                                credits={credits}
                                verifyTopSlot={verifyTopSlot}
                                isSubmitting={createPlan.isPending}
                                onSubmitPlan={handleSubmit}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HRCreatePlan;

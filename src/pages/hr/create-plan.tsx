import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlanStore } from "../../stores/planStore";
import { useCreateTravelPlan, useEmployees } from "../../api/hooks";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import CountryPicker from "../../components/CountryPicker";
import { LucideLoader2 } from "lucide-react";
import toast from "react-hot-toast";

const HRCreatePlan = () => {
    const navigate = useNavigate();
    const { selectedCompanyId, selectedCompany } = usePlanStore();
    const company = selectedCompany();
    const companyIdNum = selectedCompanyId ? parseInt(selectedCompanyId) : undefined;
    
    const { data: employeesData } = useEmployees({ companyId: companyIdNum });
    const employees = employeesData?.data || [];
    const credits = company ? company.totalCredits - company.usedCredits : 0;

    const createPlan = useCreateTravelPlan();

    const [form, setForm] = useState({
        employeeId: "",
        destination: "",
        country: "",
        duration: "",
        purpose: "Business",
        medicalConsiderations: "",
    });

    const update = (field: string, value: string) =>
        setForm((f) => ({ ...f, [field]: value }));

    const selectedEmployee = employees.find((e) => String(e.id) === form.employeeId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (credits <= 0) {
            toast.error("Company has no remaining credits.");
            return;
        }

        try {
            await createPlan.mutateAsync({
                destination: form.destination,
                country: form.country,
                duration: parseInt(form.duration) || 0,
                purpose: form.purpose,
                medicalConsiderations: form.medicalConsiderations,
                companyId: companyIdNum,
                employeeId: parseInt(form.employeeId),
                status: "completed",
                riskScore: 1,
                vaccinations: "[]",
                healthAlerts: "[]",
                safetyAdvisories: "[]",
                medications: "[]",
                waterFood: "[]",
                emergencyContacts: "[]",
            });
            
            toast.success("Plan generated for employee!");
            navigate("/hr");
        } catch (error) {
            toast.error("Failed to generate plan.");
        }
    };

    if (createPlan.isPending) {
        return (
            <div>
                <DashboardHeader title="Generating plan" />
                <div className="flex flex-col items-center justify-center py-32">
                    <LucideLoader2 className="w-10 h-10 text-accent animate-spin mb-6" />
                    <h2 className="text-xl font-serif text-heading mb-2">Generating plan for {selectedEmployee?.name}…</h2>
                    <p className="text-sm text-body">Destination: {form.destination}, {form.country}</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <DashboardHeader title="Create plan for employee" />

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border-light/50 p-6 md:p-8 max-w-2xl">
                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Employee</label>
                        <select
                            value={form.employeeId}
                            onChange={(e) => update("employeeId", e.target.value)}
                            className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors duration-200"
                            required
                        >
                            <option value="">Select employee…</option>
                            {employees.filter((e) => e.status === "active").map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.name} — {emp.department}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Destination</label>
                            <input type="text" value={form.destination} onChange={(e) => update("destination", e.target.value)} placeholder="e.g. Lagos" className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200" required />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Country</label>
                            <CountryPicker
                                value={form.country}
                                onChange={(name) => update("country", name)}
                                placeholder="e.g. Nigeria"
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Duration (days)</label>
                            <input type="number" value={form.duration} onChange={(e) => update("duration", e.target.value)} placeholder="e.g. 7" className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200" required />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Purpose</label>
                            <select value={form.purpose} onChange={(e) => update("purpose", e.target.value)} className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors duration-200">
                                <option>Business</option>
                                <option>Conference</option>
                                <option>Client visit</option>
                                <option>Training</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Medical notes <span className="text-muted font-normal normal-case">(optional)</span></label>
                        <textarea value={form.medicalConsiderations} onChange={(e) => update("medicalConsiderations", e.target.value)} placeholder="Any known conditions or requirements" rows={3} className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200 resize-none" />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 pt-6 border-t border-border-light/50">
                    <p className="text-xs text-muted">Uses <strong className="text-heading">1 credit</strong>. {credits} remaining.</p>
                    <button type="submit" disabled={credits === 0 || createPlan.isPending} className="py-3 px-6 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200">
                        Generate plan
                    </button>
                </div>
            </form>
        </div>
    );
};

export default HRCreatePlan;

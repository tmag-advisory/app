import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { usePlanStore } from "../../stores/planStore";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import { LucideLoader2 } from "lucide-react";
import type { TravelPlan } from "../../stores/planStore";

const HRCreatePlan = () => {
    const navigate = useNavigate();
    const consumeCredit = useAuthStore((s) => s.consumeCredit);
    const { companyEmployees, addPlan, selectedCompanyId } = usePlanStore();
    const employees = companyEmployees();
    const credits = useAuthStore((s) => s.user?.credits ?? 0);

    const [form, setForm] = useState({
        employeeId: "",
        destination: "",
        country: "",
        duration: "",
        purpose: "Business",
        medicalConsiderations: "",
    });
    const [processing, setProcessing] = useState(false);

    const update = (field: string, value: string) =>
        setForm((f) => ({ ...f, [field]: value }));

    const selectedEmployee = employees.find((e) => e.id === form.employeeId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!consumeCredit()) return;

        setProcessing(true);
        setTimeout(() => {
            const newPlan: TravelPlan = {
                id: `p${Date.now()}`,
                destination: form.destination,
                country: form.country,
                duration: form.duration,
                purpose: form.purpose,
                riskScore: "Moderate",
                status: "completed",
                createdAt: new Date().toISOString().slice(0, 10),
                companyId: selectedCompanyId ?? undefined,
                vaccinations: [
                    { name: "Hepatitis A", status: "Recommended" },
                    { name: "Typhoid", status: "Recommended" },
                ],
                healthAlerts: ["Review local health advisories before departure"],
                safetyAdvisories: ["Carry copies of prescriptions", "Register with embassy"],
                medications: ["Standard travel first-aid kit"],
                waterFood: ["Check local water safety"],
                emergencyContacts: [{ label: "Local emergency", value: "Check destination" }],
                employeeId: form.employeeId,
                employeeName: selectedEmployee?.name,
                medicalConsiderations: form.medicalConsiderations || undefined,
            };
            addPlan(newPlan);
            setProcessing(false);
            navigate("/hr");
        }, 2500);
    };

    if (processing) {
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
                            <input type="text" value={form.country} onChange={(e) => update("country", e.target.value)} placeholder="e.g. Nigeria" className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Duration</label>
                            <input type="text" value={form.duration} onChange={(e) => update("duration", e.target.value)} placeholder="e.g. 7 days" className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200" required />
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
                    <button type="submit" disabled={credits === 0} className="py-3 px-6 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200">
                        Generate plan
                    </button>
                </div>
            </form>
        </div>
    );
};

export default HRCreatePlan;

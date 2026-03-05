import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlanStore } from "../../stores/planStore";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import { LucideLoader2 } from "lucide-react";
import type { TravelPlan } from "../../stores/planStore";

const CreatePlan = () => {
    const navigate = useNavigate();
    const addPlan = usePlanStore((s) => s.addPlan);
    const credits: number = 100
    const [form, setForm] = useState({
        destination: "",
        country: "",
        duration: "",
        purpose: "Leisure",
        medicalConsiderations: "",
    });
    const [processing, setProcessing] = useState(false);

    const update = (field: string, value: string) =>
        setForm((f) => ({ ...f, [field]: value }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        setProcessing(true);

        // Simulate AI processing
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
                vaccinations: [
                    { name: "Hepatitis A", status: "Recommended" },
                    { name: "Typhoid", status: "Recommended" },
                    { name: "Tdap", status: "Optional" },
                ],
                healthAlerts: ["Review local health advisories before departure"],
                safetyAdvisories: ["Carry copies of prescriptions", "Register with your embassy"],
                medications: ["Standard travel first-aid kit", "Oral rehydration salts"],
                waterFood: ["Check local water safety", "Eat at reputable establishments"],
                emergencyContacts: [{ label: "Local emergency", value: "Check destination" }],
                medicalConsiderations: form.medicalConsiderations || undefined,
            };
            addPlan(newPlan);
            setProcessing(false);
            navigate(`/dashboard/plans/${newPlan.id}`);
        }, 2500);
    };

    if (processing) {
        return (
            <div>
                <DashboardHeader title="Generating your plan" />
                <div className="flex flex-col items-center justify-center py-32">
                    <LucideLoader2 className="w-10 h-10 text-accent animate-spin mb-6" />
                    <h2 className="text-xl font-serif text-heading mb-2">
                        AI is analyzing your trip…
                    </h2>
                    <p className="text-sm text-body max-w-sm text-center">
                        Cross-referencing WHO, CDC, and local health data for{" "}
                        <strong className="text-heading">{form.destination}</strong>.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <DashboardHeader title="Create travel plan" />

            {credits === 0 && (
                <div className="bg-gold/10 border border-gold/20 rounded-2xl p-4 mb-6">
                    <p className="text-sm text-heading font-medium">
                        You have no credits remaining.{" "}
                        <span className="text-accent cursor-pointer hover:underline">
                            Purchase more credits
                        </span>{" "}
                        to generate a new plan.
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border-light/50 p-6 md:p-8 max-w-2xl">
                <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                Destination
                            </label>
                            <input
                                type="text"
                                value={form.destination}
                                onChange={(e) => update("destination", e.target.value)}
                                placeholder="e.g. Bogotá & Cartagena"
                                className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                Country
                            </label>
                            <input
                                type="text"
                                value={form.country}
                                onChange={(e) => update("country", e.target.value)}
                                placeholder="e.g. Colombia"
                                className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                Duration
                            </label>
                            <input
                                type="text"
                                value={form.duration}
                                onChange={(e) => update("duration", e.target.value)}
                                placeholder="e.g. 10 days"
                                className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                Purpose
                            </label>
                            <select
                                value={form.purpose}
                                onChange={(e) => update("purpose", e.target.value)}
                                className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors duration-200"
                            >
                                <option>Leisure</option>
                                <option>Business</option>
                                <option>Volunteer</option>
                                <option>Study</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                            Medical considerations <span className="text-muted font-normal normal-case">(optional)</span>
                        </label>
                        <textarea
                            value={form.medicalConsiderations}
                            onChange={(e) => update("medicalConsiderations", e.target.value)}
                            placeholder="e.g. I take blood thinners, have asthma, or am pregnant"
                            rows={3}
                            className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200 resize-none"
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 pt-6 border-t border-border-light/50">
                    <p className="text-xs text-muted">
                        This will use <strong className="text-heading">1 credit</strong>. You have {credits} remaining.
                    </p>
                    <button
                        type="submit"
                        disabled={credits === 0}
                        className="py-3 px-6 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        Generate plan
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePlan;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCreateTravelPlan } from "../../api/hooks";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import CountryPicker from "../../components/CountryPicker";
import { LucideLoader2 } from "lucide-react";
import toast from "react-hot-toast";

const CreatePlan = () => {
    const navigate = useNavigate();
    const { user, refreshProfile } = useAuth();
    const createPlan = useCreateTravelPlan();

    const credits = user?.credits ?? 0;

    const [form, setForm] = useState({
        destination: "",
        country: "",
        duration: "",
        purpose: "Leisure",
        medicalConsiderations: "",
    });

    const update = (field: string, value: string) =>
        setForm((f) => ({ ...f, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (credits <= 0) {
            toast.error("You don't have enough credits.");
            return;
        }

        try {
            const result = await createPlan.mutateAsync({
                destination: form.destination,
                country: form.country,
                duration: parseInt(form.duration) || 0,
                purpose: form.purpose,
                medicalConsiderations: form.medicalConsiderations,
                userId: user?.id,
                status: "completed", // In a real app, AI might set this to 'processing'
                riskScore: 1, // Default to Low risk for now
                vaccinations: "[]",
                healthAlerts: "[]",
                safetyAdvisories: "[]",
                medications: "[]",
                waterFood: "[]",
                emergencyContacts: "[]",
            });

            await refreshProfile(); // Refresh credits
            toast.success("Plan generated successfully!");
            navigate(`/dashboard/plans/${result.id}`);
        } catch (error) {
            toast.error("Failed to generate plan. Please try again.");
        }
    };

    if (createPlan.isPending) {
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
                        <Link
                            to="/dashboard/settings"
                            className="text-accent cursor-pointer hover:underline"
                        >
                            Purchase more credits
                        </Link>{" "}
                        to generate a new plan.
                    </p>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl border border-border-light/50 p-6 md:p-8 max-w-2xl"
            >
                <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                Destination
                            </label>
                            <input
                                type="text"
                                value={form.destination}
                                onChange={(e) =>
                                    update("destination", e.target.value)
                                }
                                placeholder="e.g. Bogotá & Cartagena"
                                className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                Country
                            </label>
                            <CountryPicker
                                value={form.country}
                                onChange={(name) => update("country", name)}
                                placeholder="e.g. Colombia"
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                Duration (days)
                            </label>
                            <input
                                type="number"
                                value={form.duration}
                                onChange={(e) =>
                                    update("duration", e.target.value)
                                }
                                placeholder="e.g. 10"
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
                                onChange={(e) =>
                                    update("purpose", e.target.value)
                                }
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
                            Medical considerations{" "}
                            <span className="text-muted font-normal normal-case">
                                (optional)
                            </span>
                        </label>
                        <textarea
                            value={form.medicalConsiderations}
                            onChange={(e) =>
                                update("medicalConsiderations", e.target.value)
                            }
                            placeholder="e.g. I take blood thinners, have asthma, or am pregnant"
                            rows={3}
                            className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200 resize-none"
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 pt-6 border-t border-border-light/50">
                    <p className="text-xs text-muted">
                        This will use{" "}
                        <strong className="text-heading">1 credit</strong>. You
                        have {credits} remaining.
                    </p>
                    <button
                        type="submit"
                        disabled={credits === 0 || createPlan.isPending}
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

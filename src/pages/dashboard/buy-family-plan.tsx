import { Navigate } from "react-router-dom";
import { LucideCheck } from "lucide-react";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { familyPlans, formatFamilyPlanPrice } from "../../constants/companyPlans";
import { useCurrencyStore } from "../../stores/currencyStore";

const BuyFamilyPlan = () => {
    const { user } = useAuth();
    const { selectedCurrency, setCurrency } = useCurrencyStore();
    const isFamily = user?.type?.toUpperCase() === "FAMILY";

    if (!isFamily) {
        return <Navigate to="/unauthorized" replace />;
    }

    return (
        <div>
            <DashboardHeader title="Buy Family Plan" />

            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm text-muted max-w-2xl leading-relaxed">
                        Purchase standalone family plans for upcoming trips. Each plan includes up to 6 family members, with extra members billed separately.
                    </p>
                </div>
                <div className="inline-flex items-center self-start sm:self-auto bg-button-secondary rounded-2xl p-1 gap-1">
                    {(["USD", "NGN"] as const).map((cur) => (
                        <button
                            key={cur}
                            onClick={() => setCurrency(cur)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${selectedCurrency === cur
                                ? "bg-white shadow-sm text-heading"
                                : "text-muted hover:text-heading"
                                }`}
                        >
                            {cur === "USD" ? "$ USD" : "₦ NGN"}
                        </button>
                    ))}
                </div>
            </div>

            <section className="max-w-md">
                {familyPlans.map((plan) => (
                    <div
                        key={plan.id}
                        className="relative py-8 p-6 aspect-2/3 flex flex-col justify-between overflow-hidden min-h-150 border border-accent/25"
                    >
                        <div
                            className="absolute inset-0"
                            style={{ background: "linear-gradient(145deg, #eaf7f4 0%, #dff2ee 45%, #e6f5f1 100%)" }}
                        />
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-accent" />
                        <span className="absolute top-6 right-6 text-xs font-semibold text-white bg-accent px-3 py-1 rounded-full">
                            Best value
                        </span>
                        <div className="relative z-10">
                            <h3 className="text-lg font-semibold mb-1 text-[#1a3c38]">
                                {plan.name}
                            </h3>
                            <p className="text-sm mb-6 text-[#2a5858]/80">
                                {plan.description}
                            </p>
                            <div className="flex items-baseline gap-1.5 mb-1">
                                <span className="text-4xl font-serif text-[#1a5c52]">
                                    {formatFamilyPlanPrice(plan, selectedCurrency)}
                                </span>
                            </div>
                            <p className="text-xs mb-8 text-[#2a5858]/60">
                                {plan.priceNote}
                            </p>
                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm text-[#1a3c38]">
                                        <LucideCheck className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Button
                            variant="primary"
                            link={`/family-checkout?plan=FAMILY_${plan.id}`}
                            className="relative z-10 self-stretch bg-accent text-white! hover:bg-[#246858] text-center justify-center flex"
                        >
                            {plan.cta}
                        </Button>
                    </div>
                ))}
            </section>
        </div>
    );
};

export default BuyFamilyPlan;

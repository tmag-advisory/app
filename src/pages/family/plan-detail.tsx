import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LucideArrowLeft, LucideDownload, LucideLoader2, LucideAlertCircle, LucideSyringe, LucidePill, LucideShield, LucideUser } from "lucide-react";
import familyTripApi from "../../api/familyTrip";
import type { FamilyMemberPlanResponse } from "../../api/types";
import { DASHBOARD_GLASS_SURFACE } from "../../components/dashboard/dashboardChrome";
import { cn } from "../../lib/utils";

export default function FamilyPlanDetail() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<FamilyMemberPlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await familyTripApi.getMyMemberPlan();
        setPlan(res.data.data ?? null);
      } catch (err: any) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          navigate("/family/login");
          return;
        }
        setError("Could not load your travel health plan. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlan();
  }, [navigate]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await familyTripApi.downloadMyMemberPdf();
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "travel-health-plan.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <LucideLoader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-background-primary py-10 px-4 flex items-center justify-center">
        <div className={cn(DASHBOARD_GLASS_SURFACE, "p-10 text-center max-w-md")}>
          <LucideAlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
          <p className="text-sm text-heading font-semibold mb-2">
            {plan === null && !error ? "Plan not yet available" : error ?? "An error occurred"}
          </p>
          <p className="text-xs text-muted mb-6">
            {plan === null && !error
              ? "Your travel health plan is still being generated. Please check back shortly."
              : "Please contact your trip organiser if this problem persists."}
          </p>
          <button onClick={() => navigate("/family/dashboard")} className="text-sm text-accent font-medium hover:underline">
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const s = plan.memberSection;

  return (
    <div className="min-h-screen bg-background-primary py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate("/family/dashboard")}
          className="inline-flex items-center text-sm font-medium text-muted hover:text-heading transition-colors mb-4"
        >
          <LucideArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </button>

        {/* Hero */}
        <div className={cn(DASHBOARD_GLASS_SURFACE, "p-8")}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-serif text-heading mb-1">Travel Health Plan</h1>
              <p className="text-muted">{plan.destination}, {plan.country}</p>
            </div>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-xl text-white bg-dark hover:bg-darkest transition-all disabled:opacity-50"
            >
              {downloading ? (
                <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LucideDownload className="mr-2 h-4 w-4" />
              )}
              Download PDF
            </button>
          </div>

          {plan.tripSummary && (
            <p className="mt-4 text-sm text-body leading-relaxed border-t border-border-light pt-4">
              {plan.tripSummary}
            </p>
          )}
        </div>

        {/* Member info */}
        <div className={cn(DASHBOARD_GLASS_SURFACE, "p-6")}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <LucideUser className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold text-heading">{s.memberName}</p>
              <p className="text-xs text-muted capitalize">{s.relationship.toLowerCase()} · {s.ageAtDeparture} years old</p>
            </div>
          </div>
          {s.executiveSummary && (
            <p className="text-sm text-body leading-relaxed">{s.executiveSummary}</p>
          )}
          {s.hardStop && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-xs font-semibold text-red-700">Travel health concern flagged — please consult a physician before travelling.</p>
            </div>
          )}
        </div>

        {/* Vaccinations */}
        {s.vaccinations?.length > 0 && (
          <div className={cn(DASHBOARD_GLASS_SURFACE, "p-6")}>
            <h2 className="text-lg font-serif text-heading mb-4 flex items-center gap-2">
              <LucideSyringe className="w-5 h-5 text-accent" />
              Vaccinations
            </h2>
            <div className="space-y-3">
              {s.vaccinations.map((v, i) => (
                <div key={i} className="border border-border-light rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-heading">{v.name}</p>
                    <span className={cn(
                      "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full",
                      v.recommendation === "Required" ? "bg-red-50 text-red-700" :
                      v.recommendation === "Recommended" ? "bg-emerald-50 text-emerald-700" :
                      "bg-amber-50 text-amber-700"
                    )}>
                      {v.recommendation}
                    </span>
                  </div>
                  <p className="text-xs text-body">{v.rationale}</p>
                  {v.timing && <p className="text-xs text-muted mt-1">Timing: {v.timing}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medications */}
        {s.medications?.length > 0 && (
          <div className={cn(DASHBOARD_GLASS_SURFACE, "p-6")}>
            <h2 className="text-lg font-serif text-heading mb-4 flex items-center gap-2">
              <LucidePill className="w-5 h-5 text-accent" />
              Medications
            </h2>
            <div className="space-y-3">
              {s.medications.map((m, i) => (
                <div key={i} className="border border-border-light rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-heading">{m.name}</p>
                    <span className="text-xs text-muted">{m.dosage}</span>
                  </div>
                  <p className="text-xs text-body">{m.indication}</p>
                  {m.notes && <p className="text-xs text-muted mt-1">{m.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Health considerations */}
        {s.healthConsiderations?.length > 0 && (
          <div className={cn(DASHBOARD_GLASS_SURFACE, "p-6")}>
            <h2 className="text-lg font-serif text-heading mb-4 flex items-center gap-2">
              <LucideShield className="w-5 h-5 text-accent" />
              Health Considerations
            </h2>
            <div className="space-y-3">
              {s.healthConsiderations.map((h, i) => (
                <div key={i} className="border border-border-light rounded-xl p-4">
                  <p className="text-sm font-semibold text-heading mb-1">{h.category}</p>
                  <p className="text-xs text-body">{h.advice}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Traveller-specific notes */}
        {s.travellerSpecific && (
          <div className={cn(DASHBOARD_GLASS_SURFACE, "p-6")}>
            <h2 className="text-sm font-semibold text-heading mb-2">Personalised Notes</h2>
            <p className="text-sm text-body leading-relaxed">{s.travellerSpecific}</p>
          </div>
        )}
      </div>
    </div>
  );
}

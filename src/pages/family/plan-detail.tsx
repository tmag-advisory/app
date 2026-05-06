import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LucideArrowLeft, LucideDownload, LucideFileText } from "lucide-react";
import familyTripApi from "../../api/familyTrip";
import { DASHBOARD_GLASS_SURFACE } from "../../components/dashboard/dashboardChrome";
import { cn } from "../../lib/utils";

export default function FamilyPlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await familyTripApi.getMemberPlanDetail(Number(id));
        setPlan(res.data.data);
      } catch (err) {
        console.error("Error fetching plan", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchPlan();
  }, [id]);

  if (isLoading) return <div className="p-8 text-center text-muted">Loading...</div>;

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

        <div className={cn(DASHBOARD_GLASS_SURFACE, "p-8")}>
          <h1 className="text-3xl font-serif text-heading mb-2">Travel Health Plan Detail</h1>
          <p className="text-muted mb-8">Plan #{id}</p>
          
          <div className="bg-background-secondary border border-border-light rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6">
              <LucideFileText className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-heading mb-3">PDF Report Available</h3>
            <p className="text-sm text-body max-w-lg mb-8 leading-relaxed">
              Your comprehensive travel health plan for <span className="font-semibold">{plan?.destination}</span> is ready to be downloaded. The full report contains all necessary medical considerations, vaccinations, and safety advisories tailored to your profile.
            </p>
            <button className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-dark hover:bg-darkest shadow-[0_4px_16px_-6px_rgba(10,20,18,0.18)] transition-all">
              <LucideDownload className="mr-2 h-4 w-4" />
              Download PDF Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

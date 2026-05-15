import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { travelPlansApi } from "../../api/api";
import type { TravelPlanListItemResponse } from "../../api/types";
import {
    canDownloadTravelPlanPdf,
    canDownloadTravelPlanSummaryPdf,
    isPaidTravelPlanTier,
} from "../../lib/travel-plan-pdf";
import { useTravelPlans, useTravelPlanSummaryPdf } from "../../api/hooks";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import {
    LucideAlertTriangle,
    LucideArrowRight,
    LucideCheck,
    LucideChevronDown,
    LucideClock,
    LucideDownload,
    LucideFileText,
    LucideLoader2,
    LucideSearch,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { DASHBOARD_GLASS_SURFACE } from "../../components/dashboard/dashboardChrome";
import PaginationFooter from "../../components/dashboard/PaginationFooter";

const riskColors: Record<string, string> = { Low: "text-accent", Moderate: "text-gold", High: "text-red-600" };
const riskBg: Record<string, string> = { Low: "bg-accent/10", Moderate: "bg-gold/10", High: "bg-red-50" };

const getRiskLabel = (score: number) => {
  if (score <= 1) return "Low";
  if (score === 2) return "Moderate";
  return "High";
};

const planStatusConfig: Record<
    string,
    { label: string; text: string; bg: string; icon: typeof LucideCheck }
> = {
    COMPLETED: {
        label: "Completed",
        text: "text-emerald-700",
        bg: "bg-emerald-50",
        icon: LucideCheck,
    },
    PROCESSING: {
        label: "Processing",
        text: "text-amber-700",
        bg: "bg-amber-50",
        icon: LucideLoader2,
    },
    QUEUED: {
        label: "Queued",
        text: "text-gray-600",
        bg: "bg-gray-100",
        icon: LucideClock,
    },
    PENDING: {
        label: "Pending",
        text: "text-amber-700",
        bg: "bg-amber-50",
        icon: LucideClock,
    },
    FAILED: {
        label: "Failed",
        text: "text-red-700",
        bg: "bg-red-50",
        icon: LucideAlertTriangle,
    },
    ERROR: {
        label: "Failed",
        text: "text-red-700",
        bg: "bg-red-50",
        icon: LucideAlertTriangle,
    },
    ELEVATED: {
        label: "Under review",
        text: "text-amber-700",
        bg: "bg-amber-50",
        icon: LucideClock,
    },
    REJECTED: {
        label: "Review needed",
        text: "text-red-700",
        bg: "bg-red-50",
        icon: LucideAlertTriangle,
    },
};

function PlanStatusBadge({ status }: { status: string }) {
    const config = planStatusConfig[status] ?? {
        label: status,
        text: "text-gray-600",
        bg: "bg-gray-100",
        icon: LucideFileText,
    };
    const Icon = config.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.text} ${config.bg}`}
        >
            <Icon
                className={`h-3.5 w-3.5 ${status === "PROCESSING" ? "animate-spin" : ""}`}
                aria-hidden
            />
            {config.label}
        </span>
    );
}

const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};

const planFilenameSlug = (destination: string | null | undefined) => {
    return (
        destination
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 48) || "travel-health-plan"
    );
};

const isPlanDownloadAvailable = (plan: TravelPlanListItemResponse) =>
    canDownloadTravelPlanPdf(plan.status);

const isPlanSummaryDownloadAvailable = (plan: TravelPlanListItemResponse) =>
    canDownloadTravelPlanSummaryPdf(plan.status, plan.planTier);

const getPlanDisplayStatus = (plan: TravelPlanListItemResponse) => {
    if (
        plan.doctorValidationStatus === "PENDING" ||
        plan.doctorValidationStatus === "ELEVATED" ||
        plan.doctorValidationStatus === "REJECTED"
    ) {
        return plan.doctorValidationStatus;
    }
    return plan.status;
};

const PlanHistory = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [downloadingAction, setDownloadingAction] = useState<string | null>(
      null,
  );
  const { data: plansData, isLoading } = useTravelPlans({
      search: search || undefined,
      page,
      per_page: perPage,
  });
  const { mutateAsync: downloadSummaryPdfBlob } = useTravelPlanSummaryPdf();

  useEffect(() => {
      setPage(1);
  }, [search, perPage]);

  const plans = useMemo(() => plansData?.data || [], [plansData]);
  const pagination = plansData?.pagination;
  const sortedPlans = useMemo(
      () =>
          [...plans].sort(
              (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
          ),
      [plans],
  );

  const handleDownloadPdf = useCallback(async (plan: TravelPlanListItemResponse) => {
      if (!isPlanDownloadAvailable(plan)) {
          toast.error(
              "PDF is only available when your plan is completed.",
          );
          return;
      }

      setDownloadingAction(`${plan.id}:pdf`);

      if (plan.doctorValidationStatus === "APPROVED" && plan.signedPdfUrl) {
          window.open(plan.signedPdfUrl, "_blank", "noopener");
          setDownloadingAction(null);
          return;
      }

      try {
          const blob = await travelPlansApi.downloadPdfBlob(plan.id);
          downloadBlob(
              blob,
              `${planFilenameSlug(plan.destination)}-travel-health.pdf`,
          );
          toast.success("Travel health plan downloaded");
      } catch (err) {
          console.error(err);
          toast.error("Could not download PDF. Please try again.");
      } finally {
          setDownloadingAction(null);
      }
  }, []);

  const handleDownloadSummaryPdf = useCallback(
      async (plan: TravelPlanListItemResponse) => {
          if (!isPlanDownloadAvailable(plan)) {
              toast.error(
                  "Summary PDF is only available when your plan is completed.",
              );
              return;
          }
          if (!isPaidTravelPlanTier(plan.planTier)) {
              return;
          }

          const summaryPdfUrl = plan.summaryPdfUrl;
          setDownloadingAction(`${plan.id}:summary`);

          if (summaryPdfUrl) {
              window.open(summaryPdfUrl, "_blank", "noopener");
              setDownloadingAction(null);
              return;
          }

          try {
              const blob = await downloadSummaryPdfBlob(plan.id);
              downloadBlob(
                  blob,
                  `${planFilenameSlug(plan.destination)}-travel-health-summary.pdf`,
              );
              toast.success("Travel health summary downloaded");
          } catch (err) {
              console.error(err);
              toast.error("Could not download summary PDF. Please try again.");
          } finally {
              setDownloadingAction(null);
          }
      },
      [downloadSummaryPdfBlob],
  );

  return (
      <div>
          <DashboardHeader title="My plans" />

          {/* Search */}
          <div className="relative max-w-sm mb-6">
              <LucideSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search plans…"
                  className="w-full border border-border-light/55 bg-white/80 backdrop-blur-md rounded-xl pl-10 pr-4 py-2.5 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200 shadow-sm"
              />
          </div>

          {/* Plans table */}
          <div className={cn(DASHBOARD_GLASS_SURFACE, "overflow-hidden")}>
              <div className="overflow-x-auto">
                  <table className="w-full min-w-232">
                      <thead>
                          <tr className="border-b border-border-light/50">
                              <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                                  Destination
                              </th>
                              <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3 hidden sm:table-cell">
                                  Duration
                              </th>
                              <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3 hidden md:table-cell">
                                  Purpose
                              </th>
                              <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                                  Risk
                              </th>
                              <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                                  Status
                              </th>
                              <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3 hidden sm:table-cell">
                                  Date
                              </th>
                              <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                                  Actions
                              </th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-border-light/50">
                          {isLoading ?
                              <tr>
                                  <td
                                      colSpan={7}
                                      className="px-6 py-12 text-center"
                                  >
                                      <LucideLoader2 className="w-6 h-6 text-accent animate-spin mx-auto" />
                                  </td>
                              </tr>
                          :   sortedPlans.map((plan) => {
                                  const riskLabel = getRiskLabel(
                                      plan.riskScore,
                                  );
                                  const canDownload =
                                      isPlanDownloadAvailable(plan);
                                  const canDownloadSummary =
                                      isPlanSummaryDownloadAvailable(plan);
                                  return (
                                      <tr
                                          key={plan.id}
                                          className="hover:bg-background-secondary/50 transition-colors duration-150"
                                      >
                                          <td className="px-6 py-4">
                                              <p className="text-sm font-medium text-heading">
                                                  {plan.destination}
                                              </p>
                                              <p className="text-xs text-muted">
                                                  {plan.country}
                                              </p>
                                          </td>
                                          <td className="px-6 py-4 text-sm text-body hidden sm:table-cell">
                                              {plan.duration} days
                                          </td>
                                          <td className="px-6 py-4 text-sm text-body hidden md:table-cell">
                                              {plan.purpose}
                                          </td>
                                          <td className="px-6 py-4">
                                              <span
                                                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${riskColors[riskLabel]} ${riskBg[riskLabel]}`}
                                              >
                                                  {riskLabel}
                                              </span>
                                          </td>
                                          <td className="px-6 py-4">
                                              <PlanStatusBadge
                                                  status={getPlanDisplayStatus(
                                                      plan,
                                                  )}
                                              />
                                          </td>
                                          <td className="px-6 py-4 text-sm text-muted hidden sm:table-cell">
                                              {new Date(
                                                  plan.createdAt,
                                              ).toLocaleDateString("en-US", {
                                                  month: "short",
                                                  day: "numeric",
                                                  year: "numeric",
                                                  minute: "2-digit",
                                                  hour: "2-digit",
                                              })}
                                          </td>
                                          <td className="px-6 py-4">
                                              <div className="flex items-center justify-end gap-3">
                                                  <Link
                                                      to={`/dashboard/plans/${plan.id}`}
                                                      className="text-xs text-accent font-medium hover:underline inline-flex items-center gap-1"
                                                  >
                                                      View{" "}
                                                      <LucideArrowRight className="w-3 h-3" />
                                                  </Link>
                                                  {canDownload && (
                                                      <details className="flex flex-col items-end">
                                                          <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-border-light/70 bg-white/85 px-3 py-1.5 text-xs font-semibold text-heading shadow-sm transition-colors duration-150 hover:border-accent/45 hover:text-accent">
                                                              <LucideDownload className="h-3.5 w-3.5" />
                                                              <span>Download</span>
                                                              <LucideChevronDown className="h-3.5 w-3.5" />
                                                          </summary>
                                                          <div className="mt-2 w-44 overflow-hidden rounded-xl border border-border-light/70 bg-white shadow-lg">
                                                              <button
                                                                  type="button"
                                                                  onClick={() =>
                                                                      void handleDownloadPdf(
                                                                          plan,
                                                                      )
                                                                  }
                                                                  disabled={
                                                                      downloadingAction ===
                                                                      `${plan.id}:pdf`
                                                                  }
                                                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-heading transition-colors hover:bg-background-secondary disabled:cursor-not-allowed disabled:opacity-60"
                                                              >
                                                                  {(
                                                                      downloadingAction ===
                                                                      `${plan.id}:pdf`
                                                                  ) ?
                                                                      <LucideLoader2 className="h-3.5 w-3.5 animate-spin" />
                                                                  :   <LucideFileText className="h-3.5 w-3.5" />
                                                                  }
                                                                  Full PDF
                                                              </button>
                                                              {canDownloadSummary && (
                                                                  <button
                                                                      type="button"
                                                                      onClick={() =>
                                                                          void handleDownloadSummaryPdf(
                                                                              plan,
                                                                          )
                                                                      }
                                                                      disabled={
                                                                          downloadingAction ===
                                                                          `${plan.id}:summary`
                                                                      }
                                                                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-heading transition-colors hover:bg-background-secondary disabled:cursor-not-allowed disabled:opacity-60"
                                                                  >
                                                                      {(
                                                                          downloadingAction ===
                                                                          `${plan.id}:summary`
                                                                      ) ?
                                                                          <LucideLoader2 className="h-3.5 w-3.5 animate-spin" />
                                                                      :   <LucideFileText className="h-3.5 w-3.5" />
                                                                      }
                                                                      Summary PDF
                                                                  </button>
                                                              )}
                                                          </div>
                                                      </details>
                                                  )}
                                              </div>
                                          </td>
                                      </tr>
                                  );
                              })
                          }
                      </tbody>
                  </table>
              </div>
              {!isLoading && plans.length === 0 && (
                  <div className="px-6 py-12 text-center">
                      <p className="text-sm text-muted">No plans found.</p>
                  </div>
              )}
              {pagination && pagination.total > 0 && (
                  <PaginationFooter
                      page={pagination.page}
                      pageSize={pagination.pageSize}
                      total={pagination.total}
                      totalPages={pagination.totalPages}
                      onPageChange={setPage}
                      onPageSizeChange={setPerPage}
                  />
              )}
          </div>
      </div>
  );
};

export default PlanHistory;

import type { PlanTier } from "../api/types";

export const isTravelPlanComplete = (status: string | null | undefined): boolean =>
  status === "COMPLETED";

export const isPaidTravelPlanTier = (
  planTier: PlanTier | string | null | undefined,
): boolean => planTier === "STANDARD" || planTier === "PREMIUM";

export const canDownloadTravelPlanPdf = (
  status: string | null | undefined,
): boolean => isTravelPlanComplete(status);

export const canDownloadTravelPlanSummaryPdf = (
  status: string | null | undefined,
  planTier: PlanTier | string | null | undefined,
): boolean => canDownloadTravelPlanPdf(status) && isPaidTravelPlanTier(planTier);

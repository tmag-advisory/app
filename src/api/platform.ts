import api from "./axios";
import type { ApiResponse } from "./types";

/**
 * Platform launch-discount state shared by every consumer frontend.
 * `rate` is a fraction in [0, 1] and `percentage` is the integer 0..100 form.
 */
export interface LaunchDiscount {
  active: boolean;
  rate: number;
  percentage: number;
  label: string;
}

export const platformApi = {
  getLaunchDiscount: () =>
    api
      .get<ApiResponse<LaunchDiscount>>("/platform/discount")
      .then((r) => r.data.data),
};

export const LAUNCH_DISCOUNT_FALLBACK: LaunchDiscount = {
  active: false,
  rate: 0,
  percentage: 0,
  label: "",
};

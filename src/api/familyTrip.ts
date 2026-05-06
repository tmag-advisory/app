import api from "./axios";
import type {
  ApiResponse,
  FamilyTripRequest,
  FamilyTripResponse,
  FamilyTripPreviewResponse,
} from "./types";

export interface FamilyMemberSession {
  id: number;
  firstName: string;
  lastName: string;
  relationship: string;
  familyTripId: number;
}

export interface FamilyMemberLoginResponse {
  sessionToken: string;
  expiresAt: string;
  member: FamilyMemberSession;
}

const familyTripApi = {
  // Main Applicant Endpoints
  preview: (data: FamilyTripRequest) =>
    api.post<ApiResponse<FamilyTripPreviewResponse>>("/family-trips/preview", data),
    
  saveDraft: (data: FamilyTripRequest) =>
    api.post<ApiResponse<FamilyTripResponse>>("/family-trips/drafts", data),
    
  getLatestDraft: () =>
    api.get<ApiResponse<FamilyTripResponse>>("/family-trips/drafts/latest"),
    
  getById: (id: number) =>
    api.get<ApiResponse<FamilyTripResponse>>(`/family-trips/${id}`),
    
  update: (id: number, data: FamilyTripRequest) =>
    api.put<ApiResponse<FamilyTripResponse>>(`/family-trips/${id}`, data),
    
  submit: (id: number) =>
    api.post<ApiResponse<FamilyTripResponse>>(`/family-trips/${id}/submit`),
    
  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/family-trips/${id}`),
    
  regenerateCode: (id: number, memberId: number) =>
    api.post<ApiResponse<{ loginCode: string }>>(`/family-trips/${id}/members/${memberId}/regenerate-code`),

  // Family Member Endpoints (requires X-Family-Member-Token)
  memberLogin: (mainApplicantEmail: string, code: string) =>
    api.post<ApiResponse<FamilyMemberLoginResponse>>("/family-trips/members/login", { mainApplicantEmail, code }),
    
  memberLogout: () => {
    const token = localStorage.getItem("familyMemberToken");
    return api.post<ApiResponse<void>>("/family-trips/members/logout", {}, {
      headers: { "X-Family-Member-Token": token }
    });
  },
    
  getCurrentMember: () => {
    const token = localStorage.getItem("familyMemberToken");
    return api.get<ApiResponse<FamilyMemberSession>>("/family-trips/members/me", {
      headers: { "X-Family-Member-Token": token }
    });
  },
  
  getMemberPlans: () => {
    const token = localStorage.getItem("familyMemberToken");
    return api.get<ApiResponse<number[]>>("/family-trips/members/plans", {
      headers: { "X-Family-Member-Token": token }
    });
  },
  
  getMemberPlanDetail: (planId: number) => {
    const token = localStorage.getItem("familyMemberToken");
    return api.get<ApiResponse<Record<string, unknown>>>("/family-trips/members/plans/" + planId, {
      headers: { "X-Family-Member-Token": token }
    });
  }
};

export default familyTripApi;

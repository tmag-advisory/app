import api from "./axios";
import type {
  PaginatedResponse,
  PaginationParams,
  SelectOption,
  // Auth
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  AuthResponse,
  // Company
  CompanyResponse,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  // Employee
  EmployeeResponse,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  // Travel Plan
  TravelPlanResponse,
  CreateTravelPlanRequest,
  UpdateTravelPlanRequest,
  // Travel Request
  TravelRequestResponse,
  CreateTravelRequestRequest,
  UpdateTravelRequestRequest,
  // Health Profile
  HealthProfileResponse,
  CreateHealthProfileRequest,
  UpdateHealthProfileRequest,
  // Country
  CountryResponse,
  CreateCountryRequest,
  UpdateCountryRequest,
  // Country Health Alert
  CountryHealthAlertResponse,
  // Country Accommodation
  CountryAccommodationResponse,
  // Credit
  CreditResponse,
  CreateCreditRequest,
  // Notification
  NotificationResponse,
  CreateNotificationRequest,
  UpdateNotificationRequest,
  // Pricing Plan
  PricingPlanResponse,
  // Invoice
  InvoiceResponse,
  CreateInvoiceRequest,
  // Blog Post
  BlogPostResponse,
  // FAQ Item
  FaqItemResponse,
  // Company User
  CompanyUserResponse,
  CreateCompanyUserRequest,
  MyCompanyMembership,
  // Profile
  ProfileResponse,
  UpdateProfileRequest,
  UpdateProfilePasswordRequest,
  // Onboarding
  UserOnboardingResponse,
  UpsertOnboardingRequest,
  AdvanceStageRequest,
  OnboardingQuestionCategoryResponse,
  SubmitQuestionnaireRequest,
  QuestionnaireProgressRequest,
} from "./types";

// ─── Generic CRUD helpers ────────────────────────────────────

function buildParams(params?: PaginationParams) {
  if (!params) return {};
  return {
    page: params.page,
    per_page: params.per_page,
    search: params.search,
    sort: params.sort,
    order: params.order,
  };
}

// ─── Auth ────────────────────────────────────────────────────

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>("/auth/login", data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    api.post<AuthResponse>("/auth/register", data).then((r) => r.data),

  logout: () =>
    api.post("/auth/logout").then((r) => r.data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    api.post("/auth/forgot-password", data).then((r) => r.data),

  resetPassword: (data: ResetPasswordRequest) =>
    api.post("/auth/reset-password", data).then((r) => r.data),

  resendVerificationEmail: (data: ResendVerificationRequest) =>
    api.post<{ message: string }>("/auth/resend-verification", data).then((r) => r.data),

  verifyEmail: (token: string) =>
    api.get<{ message: string }>("/auth/verify-email", { params: { token } }).then((r) => r.data),
};

// ─── Companies ───────────────────────────────────────────────

export const companiesApi = {
  list: (params?: PaginationParams) =>
    api.get<PaginatedResponse<CompanyResponse>>("/companies", { params: buildParams(params) }).then((r) => r.data),

  listAll: () =>
    api.get<SelectOption[]>("/companies/all").then((r) => r.data),

  get: (id: number) =>
    api.get<CompanyResponse>(`/companies/${id}`).then((r) => r.data),

  create: (data: CreateCompanyRequest) =>
    api.post<CompanyResponse>("/companies", data).then((r) => r.data),

  update: (id: number, data: UpdateCompanyRequest) =>
    api.put<CompanyResponse>(`/companies/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/companies/${id}`).then((r) => r.data),

  uploadLogo: (id: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/companies/${id}/logo`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },

  removeLogo: (id: number) =>
    api.delete(`/companies/${id}/logo`).then((r) => r.data),
};

// ─── Employees ───────────────────────────────────────────────

export const employeesApi = {
  list: (params?: PaginationParams) =>
    api.get<PaginatedResponse<EmployeeResponse>>("/employees", { params: buildParams(params) }).then((r) => r.data),

  listAll: () =>
    api.get<SelectOption[]>("/employees/all").then((r) => r.data),

  get: (id: number) =>
    api.get<EmployeeResponse>(`/employees/${id}`).then((r) => r.data),

  create: (data: CreateEmployeeRequest) =>
    api.post<EmployeeResponse>("/employees", data).then((r) => r.data),

  update: (id: number, data: UpdateEmployeeRequest) =>
    api.put<EmployeeResponse>(`/employees/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/employees/${id}`).then((r) => r.data),
};

// ─── Travel Plans ────────────────────────────────────────────

export const travelPlansApi = {
  list: (params?: PaginationParams) =>
    api.get<PaginatedResponse<TravelPlanResponse>>("/travel-plans", { params: buildParams(params) }).then((r) => r.data),

  listAll: () =>
    api.get<SelectOption[]>("/travel-plans/all").then((r) => r.data),

  get: (id: number) =>
    api.get<TravelPlanResponse>(`/travel-plans/${id}`).then((r) => r.data),

  create: (data: CreateTravelPlanRequest) =>
    api.post<TravelPlanResponse>("/travel-plans", data).then((r) => r.data),

  update: (id: number, data: UpdateTravelPlanRequest) =>
    api.put<TravelPlanResponse>(`/travel-plans/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/travel-plans/${id}`).then((r) => r.data),
};

// ─── Travel Requests ─────────────────────────────────────────

export const travelRequestsApi = {
  list: (params?: PaginationParams) =>
    api.get<PaginatedResponse<TravelRequestResponse>>("/travel-requests", { params: buildParams(params) }).then((r) => r.data),

  listAll: () =>
    api.get<SelectOption[]>("/travel-requests/all").then((r) => r.data),

  get: (id: number) =>
    api.get<TravelRequestResponse>(`/travel-requests/${id}`).then((r) => r.data),

  create: (data: Partial<CreateTravelRequestRequest>) =>
    api.post<TravelRequestResponse>("/travel-requests", data).then((r) => r.data),

  update: (id: number, data: UpdateTravelRequestRequest) =>
    api.put<TravelRequestResponse>(`/travel-requests/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/travel-requests/${id}`).then((r) => r.data),
};

// ─── Health Profiles ─────────────────────────────────────────

export const healthProfilesApi = {
  list: (params?: PaginationParams) =>
    api.get<PaginatedResponse<HealthProfileResponse>>("/health-profiles", { params: buildParams(params) }).then((r) => r.data),

  getMine: () =>
    api.get<HealthProfileResponse>("/health-profiles/my").then((r) => r.data),

  listAll: () =>
    api.get<SelectOption[]>("/health-profiles/all").then((r) => r.data),

  get: (id: number) =>
    api.get<HealthProfileResponse>(`/health-profiles/${id}`).then((r) => r.data),

  create: (data: CreateHealthProfileRequest) =>
    api.post<HealthProfileResponse>("/health-profiles", data).then((r) => r.data),

  update: (id: number, data: UpdateHealthProfileRequest) =>
    api.put<HealthProfileResponse>(`/health-profiles/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/health-profiles/${id}`).then((r) => r.data),
};

// ─── Countries ───────────────────────────────────────────────

export const countriesApi = {
  list: (params?: PaginationParams) =>
    api.get<PaginatedResponse<CountryResponse>>("/countries", { params: buildParams(params) }).then((r) => r.data),

  listAll: () =>
    api.get<{ message: string; success: boolean; data: CountryResponse[] }>("/countries/all")
      .then((r) => r.data.data),

  get: (id: number) =>
    api.get<CountryResponse>(`/countries/${id}`).then((r) => r.data),

  create: (data: CreateCountryRequest) =>
    api.post<CountryResponse>("/countries", data).then((r) => r.data),

  update: (id: number, data: UpdateCountryRequest) =>
    api.put<CountryResponse>(`/countries/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/countries/${id}`).then((r) => r.data),
};

// ─── Country Health Alerts ───────────────────────────────────

export const countryHealthAlertsApi = {
  list: (params?: PaginationParams) =>
    api.get<PaginatedResponse<CountryHealthAlertResponse>>("/country-health-alerts", { params: buildParams(params) }).then((r) => r.data),

  listAll: () =>
    api.get<SelectOption[]>("/country-health-alerts/all").then((r) => r.data),

  get: (id: number) =>
    api.get<CountryHealthAlertResponse>(`/country-health-alerts/${id}`).then((r) => r.data),
};

// ─── Country Accommodations ──────────────────────────────────

export const countryAccommodationsApi = {
  list: (params?: PaginationParams) =>
    api.get<PaginatedResponse<CountryAccommodationResponse>>("/country-accommodations", { params: buildParams(params) }).then((r) => r.data),

  listAll: () =>
    api.get<SelectOption[]>("/country-accommodations/all").then((r) => r.data),

  get: (id: number) =>
    api.get<CountryAccommodationResponse>(`/country-accommodations/${id}`).then((r) => r.data),
};

// ─── Credits ─────────────────────────────────────────────────

export const creditsApi = {
  list: (params?: PaginationParams) =>
    api.get<PaginatedResponse<CreditResponse>>("/credits", { params: buildParams(params) }).then((r) => r.data),

  listAll: () =>
    api.get<SelectOption[]>("/credits/all").then((r) => r.data),

  get: (id: number) =>
    api.get<CreditResponse>(`/credits/${id}`).then((r) => r.data),

  create: (data: CreateCreditRequest) =>
    api.post<CreditResponse>("/credits", data).then((r) => r.data),
};

// ─── Notifications ───────────────────────────────────────────

export const notificationsApi = {
  list: (params?: PaginationParams) =>
    api.get<PaginatedResponse<NotificationResponse>>("/notifications", { params: buildParams(params) }).then((r) => r.data),

  listAll: () =>
    api.get<SelectOption[]>("/notifications/all").then((r) => r.data),

  get: (id: number) =>
    api.get<NotificationResponse>(`/notifications/${id}`).then((r) => r.data),

  create: (data: CreateNotificationRequest) =>
    api.post<NotificationResponse>("/notifications", data).then((r) => r.data),

  update: (id: number, data: UpdateNotificationRequest) =>
    api.put<NotificationResponse>(`/notifications/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/notifications/${id}`).then((r) => r.data),
};

// ─── Pricing Plans ───────────────────────────────────────────

export const pricingPlansApi = {
  list: (params?: PaginationParams) =>
    api.get<PaginatedResponse<PricingPlanResponse>>("/pricing-plans", { params: buildParams(params) }).then((r) => r.data),

  listAll: () =>
    api.get<SelectOption[]>("/pricing-plans/all").then((r) => r.data),

  get: (id: number) =>
    api.get<PricingPlanResponse>(`/pricing-plans/${id}`).then((r) => r.data),
};

// ─── Invoices ────────────────────────────────────────────────

export const invoicesApi = {
  list: (params?: PaginationParams) =>
    api.get<PaginatedResponse<InvoiceResponse>>("/invoices", { params: buildParams(params) }).then((r) => r.data),

  listAll: () =>
    api.get<SelectOption[]>("/invoices/all").then((r) => r.data),

  get: (id: number) =>
    api.get<InvoiceResponse>(`/invoices/${id}`).then((r) => r.data),

  create: (data: CreateInvoiceRequest) =>
    api.post<InvoiceResponse>("/invoices", data).then((r) => r.data),
};

// ─── Blog Posts ──────────────────────────────────────────────

export const blogPostsApi = {
  list: (params?: PaginationParams) =>
    api.get<PaginatedResponse<BlogPostResponse>>("/blog-posts", { params: buildParams(params) }).then((r) => r.data),

  listAll: () =>
    api.get<SelectOption[]>("/blog-posts/all").then((r) => r.data),

  get: (id: number) =>
    api.get<BlogPostResponse>(`/blog-posts/${id}`).then((r) => r.data),

  uploadFeaturedImage: (id: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/blog-posts/${id}/featured-image`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },

  removeFeaturedImage: (id: number) =>
    api.delete(`/blog-posts/${id}/featured-image`).then((r) => r.data),
};

// ─── FAQ Items ───────────────────────────────────────────────

export const faqItemsApi = {
  list: (params?: PaginationParams) =>
    api.get<PaginatedResponse<FaqItemResponse>>("/faq-items", { params: buildParams(params) }).then((r) => r.data),

  listAll: () =>
    api.get<SelectOption[]>("/faq-items/all").then((r) => r.data),

  get: (id: number) =>
    api.get<FaqItemResponse>(`/faq-items/${id}`).then((r) => r.data),
};

// ─── Company Users ───────────────────────────────────────────

export const companyUsersApi = {
  list: (params?: PaginationParams) =>
    api.get<PaginatedResponse<CompanyUserResponse>>("/company-users", { params: buildParams(params) }).then((r) => r.data),

  listAll: () =>
    api.get<SelectOption[]>("/company-users/all").then((r) => r.data),

  get: (id: number) =>
    api.get<CompanyUserResponse>(`/company-users/${id}`).then((r) => r.data),

  create: (data: CreateCompanyUserRequest) =>
    api.post<CompanyUserResponse>("/company-users", data).then((r) => r.data),

  update: (id: number, data: Partial<CreateCompanyUserRequest>) =>
    api.put<CompanyUserResponse>(`/company-users/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/company-users/${id}`).then((r) => r.data),

  mine: () =>
    api.get<{ success: boolean; data: MyCompanyMembership[] }>("/profile/companies")
      .then((r) => r.data.data),
};

// ─── Profile ─────────────────────────────────────────────────

export const profileApi = {
  get: () =>
    api.get<ProfileResponse>("/profile").then((r) => r.data),

  update: (data: UpdateProfileRequest) =>
    api.put<ProfileResponse>("/profile", data).then((r) => r.data),

  updateAvatar: (file: File) => {
    const form = new FormData();
    form.append("avatar", file);
    return api.put<ProfileResponse>("/profile/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },

  updatePassword: (data: UpdateProfilePasswordRequest) =>
    api.put("/profile/password", data).then((r) => r.data),
};

// ─── Onboarding ──────────────────────────────────────────────
export const onboardingApi = {
  get: () =>
    api.get<UserOnboardingResponse>("/onboarding").then((r) => r.data),

  upsert: (data: UpsertOnboardingRequest) =>
    api.post<UserOnboardingResponse>("/onboarding", data).then((r) => r.data),

  advanceStage: (data: AdvanceStageRequest) =>
    api.put<{ stage: number }>("/onboarding/stage", data).then((r) => r.data),

  getQuestions: () =>
    api.get<{ success: boolean; data: OnboardingQuestionCategoryResponse[] }>("/onboarding/questions").then((r) => r.data.data),

  submitQuestionnaire: (data: SubmitQuestionnaireRequest) =>
    api.post("/onboarding/questionnaire", data).then((r) => r.data),

  saveProgress: (data: QuestionnaireProgressRequest) =>
    api.post("/onboarding/progress", data).then((r) => r.data),

  getProgress: () =>
    api.get<{ success: boolean; data: unknown }>("/onboarding/progress").then((r) => r.data.data),
};

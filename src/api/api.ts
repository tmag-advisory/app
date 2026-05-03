import api from "./axios";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  SelectOption,
  // Contact
  ContactRequest,
  ContactResponse,
  NewsletterSubscribeRequest,
  NewsletterSubscribeResponse,
  // Auth
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  AuthResponse,
  GoogleCallbackRequest,
  // Company
  CompanyResponse,
  CompanyCodeValidationResponse,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  // Employee
  EmployeeResponse,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  AllocateEmployeeCreditsRequest,
  UpdateEmployeeStatusRequest,
  PurchaseCreditsRequest,
  // Travel Plan
  TravelPlanResponse,
  TravelPlanListItemResponse,
  CreateTravelPlanRequest,
  UpdateTravelPlanRequest,
  // Draft Plan
  DraftPlanResponse,
  SaveDraftPlanRequest,
  // Travel Request
  CreditRequestResponse,
  CreateCreditRequestRequest,
  UpdateCreditRequestRequest,
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
  CreditPurchaseRequest,
  CreditPurchaseInitiateResponse,
  CreditPurchaseResponse,
  CompanyAdminCreditQuoteResponse,
  CompanyAdminPurchaseInitiateResponse,
  CompanyAdminPricingResponse,
  // Plan Usage Ledger
  PlanUsageLedgerResponse,
  // Reports
  UsageReportSummary,
  PlanHistoryDto,
  DashboardAnalyticsDto,
  ComplianceReportDto,
  // Ebooks
  EbookResponse,
  EbookCheckoutRequest,
  EbookCheckoutResponse,
  EbookOrderResponse,
  CartItemResponse,
  CartCheckoutRequest,
  CartCheckoutResponse,
  ExchangeRatesResponse,
  SupportedCurrency,
  // Doctor
  DoctorApplicationRequest,
  DoctorProfileUpdateRequest,
  DoctorProfileResponse,
  DoctorDashboardStats,
  DoctorValidationPlanDto,
  DoctorValidationDetailDto,
  ValidatePlanRequest,
  AdminDoctorApplicationDto,
  AdminDoctorListItemDto,
  AdminDoctorStatsDto,
} from "./types";

// ─── Generic CRUD helpers ────────────────────────────────────

function buildParams(params?: PaginationParams) {
  if (!params) return {};
  return {
    page: params.page !== undefined ? params.page - 1 : undefined,
    size: params.per_page, // Spring Data JPA Pageable uses 'size' instead of 'per_page'
    search: params.search,
    sort: params.sort,
    order: params.order,
    companyId: params.companyId,
  };
}

// ─── Auth ────────────────────────────────────────────────────

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse<AuthResponse>>("/auth/login", data).then((r) => r.data.data),

  register: (data: RegisterRequest) =>
    api.post<ApiResponse<AuthResponse>>("/auth/register", data).then((r) => r.data.data),

  logout: () =>
    api.post<ApiResponse<null>>("/auth/logout").then((r) => r.data.data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    api.post<ApiResponse<null>>("/auth/forgot-password", data).then((r) => r.data.data),

  resetPassword: (data: ResetPasswordRequest) =>
    api.post<ApiResponse<null>>("/auth/reset-password", data).then((r) => r.data.data),

  resendVerificationEmail: (data: ResendVerificationRequest) =>
    api.post<ApiResponse<{ message: string }>>("/auth/resend-verification", data).then((r) => r.data.data),

  verifyEmail: (data: { email: string; code: string }) =>
    api.post<ApiResponse<{ message: string }>>("/auth/verify-email", data).then((r) => r.data.data),

  acceptInvitation: (data: { token: string; new_password: string }) =>
    api.post<ApiResponse<AuthResponse>>("/auth/accept-invitation", data).then((r) => r.data.data),

  googleAuthUrl: () =>
    api.get<ApiResponse<{ url: string }>>("/auth/google/url").then((r) => r.data.data),

  googleCallback: (data: GoogleCallbackRequest) =>
    api.post<ApiResponse<AuthResponse>>("/auth/google/callback", data).then((r) => r.data.data),
};

// ─── Companies ───────────────────────────────────────────────

export const companiesApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<CompanyResponse>>>("/companies", { params: buildParams(params) }).then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<SelectOption[]>>("/companies/all").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<CompanyResponse>>(`/companies/${id}`).then((r) => r.data.data),

  create: (data: CreateCompanyRequest) =>
    api.post<ApiResponse<CompanyResponse>>("/companies", data).then((r) => r.data.data),

  update: (id: number, data: UpdateCompanyRequest) =>
    api.put<ApiResponse<CompanyResponse>>(`/companies/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/companies/${id}`).then((r) => r.data.data),

  uploadLogo: (id: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<ApiResponse<{ url: string }>>(`/companies/${id}/logo`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data.data);
  },

  removeLogo: (id: number) =>
    api.delete<ApiResponse<null>>(`/companies/${id}/logo`).then((r) => r.data.data),

  validateCode: (code: string) =>
    api.get<ApiResponse<CompanyCodeValidationResponse>>("/companies/validate-code", { params: { code } }).then((r) => r.data.data),

  purchaseCredits: (id: number, data: PurchaseCreditsRequest) =>
    api.post<ApiResponse<CompanyResponse>>(`/companies/${id}/purchase-credits`, data).then((r) => r.data.data),
};

// ─── Employees ───────────────────────────────────────────────

export const employeesApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<EmployeeResponse>>>("/employees", { params: buildParams(params) }).then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<SelectOption[]>>("/employees/all").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<EmployeeResponse>>(`/employees/${id}`).then((r) => r.data.data),

  create: (data: CreateEmployeeRequest) =>
    api.post<ApiResponse<EmployeeResponse>>("/employees", data).then((r) => r.data.data),

  update: (id: number, data: UpdateEmployeeRequest) =>
    api.put<ApiResponse<EmployeeResponse>>(`/employees/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/employees/${id}`).then((r) => r.data.data),

  allocateCredits: (id: number, data: AllocateEmployeeCreditsRequest) =>
    api.put<ApiResponse<EmployeeResponse>>(`/employees/${id}/credits`, data).then((r) => r.data.data),

  updateStatus: (id: number, data: UpdateEmployeeStatusRequest) =>
    api.put<ApiResponse<EmployeeResponse>>(`/employees/${id}/status`, data).then((r) => r.data.data),

  invite: (data: { name: string; email: string; department: string; creditsAllocated: number; companyId: number }) =>
    api.post<ApiResponse<EmployeeResponse>>("/employees/invite", data).then((r) => r.data.data),
};

// ─── Travel Plans ────────────────────────────────────────────

export const travelPlansApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<TravelPlanListItemResponse>>>("/travel-plans", { params: buildParams(params) }).then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<SelectOption[]>>("/travel-plans/all").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<TravelPlanResponse>>(`/travel-plans/${id}`).then((r) => r.data.data),

  create: (data: CreateTravelPlanRequest) =>
    api.post<ApiResponse<TravelPlanResponse>>("/travel-plans", data).then((r) => r.data.data),

  update: (id: number, data: UpdateTravelPlanRequest) =>
    api.put<ApiResponse<TravelPlanResponse>>(`/travel-plans/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/travel-plans/${id}`).then((r) => r.data.data),

  /** Server-generated PDF (OpenHTMLToPDF). Requires completed plan; same auth as other travel-plan routes. */
  downloadPdfBlob: (id: number) =>
    api.get<Blob>(`/travel-plans/${id}/pdf`, { responseType: "blob" }).then((r) => r.data),

  /** Condensed server-generated PDF. Available for completed standard and premium plans. */
  downloadSummaryPdfBlob: (id: number) =>
    api.get<Blob>(`/travel-plans/${id}/summary-pdf`, { responseType: "blob" }).then((r) => r.data),
};

// ─── Credit Requests ─────────────────────────────────────────

export const creditRequestsApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<CreditRequestResponse>>>("/credit-requests", { params: buildParams(params) }).then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<SelectOption[]>>("/credit-requests/all").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<CreditRequestResponse>>(`/credit-requests/${id}`).then((r) => r.data.data),

  create: (data: Partial<CreateCreditRequestRequest>) =>
    api.post<ApiResponse<CreditRequestResponse>>("/credit-requests", data).then((r) => r.data.data),

  update: (id: number, data: UpdateCreditRequestRequest) =>
    api.put<ApiResponse<CreditRequestResponse>>(`/credit-requests/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/credit-requests/${id}`).then((r) => r.data.data),

  approve: (id: number) =>
    api.post<ApiResponse<CreditRequestResponse>>(`/credit-requests/${id}/approve`).then((r) => r.data.data),

  reject: (id: number) =>
    api.post<ApiResponse<CreditRequestResponse>>(`/credit-requests/${id}/reject`).then((r) => r.data.data),
};

// ─── Health Profiles ─────────────────────────────────────────

export const healthProfilesApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<HealthProfileResponse>>>("/health-profiles", { params: buildParams(params) }).then((r) => r.data.data),

  getMine: () =>
    api.get<ApiResponse<HealthProfileResponse>>("/health-profiles/my").then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<SelectOption[]>>("/health-profiles/all").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<HealthProfileResponse>>(`/health-profiles/${id}`).then((r) => r.data.data),

  create: (data: CreateHealthProfileRequest) =>
    api.post<ApiResponse<HealthProfileResponse>>("/health-profiles", data).then((r) => r.data.data),

  update: (id: number, data: UpdateHealthProfileRequest) =>
    api.put<ApiResponse<HealthProfileResponse>>(`/health-profiles/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/health-profiles/${id}`).then((r) => r.data.data),
};

// ─── Countries ───────────────────────────────────────────────

export const countriesApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<CountryResponse>>>("/countries", { params: buildParams(params) }).then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<CountryResponse[]>>("/countries/all")
      .then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<CountryResponse>>(`/countries/${id}`).then((r) => r.data.data),

  create: (data: CreateCountryRequest) =>
    api.post<ApiResponse<CountryResponse>>("/countries", data).then((r) => r.data.data),

  update: (id: number, data: UpdateCountryRequest) =>
    api.put<ApiResponse<CountryResponse>>(`/countries/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/countries/${id}`).then((r) => r.data.data),
};

// ─── Country Health Alerts ───────────────────────────────────

export const countryHealthAlertsApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<CountryHealthAlertResponse>>>("/country-health-alerts", { params: buildParams(params) }).then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<SelectOption[]>>("/country-health-alerts/all").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<CountryHealthAlertResponse>>(`/country-health-alerts/${id}`).then((r) => r.data.data),
};

// ─── Country Accommodations ──────────────────────────────────

export const countryAccommodationsApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<CountryAccommodationResponse>>>("/country-accommodations", { params: buildParams(params) }).then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<SelectOption[]>>("/country-accommodations/all").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<CountryAccommodationResponse>>(`/country-accommodations/${id}`).then((r) => r.data.data),
};

// ─── Credits ─────────────────────────────────────────────────

export const creditsApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<CreditResponse>>>("/credits", { params: buildParams(params) }).then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<SelectOption[]>>("/credits/all").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<CreditResponse>>(`/credits/${id}`).then((r) => r.data.data),

  create: (data: CreateCreditRequest) =>
    api.post<ApiResponse<CreditResponse>>("/credits", data).then((r) => r.data.data),
};

// ─── Notifications ───────────────────────────────────────────

export const notificationsApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<NotificationResponse>>>("/notifications", { params: buildParams(params) }).then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<SelectOption[]>>("/notifications/all").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<NotificationResponse>>(`/notifications/${id}`).then((r) => r.data.data),

  create: (data: CreateNotificationRequest) =>
    api.post<ApiResponse<NotificationResponse>>("/notifications", data).then((r) => r.data.data),

  update: (id: number, data: UpdateNotificationRequest) =>
    api.put<ApiResponse<NotificationResponse>>(`/notifications/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/notifications/${id}`).then((r) => r.data.data),
};

// ─── Invoices ────────────────────────────────────────────────

export const invoicesApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<InvoiceResponse>>>("/invoices", { params: buildParams(params) }).then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<SelectOption[]>>("/invoices/all").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<InvoiceResponse>>(`/invoices/${id}`).then((r) => r.data.data),

  create: (data: CreateInvoiceRequest) =>
    api.post<ApiResponse<InvoiceResponse>>("/invoices", data).then((r) => r.data.data),
};

// ─── Blog Posts ──────────────────────────────────────────────

export const blogPostsApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<BlogPostResponse>>>("/blog-posts", { params: buildParams(params) }).then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<SelectOption[]>>("/blog-posts/all").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<BlogPostResponse>>(`/blog-posts/${id}`).then((r) => r.data.data),

  uploadFeaturedImage: (id: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<ApiResponse<{ url: string }>>(`/blog-posts/${id}/featured-image`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data.data);
  },

  removeFeaturedImage: (id: number) =>
    api.delete<ApiResponse<null>>(`/blog-posts/${id}/featured-image`).then((r) => r.data.data),
};

// ─── FAQ Items ───────────────────────────────────────────────

export const faqItemsApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<FaqItemResponse>>>("/faq-items", { params: buildParams(params) }).then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<SelectOption[]>>("/faq-items/all").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<FaqItemResponse>>(`/faq-items/${id}`).then((r) => r.data.data),
};

// ─── Company Users ───────────────────────────────────────────

export const companyUsersApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<CompanyUserResponse>>>("/company-users", { params: buildParams(params) }).then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<SelectOption[]>>("/company-users/all").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<CompanyUserResponse>>(`/company-users/${id}`).then((r) => r.data.data),

  create: (data: CreateCompanyUserRequest) =>
    api.post<ApiResponse<CompanyUserResponse>>("/company-users", data).then((r) => r.data.data),

  update: (id: number, data: Partial<CreateCompanyUserRequest>) =>
    api.put<ApiResponse<CompanyUserResponse>>(`/company-users/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/company-users/${id}`).then((r) => r.data.data),

  mine: () =>
    api.get<ApiResponse<MyCompanyMembership[]>>("/profile/companies")
      .then((r) => r.data.data),
};

// ─── Profile ─────────────────────────────────────────────────

export const profileApi = {
  get: () =>
    api.get<ApiResponse<ProfileResponse>>("/profile").then((r) => r.data.data),

  update: (data: UpdateProfileRequest) =>
    api.put<ApiResponse<ProfileResponse>>("/profile", data).then((r) => r.data.data),

  updateAvatar: (file: File) => {
    const form = new FormData();
    form.append("avatar", file);
    return api.put<ApiResponse<ProfileResponse>>("/profile/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data.data);
  },

  updatePassword: (data: UpdateProfilePasswordRequest) =>
    api.put<ApiResponse<null>>("/profile/password", data).then((r) => r.data.data),

  upgradePlan: (planCode: string) =>
    api.put<ApiResponse<ProfileResponse>>("/profile/upgrade-plan", { planCode }).then((r) => r.data.data),
};

// ─── Onboarding ──────────────────────────────────────────────
export const onboardingApi = {
  get: () =>
    api.get<ApiResponse<UserOnboardingResponse>>("/onboarding").then((r) => r.data.data),

  upsert: (data: UpsertOnboardingRequest) =>
    api.post<ApiResponse<UserOnboardingResponse>>("/onboarding", data).then((r) => r.data.data),

  advanceStage: (data: AdvanceStageRequest) =>
    api.put<ApiResponse<{ stage: number; role: string }>>("/onboarding/stage", data).then((r) => r.data.data),

  getQuestions: () =>
    api.get<ApiResponse<OnboardingQuestionCategoryResponse[]>>("/onboarding/questions").then((r) => r.data.data),

  submitQuestionnaire: (data: SubmitQuestionnaireRequest) =>
    api.post<ApiResponse<UserOnboardingResponse>>("/onboarding/questionnaire", data).then((r) => r.data.data),

  saveProgress: (data: QuestionnaireProgressRequest) =>
    api.post<ApiResponse<null>>("/onboarding/progress", data).then((r) => r.data.data),

  getProgress: () =>
    api.get<ApiResponse<any>>("/onboarding/progress").then((r) => r.data.data),
};

// ─── Draft Plans ──────────────────────────────────────────────

export const draftPlansApi = {
  list: () =>
    api.get<ApiResponse<DraftPlanResponse[]>>("/draft-plans").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<DraftPlanResponse>>(`/draft-plans/${id}`).then((r) => r.data.data),

  create: (data: SaveDraftPlanRequest) =>
    api.post<ApiResponse<DraftPlanResponse>>("/draft-plans", data).then((r) => r.data.data),

  update: (id: number, data: SaveDraftPlanRequest) =>
    api.put<ApiResponse<DraftPlanResponse>>(`/draft-plans/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/draft-plans/${id}`).then((r) => r.data.data),
};

// ─── User Credit Plans ────────────────────────────────────────────
export const creditPlansApi = {
  list: () =>
    api.get<ApiResponse<import("./types").CreditPlan[]>>("/user-credit-plans").then((r) => r.data.data),

  getById: (id: number) =>
    api.get<ApiResponse<import("./types").CreditPlan>>(`/user-credit-plans/${id}`).then((r) => r.data.data),
};

// ─── Credit Purchase ────────────────────────────────────────────
export const creditPurchaseApi = {
  initiate: (data: CreditPurchaseRequest) =>
    api.post<ApiResponse<CreditPurchaseInitiateResponse>>("/credit-purchases/initiate", data).then((r) => r.data.data),

  verify: (txRef: string, transactionId?: string) =>
    api.get<ApiResponse<{ success: boolean; purchase: CreditPurchaseResponse }>>(`/credit-purchases/verify/${txRef}`, { params: transactionId ? { transaction_id: transactionId } : undefined }).then((r) => r.data.data),

  callback: (params: { tx_ref?: string; status?: string; transaction_id?: string }) =>
    api.get<ApiResponse<{ success: boolean; purchase: CreditPurchaseResponse }>>("/credit-purchases/callback", { params }).then((r) => r.data.data),

  history: () =>
    api.get<ApiResponse<CreditPurchaseResponse[]>>("/credit-purchases/history").then((r) => r.data.data),

  get: (txRef: string) =>
    api.get<ApiResponse<CreditPurchaseResponse>>(`/credit-purchases/${txRef}`).then((r) => r.data.data),
};

// ─── Company Admin Credits (HR Payment) ────────────────────────────────────
export const companyAdminCreditsApi = {
  getQuote: (companyId: number, credits: number) =>
    api.post<ApiResponse<CompanyAdminCreditQuoteResponse>>("/company-admin/credits/quote", null, { params: { companyId, credits } }).then((r) => r.data.data),

  purchase: (data: { credits: number; companyId: number }) =>
    api.post<ApiResponse<CompanyAdminPurchaseInitiateResponse>>("/company-admin/credits/purchase/hr", data).then((r) => r.data.data),

  verify: (txRef: string, transactionId?: string) =>
    api.get<ApiResponse<{ success: boolean; purchase: CreditPurchaseResponse }>>(`/company-admin/credits/verify/${txRef}`, {
      params: transactionId ? { transaction_id: transactionId } : {},
    }).then((r) => r.data.data),

  getPurchase: (txRef: string) =>
    api.get<ApiResponse<CreditPurchaseResponse>>(`/company-admin/credits/${txRef}`).then((r) => r.data.data),

  getHistory: (companyId?: number) =>
    api.get<ApiResponse<CreditPurchaseResponse[]>>("/company-admin/credits/history", {
      params: companyId ? { companyId } : {},
    }).then((r) => r.data.data),

  getPricing: (companyId: number) =>
    api.get<ApiResponse<CompanyAdminPricingResponse>>("/company-admin/credits/pricing", { params: { companyId } }).then((r) => r.data.data),
};

// ─── Plan Usage Ledger ───────────────────────────────────────────
export const planUsageLedgerApi = {
  mine: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<PlanUsageLedgerResponse>>>("/plan-usage-ledgers/my", { params: buildParams(params) }).then((r) => r.data.data),

  byEmployee: (employeeId: number, params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<PlanUsageLedgerResponse>>>(`/plan-usage-ledgers/employee/${employeeId}`, { params: buildParams(params) }).then((r) => r.data.data),
};

// ─── Reports ────────────────────────────────────────────────

export const reportsApi = {
  getUsageReport: (companyId?: number) =>
    api.get<ApiResponse<UsageReportSummary>>("/reports/usage", { params: companyId ? { companyId } : {} }).then((r) => r.data.data),

  getUsageReportCsv: (companyId?: number) =>
    api.get<string>("/reports/usage/csv", { params: companyId ? { companyId } : {}, responseType: 'text' }),

  getPlanHistory: (companyId?: number) =>
    api.get<ApiResponse<PlanHistoryDto[]>>("/reports/plans", { params: companyId ? { companyId } : {} }).then((r) => r.data.data),

  getPlanHistoryCsv: (companyId?: number) =>
    api.get<string>("/reports/plans/csv", { params: companyId ? { companyId } : {}, responseType: 'text' }),

  getComplianceReport: (companyId?: number) =>
    api.get<ApiResponse<ComplianceReportDto>>("/reports/compliance", { params: companyId ? { companyId } : {} }).then((r) => r.data.data),

  getComplianceReportCsv: (companyId?: number) =>
    api.get<string>("/reports/compliance/csv", { params: companyId ? { companyId } : {}, responseType: 'text' }),

  getDashboardAnalytics: (companyId?: number) =>
    api
      .get<ApiResponse<DashboardAnalyticsDto>>("/reports/dashboard/analytics", {
        params: companyId !== undefined ? { companyId } : {},
      })
      .then((r) => r.data.data),
};

// ─── Ebooks ──────────────────────────────────────────────────

export const ebooksApi = {
  list: () =>
    api.get<ApiResponse<EbookResponse[]>>("/ebooks").then((r) => r.data.data),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<EbookResponse>>(`/ebooks/${slug}`).then((r) => r.data.data),

  checkout: (data: EbookCheckoutRequest) =>
    api.post<ApiResponse<EbookCheckoutResponse>>("/ebooks/checkout", data).then((r) => r.data.data),

  verifyOrder: (data: { txRef: string; transactionId?: string }) =>
    api.post<ApiResponse<EbookOrderResponse>>("/ebooks/orders/verify", data).then((r) => r.data.data),

  getOrderStatus: (txRef: string) =>
    api.get<ApiResponse<EbookOrderResponse>>(`/ebooks/orders/${txRef}`).then((r) => r.data.data),

  myOrders: () =>
    api.get<ApiResponse<EbookOrderResponse[]>>("/ebooks/my-orders").then((r) => r.data.data),
};

// ─── Cart ────────────────────────────────────────────────────

export const cartApi = {
  getCart: () =>
    api.get<ApiResponse<CartItemResponse[]>>("/cart").then((r) => r.data.data),

  addItem: (ebookVersionId: number) =>
    api.post<ApiResponse<CartItemResponse[]>>("/cart/add", { ebookVersionId }).then((r) => r.data.data),

  removeItem: (cartItemId: number) =>
    api.delete<ApiResponse<CartItemResponse[]>>(`/cart/${cartItemId}`).then((r) => r.data.data),

  clearCart: () =>
    api.delete<ApiResponse<CartItemResponse[]>>("/cart").then((r) => r.data.data),

  syncCart: (items: { ebookVersionId: number }[]) =>
    api.post<ApiResponse<CartItemResponse[]>>("/cart/sync", items).then((r) => r.data.data),

  checkout: (data: CartCheckoutRequest) =>
    api.post<ApiResponse<CartCheckoutResponse>>("/cart/checkout", data).then((r) => r.data.data),
};

// ─── Exchange Rates ──────────────────────────────────────────

export const exchangeRatesApi = {
  getRates: () =>
    api.get<ApiResponse<ExchangeRatesResponse>>("/exchange-rates").then((r) => r.data.data),

  getCurrencies: () =>
    api.get<ApiResponse<SupportedCurrency[]>>("/exchange-rates/currencies").then((r) => r.data.data),

  convert: (amount: number, from: string, to: string) =>
    api.get<ApiResponse<{ convertedAmount: number; symbol: string }>>("/exchange-rates/convert", {
      params: { amount, from, to },
    }).then((r) => r.data.data),
};

// ─── Contact ─────────────────────────────────────────────────

export const contactApi = {
  submit: (data: ContactRequest) =>
    api.post<ApiResponse<ContactResponse>>("/contact", data).then((r) => r.data.data),
};

// ─── Newsletter ───────────────────────────────────────────────

export const newsletterApi = {
  subscribe: (data: NewsletterSubscribeRequest) =>
    api.post<ApiResponse<NewsletterSubscribeResponse>>("/newsletter/subscribe", data).then((r) => r.data.data),
};

// ─── Public Plans ───────────────────────────────────────────

export interface PublicPlanResponse {
  id: number;
  code: string;
  displayName: string;
  signupCredits: number;
  maxEmployees: number;
  customSupportEnabled: boolean;
  apiAccessEnabled: boolean;
  multipleAdminAccountsEnabled: boolean;
  highEmployeeLimitEnabled: boolean;
  priceUsd: number;
  priceNgn: number;
  priceEur: number;
  priceGbp: number;
}

export const publicPlansApi = {
  list: () =>
    api.get<ApiResponse<PublicPlanResponse[]>>("/public/plans").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<PublicPlanResponse>>(`/public/plans/${id}`).then((r) => r.data.data),
};

// ─── Doctor ────────────────────────────────────────────────

export const doctorApi = {
  getProfile: () =>
    api.get<ApiResponse<DoctorProfileResponse>>("/doctor/profile").then((r) => r.data.data),

  apply: (data: DoctorApplicationRequest) => {
    const form = new FormData();
    form.append("medicalLicenseNumber", data.medicalLicenseNumber);
    form.append("signature", data.signature);
    if (data.stamp) form.append("stamp", data.stamp);
    return api.post<ApiResponse<void>>("/doctor/apply", form, { headers: { "Content-Type": undefined } }).then((r) => r.data.data);
  },

  updateProfile: (data: DoctorProfileUpdateRequest) => {
    const form = new FormData();
    if (data.firstName) form.append("firstName", data.firstName);
    if (data.lastName) form.append("lastName", data.lastName);
    if (data.profilePictureOption) form.append("profilePictureOption", data.profilePictureOption);
    if (data.medicalLicenseNumber) form.append("medicalLicenseNumber", data.medicalLicenseNumber);
    if (data.signature) form.append("signature", data.signature);
    if (data.stamp) form.append("stamp", data.stamp);
    return api.put<ApiResponse<DoctorProfileResponse>>("/doctor/profile", form, { headers: { "Content-Type": undefined } }).then((r) => r.data.data);
  },

  updateAvatar: (file: File) => {
    const form = new FormData();
    form.append("avatar", file);
    return api.put<ApiResponse<ProfileResponse>>("/profile/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data.data);
  },

  getDashboardStats: () =>
    api.get<ApiResponse<DoctorDashboardStats>>("/doctor/dashboard").then((r) => r.data.data),

  getPendingValidations: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<DoctorValidationPlanDto>>>("/doctor/pending", { params: buildParams(params) }).then((r) => r.data.data),

  getValidatedPlans: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<DoctorValidationPlanDto>>>("/doctor/validated", { params: buildParams(params) }).then((r) => r.data.data),

  getValidationDetail: (planId: number) =>
    api.get<ApiResponse<DoctorValidationDetailDto>>(`/doctor/plans/${planId}`).then((r) => r.data.data),

  validatePlan: (data: ValidatePlanRequest) =>
    api.post<ApiResponse<null>>("/doctor/validate", data).then((r) => r.data.data),

  downloadSignedPdf: (planId: number) =>
    api.get<Blob>(`/doctor/plans/${planId}/signed-pdf`, { responseType: "blob" }).then((r) => r.data),
};

// ─── Admin Doctor ──────────────────────────────────────────

export const adminDoctorApi = {
  getApplications: (status?: string) =>
    api.get<ApiResponse<AdminDoctorApplicationDto[]>>("/admin/doctors/applications", { params: status ? { status } : {} }).then((r) => r.data.data),

  getDoctors: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<AdminDoctorListItemDto>>>("/admin/doctors", { params: buildParams(params) }).then((r) => r.data.data),

  approveApplication: (userId: number) =>
    api.post<ApiResponse<null>>(`/admin/doctors/${userId}/approve`).then((r) => r.data.data),

  rejectApplication: (userId: number, reason: string) =>
    api.post<ApiResponse<null>>(`/admin/doctors/${userId}/reject`, { reason }).then((r) => r.data.data),

  revokeDoctor: (userId: number) =>
    api.post<ApiResponse<null>>(`/admin/doctors/${userId}/revoke`).then((r) => r.data.data),

  getStats: () =>
    api.get<ApiResponse<AdminDoctorStatsDto>>("/admin/doctors/stats").then((r) => r.data.data),
};

// ─── Company Onboarding ────────────────────────────────────

export const companyOnboardingApi = {
  submit: (data: import("./types").CompanyOnboardingRequest) => {
    const formData = new FormData();
    const { teamMembersCsv, ...payload } = data;
    formData.append("request", new Blob([JSON.stringify(payload)], { type: "application/json" }));
    if (teamMembersCsv) formData.append("teamMembersCsv", teamMembersCsv);

    return api.post<ApiResponse<import("./types").CompanyOnboardingResponse>>("/public/company-onboarding", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data.data);
  },

  initiatePayment: (id: number) =>
    api.post<ApiResponse<import("./types").OnboardingPaymentInitiate>>(`/public/company-onboarding/${id}/pay`).then((r) => r.data.data),

  verifyPayment: (txRef: string, transactionId?: string) =>
    api.get<ApiResponse<import("./types").CompanyOnboardingResponse>>("/public/company-onboarding/verify", {
      params: { tx_ref: txRef, transaction_id: transactionId },
    }).then((r) => r.data.data),

  getStatus: (id: number) =>
    api.get<ApiResponse<import("./types").CompanyOnboardingResponse>>(`/public/company-onboarding/${id}/status`).then((r) => r.data.data),

  getPricingPreview: (credits: number) =>
    api.get<ApiResponse<import("./types").PublicPricingPreview[]>>("/public/company-onboarding/pricing", {
      params: { credits },
    }).then((r) => r.data.data),
};

// ─── User Settings ────────────────────────────────────────────

export const settingsApi = {
  get: () =>
    api.get<ApiResponse<import("./types").UserSettingResponse>>("/settings").then((r) => r.data.data),

  acceptQuestionnaireConsent: () =>
    api.post<ApiResponse<import("./types").UserSettingResponse>>("/settings/questionnaire-consent").then((r) => r.data.data),
};

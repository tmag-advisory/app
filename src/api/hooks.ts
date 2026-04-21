import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaginationParams, ResendVerificationRequest } from "./types";
import {
  authApi,
  companiesApi,
  employeesApi,
  travelPlansApi,
  draftPlansApi,
  creditRequestsApi,
  healthProfilesApi,
  countriesApi,
  countryHealthAlertsApi,
  countryAccommodationsApi,
  creditsApi,
  notificationsApi,
  invoicesApi,
  blogPostsApi,
  faqItemsApi,
  companyUsersApi,
  profileApi,
  onboardingApi,
  creditPlansApi,
  creditPurchaseApi,
  companyAdminCreditsApi,
  planUsageLedgerApi,
  reportsApi,
  contactApi,
  newsletterApi,
  ebooksApi,
  cartApi,
  exchangeRatesApi,
  publicPlansApi,
  companyOnboardingApi,
} from "./api";
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  PurchaseCreditsRequest,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  AllocateEmployeeCreditsRequest,
  UpdateEmployeeStatusRequest,
  InviteEmployeeRequest,
  AcceptInvitationRequest,
  CreateTravelPlanRequest,
  UpdateTravelPlanRequest,
  CreateCreditRequestRequest,
  UpdateCreditRequestRequest,
  CreateHealthProfileRequest,
  UpdateHealthProfileRequest,
  CreateCountryRequest,
  UpdateCountryRequest,
  CreateCreditRequest,
  CreateNotificationRequest,
  UpdateNotificationRequest,
  CreateInvoiceRequest,
  CreateCompanyUserRequest,
  UpdateProfileRequest,
  UpdateProfilePasswordRequest,
  UpsertOnboardingRequest,
  AdvanceStageRequest,
  SubmitQuestionnaireRequest,
  QuestionnaireProgressRequest,
  SaveDraftPlanRequest,
  CreditPurchaseRequest,
  GoogleCallbackRequest,
  PlanUsageLedgerResponse,
  ContactRequest,
  NewsletterSubscribeRequest,
  EbookCheckoutRequest,
  CartCheckoutRequest,
} from "./types";

// ─── Query Keys ──────────────────────────────────────────────

export const queryKeys = {
  companies: {
    all: ["companies"] as const,
    lists: () => [...queryKeys.companies.all, "list"] as const,
    list: (params?: PaginationParams) => [...queryKeys.companies.lists(), params] as const,
    selectAll: () => [...queryKeys.companies.all, "select"] as const,
    details: () => [...queryKeys.companies.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.companies.details(), id] as const,
  },
  employees: {
    all: ["employees"] as const,
    lists: () => [...queryKeys.employees.all, "list"] as const,
    list: (params?: PaginationParams) => [...queryKeys.employees.lists(), params] as const,
    selectAll: () => [...queryKeys.employees.all, "select"] as const,
    details: () => [...queryKeys.employees.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.employees.details(), id] as const,
  },
  travelPlans: {
    all: ["travel-plans"] as const,
    lists: () => [...queryKeys.travelPlans.all, "list"] as const,
    list: (params?: PaginationParams) => [...queryKeys.travelPlans.lists(), params] as const,
    selectAll: () => [...queryKeys.travelPlans.all, "select"] as const,
    details: () => [...queryKeys.travelPlans.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.travelPlans.details(), id] as const,
  },
  creditRequests: {
    all: ["credit-requests"] as const,
    lists: () => [...queryKeys.creditRequests.all, "list"] as const,
    list: (params?: PaginationParams) => [...queryKeys.creditRequests.lists(), params] as const,
    selectAll: () => [...queryKeys.creditRequests.all, "select"] as const,
    details: () => [...queryKeys.creditRequests.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.creditRequests.details(), id] as const,
  },
  healthProfiles: {
    all: ["health-profiles"] as const,
    lists: () => [...queryKeys.healthProfiles.all, "list"] as const,
    list: (params?: PaginationParams) => [...queryKeys.healthProfiles.lists(), params] as const,
    selectAll: () => [...queryKeys.healthProfiles.all, "select"] as const,
    details: () => [...queryKeys.healthProfiles.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.healthProfiles.details(), id] as const,
  },
  countries: {
    all: ["countries"] as const,
    lists: () => [...queryKeys.countries.all, "list"] as const,
    list: (params?: PaginationParams) => [...queryKeys.countries.lists(), params] as const,
    selectAll: () => [...queryKeys.countries.all, "select"] as const,
    details: () => [...queryKeys.countries.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.countries.details(), id] as const,
  },
  countryHealthAlerts: {
    all: ["country-health-alerts"] as const,
    lists: () => [...queryKeys.countryHealthAlerts.all, "list"] as const,
    list: (params?: PaginationParams) => [...queryKeys.countryHealthAlerts.lists(), params] as const,
    selectAll: () => [...queryKeys.countryHealthAlerts.all, "select"] as const,
    details: () => [...queryKeys.countryHealthAlerts.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.countryHealthAlerts.details(), id] as const,
  },
  countryAccommodations: {
    all: ["country-accommodations"] as const,
    lists: () => [...queryKeys.countryAccommodations.all, "list"] as const,
    list: (params?: PaginationParams) => [...queryKeys.countryAccommodations.lists(), params] as const,
    selectAll: () => [...queryKeys.countryAccommodations.all, "select"] as const,
    details: () => [...queryKeys.countryAccommodations.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.countryAccommodations.details(), id] as const,
  },
  credits: {
    all: ["credits"] as const,
    lists: () => [...queryKeys.credits.all, "list"] as const,
    list: (params?: PaginationParams) => [...queryKeys.credits.lists(), params] as const,
    selectAll: () => [...queryKeys.credits.all, "select"] as const,
    details: () => [...queryKeys.credits.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.credits.details(), id] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    lists: () => [...queryKeys.notifications.all, "list"] as const,
    list: (params?: PaginationParams) => [...queryKeys.notifications.lists(), params] as const,
    selectAll: () => [...queryKeys.notifications.all, "select"] as const,
    details: () => [...queryKeys.notifications.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.notifications.details(), id] as const,
  },
  invoices: {
    all: ["invoices"] as const,
    lists: () => [...queryKeys.invoices.all, "list"] as const,
    list: (params?: PaginationParams) => [...queryKeys.invoices.lists(), params] as const,
    selectAll: () => [...queryKeys.invoices.all, "select"] as const,
    details: () => [...queryKeys.invoices.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.invoices.details(), id] as const,
  },
  blogPosts: {
    all: ["blog-posts"] as const,
    lists: () => [...queryKeys.blogPosts.all, "list"] as const,
    list: (params?: PaginationParams) => [...queryKeys.blogPosts.lists(), params] as const,
    selectAll: () => [...queryKeys.blogPosts.all, "select"] as const,
    details: () => [...queryKeys.blogPosts.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.blogPosts.details(), id] as const,
  },
  faqItems: {
    all: ["faq-items"] as const,
    lists: () => [...queryKeys.faqItems.all, "list"] as const,
    list: (params?: PaginationParams) => [...queryKeys.faqItems.lists(), params] as const,
    selectAll: () => [...queryKeys.faqItems.all, "select"] as const,
    details: () => [...queryKeys.faqItems.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.faqItems.details(), id] as const,
  },
  companyUsers: {
    all: ["company-users"] as const,
    lists: () => [...queryKeys.companyUsers.all, "list"] as const,
    list: (params?: PaginationParams) => [...queryKeys.companyUsers.lists(), params] as const,
    selectAll: () => [...queryKeys.companyUsers.all, "select"] as const,
    details: () => [...queryKeys.companyUsers.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.companyUsers.details(), id] as const,
    mine: () => [...queryKeys.companyUsers.all, "mine"] as const,
  },
  profile: {
    all: ["profile"] as const,
    detail: () => [...["profile"], "detail"] as const,
  },
  onboarding: {
    all: ["onboarding"] as const,
    detail: () => [...["onboarding"], "detail"] as const,
  },
  creditPlans: {
    all: ["user-credit-plans"] as const,
    list: () => [...["user-credit-plans"], "list"] as const,
  },
  creditPurchases: {
    all: ["credit-purchases"] as const,
    history: () => [...["credit-purchases"], "history"] as const,
    byTxRef: (txRef: string) => [...["credit-purchases"], "txRef", txRef] as const,
  },
  companyAdminCredits: {
    all: ["company-admin-credits"] as const,
    history: (companyId?: number) => [...["company-admin-credits"], "history", companyId] as const,
    pricing: (companyId: number) => [...["company-admin-credits"], "pricing", companyId] as const,
  },
  planUsageLedgers: {
    all: ["plan-usage-ledgers"] as const,
    mine: () => [...["plan-usage-ledgers"], "mine"] as const,
    byEmployee: (employeeId: number) => [...["plan-usage-ledgers"], "employee", employeeId] as const,
  },
};

// ─── Auth Hooks ──────────────────────────────────────────────

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
  });
}

export function useLogout() {
  return useMutation({ mutationFn: () => authApi.logout() });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (data: { email: string; code: string }) => authApi.verifyEmail(data),
  });
}

export function useGoogleCallback() {
  return useMutation({
    mutationFn: (data: GoogleCallbackRequest) => authApi.googleCallback(data),
  });
}

// ─── Company Hooks ───────────────────────────────────────────

export function useCompanies(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.companies.list(params),
    queryFn: () => companiesApi.list(params),
  });
}

export function useCompaniesSelect() {
  return useQuery({
    queryKey: queryKeys.companies.selectAll(),
    queryFn: () => companiesApi.listAll(),
  });
}

export function useCompany(id: number) {
  return useQuery({
    queryKey: queryKeys.companies.detail(id),
    queryFn: () => companiesApi.get(id),
    enabled: id > 0,
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCompanyRequest) => companiesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.companies.all }),
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCompanyRequest }) =>
      companiesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.companies.all }),
  });
}

export function useDeleteCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => companiesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.companies.all }),
  });
}

export function usePurchaseCredits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PurchaseCreditsRequest }) =>
      companiesApi.purchaseCredits(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.companies.all });
      qc.invalidateQueries({ queryKey: queryKeys.credits.all });
    },
  });
}

export function useValidateCompanyCode(code: string) {
  return useQuery({
    queryKey: [...queryKeys.companies.all, "validate-code", code],
    queryFn: () => companiesApi.validateCode(code),
    enabled: code.trim().length > 0,
    staleTime: 30_000,
    retry: false,
  });
}

export function useUploadCompanyLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      companiesApi.uploadLogo(id, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.companies.all }),
  });
}

// ─── Employee Hooks ──────────────────────────────────────────

export function useEmployees(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.employees.list(params),
    queryFn: () => employeesApi.list(params),
  });
}

export function useEmployeesSelect() {
  return useQuery({
    queryKey: queryKeys.employees.selectAll(),
    queryFn: () => employeesApi.listAll(),
  });
}

export function useEmployee(id: number) {
  return useQuery({
    queryKey: queryKeys.employees.detail(id),
    queryFn: () => employeesApi.get(id),
    enabled: id > 0,
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeRequest) => employeesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.employees.all }),
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployeeRequest }) =>
      employeesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.employees.all }),
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.employees.all }),
  });
}

export function useAllocateEmployeeCredits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AllocateEmployeeCreditsRequest }) =>
      employeesApi.allocateCredits(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.employees.all }),
  });
}

export function useUpdateEmployeeStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployeeStatusRequest }) =>
      employeesApi.updateStatus(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.employees.all }),
  });
}

export function useInviteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InviteEmployeeRequest) => employeesApi.invite(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.employees.all }),
  });
}

export function useAcceptInvitation() {
  return useMutation({
    mutationFn: (data: AcceptInvitationRequest) => authApi.acceptInvitation(data),
  });
}

// ─── Travel Plan Hooks ───────────────────────────────────────

/** Matches spring-server TravelPlan / PlanGenerationService lifecycle (QUEUED → PROCESSING → COMPLETED). */
export function isTravelPlanGeneratingStatus(status: string | undefined): boolean {
  return status === "QUEUED" || status === "PENDING" || status === "PROCESSING";
}

export function useTravelPlans(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.travelPlans.list(params),
    queryFn: () => travelPlansApi.list(params),
  });
}

export function useTravelPlansSelect() {
  return useQuery({
    queryKey: queryKeys.travelPlans.selectAll(),
    queryFn: () => travelPlansApi.listAll(),
  });
}

export function useTravelPlan(id: number) {
  return useQuery({
    queryKey: queryKeys.travelPlans.detail(id),
    queryFn: () => travelPlansApi.get(id),
    enabled: id > 0,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return isTravelPlanGeneratingStatus(status) ? 3000 : false;
    },
  });
}

export function useCreateTravelPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTravelPlanRequest) => travelPlansApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.travelPlans.all }),
  });
}

export function useUpdateTravelPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTravelPlanRequest }) =>
      travelPlansApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.travelPlans.all }),
  });
}

export function useDeleteTravelPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => travelPlansApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.travelPlans.all }),
  });
}

// ─── Credit Request Hooks ─────────────────────────────────────

export function useCreditRequests(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.creditRequests.list(params),
    queryFn: () => creditRequestsApi.list(params),
  });
}

export function useCreditRequestsSelect() {
  return useQuery({
    queryKey: queryKeys.creditRequests.selectAll(),
    queryFn: () => creditRequestsApi.listAll(),
  });
}

export function useCreditRequest(id: number) {
  return useQuery({
    queryKey: queryKeys.creditRequests.detail(id),
    queryFn: () => creditRequestsApi.get(id),
    enabled: id > 0,
  });
}

export function useCreateCreditRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCreditRequestRequest) => creditRequestsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.creditRequests.all }),
  });
}

export function useUpdateCreditRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCreditRequestRequest }) =>
      creditRequestsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.creditRequests.all }),
  });
}

export function useDeleteCreditRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => creditRequestsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.creditRequests.all }),
  });
}

export function useApproveCreditRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => creditRequestsApi.approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.creditRequests.all }),
  });
}

export function useRejectCreditRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => creditRequestsApi.reject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.creditRequests.all }),
  });
}

// ─── Health Profile Hooks ────────────────────────────────────

export function useHealthProfiles(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.healthProfiles.list(params),
    queryFn: () => healthProfilesApi.list(params),
  });
}

export function useMyHealthProfile() {
  return useQuery({
    queryKey: [...queryKeys.healthProfiles.all, "mine"],
    queryFn: () => healthProfilesApi.getMine(),
    retry: false, // Don't retry if not found
  });
}

export function useHealthProfile(id: number) {
  return useQuery({
    queryKey: queryKeys.healthProfiles.detail(id),
    queryFn: () => healthProfilesApi.get(id),
    enabled: id > 0,
  });
}

export function useCreateHealthProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateHealthProfileRequest>) =>
      healthProfilesApi.create(data as CreateHealthProfileRequest),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.healthProfiles.all }),
  });
}

export function useUpdateHealthProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateHealthProfileRequest }) =>
      healthProfilesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.healthProfiles.all }),
  });
}

export function useDeleteHealthProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => healthProfilesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.healthProfiles.all }),
  });
}

// ─── Country Hooks ───────────────────────────────────────────

export function useCountries(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.countries.list(params),
    queryFn: () => countriesApi.list(params),
  });
}

export function useCountriesSelect() {
  return useQuery<import("./types").CountryResponse[]>({
    queryKey: queryKeys.countries.selectAll(),
    queryFn: () => countriesApi.listAll(),
  });
}

export function useCountry(id: number) {
  return useQuery({
    queryKey: queryKeys.countries.detail(id),
    queryFn: () => countriesApi.get(id),
    enabled: id > 0,
  });
}

export function useCreateCountry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCountryRequest) => countriesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.countries.all }),
  });
}

export function useUpdateCountry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCountryRequest }) =>
      countriesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.countries.all }),
  });
}

export function useDeleteCountry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => countriesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.countries.all }),
  });
}

// ─── Country Health Alert Hooks ──────────────────────────────

export function useCountryHealthAlerts(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.countryHealthAlerts.list(params),
    queryFn: () => countryHealthAlertsApi.list(params),
  });
}

export function useCountryHealthAlertsSelect() {
  return useQuery({
    queryKey: queryKeys.countryHealthAlerts.selectAll(),
    queryFn: () => countryHealthAlertsApi.listAll(),
  });
}

export function useCountryHealthAlert(id: number) {
  return useQuery({
    queryKey: queryKeys.countryHealthAlerts.detail(id),
    queryFn: () => countryHealthAlertsApi.get(id),
    enabled: id > 0,
  });
}

// ─── Country Accommodation Hooks ─────────────────────────────

export function useCountryAccommodations(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.countryAccommodations.list(params),
    queryFn: () => countryAccommodationsApi.list(params),
  });
}

export function useCountryAccommodationsSelect() {
  return useQuery({
    queryKey: queryKeys.countryAccommodations.selectAll(),
    queryFn: () => countryAccommodationsApi.listAll(),
  });
}

export function useCountryAccommodation(id: number) {
  return useQuery({
    queryKey: queryKeys.countryAccommodations.detail(id),
    queryFn: () => countryAccommodationsApi.get(id),
    enabled: id > 0,
  });
}

// ─── Credit Hooks ────────────────────────────────────────────

export function useCredits(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.credits.list(params),
    queryFn: () => creditsApi.list(params),
  });
}

export function useCredit(id: number) {
  return useQuery({
    queryKey: queryKeys.credits.detail(id),
    queryFn: () => creditsApi.get(id),
    enabled: id > 0,
  });
}

export function useCreateCredit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCreditRequest) => creditsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.credits.all }),
  });
}

// ─── Notification Hooks ──────────────────────────────────────

export function useNotifications(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => notificationsApi.list(params),
  });
}

export function useNotification(id: number) {
  return useQuery({
    queryKey: queryKeys.notifications.detail(id),
    queryFn: () => notificationsApi.get(id),
    enabled: id > 0,
  });
}

export function useCreateNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNotificationRequest) => notificationsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
}

export function useUpdateNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateNotificationRequest }) =>
      notificationsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
}

// ─── Invoice Hooks ───────────────────────────────────────────

export function useInvoices(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.invoices.list(params),
    queryFn: () => invoicesApi.list(params),
  });
}

export function useInvoice(id: number) {
  return useQuery({
    queryKey: queryKeys.invoices.detail(id),
    queryFn: () => invoicesApi.get(id),
    enabled: id > 0,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInvoiceRequest) => invoicesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.invoices.all }),
  });
}

// ─── Blog Post Hooks ─────────────────────────────────────────

export function useBlogPosts(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.blogPosts.list(params),
    queryFn: () => blogPostsApi.list(params),
  });
}

export function useBlogPost(id: number) {
  return useQuery({
    queryKey: queryKeys.blogPosts.detail(id),
    queryFn: () => blogPostsApi.get(id),
    enabled: id > 0,
  });
}

export function useUploadBlogFeaturedImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      blogPostsApi.uploadFeaturedImage(id, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.blogPosts.all }),
  });
}

// ─── FAQ Item Hooks ──────────────────────────────────────────

export function useFaqItems(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.faqItems.list(params),
    queryFn: () => faqItemsApi.list(params),
  });
}

export function useFaqItem(id: number) {
  return useQuery({
    queryKey: queryKeys.faqItems.detail(id),
    queryFn: () => faqItemsApi.get(id),
    enabled: id > 0,
  });
}

// ─── Company User Hooks ──────────────────────────────────────

export function useCompanyUsers(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.companyUsers.list(params),
    queryFn: () => companyUsersApi.list(params),
  });
}

export function useCompanyUser(id: number) {
  return useQuery({
    queryKey: queryKeys.companyUsers.detail(id),
    queryFn: () => companyUsersApi.get(id),
    enabled: id > 0,
  });
}

export function useCreateCompanyUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCompanyUserRequest) => companyUsersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.companyUsers.all }),
  });
}

export function useUpdateCompanyUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateCompanyUserRequest> }) =>
      companyUsersApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.companyUsers.all }),
  });
}

export function useDeleteCompanyUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => companyUsersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.companyUsers.all }),
  });
}

export function useMyCompanies(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.companyUsers.mine(),
    queryFn: () => companyUsersApi.mine(),
    enabled: options?.enabled ?? true,
  });
}

// ─── Profile Hooks ───────────────────────────────────────────

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile.detail(),
    queryFn: () => profileApi.get(),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileApi.update(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.profile.all }),
  });
}

export function useUpdateProfileAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => profileApi.updateAvatar(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.profile.all }),
  });
}

export function useUpdateProfilePassword() {
  return useMutation({
    mutationFn: (data: UpdateProfilePasswordRequest) => profileApi.updatePassword(data),
  });
}

export function useUpgradeUserPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (planCode: string) => profileApi.upgradePlan(planCode),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.profile.all }),
  });
}

export function useResendVerificationEmail() {
  return useMutation({
    mutationFn: (data: ResendVerificationRequest) => authApi.resendVerificationEmail(data),
  });
}

// ─── Onboarding Hooks ─────────────────────────────────────────

export function useOnboarding() {
  return useQuery({
    queryKey: queryKeys.onboarding.detail(),
    queryFn: () => onboardingApi.get(),
  });
}

export function useUpsertOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpsertOnboardingRequest) => onboardingApi.upsert(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.onboarding.all }),
  });
}

export function useAdvanceOnboardingStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AdvanceStageRequest) => onboardingApi.advanceStage(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.profile.all });
      qc.invalidateQueries({ queryKey: queryKeys.onboarding.all });
    },
  });
}

// ─── Onboarding Questionnaire Hooks ──────────────────────────

export function useOnboardingQuestions() {
  return useQuery({
    queryKey: [...queryKeys.onboarding.all, "questions"],
    queryFn: () => onboardingApi.getQuestions(),
  });
}

export function useSubmitQuestionnaire() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmitQuestionnaireRequest) => onboardingApi.submitQuestionnaire(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.onboarding.all });
      qc.invalidateQueries({ queryKey: queryKeys.profile.all });
    },
  });
}

export function useSaveQuestionnaireProgress() {
  return useMutation({
    mutationFn: (data: QuestionnaireProgressRequest) => onboardingApi.saveProgress(data),
  });
}

export function useGetQuestionnaireProgress() {
  return useQuery({
    queryKey: [...queryKeys.onboarding.all, "progress"],
    queryFn: () => onboardingApi.getProgress(),
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });
}

// ─── Draft Plan Hooks ─────────────────────────────────────────

export function useDraftPlans() {
  return useQuery({
    queryKey: ["draft-plans"],
    queryFn: () => draftPlansApi.list(),
  });
}

export function useDraftPlan(id: number) {
  return useQuery({
    queryKey: ["draft-plans", id],
    queryFn: () => draftPlansApi.get(id),
    enabled: id > 0,
  });
}

export function useCreateDraftPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SaveDraftPlanRequest) => draftPlansApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["draft-plans"] }),
  });
}

export function useUpdateDraftPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SaveDraftPlanRequest }) => draftPlansApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["draft-plans"] }),
  });
}

export function useDeleteDraftPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => draftPlansApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["draft-plans"] }),
  });
}

// ─── User Credit Plan Hooks ─────────────────────────────────────

export function useCreditPlans() {
  return useQuery<import("./types").CreditPlan[]>({
    queryKey: queryKeys.creditPlans.list(),
    queryFn: () => creditPlansApi.list(),
    staleTime: 10 * 60 * 1000,
  });
}

// ─── Credit Purchase Hooks ───────────────────────────────────────

export function useInitiateCreditPurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreditPurchaseRequest) => creditPurchaseApi.initiate(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.profile.all });
    },
  });
}

export function useVerifyCreditPurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ txRef, transactionId }: { txRef: string; transactionId?: string }) =>
      creditPurchaseApi.verify(txRef, transactionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.profile.all });
      qc.invalidateQueries({ queryKey: queryKeys.creditPurchases.all });
    },
  });
}

export function useCreditPurchaseHistory() {
  return useQuery({
    queryKey: queryKeys.creditPurchases.history(),
    queryFn: () => creditPurchaseApi.history(),
  });
}

// ─── Company Admin Credit Hooks (HR) ─────────────────────────────────

export function useHrCreditQuote() {
  return useMutation({
    mutationFn: ({ companyId, credits }: { companyId: number; credits: number }) =>
      companyAdminCreditsApi.getQuote(companyId, credits),
  });
}

export function useHrPurchaseCredits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { credits: number; companyId: number }) =>
      companyAdminCreditsApi.purchase(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.companies.all });
      qc.invalidateQueries({ queryKey: queryKeys.credits.all });
      qc.invalidateQueries({ queryKey: queryKeys.companyAdminCredits.all });
    },
  });
}

export function useHrVerifyCreditPurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ txRef, transactionId }: { txRef: string; transactionId?: string }) =>
      companyAdminCreditsApi.verify(txRef, transactionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.companies.all });
      qc.invalidateQueries({ queryKey: queryKeys.credits.all });
      qc.invalidateQueries({ queryKey: queryKeys.companyAdminCredits.all });
    },
  });
}

export function useHrCreditHistory(companyId?: number) {
  return useQuery({
    queryKey: queryKeys.companyAdminCredits.history(companyId),
    queryFn: () => companyAdminCreditsApi.getHistory(companyId),
    enabled: !!companyId,
  });
}

export function useHrCompanyPricing(companyId: number) {
  return useQuery({
    queryKey: queryKeys.companyAdminCredits.pricing(companyId),
    queryFn: () => companyAdminCreditsApi.getPricing(companyId),
    enabled: companyId > 0,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Plan Usage Ledger Hooks ─────────────────────────────────────

export function usePlanUsageLedgerHistory(params?: PaginationParams) {
  return useQuery<import("./types").PaginatedResponse<PlanUsageLedgerResponse>>({
    queryKey: [...queryKeys.planUsageLedgers.mine(), params],
    queryFn: () => planUsageLedgerApi.mine(params),
  });
}

export function usePlanUsageLedgerByEmployee(employeeId: number, params?: PaginationParams) {
  return useQuery<import("./types").PaginatedResponse<PlanUsageLedgerResponse>>({
    queryKey: [...queryKeys.planUsageLedgers.byEmployee(employeeId), params],
    queryFn: () => planUsageLedgerApi.byEmployee(employeeId, params),
    enabled: employeeId > 0,
  });
}

// ─── Report Hooks ─────────────────────────────────────────────

export function useUsageReport(companyId?: number) {
  return useQuery({
    queryKey: ["reports", "usage", companyId],
    queryFn: () => reportsApi.getUsageReport(companyId),
  });
}

export function usePlanHistory(companyId?: number) {
  return useQuery({
    queryKey: ["reports", "plans", companyId],
    queryFn: () => reportsApi.getPlanHistory(companyId),
  });
}

export function useComplianceReport(companyId?: number) {
  return useQuery({
    queryKey: ["reports", "compliance", companyId],
    queryFn: () => reportsApi.getComplianceReport(companyId),
  });
}

export function useDashboardAnalytics(companyId?: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["reports", "dashboard-analytics", companyId ?? "me"],
    queryFn: () => reportsApi.getDashboardAnalytics(companyId),
    enabled: options?.enabled !== false,
  });
}

// ─── Contact Hooks ────────────────────────────────────────────

export function useSubmitContact() {
  return useMutation({
    mutationFn: (data: ContactRequest) => contactApi.submit(data),
  });
}

// ─── Newsletter Hooks ─────────────────────────────────────────

export function useNewsletterSubscribe() {
  return useMutation({
    mutationFn: (data: NewsletterSubscribeRequest) => newsletterApi.subscribe(data),
  });
}

// ─── Ebook Hooks ──────────────────────────────────────────────

export function useEbooks() {
  return useQuery({
    queryKey: ["ebooks"],
    queryFn: () => ebooksApi.list(),
  });
}

export function useEbook(slug: string) {
  return useQuery({
    queryKey: ["ebooks", slug],
    queryFn: () => ebooksApi.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useEbookCheckout() {
  return useMutation({
    mutationFn: (data: EbookCheckoutRequest) => ebooksApi.checkout(data),
  });
}

export function useVerifyEbookOrder() {
  return useMutation({
    mutationFn: (data: { txRef: string; transactionId?: string }) =>
      ebooksApi.verifyOrder(data),
  });
}

export function useEbookOrderStatus(txRef: string, enabled = true) {
  return useQuery({
    queryKey: ["ebooks", "orders", txRef],
    queryFn: () => ebooksApi.getOrderStatus(txRef),
    enabled: !!txRef && enabled,
  });
}

export function useMyEbookOrders() {
  return useQuery({
    queryKey: ["ebooks", "my-orders"],
    queryFn: () => ebooksApi.myOrders(),
  });
}

// ─── Cart Hooks ──────────────────────────────────────────────

export function useCart(enabled = true) {
  return useQuery({
    queryKey: ["cart"],
    queryFn: () => cartApi.getCart(),
    enabled,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ebookVersionId: number) => cartApi.addItem(ebookVersionId),
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data);
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cartItemId: number) => cartApi.removeItem(cartItemId),
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data);
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => {
      queryClient.setQueryData(["cart"], []);
    },
  });
}

export function useSyncCart() {
  return useMutation({
    mutationFn: (items: { ebookVersionId: number }[]) => cartApi.syncCart(items),
  });
}

export function useCartCheckout() {
  return useMutation({
    mutationFn: (data: CartCheckoutRequest) => cartApi.checkout(data),
  });
}

// ─── Exchange Rate Hooks ────────────────────────────────────

export function useExchangeRates() {
  return useQuery({
    queryKey: ["exchange-rates"],
    queryFn: () => exchangeRatesApi.getRates(),
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: 60 * 60 * 1000,
  });
}

export function useSupportedCurrencies() {
  return useQuery({
    queryKey: ["exchange-rates", "currencies"],
    queryFn: () => exchangeRatesApi.getCurrencies(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

// ─── Public Plans Hooks ─────────────────────────────────────

export function usePublicPlans() {
  return useQuery({
    queryKey: ["public-plans"],
    queryFn: () => publicPlansApi.list(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function usePublicPlan(id: number) {
  return useQuery({
    queryKey: ["public-plans", id],
    queryFn: () => publicPlansApi.get(id),
    enabled: id > 0,
  });
}

// ─── Company Onboarding Hooks ─────────────────────────────────

export function useSubmitCompanyOnboarding() {
  return useMutation({
    mutationFn: (data: import("./types").CompanyOnboardingRequest) =>
      companyOnboardingApi.submit(data),
  });
}

export function useInitiateOnboardingPayment() {
  return useMutation({
    mutationFn: (id: number) => companyOnboardingApi.initiatePayment(id),
  });
}

export function useVerifyOnboardingPayment() {
  return useMutation({
    mutationFn: ({ txRef, transactionId }: { txRef: string; transactionId?: string }) =>
      companyOnboardingApi.verifyPayment(txRef, transactionId),
  });
}

export function useOnboardingStatus(id: number) {
  return useQuery({
    queryKey: ["company-onboarding", id],
    queryFn: () => companyOnboardingApi.getStatus(id),
    enabled: id > 0,
    refetchInterval: (query) => {
      const data = query.state.data as import("./types").CompanyOnboardingResponse | undefined;
      return data?.status === "pending_approval" ? 5000 : false;
    },
  });
}

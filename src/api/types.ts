// ─── Billing ─────────────────────────────────────────────────

export type BillingCurrency = "USD" | "NGN" | "EUR" | "GBP";

// ─── User Credit Plans ────────────────────────────────────────

export type CreditPlanCode =
  | "ESSENTIAL"
  | "STANDARD"
  | "PREMIUM"
  | "ENTERPRISE_SILVER"
  | "ENTERPRISE_PLUS"
  | "ENTERPRISE_GOLD"
  | "ENTERPRISE_ELITE"
  | "ENTERPRISE_PLATINUM"
  | "ENTERPRISE_SIGNATURE";

export interface CreditPlan {
  id: number;
  code: CreditPlanCode;
  displayName: string;
  basePriceUsd: number;
  basePriceNgn: number | null;
  description: string;
  isDefault: boolean;
  isCompanyPlan: boolean;
  signupRangeLabel: string | null;
  serviceLevel: "STANDARD" | "PREMIUM" | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Common ──────────────────────────────────────────────────

export interface ApiResponse<T> {
  message: string;
  success: boolean;
  data: T;
}

export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface SelectOption {
  value: number;
  label: string;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  companyId?: number;
}

// ─── Auth ────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  username: string;
  phone: string;
  email: string;
  password: string;
  planCode?: string;
  billing_currency?: BillingCurrency;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  new_password: string;
}

export interface AuthResponse {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  phone: string;
  email: string;
  role_id: number;
  role_name: string;
  avatar_url: string;
  onboarding_stage: number;
  is_verified: boolean;
  last_login: string;
  accessToken: string; // Backend uses accessToken (camelCase) in AuthResponse.java @JsonProperty("accessToken")
  exp: number;
  extend?: any;
  settings?: UserSettingResponse;
}

export interface GoogleAuthRequest {
  credential: string;
}

export interface GoogleCallbackRequest {
  code: string;
}

// ─── User ────────────────────────────────────────────────────

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  username: string;
  phone: string;
  email: string;
  onboardingStage: number;
  onboarded: boolean;
  isVerified: boolean;
  lastLogin: string;
  avatarUrl: string;
  credits: number;
  type: string;
  roleId: number;
  billingCurrency?: BillingCurrency;
  createdAt: string;
  updatedAt: string;
  userCreditPlan?: CreditPlan | null;
}

// ─── Company ─────────────────────────────────────────────────

export interface CompanyResponse {
  id: number;
  name: string;
  industry: string;
  totalCredits: number;
  usedCredits: number;
  employeeCount: number;
  plan: string;
  companyCode: string;
  logoId?: number;
  billingCurrency?: BillingCurrency;
  createdAt: string;
  updatedAt: string;
  creditPlan?: CreditPlan | null;
}

export interface CreateCompanyRequest {
  name: string;
  industry: string;
  plan: string;
  totalCredits: number;
  usedCredits: number;
  employeeCount: number;
}

export interface UpdateCompanyRequest extends Partial<CreateCompanyRequest> { }

export interface CompanyCodeValidationResponse {
  valid: boolean;
}

// ─── Employee ────────────────────────────────────────────────

export interface EmployeeResponse {
  id: number;
  name: string;
  email: string;
  department: string;
  creditsUsed: number;
  creditsAllocated: number;
  status: string;
  plansGenerated: number;
  companyId: number;
  userId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeRequest {
  companyId: number;
  userId?: number;
  name: string;
  email: string;
  department: string;
  status: string;
  creditsUsed: number;
  creditsAllocated: number;
  plansGenerated: number;
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> { }

export interface AllocateEmployeeCreditsRequest {
  creditsAllocated: number;
  companyId: number;
}

export interface UpdateEmployeeStatusRequest {
  status: "active" | "inactive";
}

export interface InviteEmployeeRequest {
  name: string;
  email: string;
  department: string;
  creditsAllocated: number;
  companyId: number;
}

export interface AcceptInvitationRequest {
  token: string;
  new_password: string;
}

export interface PurchaseCreditsRequest {
  amount: number;
  reference?: string;
}

// ─── Doctor ──────────────────────────────────────────────────

export type DoctorApplicationStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";
export type DoctorValidationStatus = "PENDING" | "APPROVED" | "REJECTED" | "NOT_REQUIRED";
export type PlanTier = "FREE" | "STANDARD" | "PREMIUM";

export interface DoctorApplicationRequest {
  medicalLicenseNumber: string;
  signature: File;
  stamp?: File;
}

export interface DoctorProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  medicalLicenseNumber?: string;
  signature?: File;
  stamp?: File;
}

export interface DoctorProfileResponse {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  medicalLicenseNumber: string;
  signatureUrl: string | null;
  stampUrl: string | null;
  doctorApplicationStatus: DoctorApplicationStatus;
  applicationSubmittedAt: string | null;
}

export interface UserSettingResponse {
  medicalLicenseNumber?: string | null;
  signatureUrl?: string | null;
  stampUrl?: string | null;
  doctorApplicationStatus?: DoctorApplicationStatus;
  consentVersion?: number;
  consentAcceptedByVersion?: number | null;
  consentAcceptedAt?: string | null;
}

export interface ConsentAcceptRequest {
  consentVersion: number;
}

export interface DoctorDashboardStats {
  pendingValidations: number;
  approvedToday: number;
  totalValidated: number;
  recentPlans: DoctorValidationPlanDto[];
}

export interface DoctorValidationPlanDto {
  planId: number;
  destination: string;
  country: string;
  purpose: string;
  duration: number;
  riskScore: number;
  validationStatus: DoctorValidationStatus;
  planTier: PlanTier;
  travellerName: string;
  travellerEmail: string;
  createdAt: string;
  generatedPlanStatus: string;
}

export interface DoctorValidationDetailDto {
  planId: number;
  destination: string;
  country: string;
  purpose: string;
  duration: number;
  riskScore: number;
  validationStatus: DoctorValidationStatus;
  validatedAt: string | null;
  validatedByName: string | null;
  rejectionReason: string | null;
  planTier: PlanTier;
  travellerName: string;
  travellerEmail: string;
  travellerPhone: string;
  createdAt: string;
  generatedPlan: GeneratedPlanPayload | null;
  generatedPlanContent: GeneratedPlanContent | null;
}

export interface ValidatePlanRequest {
  planId: number;
  approved: boolean;
  rejectionReason?: string;
}

export interface AdminDoctorApplicationDto {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  specialization: string;
  applicationStatus: DoctorApplicationStatus;
  applicationSubmittedAt: string | null;
  identityDocumentUrl: string | null;
  licenseDocumentUrl: string | null;
  createdAt: string | null;
}

export interface AdminDoctorListItemDto {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  specialization: string;
  validatedPlansCount: number;
  createdAt: string | null;
}

export interface AdminDoctorStatsDto {
  totalDoctors: number;
  pendingApplications: number;
  approvedToday: number;
  totalValidatedPlans: number;
}

// ─── Travel Plan ─────────────────────────────────────────────

/** Mirrors spring-server GeneratedPlanPayload; present on GET /travel-plans/:id when a row exists. */
export interface GeneratedPlanPayload {
  status: string;
  planJson: string | null;
  provider?: string | null;
  modelUsed?: string | null;
  tokensUsed?: number | null;
  processingTimeMs?: number | null;
  errorMessage?: string | null;
  signedPdfUrl?: string | null;
  summaryPdfUrl?: string | null;
  isSigned?: boolean;
}

/** Parsed from AI output (PlanGenerationService JSON schema). */
export interface GeneratedPlanTripAtGlance {
  durationDays?: number;
  purpose?: string;
  travelling?: string;
  accommodation?: string;
  insurance?: string;
}

export interface GeneratedPlanHealthRiskItem {
  category: string;
  level: string;
  summary: string;
}

export interface GeneratedPlanVaccinationItem {
  vaccine: string;
  status: string;
  recommendation: string;
  action: string;
}

export interface GeneratedPlanRecommendationItem {
  title: string;
  details: string;
}

export interface GeneratedPlanMalariaPrevention {
  riskLevel?: string;
  recommendedAgent?: string;
  rationale?: string;
  mosquitoProtection?: string[];
  contraindications?: string;
}

export interface GeneratedPlanSpecialistReferral {
  condition: string;
  specialist: string;
  urgency: string;
}

export interface GeneratedPlanMedicalCondition {
  condition: string;
  precautions: string;
}

export interface GeneratedPlanFlightHealth {
  vteRiskLevel?: string;
  preventionMeasures?: string[];
  medifClearanceRequired?: boolean;
  medicationTimingGuidance?: string;
}

export interface GeneratedPlanMedicationLogistics {
  packaging?: string;
  supplyRule?: string;
  destinationLegalityCheck?: boolean;
  coldChainRequired?: boolean;
}

export interface GeneratedPlanSexualHealth {
  riskLevel?: string;
  preventionAdvice?: string[];
  prepPepDiscussion?: boolean;
}

export interface GeneratedPlanAfterReturn {
  within1Week?: string[];
  within4Weeks?: string[];
  beyond4Weeks?: string[];
  redFlag?: string;
}

export interface GeneratedPlanClinic {
  name: string;
  address: string;
  phone: string;
  distance: string;
  notes: string;
}

export interface GeneratedPlanEmbassyContact {
  name: string;
  details: string;
}

export interface GeneratedPlanEmergencyContact {
  label: string;
  value: string;
}

export interface GeneratedPlanMedicalCare {
  clinics?: GeneratedPlanClinic[];
  embassyContacts?: GeneratedPlanEmbassyContact[];
  emergencyContacts?: GeneratedPlanEmergencyContact[];
}

export interface GeneratedPlanItineraryRouteAdviceItem {
  stop: string;
  country: string;
  guidance: string;
}

export interface GeneratedPlanItineraryGuidance {
  tripType?: "ONE_WAY" | "RETURN" | "MULTI_STOP";
  summary?: string;
  routeAdvice?: GeneratedPlanItineraryRouteAdviceItem[];
  returnGuidance?: string[];
}

export interface GeneratedPlanContent {
  reportTitle?: string;
  travellerName?: string;
  destination?: string;
  travelDates?: string;
  overallRiskLevel?: string;
  hardStop?: string | null;
  tripAtGlance?: GeneratedPlanTripAtGlance;
  healthRiskOverview?: GeneratedPlanHealthRiskItem[];
  vaccinations?: GeneratedPlanVaccinationItem[];
  malariaPrevention?: GeneratedPlanMalariaPrevention;
  recommendations?: GeneratedPlanRecommendationItem[];
  clinicalFlags?: string[];
  contraindications?: string[];
  specialistReferrals?: GeneratedPlanSpecialistReferral[];
  flightHealth?: GeneratedPlanFlightHealth;
  medicalConditions?: GeneratedPlanMedicalCondition[];
  medicationLogistics?: GeneratedPlanMedicationLogistics;
  sexualHealth?: GeneratedPlanSexualHealth;
  pregnancyGuidance?: unknown;
  afterReturn?: GeneratedPlanAfterReturn;
  medicalCare?: GeneratedPlanMedicalCare;
  itineraryGuidance?: GeneratedPlanItineraryGuidance;
  nextSteps?: string[];
  medicalDisclaimer?: string;
}

export interface TravelPlanResponse {
  id: number;
  destination: string;
  country: string;
  duration: number;
  purpose: string;
  tripType?: "one-way" | "return" | "multi" | "transit";
  tripDetailsJson?: string;
  riskScore: number;
  status: string;
  medicalConsiderations: string;
  vaccinations: string;
  healthAlerts: string;
  safetyAdvisories: string;
  medications: string;
  waterFood: string;
  emergencyContacts: string;
  companyId?: number;
  employeeId?: number;
  userId?: number;
  signedPdfUrl: string | null;
  summaryPdfUrl: string | null;
  doctorValidationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ELEVATED' | 'NOT_REQUIRED';
  createdAt: string;
  updatedAt: string;
  generatedPlan?: GeneratedPlanPayload | null;
  planTier?: PlanTier;
  validationStatus?: DoctorValidationStatus;
  validatedAt?: string | null;
  validatedByName?: string | null;
  rejectionReason?: string | null;
}

export interface TravelPlanListItemResponse {
  id: number;
  destination: string;
  country: string;
  duration: number;
  purpose: string;
  riskScore: number;
  status: string;
  companyId?: number;
  employeeId?: number;
  userId?: number;
  createdAt: string;
  updatedAt: string;
  planTier?: PlanTier;
  doctorValidationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ELEVATED' | 'NOT_REQUIRED';
  validatedByName?: string | null;
  validatedAt?: string | null;
  rejectionReason?: string | null;
  signedPdfUrl?: string | null;
  summaryPdfUrl?: string | null;
}

export interface CreateTravelPlanRequest {
  companyId?: number;
  employeeId?: number;
  userId?: number;
  destination: string;
  country: string;
  duration: number;
  purpose: string;
  tripType?: "one-way" | "return" | "multi" | "transit";
  tripDetailsJson?: string;
  riskScore?: number;
  status?: string;
  medicalConsiderations?: string;
  vaccinations?: string;
  healthAlerts?: string;
  safetyAdvisories?: string;
  medications?: string;
  waterFood?: string;
  emergencyContacts?: string;
  questionnaireResponses?: string;
}

export interface UpdateTravelPlanRequest extends Partial<CreateTravelPlanRequest> { }

// ─── Draft Plan ──────────────────────────────────────────────

export interface DraftPlanResponse {
  id: number;
  title: string;
  country: string;
  answersJson: string;
  categoryIndex: number;
  showVerify: boolean;
  showIntro: boolean;
  riskConsentGiven: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaveDraftPlanRequest {
  country?: string;
  answersJson: string;
  categoryIndex: number;
  showVerify?: boolean;
  showIntro?: boolean;
  riskConsentGiven?: boolean;
}

export interface UpdateDraftPlanRequest extends SaveDraftPlanRequest { }

// ─── Credit Request ──────────────────────────────────────────

export interface CreditRequestResponse {
  id: number;
  creditsRequested: number;
  reason: string;
  status: string;
  submittedAt?: string;
  companyId?: number;
  employeeId?: number;
  employeeName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCreditRequestRequest {
  companyId: number;
  employeeId?: number;
  creditsRequested: number;
  reason: string;
  status: string;
  submittedAt?: string;
}

export interface UpdateCreditRequestRequest extends Partial<CreateCreditRequestRequest> { }

// ─── Health Profile ──────────────────────────────────────────

export interface HealthProfileResponse {
  id: number;
  conditions: string;
  medications: string;
  allergies: string;
  blood_type: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateHealthProfileRequest {
  user_id: number;
  conditions: string;
  medications: string;
  allergies: string;
  blood_type: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

export interface UpdateHealthProfileRequest extends Partial<CreateHealthProfileRequest> { }

// ─── Country ─────────────────────────────────────────────────

export interface CountryResponse {
  id: number;
  name: string;
  code: string;
  region: string;
  continent: string;
  riskLevel: string;
  visaInfo: string;
  currency: string;
  language: string;
  timezone: string;
  healthAdvisory: string;
  travelAdvisory: string;
  emergencyNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCountryRequest {
  name: string;
  code: string;
  region: string;
  continent: string;
  riskLevel: string;
  visaInfo: string;
  currency: string;
  language: string;
  timezone: string;
  healthAdvisory: string;
  travelAdvisory: string;
  emergencyNumber: string;
  isActive: boolean;
}

export interface UpdateCountryRequest extends Partial<CreateCountryRequest> { }

// ─── Country Health Alert ────────────────────────────────────

export interface CountryHealthAlertResponse {
  id: number;
  title: string;
  description: string;
  severity: string;
  source: string;
  isActive: boolean;
  publishedAt?: string;
  expiresAt?: string;
  countryId?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Country Accommodation ───────────────────────────────────

export interface CountryAccommodationResponse {
  id: number;
  name: string;
  type: string;
  address: string;
  city: string;
  priceRange: string;
  rating: number;
  hasMedicalFacility: boolean;
  notes: string;
  countryId?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Credit ──────────────────────────────────────────────────

export interface CreditResponse {
  id: number;
  amount: number;
  balanceAfter: number;
  type: string;
  reference: string;
  companyId?: number;
  userId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCreditRequest {
  companyId?: number;
  userId?: number;
  amount: number;
  balanceAfter: number;
  type: string;
  reference: string;
}

// ─── Notification ────────────────────────────────────────────

export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  type: string;
  link: string;
  isRead: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationRequest {
  userId: number;
  title: string;
  message: string;
  type: string;
  link: string;
  isRead: boolean;
}

export interface UpdateNotificationRequest extends Partial<CreateNotificationRequest> { }

// ─── Invoice ─────────────────────────────────────────────────

export interface InvoiceResponse {
  id: number;
  amount: number;
  currency: string;
  status: string;
  description: string;
  paymentMethod: string;
  issuedAt?: string;
  dueDate?: string;
  paidAt?: string;
  userId?: number;
  companyId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceRequest {
  userId?: number;
  companyId?: number;
  amount: number;
  currency: string;
  status: string;
  description: string;
  paymentMethod: string;
  issuedAt?: string;
  dueDate?: string;
  paidAt?: string;
}

// ─── Blog Post ───────────────────────────────────────────────

export interface BlogPostResponse {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: number;
  isPublished: boolean;
  publishedAt?: string;
  featuredImageId?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── FAQ Item ────────────────────────────────────────────────

export interface FaqItemResponse {
  id: number;
  question: string;
  answer: string;
  category: string;
  position: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Profile ─────────────────────────────────────────────────

export interface ProfileResponse {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  username: string;
  phone: string;
  email: string;
  onboardingStage: number;
  onboarded: boolean;
  isVerified: boolean;
  lastLogin: string;
  avatarUrl: string;
  credits: number;
  type: string;
  roleId: number;
  billingCurrency?: BillingCurrency;
  createdAt: string;
  updatedAt: string;
  userCreditPlan?: CreditPlan | null;
  settings?: UserSettingResponse;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  username?: string;
  phone?: string;
  email?: string;
  billing_currency?: BillingCurrency;
}

export interface UpdateProfilePasswordRequest {
  OldPassword: string;
  NewPassword: string;
}



// ─── Company User ────────────────────────────────────────────

export interface CompanyUserResponse {
  id: number;
  role: string;
  creditsAllocated?: number;
  creditsUsed?: number;
  companyId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyUserRequest {
  role: string;
  company_id: number;
  user_id: number;
}

export interface MyCompanyMembership {
  id: number;
  name: string;
  industry: string;
  plan: string;
  company_code: string;
  total_credits: number;
  used_credits: number;
  employee_count: number;
  billing_currency?: BillingCurrency;
  credit_plan?: CreditPlan | null;
  role: string;
  credits_allocated?: number;
  credits_used?: number;
}

// ─── Onboarding ──────────────────────────────────────────────

export interface UserOnboardingResponse {
  id: number;
  userType: string | null;
  nationality: string | null;
  companyCode: string | null;
  completedAt: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
  questionnaireCompleted: boolean | null;
}

export interface UpsertOnboardingRequest {
  userType?: string;
  nationality?: string;
  companyCode?: string;
  complete?: boolean;
}

export interface AdvanceStageRequest {
  stage: number;
}

export interface OnboardingQuestion {
  id: number;
  text: string;
  type: string;
  options?: string[];
  required?: boolean;
}

export interface OnboardingQuestionCategoryResponse {
  id: number;
  category_key: string;
  category_name: string;
  category_icon: string;
  category_description: string;
  display_order: number;
  is_optional: boolean;
  questions: string;
}

export interface SubmitQuestionnaireRequest {
  responses: string | Record<string, unknown>;
  complete?: boolean;
}

export interface QuestionnaireProgressRequest {
  [key: string]: unknown;
}

// ─── Plan Usage Ledger ───────────────────────────────────────

export interface PlanUsageLedgerResponse {
  id: number;
  action: string;
  ipAddress: string | null;
  userAgent: string | null;
  travelPlanId: number | null;
  travelPlanDestination: string | null;
  travelPlanCountry: string | null;
  userId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreditPurchaseRequest {
  credits: number;
  currency: BillingCurrency;
}

export interface CreditPurchaseInitiateResponse {
  success: boolean;
  txRef: string;
  paymentLink: string;
  credits: number;
  basePrice: number;
  amount: number;
  currency: BillingCurrency;
  currencySymbol: string;
  pricePerCredit: number;
  purchaseId: number;
  error?: string;
  errorType?: string;
}

export interface CreditPurchaseResponse {
  id: number;
  txRef: string;
  flwRef: string | null;
  userId: number;
  creditsPurchased: number;
  currency: BillingCurrency;
  currencySymbol: string;
  pricePerCredit: number;
  amount: number;
  amountPaid: number | null;
  status: string;
  flutterwaveStatus: string | null;
  paidAt: string | null;
  failedAt: string | null;
  failedReason: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Company Admin Credits (HR) ───────────────────────────────────────────

export interface CompanyAdminCreditQuoteResponse {
  companyId: number;
  companyName: string;
  credits: number;
  basePrice: number;
  totalAmount: number;
  currency: BillingCurrency;
  currencySymbol: string;
  pricePerCredit: number;
  appliedTier: string | null;
  qualifiesForContactSales: boolean;
}

export interface CompanyAdminPurchaseInitiateResponse {
  txRef: string;
  paymentLink: string;
  credits: number;
  amount: number;
  currency: BillingCurrency;
  currencySymbol: string;
  purchaseId: number;
}

export interface CompanyAdminPricingResponse {
  companyId: number;
  companyName: string;
  currency: BillingCurrency;
  currencySymbol: string;
  pricePerCredit: number;
  appliedTier: string;
  qualifiesForContactSales: boolean;
  historicalCreditsPurchased: number;
  pricePerCreditTier1: number;
  pricePerCreditTier2: number;
  pricePerCreditTier3: number;
  tier1MaxCredits: number;
  tier2MaxCredits: number;
  tier3MaxCredits: number;
}

// ─── Reports ────────────────────────────────────────────────

export interface UsageReportDto {
  employeeName: string;
  employeeEmail: string;
  department: string;
  creditsAllocated: number;
  creditsUsed: number;
  plansGenerated: number;
  status: string;
  lastActivityAt: string;
}

export interface UsageReportSummary {
  totalEmployees: number;
  totalPlansGenerated: number;
  totalCreditsUsed: number;
  totalCreditsAllocated: number;
  employees: UsageReportDto[];
}

export interface PlanHistoryDto {
  planId: number;
  destination: string;
  country: string;
  purpose: string;
  duration: number;
  riskScore: number;
  status: string;
  employeeName: string;
  createdAt: string;
  updatedAt: string;
}

export interface NamedCountDto {
  name: string;
  count: number;
}

export interface MonthCountDto {
  month: string;
  count: number;
}

export interface TopEmployeePlansDto {
  name: string;
  plansGenerated: number;
  creditsUsed: number;
}

export interface DashboardAnalyticsDto {
  plansByStatus: NamedCountDto[];
  plansCreatedLastSixMonths: MonthCountDto[];
  topDestinations: NamedCountDto[];
  topEmployeesByPlans: TopEmployeePlansDto[];
  creditRequestsByStatus: NamedCountDto[];
}

export interface ComplianceAuditDto {
  ledgerId: number;
  action: string;
  employeeName: string;
  planDestination: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface ComplianceReportDto {
  audits: ComplianceAuditDto[];
  totalRecords: number;
  generatedAt: string;
}

// ─── Contact ─────────────────────────────────────────────────

export type ContactInquiryType = "SUPPORT" | "DEMO" | "SALES" | "GENERAL";
export type ContactStatus = "NEW" | "IN_PROGRESS" | "RESOLVED";

export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiryType: ContactInquiryType;
}

export interface ContactResponse {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiryType: ContactInquiryType;
  status: ContactStatus;
  createdAt: string;
}

// ─── Newsletter ───────────────────────────────────────────────

export interface NewsletterSubscribeRequest {
  email: string;
}

export interface NewsletterSubscribeResponse {
  id: number;
  email: string;
  isActive: boolean;
  subscribedAt: string;
}

// ─── Ebooks ───────────────────────────────────────────────────

export interface EbookVersionResponse {
  id: number;
  label: string;
  countryCode: string | null;
  countryName: string | null;
  region: string | null;
  price: number;
  currency: string;
  currencySymbol: string;
  fileSizeMb: number | null;
  isActive: boolean;
  sortOrder: number;
}

export interface EbookResponse {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  author: string;
  authorBio: string | null;
  coverUrl: string | null;
  previewUrl: string | null;
  pageCount: number | null;
  publishedYear: number | null;
  isbn: string | null;
  isActive: boolean;
  isFeatured: boolean;
  versions: EbookVersionResponse[];
  createdAt: string;
}

export interface EbookCheckoutRequest {
  ebookVersionId: number;
  guestEmail?: string;
  guestName?: string;
  guestPhone?: string;
}

export interface EbookCheckoutResponse {
  txRef: string;
  paymentLink: string;
  orderId: number;
  ebookTitle: string;
  versionLabel: string;
  amount: number;
  currency: string;
  currencySymbol: string;
}

export interface EbookOrderResponse {
  id: number;
  txRef: string;
  status: string;
  buyerEmail: string;
  buyerName: string;
  buyerPhone: string | null;
  isGuest: boolean;
  userId: number | null;
  ebookId: number;
  ebookTitle: string;
  ebookSlug: string;
  versionLabel: string;
  countryName: string | null;
  amount: number;
  amountPaid: number | null;
  currency: string;
  currencySymbol: string;
  emailSent: boolean;
  paidAt: string | null;
  createdAt: string;
}

export interface CartItemResponse {
  id: number;
  ebookId: number;
  ebookTitle: string;
  ebookSlug: string;
  coverUrl: string | null;
  ebookVersionId: number;
  versionLabel: string;
  countryName: string | null;
  price: number;
  currency: string;
  currencySymbol: string;
}

export interface CartCheckoutRequest {
  ebookVersionIds: number[];
  guestEmail?: string;
  guestName?: string;
  guestPhone?: string;
}

export interface CartCheckoutResponse {
  txRef: string;
  paymentLink: string;
  orderIds: number[];
  totalAmount: number;
  currency: string;
  currencySymbol: string;
  itemCount: number;
}

export interface SupportedCurrency {
  code: string;
  name: string;
  symbol: string;
}

export interface ExchangeRatesResponse {
  base: string;
  rates: Record<string, number>;
  lastFetched: string | null;
}

// ============ Company Onboarding ============

export interface TeamMember {
  name: string;
  email: string;
  role: "admin" | "hr";
}

export interface CompanyOnboardingRequest {
  companyName: string;
  industry: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  billingCurrency: string;
  selectedPlanCode: string;
  creditCount?: number;
  sampleRequest: string;
  teamMembers: TeamMember[];
}

export interface CompanyOnboardingResponse {
  id: number;
  companyName: string;
  industry: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  billingCurrency: string;
  selectedPlanCode: string;
  creditCount?: number | null;
  sampleRequest: string;
  teamMembers: TeamMember[];
  txRef: string;
  paymentStatus: string;
  paymentAmount: number;
  paymentCurrency: string;
  status: string;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdCompanyId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingPaymentInitiate {
  txRef: string;
  paymentLink: string;
  amount: number;
  currency: string;
}

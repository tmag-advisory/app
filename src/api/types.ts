// ─── Billing ─────────────────────────────────────────────────

export type BillingCurrency = "USD" | "NGN" | "EUR" | "GBP";

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
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
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

// ─── Travel Plan ─────────────────────────────────────────────

export interface TravelPlanResponse {
  id: number;
  destination: string;
  country: string;
  duration: number;
  purpose: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface CreateTravelPlanRequest {
  companyId?: number;
  employeeId?: number;
  userId?: number;
  destination: string;
  country: string;
  duration: number;
  purpose: string;
  riskScore?: number;
  status?: string;
  medicalConsiderations?: string;
  vaccinations?: string;
  healthAlerts?: string;
  safetyAdvisories?: string;
  medications?: string;
  waterFood?: string;
  emergencyContacts?: string;
}

export interface UpdateTravelPlanRequest extends Partial<CreateTravelPlanRequest> { }

// ─── Travel Request ──────────────────────────────────────────

export interface TravelRequestResponse {
  id: number;
  destination: string;
  dates: string;
  status: string;
  submittedAt?: string;
  companyId?: number;
  employeeId?: number;
  userId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTravelRequestRequest {
  companyId: number;
  employeeId: number;
  destination: string;
  dates: string;
  status: string;
  userId: number;
  submittedAt?: string;
}

export interface UpdateTravelRequestRequest extends Partial<CreateTravelRequestRequest> { }

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

// ─── Pricing Plan ────────────────────────────────────────────

export interface PricingPlanResponse {
  id: number;
  name: string;
  period: string;
  description: string;
  features: string;
  price: number;
  creditsIncluded: number;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  createdAt: string;
  updatedAt: string;
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
  companyId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
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
  billing_currency: BillingCurrency;
  role: string;
}

export interface CreateCompanyUserRequest {
  companyId: number;
  userId: number;
  role: string;
}

// ─── Onboarding ──────────────────────────────────────────────

export interface UserOnboardingResponse {
  id: number;
  userId: number;
  userType: "individual" | "company" | "";
  nationality: string;
  companyCode: string;
  completedAt?: string;
  questionnaireCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertOnboardingRequest {
  userType?: "individual" | "company";
  nationality?: string;
  companyCode?: string;
  complete?: boolean;
}

export interface AdvanceStageRequest {
  stage: number;
}

// ─── Onboarding Questionnaire ───────────────────────────────

export interface OnboardingQuestionCategoryResponse {
  id: number;
  category_key: string;
  category_name: string;
  category_icon: string;
  category_description: string;
  display_order: number;
  is_optional: boolean;
  questions: string; // JSON string of Question[]
}

export interface SubmitQuestionnaireRequest {
  responses: string;
  complete: boolean;
}

export interface QuestionnaireProgressRequest {
  answers: Record<string, unknown>;
  categoryIndex: number;
  questionIndex: number;
}

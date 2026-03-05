// ─── Common ──────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
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
  last_login: string;
  access_token: string;
  exp: number;
}

// ─── User ────────────────────────────────────────────────────

export interface UserResponse {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  phone: string;
  email: string;
  role_id: number;
  role_name: string;
  avatar_url: string;
  last_login: string;
}

// ─── Company ─────────────────────────────────────────────────

export interface CompanyResponse {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  industry: string;
  plan: string;
  total_credits: number;
  used_credits: number;
  employee_count: number;
  logo?: { url: string; name: string };
}

export interface CreateCompanyRequest {
  name: string;
  industry: string;
  plan: string;
  total_credits: number;
  used_credits: number;
  employee_count: number;
}

export interface UpdateCompanyRequest extends Partial<CreateCompanyRequest> {}

// ─── Employee ────────────────────────────────────────────────

export interface EmployeeResponse {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  department: string;
  status: string;
  credits_used: number;
  credits_allocated: number;
  plans_generated: number;
  company?: { id: number; name: string };
}

export interface CreateEmployeeRequest {
  company_id: number;
  user_id?: number;
  name: string;
  email: string;
  department: string;
  status: string;
  credits_used: number;
  credits_allocated: number;
  plans_generated: number;
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {}

// ─── Travel Plan ─────────────────────────────────────────────

export interface TravelPlanResponse {
  id: number;
  created_at: string;
  updated_at: string;
  destination: string;
  country: string;
  duration: string;
  purpose: string;
  risk_score: string;
  status: string;
  medical_considerations: string;
  vaccinations: string;
  health_alerts: string;
  safety_advisories: string;
  medications: string;
  water_food: string;
  emergency_contacts: string;
  company?: { id: number; name: string };
  employee?: { id: number; name: string };
}

export interface CreateTravelPlanRequest {
  company_id?: number;
  employee_id?: number;
  user_id?: number;
  destination: string;
  country: string;
  duration: string;
  purpose: string;
  risk_score?: string;
  status?: string;
  medical_considerations?: string;
  vaccinations?: string;
  health_alerts?: string;
  safety_advisories?: string;
  medications?: string;
  water_food?: string;
  emergency_contacts?: string;
}

export interface UpdateTravelPlanRequest extends Partial<CreateTravelPlanRequest> {}

// ─── Travel Request ──────────────────────────────────────────

export interface TravelRequestResponse {
  id: number;
  created_at: string;
  updated_at: string;
  destination: string;
  dates: string;
  status: string;
  submitted_at?: string;
  company?: { id: number; name: string };
  employee?: { id: number; name: string };
}

export interface CreateTravelRequestRequest {
  company_id: number;
  employee_id: number;
  destination: string;
  dates: string;
  status: string;
  submitted_at?: string;
}

export interface UpdateTravelRequestRequest extends Partial<CreateTravelRequestRequest> {}

// ─── Health Profile ──────────────────────────────────────────

export interface HealthProfileResponse {
  id: number;
  created_at: string;
  updated_at: string;
  conditions: string;
  medications: string;
  allergies: string;
  blood_type: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
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

export interface UpdateHealthProfileRequest extends Partial<CreateHealthProfileRequest> {}

// ─── Country ─────────────────────────────────────────────────

export interface CountryResponse {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  code: string;
  region: string;
  continent: string;
  risk_level: string;
  visa_info: string;
  currency: string;
  language: string;
  timezone: string;
  health_advisory: string;
  travel_advisory: string;
  emergency_number: string;
  is_active: boolean;
}

export interface CreateCountryRequest {
  name: string;
  code: string;
  region: string;
  continent: string;
  risk_level: string;
  visa_info: string;
  currency: string;
  language: string;
  timezone: string;
  health_advisory: string;
  travel_advisory: string;
  emergency_number: string;
  is_active: boolean;
}

export interface UpdateCountryRequest extends Partial<CreateCountryRequest> {}

// ─── Country Health Alert ────────────────────────────────────

export interface CountryHealthAlertResponse {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  severity: string;
  source: string;
  is_active: boolean;
  published_at?: string;
  expires_at?: string;
  country?: { id: number; name: string };
}

// ─── Country Accommodation ───────────────────────────────────

export interface CountryAccommodationResponse {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  type: string;
  address: string;
  city: string;
  price_range: string;
  rating: number;
  has_medical_facility: boolean;
  notes: string;
  country?: { id: number; name: string };
}

// ─── Credit ──────────────────────────────────────────────────

export interface CreditResponse {
  id: number;
  created_at: string;
  updated_at: string;
  amount: number;
  balance_after: number;
  type: string;
  reference: string;
  company?: { id: number; name: string };
}

export interface CreateCreditRequest {
  company_id?: number;
  user_id?: number;
  amount: number;
  balance_after: number;
  type: string;
  reference: string;
}

// ─── Notification ────────────────────────────────────────────

export interface NotificationResponse {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  message: string;
  type: string;
  link: string;
  is_read: boolean;
}

export interface CreateNotificationRequest {
  user_id: number;
  title: string;
  message: string;
  type: string;
  link: string;
  is_read: boolean;
}

export interface UpdateNotificationRequest extends Partial<CreateNotificationRequest> {}

// ─── Pricing Plan ────────────────────────────────────────────

export interface PricingPlanResponse {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  period: string;
  description: string;
  features: string;
  price: number;
  credits_included: number;
  position: number;
  is_active: boolean;
}

// ─── Invoice ─────────────────────────────────────────────────

export interface InvoiceResponse {
  id: number;
  created_at: string;
  updated_at: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  payment_method: string;
  issued_at?: string;
  due_date?: string;
  paid_at?: string;
}

export interface CreateInvoiceRequest {
  user_id?: number;
  company_id?: number;
  amount: number;
  currency: string;
  status: string;
  description: string;
  payment_method: string;
  issued_at?: string;
  due_date?: string;
  paid_at?: string;
}

// ─── Blog Post ───────────────────────────────────────────────

export interface BlogPostResponse {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  read_time: number;
  is_published: boolean;
  published_at?: string;
  featured_image?: { url: string; name: string };
}

// ─── FAQ Item ────────────────────────────────────────────────

export interface FaqItemResponse {
  id: number;
  created_at: string;
  updated_at: string;
  question: string;
  answer: string;
  category: string;
  position: number;
  is_published: boolean;
}

// ─── Company User ────────────────────────────────────────────

export interface CompanyUserResponse {
  id: number;
  created_at: string;
  updated_at: string;
  role: string;
  company?: { id: number; name: string };
  user?: { id: number; name: string };
}

export interface CreateCompanyUserRequest {
  company_id: number;
  user_id: number;
  role: string;
}

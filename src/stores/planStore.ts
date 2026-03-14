import { create } from "zustand";
import { createJSONStorage } from "zustand/middleware";
import { persist } from "zustand/middleware";

// ─── Types ───────────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  totalCredits: number;
  usedCredits: number;
  employeeCount: number;
  plan: "starter" | "professional" | "enterprise";
}

export interface TravelPlan {
  id: string;
  companyId?: string;
  destination: string;
  country: string;
  duration: string;
  purpose: string;
  riskScore: "Low" | "Moderate" | "High";
  status: "completed" | "processing" | "draft";
  createdAt: string;
  vaccinations: { name: string; status: "Required" | "Recommended" | "Optional" }[];
  healthAlerts: string[];
  safetyAdvisories: string[];
  medications: string[];
  waterFood: string[];
  emergencyContacts: { label: string; value: string }[];
  medicalConsiderations?: string;
  employeeId?: string;
  employeeName?: string;
}

export interface TravelRequest {
  id: string;
  companyId: string;
  employeeId: string;
  employeeName: string;
  destination: string;
  dates: string;
  status: "pending" | "approved" | "completed" | "rejected";
  submittedAt: string;
}

export interface Employee {
  id: string;
  companyId: string;
  name: string;
  email: string;
  department: string;
  creditsUsed: number;
  creditsAllocated: number;
  status: "active" | "inactive";
  plansGenerated: number;
}

// ─── Mock plans ──────────────────────────────────────────────

const MOCK_PLANS: TravelPlan[] = [
  {
    id: "p1",
    companyId: "c1",
    destination: "Bogotá & Cartagena",
    country: "Colombia",
    duration: "10 days",
    purpose: "Leisure",
    riskScore: "Moderate",
    status: "completed",
    createdAt: "2026-02-18",
    employeeId: "e1",
    employeeName: "Anna Chen",
    vaccinations: [
      { name: "Yellow Fever", status: "Required" },
      { name: "Typhoid", status: "Recommended" },
      { name: "Hepatitis A", status: "Recommended" },
      { name: "Tdap", status: "Optional" },
    ],
    healthAlerts: [
      "Dengue fever — high season in coastal regions",
      "Zika virus advisory for pregnant travelers",
      "Altitude sickness risk above 2,500m in Bogotá",
    ],
    safetyAdvisories: [
      "Avoid tap water — use bottled or purified",
      "Carry antimalarial medication in rural areas",
      "Register with your embassy before departure",
    ],
    medications: ["Malarone (malaria prophylaxis)", "Ciprofloxacin (traveler's diarrhea)", "Oral rehydration salts"],
    waterFood: ["Drink only bottled/purified water", "Avoid raw salads in street stalls", "Stick to cooked-to-order food"],
    emergencyContacts: [
      { label: "Emergency", value: "123 (Colombia)" },
      { label: "Nearest hospital", value: "Fundación Santa Fe, Bogotá" },
      { label: "Embassy", value: "+57 1 275 2000" },
    ],
  },
  {
    id: "p2",
    companyId: "c1",
    destination: "Tokyo & Osaka",
    country: "Japan",
    duration: "14 days",
    purpose: "Business",
    riskScore: "Low",
    status: "completed",
    createdAt: "2026-02-10",
    employeeId: "e2",
    employeeName: "Michael Osei",
    vaccinations: [
      { name: "Japanese Encephalitis", status: "Recommended" },
      { name: "Influenza", status: "Optional" },
    ],
    healthAlerts: ["Low risk destination — standard precautions apply"],
    safetyAdvisories: ["Earthquake preparedness advised", "Carry prescribed medications in original packaging"],
    medications: ["Standard travel first-aid kit"],
    waterFood: ["Tap water is safe to drink", "Food hygiene standards are high"],
    emergencyContacts: [
      { label: "Emergency", value: "119 (Japan)" },
      { label: "Nearest hospital", value: "St. Luke's International, Tokyo" },
    ],
  },
  {
    id: "p3",
    companyId: "c2",
    destination: "Nairobi & Maasai Mara",
    country: "Kenya",
    duration: "7 days",
    purpose: "Leisure",
    riskScore: "High",
    status: "completed",
    createdAt: "2026-01-28",
    employeeId: "e7",
    employeeName: "Dr. Sarah Njeri",
    vaccinations: [
      { name: "Yellow Fever", status: "Required" },
      { name: "Typhoid", status: "Required" },
      { name: "Hepatitis A", status: "Recommended" },
      { name: "Meningitis", status: "Recommended" },
      { name: "Rabies", status: "Optional" },
    ],
    healthAlerts: [
      "Malaria risk — prophylaxis essential",
      "Cholera outbreaks reported in some regions",
      "Altitude sickness at higher elevations",
    ],
    safetyAdvisories: [
      "Use DEET-based insect repellent",
      "Sleep under mosquito nets",
      "Avoid contact with freshwater lakes (schistosomiasis)",
    ],
    medications: ["Malarone", "Doxycycline (backup)", "Azithromycin", "Oral rehydration salts"],
    waterFood: ["Drink only bottled water", "Avoid ice in drinks", "Eat only thoroughly cooked food"],
    emergencyContacts: [
      { label: "Emergency", value: "999 (Kenya)" },
      { label: "Nearest hospital", value: "Nairobi Hospital" },
      { label: "Embassy", value: "+254 20 363 6000" },
    ],
  },
  {
    id: "p4",
    companyId: "c2",
    destination: "Mumbai & Delhi",
    country: "India",
    duration: "12 days",
    purpose: "Conference",
    riskScore: "Moderate",
    status: "completed",
    createdAt: "2026-02-05",
    employeeId: "e8",
    employeeName: "Robert Andersen",
    vaccinations: [
      { name: "Hepatitis A", status: "Required" },
      { name: "Typhoid", status: "Required" },
      { name: "Tdap", status: "Recommended" },
    ],
    healthAlerts: ["Air quality advisories in Delhi", "Dengue risk in monsoon season"],
    safetyAdvisories: ["Drink only bottled water", "Use insect repellent"],
    medications: ["Ciprofloxacin", "Oral rehydration salts"],
    waterFood: ["Avoid street food and tap water", "Eat at reputable restaurants"],
    emergencyContacts: [
      { label: "Emergency", value: "112 (India)" },
      { label: "Nearest hospital", value: "Apollo Hospital, Mumbai" },
    ],
  },
  {
    id: "p5",
    companyId: "c3",
    destination: "São Paulo",
    country: "Brazil",
    duration: "5 days",
    purpose: "Client visit",
    riskScore: "Moderate",
    status: "completed",
    createdAt: "2026-02-12",
    employeeId: "e13",
    employeeName: "Lena Fischer",
    vaccinations: [
      { name: "Yellow Fever", status: "Recommended" },
      { name: "Hepatitis A", status: "Recommended" },
    ],
    healthAlerts: ["Zika virus advisory", "Dengue risk in urban areas"],
    safetyAdvisories: ["Use mosquito repellent", "Register with embassy"],
    medications: ["Standard travel first-aid kit"],
    waterFood: ["Tap water is generally safe in São Paulo", "Avoid street food from unverified vendors"],
    emergencyContacts: [
      { label: "Emergency", value: "192 (Brazil)" },
      { label: "Nearest hospital", value: "Hospital Sírio-Libanês" },
    ],
  },
];

// ─── Mock employees (company-scoped) ─────────────────────────

const MOCK_EMPLOYEES: Employee[] = [
  // TechCorp (c1)
  { id: "e1", companyId: "c1", name: "Anna Chen", email: "anna@techcorp.com", department: "Engineering", creditsUsed: 3, creditsAllocated: 10, status: "active", plansGenerated: 3 },
  { id: "e2", companyId: "c1", name: "Michael Osei", email: "michael@techcorp.com", department: "Sales", creditsUsed: 5, creditsAllocated: 8, status: "active", plansGenerated: 5 },
  { id: "e3", companyId: "c1", name: "Priya Sharma", email: "priya@techcorp.com", department: "Marketing", creditsUsed: 2, creditsAllocated: 5, status: "active", plansGenerated: 2 },
  { id: "e4", companyId: "c1", name: "David Kim", email: "david@techcorp.com", department: "Engineering", creditsUsed: 1, creditsAllocated: 5, status: "active", plansGenerated: 1 },
  { id: "e5", companyId: "c1", name: "Emily Johnson", email: "emily@techcorp.com", department: "HR", creditsUsed: 0, creditsAllocated: 3, status: "active", plansGenerated: 0 },
  { id: "e6", companyId: "c1", name: "Carlos Ruiz", email: "carlos@techcorp.com", department: "Sales", creditsUsed: 4, creditsAllocated: 6, status: "inactive", plansGenerated: 4 },

  // GlobalHealth Inc. (c2)
  { id: "e7", companyId: "c2", name: "Dr. Sarah Njeri", email: "sarah@globalhealth.com", department: "Research", creditsUsed: 8, creditsAllocated: 15, status: "active", plansGenerated: 8 },
  { id: "e8", companyId: "c2", name: "Robert Andersen", email: "robert@globalhealth.com", department: "Field Ops", creditsUsed: 12, creditsAllocated: 20, status: "active", plansGenerated: 12 },
  { id: "e9", companyId: "c2", name: "Amina Yusuf", email: "amina@globalhealth.com", department: "Logistics", creditsUsed: 6, creditsAllocated: 10, status: "active", plansGenerated: 6 },
  { id: "e10", companyId: "c2", name: "James O'Brien", email: "james@globalhealth.com", department: "Research", creditsUsed: 10, creditsAllocated: 12, status: "active", plansGenerated: 10 },
  { id: "e11", companyId: "c2", name: "Lin Wei", email: "lin@globalhealth.com", department: "Compliance", creditsUsed: 5, creditsAllocated: 8, status: "active", plansGenerated: 5 },
  { id: "e12", companyId: "c2", name: "Maria Santos", email: "maria@globalhealth.com", department: "Field Ops", creditsUsed: 7, creditsAllocated: 10, status: "inactive", plansGenerated: 7 },
  { id: "e20", companyId: "c2", name: "Tobias Gruber", email: "tobias@globalhealth.com", department: "IT", creditsUsed: 0, creditsAllocated: 5, status: "active", plansGenerated: 0 },
  { id: "e21", companyId: "c2", name: "Fatima Al-Rashid", email: "fatima@globalhealth.com", department: "Logistics", creditsUsed: 0, creditsAllocated: 5, status: "active", plansGenerated: 0 },

  // Meridian Consulting (c3)
  { id: "e13", companyId: "c3", name: "Lena Fischer", email: "lena@meridian.com", department: "Strategy", creditsUsed: 3, creditsAllocated: 8, status: "active", plansGenerated: 3 },
  { id: "e14", companyId: "c3", name: "Raj Patel", email: "raj@meridian.com", department: "Advisory", creditsUsed: 2, creditsAllocated: 6, status: "active", plansGenerated: 2 },
  { id: "e15", companyId: "c3", name: "Sophie Dubois", email: "sophie@meridian.com", department: "Advisory", creditsUsed: 2, creditsAllocated: 5, status: "active", plansGenerated: 2 },
];

// ─── Mock travel requests (company-scoped) ───────────────────

const MOCK_REQUESTS: TravelRequest[] = [
  // TechCorp (c1)
  { id: "r1", companyId: "c1", employeeId: "e1", employeeName: "Anna Chen", destination: "Singapore", dates: "Mar 5–12, 2026", status: "pending", submittedAt: "2026-02-20" },
  { id: "r2", companyId: "c1", employeeId: "e2", employeeName: "Michael Osei", destination: "Lagos, Nigeria", dates: "Mar 15–22, 2026", status: "pending", submittedAt: "2026-02-19" },
  { id: "r3", companyId: "c1", employeeId: "e3", employeeName: "Priya Sharma", destination: "São Paulo, Brazil", dates: "Feb 28–Mar 7, 2026", status: "approved", submittedAt: "2026-02-14" },
  { id: "r4", companyId: "c1", employeeId: "e4", employeeName: "David Kim", destination: "Berlin, Germany", dates: "Feb 10–15, 2026", status: "completed", submittedAt: "2026-02-01" },
  { id: "r5", companyId: "c1", employeeId: "e2", employeeName: "Michael Osei", destination: "Accra, Ghana", dates: "Jan 20–28, 2026", status: "completed", submittedAt: "2026-01-10" },

  // GlobalHealth Inc. (c2)
  { id: "r6", companyId: "c2", employeeId: "e7", employeeName: "Dr. Sarah Njeri", destination: "Kampala, Uganda", dates: "Mar 1–14, 2026", status: "pending", submittedAt: "2026-02-18" },
  { id: "r7", companyId: "c2", employeeId: "e8", employeeName: "Robert Andersen", destination: "Dhaka, Bangladesh", dates: "Mar 10–24, 2026", status: "approved", submittedAt: "2026-02-15" },
  { id: "r8", companyId: "c2", employeeId: "e9", employeeName: "Amina Yusuf", destination: "Addis Ababa, Ethiopia", dates: "Feb 25–Mar 5, 2026", status: "approved", submittedAt: "2026-02-10" },
  { id: "r9", companyId: "c2", employeeId: "e10", employeeName: "James O'Brien", destination: "Lima, Peru", dates: "Feb 5–12, 2026", status: "completed", submittedAt: "2026-01-25" },

  // Meridian Consulting (c3)
  { id: "r10", companyId: "c3", employeeId: "e13", employeeName: "Lena Fischer", destination: "Dubai, UAE", dates: "Mar 8–14, 2026", status: "pending", submittedAt: "2026-02-21" },
  { id: "r11", companyId: "c3", employeeId: "e14", employeeName: "Raj Patel", destination: "Bangkok, Thailand", dates: "Mar 20–28, 2026", status: "approved", submittedAt: "2026-02-17" },
];

// ─── Store ───────────────────────────────────────────────────

interface PlanState {
  companies: Company[];
  selectedCompanyId: string | null;
  plans: TravelPlan[];
  employees: Employee[];
  travelRequests: TravelRequest[];

  // Company actions
  setCompanies: (companies: Company[]) => void;
  selectCompany: (companyId: string) => void;
  getCompany: (id: string) => Company | undefined;
  selectedCompany: () => Company | undefined;

  // Filtered selectors (scoped to selectedCompanyId)
  companyPlans: () => TravelPlan[];
  companyEmployees: () => Employee[];
  companyRequests: () => TravelRequest[];

  // Plan actions
  getPlan: (id: string) => TravelPlan | undefined;
  addPlan: (plan: TravelPlan) => void;
  updateRequestStatus: (id: string, status: TravelRequest["status"]) => void;
}

export const usePlanStore = create<PlanState>()(
    persist(
        (set, get) => ({
            companies: [],
            selectedCompanyId: null,
            plans: MOCK_PLANS,
            employees: MOCK_EMPLOYEES,
            travelRequests: MOCK_REQUESTS,

            // Company actions
            setCompanies: (companies) => set({ companies }),
            selectCompany: (companyId) => set({ selectedCompanyId: companyId }),

            getCompany: (id) => get().companies.find((c) => c.id === id),

            selectedCompany: () => {
                const { companies, selectedCompanyId } = get();
                if (companies.length === 0) return undefined;
                return (
                    companies.find((c) => c.id === selectedCompanyId) ??
                    companies[0]
                );
            },

            // Filtered selectors
            companyPlans: () => {
                const { plans, selectedCompanyId } = get();
                return plans.filter((p) => p.companyId === selectedCompanyId);
            },

            companyEmployees: () => {
                const { employees, selectedCompanyId } = get();
                return employees.filter(
                    (e) => e.companyId === selectedCompanyId,
                );
            },

            companyRequests: () => {
                const { travelRequests, selectedCompanyId } = get();
                return travelRequests.filter(
                    (r) => r.companyId === selectedCompanyId,
                );
            },

            // Plan actions
            getPlan: (id) => get().plans.find((p) => p.id === id),

            addPlan: (plan) =>
                set((state) => ({ plans: [plan, ...state.plans] })),

            updateRequestStatus: (id, status) =>
                set((state) => ({
                    travelRequests: state.travelRequests.map((r) =>
                        r.id === id ? { ...r, status } : r,
                    ),
                })),
        }),
        {
            name: "PlanStore",
            storage: createJSONStorage(() => sessionStorage),
        },
    ),
);

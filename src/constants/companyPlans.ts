export type CompanyPlanTier = "bronze" | "silver" | "gold" | "diamond";

export interface CompanyPlanDefinition {
  tier: CompanyPlanTier;
  name: string;
  signupCredits: number;
  employeeLimit: string;
  apiAccess: boolean;
  customSupport: boolean;
  multipleAdminAccounts: boolean;
  highEmployeeLimit: boolean;
  description: string;
}

export const companyPlans: CompanyPlanDefinition[] = [
  {
    tier: "bronze",
    name: "Bronze",
    signupCredits: 100,
    employeeLimit: "1–100 employees",
    apiAccess: false,
    customSupport: false,
    multipleAdminAccounts: false,
    highEmployeeLimit: false,
    description: "Great for small teams getting started with travel health planning.",
  },
  {
    tier: "silver",
    name: "Silver",
    signupCredits: 200,
    employeeLimit: "Up to 500 employees",
    apiAccess: true,
    customSupport: true,
    multipleAdminAccounts: true,
    highEmployeeLimit: false,
    description: "For growing teams that need integrations and stronger admin controls.",
  },
  {
    tier: "gold",
    name: "Gold",
    signupCredits: 500,
    employeeLimit: "Up to 1,000 employees",
    apiAccess: true,
    customSupport: true,
    multipleAdminAccounts: true,
    highEmployeeLimit: false,
    description: "For larger organizations with high travel volume and compliance demands.",
  },
  {
    tier: "diamond",
    name: "Diamond",
    signupCredits: 1000,
    employeeLimit: "Up to 100,000 employees",
    apiAccess: true,
    customSupport: true,
    multipleAdminAccounts: true,
    highEmployeeLimit: true,
    description: "Enterprise scale with highest credits, full API access, and priority support.",
  },
];

export const elevatedPlanFeatures = [
  "Custom support",
  "API access",
  "Multiple admin accounts",
  "Access to 100,000 employees",
];

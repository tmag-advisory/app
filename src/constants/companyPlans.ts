export type CreditPlanTier = "essential" | "standard" | "premium";

export interface CreditPlanDefinition {
  tier: CreditPlanTier;
  code: "ESSENTIAL" | "STANDARD" | "PREMIUM";
  name: string;
  priceUsd: number;
  priceNgn: number;
  description: string;
  features: string[];
}

const standardFeatures = [
  "Trip at a glance summary",
  "Personalised health risk overview",
  "Vaccination gap analysis",
  "Activity & destination-specific guidance",
  "Emergency contacts & local clinics",
  "After-return symptom timeline",
  "Next steps checklist",
];

const premiumOnlyFeatures = [
  "Pre-travel preparation checklist",
  "Medication & supplies packing list",
  "Doctor-ready clinical summary letter",
  "Priority physician review flag",
];

export const creditPlans: CreditPlanDefinition[] = [
  {
    tier: "essential",
    code: "ESSENTIAL",
    name: "Essential",
    priceUsd: 0,
    priceNgn: 0,
    description: "Generic destination health education for casual travellers. No personal data required.",
    features: [
      "Destination health risk overview",
      "General food & water safety guidance",
      "Environmental considerations",
      "Post-return awareness note",
      "WHO & CDC validated guidance",
    ],
  },
  {
    tier: "standard",
    code: "STANDARD",
    name: "Standard",
    priceUsd: 50,
    priceNgn: 50000,
    description: "Fully personalised travel health report using all questionnaire inputs across 14 clinical decision trees.",
    features: standardFeatures,
  },
  {
    tier: "premium",
    code: "PREMIUM",
    name: "Premium",
    priceUsd: 100,
    priceNgn: 100000,
    description: "Everything in Standard plus clinical-grade extras for high-risk or complex trips.",
    features: [...standardFeatures, ...premiumOnlyFeatures],
  },
];

export interface IndividualPlanDefinition extends CreditPlanDefinition {
  priceNote: string;
  cta: string;
  highlighted: boolean;
}

export const individualPlans: IndividualPlanDefinition[] = [
  {
    ...creditPlans[0],
    priceNote: "1 credit included at signup",
    cta: "Start free",
    highlighted: false,
  },
  {
    ...creditPlans[1],
    priceNote: "per credit",
    cta: "Get started",
    highlighted: true,
  },
  {
    ...creditPlans[2],
    priceNote: "per credit",
    cta: "Get Premium",
    highlighted: false,
  },
];

export const premiumFeatures = premiumOnlyFeatures;

export type SignupRange = "0-100" | "100-500" | ">500";
export type ServiceLevel = "standard" | "premium";

export const enterpriseTiers: Record<SignupRange, Record<ServiceLevel, string>> = {
  "0-100":   { standard: "Enterprise Silver",   premium: "Enterprise Plus" },
  "100-500": { standard: "Enterprise Gold",     premium: "Enterprise Elite" },
  ">500":    { standard: "Enterprise Platinum", premium: "Enterprise Signature" },
};

export const enterprisePlanCodes: Record<SignupRange, Record<ServiceLevel, string>> = {
  "0-100":   { standard: "ENTERPRISE_SILVER",   premium: "ENTERPRISE_PLUS" },
  "100-500": { standard: "ENTERPRISE_GOLD",     premium: "ENTERPRISE_ELITE" },
  ">500":    { standard: "ENTERPRISE_PLATINUM", premium: "ENTERPRISE_SIGNATURE" },
};

export const signupRanges: { value: SignupRange; label: string }[] = [
  { value: "0-100",   label: "0 – 100" },
  { value: "100-500", label: "100 – 500" },
  { value: ">500",    label: "500+" },
];

export const featuresByServiceLevel: Record<"STANDARD" | "PREMIUM", string[]> = {
  STANDARD: standardFeatures,
  PREMIUM: [...standardFeatures, ...premiumOnlyFeatures],
};

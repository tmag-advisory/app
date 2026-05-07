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
    cta: "Get Essential",
    highlighted: false,
    features: [
      "Destination health risk overview (including current alerts & outbreaks)",
      "General food and water safety guidance",
      "Environmental and safety considerations",
      "Downloadable PDF report",
    ],
  },
  {
    ...creditPlans[1],
    priceNote: "per credit",
    cta: "Get Standard",
    highlighted: true,
    features: [
      "Destination health risk overview (including current alerts & outbreaks)",
      "General food and water safety guidance",
      "Environmental and safety considerations",
      "Downloadable PDF report",
      "Personalised health risk report (tailored to your age, medical conditions, medications & allergies)",
      "Vaccination gap analysis",
      "Emergency contacts and local clinic directory",
      "Physician-reviewed and validated report",
    ],
  },
  {
    ...creditPlans[2],
    priceNote: "per credit",
    cta: "Get Premium",
    highlighted: false,
    features: [
      "Destination health risk overview (including current alerts & outbreaks)",
      "General food and water safety guidance",
      "Environmental and safety considerations",
      "Downloadable PDF report",
      "Personalised health risk report (tailored to your age, medical conditions, medications & allergies)",
      "Vaccination gap analysis",
      "Emergency contacts and local clinic directory",
      "Physician-reviewed and validated report",
      "Pre-travel preparation and medication packing checklist",
      "15-minute virtual pre-travel consultation with a travel medicine physician",
      "Doctor-ready clinical summary letter (where applicable)",
      "Post-travel debrief note",
    ],
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

export const individualPlanFeatures: Record<"standard" | "premium", string[]> = {
  standard: [
    "Destination health risk overview (including current alerts & outbreaks)",
    "General food and water safety guidance",
    "Environmental and safety considerations",
    "Downloadable PDF report",
    "Personalised health risk report (tailored to your age, medical conditions, medications & allergies)",
    "Vaccination gap analysis",
    "Emergency contacts and local clinic directory",
    "Physician-reviewed and validated report",
  ],
  premium: [
    "Destination health risk overview (including current alerts & outbreaks)",
    "General food and water safety guidance",
    "Environmental and safety considerations",
    "Downloadable PDF report",
    "Personalised health risk report (tailored to your age, medical conditions, medications & allergies)",
    "Vaccination gap analysis",
    "Emergency contacts and local clinic directory",
    "Physician-reviewed and validated report",
    "Pre-travel preparation and medication packing checklist",
    "15-minute virtual pre-travel consultation with a travel medicine physician",
    "Doctor-ready clinical summary letter (where applicable)",
    "Post-travel debrief note",
  ],
};

export const enterpriseTierColors: Record<SignupRange, Record<ServiceLevel, {
  gradient: string;
  border: string;
  badgeBg: string;
  badgeText: string;
  checkColor: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  sideAccent: string;
}>> = {
  "0-100": {
    standard: {
      // Enterprise Silver — soft steel-blue tint, clean and professional
      gradient: "linear-gradient(145deg, #f0f4f8 0%, #e8eef6 50%, #eff4f8 100%)",
      border: "border border-slate-200",
      badgeBg: "bg-slate-100",
      badgeText: "text-slate-600",
      checkColor: "text-[#4a7a9b]",
      textPrimary: "text-slate-800",
      textSecondary: "text-slate-600",
      textMuted: "text-slate-400",
      sideAccent: "bg-[#4a7a9b]",
    },
    premium: {
      // Enterprise Plus — warm ivory with gold accents
      gradient: "linear-gradient(145deg, #fdf8f0 0%, #faf3e4 50%, #fdf7ee 100%)",
      border: "border-2 border-[#c4953a]/40",
      badgeBg: "bg-[#c4953a]/15",
      badgeText: "text-[#9a7020]",
      checkColor: "text-[#c4953a]",
      textPrimary: "text-stone-800",
      textSecondary: "text-stone-600",
      textMuted: "text-stone-400",
      sideAccent: "bg-[#c4953a]",
    },
  },
  "100-500": {
    standard: {
      // Enterprise Gold — light sage-green, growth-stage confidence
      gradient: "linear-gradient(145deg, #f0f7f3 0%, #e6f2ec 50%, #eef5f1 100%)",
      border: "border border-emerald-200",
      badgeBg: "bg-emerald-100",
      badgeText: "text-emerald-700",
      checkColor: "text-emerald-600",
      textPrimary: "text-emerald-950",
      textSecondary: "text-emerald-800",
      textMuted: "text-emerald-600",
      sideAccent: "bg-emerald-500",
    },
    premium: {
      // Enterprise Elite — warm ivory with gold, richer tone
      gradient: "linear-gradient(145deg, #fdf8f0 0%, #faf3e4 50%, #fdf7ec 100%)",
      border: "border-2 border-[#c4953a]/40",
      badgeBg: "bg-[#c4953a]/15",
      badgeText: "text-[#9a7020]",
      checkColor: "text-[#c4953a]",
      textPrimary: "text-stone-800",
      textSecondary: "text-stone-600",
      textMuted: "text-stone-400",
      sideAccent: "bg-[#c4953a]",
    },
  },
  ">500": {
    standard: {
      // Enterprise Platinum — cool silver-gray, exclusive and refined
      gradient: "linear-gradient(145deg, #f4f4f8 0%, #eeeff4 50%, #f2f2f8 100%)",
      border: "border border-slate-200",
      badgeBg: "bg-slate-100",
      badgeText: "text-slate-500",
      checkColor: "text-slate-500",
      textPrimary: "text-slate-800",
      textSecondary: "text-slate-600",
      textMuted: "text-slate-400",
      sideAccent: "bg-slate-400",
    },
    premium: {
      // Enterprise Signature — warm ivory with gold, the apex tier
      gradient: "linear-gradient(145deg, #fdf8f0 0%, #faf3e4 50%, #fdf7ee 100%)",
      border: "border-2 border-[#c4953a]/40",
      badgeBg: "bg-[#c4953a]/15",
      badgeText: "text-[#9a7020]",
      checkColor: "text-[#c4953a]",
      textPrimary: "text-stone-800",
      textSecondary: "text-stone-600",
      textMuted: "text-stone-400",
      sideAccent: "bg-[#c4953a]",
    },
  },
};

export interface FamilyPlanDefinition {
  id: "STANDARD";
  name: string;
  description: string;
  priceUsd: number;
  priceNgn: number;
  additionalMemberPriceUsd: number;
  additionalMemberPriceNgn: number;
  priceNote: string;
  cta: string;
  highlighted: boolean;
  features: string[];
}

export type PlanCurrency = "USD" | "NGN";

export function normalizePlanCurrency(currency: string): PlanCurrency {
  return currency === "NGN" ? "NGN" : "USD";
}

export function formatFamilyPlanPrice(plan: FamilyPlanDefinition, currency: string): string {
  return normalizePlanCurrency(currency) === "NGN"
    ? `₦${plan.priceNgn.toLocaleString()}`
    : `$${plan.priceUsd.toLocaleString()}`;
}

export function formatFamilyAdditionalMemberPrice(plan: FamilyPlanDefinition, currency: string): string {
  return normalizePlanCurrency(currency) === "NGN"
    ? `₦${plan.additionalMemberPriceNgn.toLocaleString()}`
    : `$${plan.additionalMemberPriceUsd.toLocaleString()}`;
}

export const familyPlans: FamilyPlanDefinition[] = [
  {
    id: "STANDARD",
    name: "Family Plan",
    description: "One family travel health plan for up to 6 family members. Covers everyone in a single trip.",
    priceUsd: 180,
    priceNgn: 180000,
    additionalMemberPriceUsd: 30,
    additionalMemberPriceNgn: 25000,
    priceNote: "for up to 6 family members",
    cta: "Get Family Plan",
    highlighted: true,
    features: [
      "Includes up to 6 family members",
      "$30 / ₦25,000 per additional family member",
      "Fully personalised health risk report for each member",
      "Family-centric dashboard and individual member access codes",
      "Emergency contacts and local clinic directory",
      "Physician-reviewed and validated reports",
    ],
  },
];

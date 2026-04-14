export type CreditPlanTier = "essential" | "standard" | "premium";

export interface CreditPlanDefinition {
  tier: CreditPlanTier;
  code: "ESSENTIAL" | "STANDARD" | "PREMIUM";
  name: string;
  priceUsd: number;
  description: string;
  features: string[];
}

export const creditPlans: CreditPlanDefinition[] = [
  // {
  //   tier: "essential",
  //   code: "ESSENTIAL",
  //   name: "Essential",
  //   priceUsd: 0,
  //   description: "Generic destination health education for casual travellers. No personal data required.",
  //   features: [
  //     "Destination health risk overview",
  //     "General food & water safety guidance",
  //     "Environmental considerations",
  //     "Post-return awareness note",
  //     "WHO & CDC validated guidance",
  //   ],
  // },
  {
    tier: "standard",
    code: "STANDARD",
    name: "Standard",
    priceUsd: 50,
    description: "Fully personalised travel health report using all questionnaire inputs across 14 clinical decision trees.",
    features: [
      "Trip at a glance summary",
      "Personalised health risk overview",
      "Vaccination gap analysis",
      "Activity & destination-specific guidance",
      "Emergency contacts & local clinics",
      "After-return symptom timeline",
      "Next steps checklist",
    ],
  },
  {
    tier: "premium",
    code: "PREMIUM",
    name: "Premium",
    priceUsd: 100,
    description: "Everything in Standard plus clinical-grade extras for high-risk or complex trips.",
    features: [
      "All Standard plan features",
      "Pre-travel preparation checklist",
      "Medication & supplies packing list",
      "Doctor-ready clinical summary letter",
      "Priority physician review flag",
    ],
  },
];

export const premiumFeatures = [
  "Pre-travel preparation checklist",
  "Medication & supplies packing list",
  "Doctor-ready clinical summary letter",
  "Priority physician review flag",
];

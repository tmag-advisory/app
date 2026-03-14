import { create } from "zustand";

export type OnboardingStage = 0 | 1 | 2 | 3 | 4;

export type OnboardingStep = {
    stage: OnboardingStage;
    title: string;
    content: string;
    link: string;
    skippable: boolean;
    nextStage?: OnboardingStage;
};

export type OnboardingState = {
    stage: OnboardingStep | null;
    userType: "individual" | "company" | null;
    setStage: (stage: OnboardingStage) => void;
    setUserType: (userType: "individual" | "company") => void;
    reset: () => void;
};

const steps: OnboardingStep[] = [
    { stage: 0, title: "Register", content: "Welcome to the onboarding process.", link: "/register", skippable: false, nextStage: 1 },
    { stage: 1, title: "Verify Email", content: "Please verify your email.", link: "/verify-email", skippable: false, nextStage: 2 },
    { stage: 2, title: "User Type", content: "Select Between an Individual and a Company", link: "/user-type", skippable: false, nextStage: 3 },
    { stage: 3, title: "Profile", content: "Update Some Other Core Details on the Profile", link: "/profile", skippable: false, nextStage: 4 },
    { stage: 4, title: "Welcome", content: "Learn what TMAG offers and your starting credits", link: "/onboarding", skippable: false, nextStage: undefined },
];

export const useOnboardingStore = create<OnboardingState>()((set) => ({
    stage: null,
    userType: null,
    setStage: (stage?: OnboardingStage) => {
        return set({ stage: steps.find((step) => step.stage === stage) });
    },
    setUserType: (userType: "individual" | "company") => set({ userType }),
    reset: () => set({ stage: null, userType: null }),
}));

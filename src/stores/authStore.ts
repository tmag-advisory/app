import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserType = "individual" | "company";
export type UserRole = "user" | "hr_admin" | "company_admin";

export interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  role: UserRole;
  credits: number;
  companyIds?: string[];
  avatarUrl?: string;
  onboarded: boolean;
}

// ─── Mock users for preview ─────────────────────────────────
// Toggle PREVIEW_USER below to switch between individual / HR views

export const MOCK_INDIVIDUAL: User = {
  id: "u1",
  name: "Sarah Kimani",
  email: "sarah@example.com",
  type: "individual",
  role: "user",
  credits: 7,
  onboarded: true,
};

export const MOCK_HR_ADMIN: User = {
  id: "u2",
  name: "James Liu",
  email: "james@techcorp.com",
  type: "company",
  role: "hr_admin",
  credits: 142,
  companyIds: ["c1", "c2", "c3"],
  onboarded: true,
};

// ★ Change this to MOCK_HR_ADMIN to preview the HR dashboard
const PREVIEW_USER: User | null = MOCK_HR_ADMIN;

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  updateCredits: (credits: number) => void;
  consumeCredit: () => boolean;
}

export const useAuthStore = create<AuthState>()(persist((set, get) => ({
  user: PREVIEW_USER,
  isAuthenticated: PREVIEW_USER !== null,

  login: (user) => set({ user, isAuthenticated: true }),

  logout: () => set({ user: null, isAuthenticated: false }),

  setUser: (user) => set({ user }),

  updateCredits: (credits) =>
    set((state) => ({
      user: state.user ? { ...state.user, credits } : null,
    })),

  consumeCredit: () => {
    const { user } = get();
    if (!user || user.credits <= 0) return false;
    set({ user: { ...user, credits: user.credits - 1 } });
    return true;
  },
}), {
  name: 'AuthState',
  storage: createJSONStorage(() => localStorage)
}));

import { useState, lazy, Suspense } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  LucideUser,
  LucideCreditCard,
  LucideShieldCheck,
  LucideLock,
  LucideLoader2,
} from "lucide-react";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import * as React from "react";

// Lazy-loaded tab components
const ProfileTab = lazy(() =>
  import("./settings/ProfileTab").then((m) => ({ default: m.default }))
);
const BillingTab = lazy(() =>
  import("./settings/BillingTab").then((m) => ({ default: m.default }))
);
const DataPrivacyTab = lazy(() =>
  import("./settings/DataPrivacyTab").then((m) => ({ default: m.default }))
);
const SecurityTab = lazy(() =>
  import("./settings/SecurityTab").then((m) => ({ default: m.default }))
);

type Tab = "profile" | "security" | "billing" | "privacy";

const Settings = () => {
  const { refreshProfile } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <LucideUser className="w-4 h-4" /> },
    { id: "security", label: "Security", icon: <LucideLock className="w-4 h-4" /> },
    { id: "billing", label: "Billing", icon: <LucideCreditCard className="w-4 h-4" /> },
    { id: "privacy", label: "Privacy & data", icon: <LucideShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <div>
      <DashboardHeader title="Settings" />

      {/* Tabs */}
      <div className="flex gap-1 bg-button-secondary rounded-xl p-1 max-w-2xl mb-8 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              tab === t.id
                ? "bg-white text-heading shadow-sm"
                : "text-muted hover:text-heading"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content with lazy loading */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <LucideLoader2 className="w-6 h-6 animate-spin text-muted" />
          </div>
        }
      >
        {tab === "profile" && <ProfileTab onRefreshProfile={refreshProfile} />}
        {tab === "security" && <SecurityTab />}
        {tab === "billing" && <BillingTab onRefreshProfile={refreshProfile} />}
        {tab === "privacy" && <DataPrivacyTab />}
      </Suspense>
    </div>
  );
};

export default Settings;

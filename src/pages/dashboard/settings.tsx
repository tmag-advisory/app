import { useState, lazy, Suspense } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  LucideUser,
  LucideLock,
  LucideCreditCard,
  LucideLoader2,
} from "lucide-react";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import * as React from "react";

// Lazy-loaded tab components
const ProfileTab = lazy(() =>
  import("./settings/ProfileTab").then((m) => ({ default: m.default }))
);
const PasswordTab = lazy(() =>
  import("./settings/PasswordTab").then((m) => ({ default: m.default }))
);
const BillingTab = lazy(() =>
  import("./settings/BillingTab").then((m) => ({ default: m.default }))
);

type Tab = "profile" | "password" | "billing";

const Settings = () => {
  const { refreshProfile } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <LucideUser className="w-4 h-4" /> },
    { id: "password", label: "Password", icon: <LucideLock className="w-4 h-4" /> },
    { id: "billing", label: "Billing", icon: <LucideCreditCard className="w-4 h-4" /> },
  ];

  return (
    <div>
      <DashboardHeader title="Settings" />

      {/* Tabs */}
      <div className="flex gap-1 bg-button-secondary rounded-xl p-1 max-w-md mb-8 overflow-x-auto">
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
        {tab === "password" && <PasswordTab />}
        {tab === "billing" && <BillingTab onRefreshProfile={refreshProfile} />}
      </Suspense>
    </div>
  );
};

export default Settings;
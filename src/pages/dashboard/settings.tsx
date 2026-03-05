import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import { LucideUser, LucideLock, LucideCreditCard } from "lucide-react";

type Tab = "profile" | "password" | "billing";

const Settings = () => {
    const { user } = useAuth();
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

            {/* Profile tab */}
            {tab === "profile" && (
                <div className="bg-white rounded-2xl border border-border-light/50 p-6 md:p-8 max-w-2xl">
                    <h2 className="text-base font-semibold text-heading mb-6">Personal information</h2>
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Full name</label>
                                <input
                                    type="text"
                                    defaultValue={user ? `${user.first_name} ${user.last_name}` : ""}
                                    className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors duration-200"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Email</label>
                                <input
                                    type="email"
                                    defaultValue={user?.email}
                                    className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors duration-200"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-border-light/50 flex justify-end">
                        <button className="py-2.5 px-5 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200">
                            Save changes
                        </button>
                    </div>
                </div>
            )}

            {/* Password tab */}
            {tab === "password" && (
                <div className="bg-white rounded-2xl border border-border-light/50 p-6 md:p-8 max-w-2xl">
                    <h2 className="text-base font-semibold text-heading mb-6">Change password</h2>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Current password</label>
                            <input type="password" placeholder="••••••••" className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">New password</label>
                            <input type="password" placeholder="Min. 8 characters" className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Confirm new password</label>
                            <input type="password" placeholder="••••••••" className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200" />
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-border-light/50 flex justify-end">
                        <button className="py-2.5 px-5 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200">
                            Update password
                        </button>
                    </div>
                </div>
            )}

            {/* Billing tab */}
            {tab === "billing" && (
                <div className="space-y-6 max-w-2xl">
                    <div className="bg-white rounded-2xl border border-border-light/50 p-6">
                        <h2 className="text-base font-semibold text-heading mb-4">Credits</h2>
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-4xl font-serif text-heading">0</span>
                            <span className="text-sm text-muted">credits remaining</span>
                        </div>
                        <button className="py-2.5 px-5 rounded-xl bg-accent text-white font-semibold text-sm cursor-pointer hover:bg-accent/90 transition-colors duration-200">
                            Purchase credits
                        </button>
                    </div>
                    <div className="bg-white rounded-2xl border border-border-light/50 p-6">
                        <h2 className="text-base font-semibold text-heading mb-4">Plan</h2>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-heading">Individual</p>
                                <p className="text-xs text-muted">Pay-per-plan pricing</p>
                            </div>
                            <span className="text-xs font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full">Active</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;

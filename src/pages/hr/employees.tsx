import { useState } from "react";
import { usePlanStore } from "../../stores/planStore";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import { LucideSearch, LucideUserPlus, LucideMoreHorizontal } from "lucide-react";

const Employees = () => {
    const { companyEmployees } = usePlanStore();
    const employees = companyEmployees();
    const [search, setSearch] = useState("");
    const [showInvite, setShowInvite] = useState(false);

    const filtered = employees.filter(
        (e) =>
            e.name.toLowerCase().includes(search.toLowerCase()) ||
            e.email.toLowerCase().includes(search.toLowerCase()) ||
            e.department.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div>
            <DashboardHeader title="Employees" />

            {/* Actions bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="relative max-w-sm flex-1">
                    <LucideSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search employees…"
                        className="w-full bg-white border border-border-light/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                    />
                </div>
                <button
                    onClick={() => setShowInvite(!showInvite)}
                    className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200"
                >
                    <LucideUserPlus className="w-4 h-4" /> Invite employee
                </button>
            </div>

            {/* Invite form */}
            {showInvite && (
                <div className="bg-white rounded-2xl border border-border-light/50 p-6 mb-6 max-w-lg">
                    <h3 className="text-base font-semibold text-heading mb-4">Invite new employee</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input placeholder="Full name" className="bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200" />
                            <input placeholder="Email" type="email" className="bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input placeholder="Department" className="bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200" />
                            <input placeholder="Credits to allocate" type="number" className="bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200" />
                        </div>
                        <div className="flex gap-3">
                            <button className="py-2.5 px-5 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200">
                                Send invite
                            </button>
                            <button onClick={() => setShowInvite(false)} className="py-2.5 px-5 rounded-xl bg-button-secondary text-heading font-semibold text-sm cursor-pointer hover:bg-border-light transition-colors duration-200">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Employees table */}
            <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full min-w-[540px]">
                    <thead>
                        <tr className="border-b border-border-light/50">
                            <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Employee</th>
                            <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3 hidden md:table-cell">Department</th>
                            <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Credits</th>
                            <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Plans</th>
                            <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Status</th>
                            <th className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light/50">
                        {filtered.map((emp) => (
                            <tr key={emp.id} className="hover:bg-background-secondary/50 transition-colors duration-150">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-button-secondary flex items-center justify-center text-xs font-semibold text-heading">
                                            {emp.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-heading">{emp.name}</p>
                                            <p className="text-xs text-muted">{emp.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-body hidden md:table-cell">{emp.department}</td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-heading font-medium">{emp.creditsUsed}</span>
                                    <span className="text-xs text-muted"> / {emp.creditsAllocated}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-body hidden sm:table-cell">{emp.plansGenerated}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                        emp.status === "active" ? "text-accent bg-accent/10" : "text-muted bg-button-secondary"
                                    }`}>
                                        {emp.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button className="p-1.5 rounded-lg hover:bg-button-secondary transition-colors duration-150 cursor-pointer">
                                        <LucideMoreHorizontal className="w-4 h-4 text-muted" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    );
};

export default Employees;

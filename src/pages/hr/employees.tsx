import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlanStore } from "../../stores/planStore";
import {
    useEmployees,
    useInviteEmployee,
    useAllocateEmployeeCredits,
    useUpdateEmployeeStatus,
    useDeleteEmployee,
} from "../../api/hooks";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import { LucideSearch, LucideUserPlus, LucideMoreHorizontal, LucideLoader2, LucideCheck, LucideX } from "lucide-react";

const Employees = () => {
    const navigate = useNavigate();
    const { selectedCompanyId } = usePlanStore();
    const companyIdNum = selectedCompanyId ? parseInt(selectedCompanyId) : undefined;

    const [search, setSearch] = useState("");
    const [showInvite, setShowInvite] = useState(false);
    const [inviteName, setInviteName] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteDept, setInviteDept] = useState("");
    const [inviteCredits, setInviteCredits] = useState("");
    const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
    const [allocatingFor, setAllocatingFor] = useState<number | null>(null);
    const [newCredits, setNewCredits] = useState("");

    const { data: employeesData, isLoading } = useEmployees({
        companyId: companyIdNum,
        search: search || undefined,
    });
    const inviteEmployee = useInviteEmployee();
    const allocateCredits = useAllocateEmployeeCredits();
    const updateStatus = useUpdateEmployeeStatus();
    const deleteEmployee = useDeleteEmployee();

    const employees = employeesData?.data || [];

    const handleInvite = () => {
        if (!companyIdNum || !inviteName || !inviteEmail) return;
        inviteEmployee.mutate(
            {
                companyId: companyIdNum,
                name: inviteName,
                email: inviteEmail,
                department: inviteDept,
                creditsAllocated: parseInt(inviteCredits) || 0,
            },
            {
                onSuccess: () => {
                    setShowInvite(false);
                    setInviteName("");
                    setInviteEmail("");
                    setInviteDept("");
                    setInviteCredits("");
                },
            }
        );
    };

    const handleAllocateCredits = (id: number) => {
        const amount = parseInt(newCredits);
        if (isNaN(amount) || amount < 0) return;
        allocateCredits.mutate(
            { id, data: { creditsAllocated: amount } },
            {
                onSuccess: () => {
                    setAllocatingFor(null);
                    setNewCredits("");
                },
            }
        );
    };

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
                        placeholder="Search employees..."
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
                            <input
                                value={inviteName}
                                onChange={(e) => setInviteName(e.target.value)}
                                placeholder="Full name"
                                className="bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                            />
                            <input
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="Email"
                                type="email"
                                className="bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                value={inviteDept}
                                onChange={(e) => setInviteDept(e.target.value)}
                                placeholder="Department"
                                className="bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                            />
                            <input
                                value={inviteCredits}
                                onChange={(e) => setInviteCredits(e.target.value)}
                                placeholder="Credits to allocate"
                                type="number"
                                className="bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleInvite}
                                disabled={inviteEmployee.isPending || !inviteName || !inviteEmail}
                                className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {inviteEmployee.isPending && <LucideLoader2 className="w-3.5 h-3.5 animate-spin" />}
                                Send invite
                            </button>
                            <button
                                onClick={() => setShowInvite(false)}
                                className="py-2.5 px-5 rounded-xl bg-button-secondary text-heading font-semibold text-sm cursor-pointer hover:bg-border-light transition-colors duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Employees table */}
            <div className="bg-white rounded-2xl border border-border-light/50">
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
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <LucideLoader2 className="w-6 h-6 text-accent animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : (
                                employees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-background-secondary/50 transition-colors duration-150 align-top">
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => navigate(`/hr/employees/${emp.id}`)}
                                                className="flex items-center gap-3 text-left cursor-pointer group"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-button-secondary flex items-center justify-center text-xs font-semibold text-heading shrink-0">
                                                    {emp.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-heading group-hover:text-accent transition-colors">{emp.name}</p>
                                                    <p className="text-xs text-muted">{emp.email}</p>
                                                </div>
                                            </button>
                                            {allocatingFor === emp.id && (
                                                <div className="flex items-center gap-2 mt-2 max-w-xs">
                                                    <input
                                                        type="number"
                                                        value={newCredits}
                                                        onChange={(e) => setNewCredits(e.target.value)}
                                                        placeholder="New credits total"
                                                        className="border border-border-light rounded-lg px-3 py-1.5 text-sm text-heading outline-none focus:border-accent flex-1 min-w-0"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleAllocateCredits(emp.id)}
                                                        disabled={allocateCredits.isPending}
                                                        className="p-1.5 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent transition-colors disabled:opacity-50"
                                                    >
                                                        <LucideCheck className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => { setAllocatingFor(null); setNewCredits(""); }}
                                                        className="p-1.5 rounded-lg hover:bg-button-secondary text-muted transition-colors"
                                                    >
                                                        <LucideX className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
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
                                        <td className="px-6 py-4 relative">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === emp.id ? null : emp.id); }}
                                                className="p-1.5 rounded-lg hover:bg-button-secondary transition-colors duration-150 cursor-pointer"
                                            >
                                                <LucideMoreHorizontal className="w-4 h-4 text-muted" />
                                            </button>
                                            {menuOpenId === emp.id && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                                                    <div className="absolute right-6 top-full mt-1 bg-white border border-border-light rounded-xl shadow-lg z-20 min-w-[160px] py-1">
                                                        <button
                                                            onClick={() => { setAllocatingFor(emp.id); setMenuOpenId(null); }}
                                                            className="w-full text-left px-4 py-2 text-sm text-heading hover:bg-background-secondary transition-colors"
                                                        >
                                                            Allocate credits
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                updateStatus.mutate({ id: emp.id, data: { status: emp.status === "active" ? "inactive" : "active" } });
                                                                setMenuOpenId(null);
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-sm text-heading hover:bg-background-secondary transition-colors"
                                                        >
                                                            {emp.status === "active" ? "Deactivate" : "Activate"}
                                                        </button>
                                                        <button
                                                            onClick={() => { deleteEmployee.mutate(emp.id); setMenuOpenId(null); }}
                                                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                            {!isLoading && employees.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <p className="text-sm text-muted">No employees found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Employees;

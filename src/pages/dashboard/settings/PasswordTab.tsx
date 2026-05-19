import { useState } from "react";
import { LucideLoader2 } from "lucide-react";
import { useUpdateProfilePassword } from "../../../api/hooks";
import { DASHBOARD_GLASS_SURFACE } from "../../../components/dashboard/dashboardChrome";
import { cn } from "../../../lib/utils";
import toast from "react-hot-toast";

const PasswordTab = () => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const updatePassword = useUpdateProfilePassword();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await updatePassword.mutateAsync({
        OldPassword: passwordForm.currentPassword,
        NewPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password updated successfully");
    } catch {
      toast.error("Failed to update password");
    }
  };

  return (
    <form
      onSubmit={handlePasswordSubmit}
      className={cn(DASHBOARD_GLASS_SURFACE, "p-6 md:p-8 max-w-2xl")}
    >
      <h2 className="text-base font-semibold text-heading mb-6">
        Change password
      </h2>
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Current password
          </label>
          <input
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                currentPassword: e.target.value,
              })
            }
            placeholder="••••••••"
            className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            New password
          </label>
          <input
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                newPassword: e.target.value,
              })
            }
            placeholder="Min. 8 characters"
            className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Confirm new password
          </label>
          <input
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                confirmPassword: e.target.value,
              })
            }
            placeholder="••••••••"
            className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
            required
          />
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-border-light/50 flex justify-end">
        <button
          type="submit"
          disabled={updatePassword.isPending}
          className="py-2.5 px-5 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200 flex items-center gap-2"
        >
          {updatePassword.isPending && (
            <LucideLoader2 className="w-3 h-3 animate-spin" />
          )}
          Update password
        </button>
      </div>
    </form>
  );
};

export default PasswordTab;
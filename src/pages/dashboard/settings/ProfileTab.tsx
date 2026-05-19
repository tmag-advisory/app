import { useState } from "react";
import { LucideUpload, LucideLoader2 } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useUpdateProfile, useUpdateProfileAvatar } from "../../../api/hooks";
import { DASHBOARD_GLASS_SURFACE } from "../../../components/dashboard/dashboardChrome";
import { cn } from "../../../lib/utils";
import toast from "react-hot-toast";

interface ProfileTabProps {
  onRefreshProfile: () => Promise<void>;
}

const ProfileTab = ({ onRefreshProfile }: ProfileTabProps) => {
  const { user } = useAuth();

  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone: user?.phone || "",
    email: user?.email || "",
  });

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url ?? "");
  const updateProfile = useUpdateProfile();
  const updateAvatar = useUpdateProfileAvatar();

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        phone: profileForm.phone,
      });
      await onRefreshProfile();
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile picture must be 5MB or smaller");
      e.target.value = "";
      return;
    }

    try {
      const updatedProfile = await updateAvatar.mutateAsync(file);
      setAvatarPreview(updatedProfile.avatarUrl ?? "");
      await onRefreshProfile();
      toast.success("Profile picture updated");
    } catch {
      toast.error("Failed to update profile picture");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile picture */}
      <section className={cn(DASHBOARD_GLASS_SURFACE, "p-6 md:p-8")}>
        <h2 className="text-base font-semibold text-heading mb-2">
          Profile picture
        </h2>
        <p className="text-sm text-muted mb-6">
          Upload a square profile photo for your travel dashboard. Images up
          to 5MB are cropped and compressed on the server.
        </p>
        <div className="flex flex-col sm:flex-row gap-5 sm:items-center mb-6">
          <div className="w-20 h-20 rounded-3xl bg-accent/10 border border-border-light overflow-hidden flex items-center justify-center text-xl font-semibold text-accent">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            ) : (
              `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}` || "U"
            )}
          </div>
          <label className="inline-flex w-fit items-center gap-2 py-2.5 px-4 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200">
            <LucideUpload className="w-4 h-4" />
            {updateAvatar.isPending ? "Uploading..." : "Upload photo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={updateAvatar.isPending}
            />
          </label>
        </div>
      </section>

      {/* Personal information form */}
      <form
        onSubmit={handleProfileSubmit}
        className={cn(DASHBOARD_GLASS_SURFACE, "p-6 md:p-8")}
      >
        <h2 className="text-base font-semibold text-heading mb-6">
          Personal information
        </h2>
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                First name
              </label>
              <input
                type="text"
                value={profileForm.first_name}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, first_name: e.target.value })
                }
                className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors duration-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Last name
              </label>
              <input
                type="text"
                value={profileForm.last_name}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, last_name: e.target.value })
                }
                className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors duration-200"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                disabled
                value={profileForm.email}
                className="w-full cursor-not-allowed disabled:bg-white bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors duration-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, phone: e.target.value })
                }
                className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors duration-200"
              />
            </div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-border-light/50 flex justify-end">
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="py-2.5 px-5 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200 flex items-center gap-2"
          >
            {updateProfile.isPending && (
              <LucideLoader2 className="w-3 h-3 animate-spin" />
            )}
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileTab;
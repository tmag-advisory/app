import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { User, FileSignature, Stamp, Loader2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { useDoctorProfile, useUpdateDoctorProfile } from "../../api/hooks";
import { DASHBOARD_GLASS_SURFACE } from "../../components/dashboard/dashboardChrome";
import { cn } from "../../lib/utils";

const FilePreview = ({ url, label }: { url: string | null; label: string }) => {
    if (!url) return <p className="text-sm text-muted">No {label} uploaded yet</p>;
    return (
        <img
            src={url}
            alt={label}
            className="h-20 w-auto rounded-lg border border-border object-contain bg-white/5"
        />
    );
};

const FilePickerField = ({
    label,
    onChange,
    file,
}: {
    label: string;
    onChange: (f: File | undefined) => void;
    file: File | undefined;
}) => {
    const ref = useRef<HTMLInputElement>(null);
    return (
        <div>
            <label className="text-sm font-medium text-heading block mb-1.5">{label}</label>
            <button
                type="button"
                onClick={() => ref.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-muted hover:text-heading hover:border-border/80 transition-colors"
            >
                <Upload className="w-4 h-4" />
                {file ? file.name : `Choose ${label}`}
            </button>
            <input
                ref={ref}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onChange(e.target.files?.[0])}
            />
        </div>
    );
};

const DoctorProfile = () => {
    const { data: profile, isLoading } = useDoctorProfile();
    const { mutate: update, isPending } = useUpdateDoctorProfile();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [licenseNumber, setLicenseNumber] = useState("");
    const [signature, setSignature] = useState<File | undefined>();
    const [stamp, setStamp] = useState<File | undefined>();

    const updateProfileFields = useCallback(() => {
        if (profile) {
            setLicenseNumber(profile.medicalLicenseNumber ?? "");
            setLastName(profile.lastName ?? "");
            setFirstName(profile.firstName ?? "");
        }
    }, [
        profile, setFirstName, setLastName, setLicenseNumber
    ])

    useEffect(() => {
        updateProfileFields();
    }, [updateProfileFields])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
        );
    }



    const handlePersonalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!firstName.trim() && !lastName.trim()) {
            toast.error("Enter at least one name field to update");
            return;
        }
        update(
            { firstName: firstName || undefined, lastName: lastName || undefined },
            {
                onSuccess: () => {
                    toast.success("Name updated");
                    setFirstName("");
                    setLastName("");
                },
                onError: () => toast.error("Failed to update name"),
            },
        );
    };

    const handleCredentialsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!licenseNumber.trim() && !signature && !stamp) {
            toast.error("Nothing to update");
            return;
        }
        update(
            {
                medicalLicenseNumber: licenseNumber || undefined,
                signature,
                stamp,
            },
            {
                onSuccess: () => {
                    toast.success("Credentials updated");
                    setLicenseNumber("");
                    setSignature(undefined);
                    setStamp(undefined);
                },
                onError: () => toast.error("Failed to update credentials"),
            },
        );
    };


    return (
        <div className="space-y-8 max-w-2xl">
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4"
            >
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                    <User size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-serif text-heading">Doctor Profile</h1>
                    <p className="text-muted text-sm">Manage your name, credentials, signature and stamp</p>
                </div>
            </motion.div>

            {/* Personal Info */}
            <motion.form
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                onSubmit={handlePersonalSubmit}
                className={cn(DASHBOARD_GLASS_SURFACE, "p-6 space-y-5")}
            >
                <div className="flex items-center gap-3 mb-1">
                    <User className="w-4 h-4 text-accent" />
                    <h2 className="font-medium text-heading">Personal Info</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-heading block mb-1.5">First Name</label>
                        <p className="text-xs text-muted mb-2">Current: {profile?.firstName ?? "—"}</p>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="New first name"
                            className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-heading placeholder:text-muted outline-none focus:border-accent/50 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-heading block mb-1.5">Last Name</label>
                        <p className="text-xs text-muted mb-2">Current: {profile?.lastName ?? "—"}</p>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="New last name"
                            className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-heading placeholder:text-muted outline-none focus:border-accent/50 transition-colors"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors"
                >
                    {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Name
                </button>
            </motion.form>

            {/* Medical Credentials */}
            <motion.form
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onSubmit={handleCredentialsSubmit}
                className={cn(DASHBOARD_GLASS_SURFACE, "p-6 space-y-5")}
            >
                <div className="flex items-center gap-3 mb-1">
                    <FileSignature className="w-4 h-4 text-accent" />
                    <h2 className="font-medium text-heading">Medical Credentials</h2>
                </div>

                <div>
                    <label className="text-sm font-medium text-heading block mb-1.5">License Number</label>
                    <p className="text-xs text-muted mb-2">Current: {profile?.medicalLicenseNumber ?? "—"}</p>
                    <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="New license number"
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-heading placeholder:text-muted outline-none focus:border-accent/50 transition-colors"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <FileSignature className="w-4 h-4 text-muted" />
                            <span className="text-sm font-medium text-heading">Signature</span>
                        </div>
                        <FilePreview url={profile?.signatureUrl ?? null} label="signature" />
                        <FilePickerField label="New Signature" onChange={setSignature} file={signature} />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Stamp className="w-4 h-4 text-muted" />
                            <span className="text-sm font-medium text-heading">Stamp</span>
                        </div>
                        <FilePreview url={profile?.stampUrl ?? null} label="stamp" />
                        <FilePickerField label="New Stamp" onChange={setStamp} file={stamp} />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors"
                >
                    {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Credentials
                </button>
            </motion.form>
        </div>
    );
};

export default DoctorProfile;

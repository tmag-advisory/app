import { useEffect, useRef, useState, type UIEvent } from "react";
import { Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
    LucideStethoscope,
    LucideCheck,
    LucideArrowRight,
    LucideArrowLeft,
    LucideUpload,
    LucideLoader2,
    LucideScale,
    LucideFileCheck,
    LucideEye,
    LucideShieldCheck,
    LucideStar,
    LucideFileText,
    LucideCheckCircle2,
    LucideX,
    LucideFile,
    LucideImage,
    LucideFileJson,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import CountryPicker from "../../components/CountryPicker";
import { useApplyAsDoctor } from "../../api/hooks";
import {
    IMAGE_ACCEPT,
    IMAGE_OR_DOC_ACCEPT,
    validateImageFile,
    validateImageIfImage,
} from "../../lib/imageUpload";

// ─────────────────────────────────────────────────────────────
// Motion + static config
// ─────────────────────────────────────────────────────────────

const stepVariants = {
    enter: (dir: number) => ({
        x: dir > 0 ? 80 : -80,
        opacity: 0,
        scale: 0.96,
    }),
    center: {
        x: 0,
        opacity: 1,
        scale: 1,
        transition: { type: "spring" as const, stiffness: 300, damping: 30 },
    },
    exit: (dir: number) => ({
        x: dir > 0 ? -80 : 80,
        opacity: 0,
        scale: 0.96,
        transition: { duration: 0.2, ease: "easeIn" as const },
    }),
};

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, type: "spring" as const, stiffness: 300, damping: 28 },
    }),
};

const STEPS = [
    { label: "Application", icon: LucideFileText },
    { label: "Credentials", icon: LucideFileCheck },
    { label: "Declaration", icon: LucideScale },
    { label: "Review", icon: LucideEye },
] as const;

const BENEFITS = [
    {
        icon: LucideShieldCheck,
        title: "Validate Travel Plans",
        desc: "Review and approve AI-generated travel medicine recommendations with confidence.",
    },
    {
        icon: LucideStar,
        title: "Impact Global Health",
        desc: "Help travellers stay safe abroad with expert medical oversight, on your schedule.",
    },
    {
        icon: LucideFileText,
        title: "Structured Onboarding",
        desc: "Approved doctors get a guided onboarding with protocols, SLAs, and review tooling.",
    },
];

const HIGHLIGHTS = [
    "48-hour turnaround on plan reviews",
    "Flexible schedule — pick the plans you take",
    "Full onboarding before going live",
    "Practise across borders, on the platform",
];

const TERMS_SECTIONS = [
    {
        title: "Professional Responsibilities",
        content:
            "As a TMAG validating doctor, you are responsible for reviewing AI-generated travel health plans with professional medical diligence. Each plan you approve carries your professional endorsement and must meet applicable medical standards before sign-off.",
    },
    {
        title: "Validation Standards",
        content:
            "You must review each plan thoroughly, including destination-specific health risks, recommended vaccinations, prophylaxis, and traveller health profiles. Plans that contain inaccuracies or pose health risks must be rejected with clear reasoning.",
    },
    {
        title: "Turnaround Expectations",
        content:
            "Pending plans should be reviewed within 48 hours of assignment. If you anticipate delays or periods of unavailability, please update your profile accordingly so travellers are not left waiting.",
    },
    {
        title: "Signature & Stamp Usage",
        content:
            "If approved, you will complete onboarding before going live. During onboarding, you may be asked to provide signature or stamp details used for any travel health plan you approve.",
    },
    {
        title: "Confidentiality & Data Handling",
        content:
            "You will have access to traveller health information, including medical conditions, vaccination history, and risk behaviours. This information is strictly confidential and must not be shared, stored outside the platform, or used for any purpose other than plan validation. All data handling is governed by our Privacy Policy standards.",
    },
    {
        title: "Account Termination",
        content:
            "TMAG reserves the right to revoke doctor privileges at any time for professional misconduct, negligent validation, breach of confidentiality, or failure to meet validation standards. You may also voluntarily withdraw from the programme at any time by contacting support.",
    },
    {
        title: "Governing Terms",
        content:
            "This application is subject to the TMAG Terms of Service, Privacy Policy, and Medical Disclaimer. By accepting below, you confirm that you hold a valid medical licence and are authorised to practise medicine in your jurisdiction.",
    },
];

// ─────────────────────────────────────────────────────────────
// File upload field (image-only or mixed)
// ─────────────────────────────────────────────────────────────

const FileField = ({
    label,
    required,
    file,
    onChange,
    accept = IMAGE_OR_DOC_ACCEPT,
    imageOnly = false,
}: {
    label: string;
    required?: boolean;
    file: File | undefined;
    onChange: (f: File | undefined) => void;
    accept?: string;
    imageOnly?: boolean;
}) => {
    const ref = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    useEffect(() => {
        if (file && file.type.startsWith("image/")) {
            const url = URL.createObjectURL(file);
            setPreview(url);
            return () => URL.revokeObjectURL(url);
        }
        setPreview(null);
    }, [file]);

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    const isImage = file?.type.startsWith("image/");
    const isPdf = file?.type === "application/pdf";
    const isDoc =
        file?.type === "application/msword" ||
        file?.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    const fileIcon = isImage ? (
        <LucideImage className="w-5 h-5" />
    ) : isPdf ? (
        <LucideFileJson className="w-5 h-5" />
    ) : (
        <LucideFile className="w-5 h-5" />
    );

    const effectiveAccept = imageOnly ? IMAGE_ACCEPT : accept;

    const acceptFile = (f: File | undefined) => {
        if (!f) {
            onChange(undefined);
            return;
        }
        const ok = imageOnly ? validateImageFile(f) : validateImageIfImage(f);
        if (ok) onChange(f);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const dropped = e.dataTransfer.files?.[0];
        acceptFile(dropped);
    };

    if (file) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group"
            >
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    {label}{" "}
                    {required && <span className="text-red-500">*</span>}
                </label>
                <div className="relative flex items-start gap-4 p-4 rounded-2xl border-2 border-accent/30 bg-accent/5 transition-all duration-200">
                    <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-white border border-border-light/60 flex items-center justify-center">
                        {isImage && preview ? (
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="text-muted/60">{fileIcon}</div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-heading truncate">
                            {file.name}
                        </p>
                        <p className="text-xs text-muted mt-0.5">
                            {formatSize(file.size)}
                            {isImage && " · Image"}
                            {isPdf && " · PDF"}
                            {isDoc && " · Document"}
                        </p>
                        <button
                            type="button"
                            onClick={() => ref.current?.click()}
                            className="mt-2 text-xs text-accent font-medium hover:underline transition-colors"
                        >
                            Change file
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={() => onChange(undefined)}
                        className="shrink-0 w-7 h-7 rounded-full bg-white/80 border border-border-light/60 flex items-center justify-center text-muted/50 hover:text-red-500 hover:border-red-200 transition-all duration-200"
                        title="Remove"
                    >
                        <LucideX className="w-3.5 h-3.5" />
                    </button>
                </div>
                <input
                    ref={ref}
                    type="file"
                    accept={effectiveAccept}
                    className="hidden"
                    onChange={(e) => {
                        acceptFile(e.target.files?.[0]);
                        e.target.value = "";
                    }}
                />
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                {label}{" "}
                {required && <span className="text-red-500">*</span>}
            </label>
            <button
                type="button"
                onClick={() => ref.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl border-2 border-dashed text-sm transition-all duration-200 text-left cursor-pointer group
                    ${
                        isDragOver
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border-light/60 text-muted hover:border-accent/50 hover:text-heading hover:bg-accent/5"
                    }`}
            >
                <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                        isDragOver
                            ? "bg-accent/20 text-accent"
                            : "bg-button-secondary text-muted group-hover:bg-accent/10 group-hover:text-accent"
                    }`}
                >
                    <LucideUpload className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1">
                    <span className="font-medium">
                        {isDragOver ? "Drop file here" : `Upload ${label}`}
                    </span>
                    <p className="text-[11px] text-muted/60 mt-0.5">
                        {imageOnly
                            ? "JPEG or PNG up to 10MB"
                            : "JPEG, PNG, PDF, DOC up to 10MB"}
                    </p>
                </div>
            </button>
            <input
                ref={ref}
                type="file"
                accept={effectiveAccept}
                className="hidden"
                onChange={(e) => {
                    acceptFile(e.target.files?.[0]);
                    e.target.value = "";
                }}
            />
        </motion.div>
    );
};

// ─────────────────────────────────────────────────────────────
// Step progress (used inside modal)
// ─────────────────────────────────────────────────────────────

const StepProgress = ({ current }: { current: number }) => (
    <div className="mb-8 w-full">
        <div className="grid grid-cols-4 gap-2">
            {STEPS.map((step, i) => {
                const done = i < current;
                const active = i === current;
                const Icon = step.icon;
                return (
                    <div
                        key={step.label}
                        className={`flex min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold transition-colors ${
                            done
                                ? "bg-accent/10 text-accent"
                                : active
                                ? "bg-dark text-white"
                                : "bg-button-secondary text-muted"
                        }`}
                    >
                        {done ? (
                            <LucideCheck className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span className="hidden truncate sm:inline">
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border-light/50">
            <div
                className="h-full rounded-full bg-accent transition-all duration-300"
                style={{ width: `${((current + 1) / STEPS.length) * 100}%` }}
            />
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────
// Application wizard (lives inside the modal)
// ─────────────────────────────────────────────────────────────

type ApplyMutation = ReturnType<typeof useApplyAsDoctor>;

interface WizardProps {
    defaultFirstName: string;
    defaultLastName: string;
    defaultEmail: string;
    applyMutation: ApplyMutation;
    onClose: () => void;
}

const ApplicationWizard = ({
    defaultFirstName,
    defaultLastName,
    defaultEmail,
    applyMutation,
    onClose,
}: WizardProps) => {
    const { mutate: apply, isPending, isSuccess, error } = applyMutation;

    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(1);
    const [scrolledToBottom, setScrolledToBottom] = useState(false);

    const [licenseNumber, setLicenseNumber] = useState("");
    const [firstName, setFirstName] = useState(defaultFirstName);
    const [lastName, setLastName] = useState(defaultLastName);
    const [email, setEmail] = useState(defaultEmail);
    const [specialty, setSpecialty] = useState("");
    const [country, setCountry] = useState("");
    const [profilePicture, setProfilePicture] = useState<File | undefined>();
    const [signature, setSignature] = useState<File | undefined>();
    const [stamp, setStamp] = useState<File | undefined>();
    const [practicingLicense, setPracticingLicense] = useState<File | undefined>();
    const [travelMedicineCertificate, setTravelMedicineCertificate] = useState<
        File | undefined
    >();
    const [confidentialityAccepted, setConfidentialityAccepted] = useState(false);
    const [conductAccepted, setConductAccepted] = useState(false);

    const goTo = (next: number) => {
        setDirection(next > step ? 1 : -1);
        setStep(next);
    };

    const handleTermsScroll = (e: UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
            setScrolledToBottom(true);
        }
    };

    const handleAcceptTerms = () => goTo(3);

    const handleSubmit = () => {
        if (!signature) return;
        apply({
            firstName,
            lastName,
            email,
            specialty,
            country,
            medicalLicenseNumber: licenseNumber,
            profilePicture,
            signature,
            stamp,
            practicingLicense,
            travelMedicineCertificate,
            confidentialityAgreementAccepted: confidentialityAccepted,
            conductAgreementAccepted: conductAccepted,
        });
    };

    const canProceedApplication =
        firstName.trim().length > 0 &&
        lastName.trim().length > 0 &&
        email.trim().length > 0 &&
        specialty.trim().length > 0 &&
        country.trim().length > 0 &&
        licenseNumber.trim().length > 0;
    const canProceedCredentials = !!signature;
    const canProceedDeclaration =
        scrolledToBottom && confidentialityAccepted && conductAccepted;

    if (isSuccess) {
        return (
            <div className="p-6 sm:p-8 rounded-2xl border border-emerald-200 bg-emerald-50 text-center">
                <LucideCheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-2xl font-serif text-heading mb-2">
                    Application Submitted
                </h2>
                <p className="text-body text-sm mb-6">
                    TMAG admin will verify your licence, complete background
                    checks, and send the approval or decline decision by email.
                </p>
                <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 rounded-2xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors duration-200 cursor-pointer"
                >
                    Close
                </button>
            </div>
        );
    }

    return (
        <>
            <StepProgress current={step} />

            {error && (
                <div className="mb-5 px-4 py-3.5 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700">
                    {(
                        error as {
                            response?: { data?: { message?: string } };
                        }
                    )?.response?.data?.message ??
                        "Something went wrong. Please try again."}
                </div>
            )}

            <AnimatePresence mode="wait" custom={direction}>
                {step === 0 && (
                    <motion.div
                        key="application"
                        custom={direction}
                        variants={stepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                    >
                        <motion.h3
                            custom={0}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            className="text-2xl font-serif text-heading mb-2 leading-tight"
                        >
                            Application Form
                        </motion.h3>
                        <motion.p
                            custom={1}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            className="text-sm text-body mb-8"
                        >
                            Tell us who you are and where you are licensed to
                            practise.
                        </motion.p>

                        <motion.div
                            custom={2}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            className="space-y-6"
                        >
                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    className="w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-3.5 text-base text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-colors duration-200"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    className="w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-3.5 text-base text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-colors duration-200"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                    Specialty <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={specialty}
                                    onChange={(e) => setSpecialty(e.target.value)}
                                    required
                                    placeholder="e.g. Travel medicine"
                                    className="w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-3.5 text-base text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-colors duration-200"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                    Licence Number{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={licenseNumber}
                                    onChange={(e) =>
                                        setLicenseNumber(e.target.value)
                                    }
                                    required
                                    placeholder="e.g. MED-123456"
                                    className="w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-3.5 text-base text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-colors duration-200"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                    Country <span className="text-red-500">*</span>
                                </label>
                                <CountryPicker
                                    value={country}
                                    onChange={setCountry}
                                    required
                                    placeholder="Country of licence or practice"
                                    inputClassName="w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-3.5 pr-10 text-base text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-colors duration-200"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-3.5 text-base text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-colors duration-200"
                                />
                            </div>
                        </motion.div>

                        <div className="mt-8">
                            <button
                                onClick={() => goTo(1)}
                                disabled={!canProceedApplication}
                                className="w-full py-3.5 rounded-2xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                Continue
                                <LucideArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div
                        key="credentials"
                        custom={direction}
                        variants={stepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                    >
                        <motion.h3
                            custom={0}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            className="text-2xl font-serif text-heading mb-2 leading-tight"
                        >
                            Credentials
                        </motion.h3>
                        <motion.p
                            custom={1}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            className="text-sm text-body mb-8"
                        >
                            Upload the signing details used by the application
                            review workflow.
                        </motion.p>

                        <motion.div
                            custom={2}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            className="space-y-6"
                        >
                            <FileField
                                label="Profile Picture"
                                imageOnly
                                file={profilePicture}
                                onChange={setProfilePicture}
                            />
                            <FileField
                                label="Signature"
                                imageOnly
                                required
                                file={signature}
                                onChange={setSignature}
                            />
                            <FileField
                                label="Stamp / Seal"
                                imageOnly
                                file={stamp}
                                onChange={setStamp}
                            />
                            <FileField
                                label="Practicing License for the Year"
                                file={practicingLicense}
                                onChange={setPracticingLicense}
                            />
                            <FileField
                                label="Travel Medicine Recent Certificate"
                                file={travelMedicineCertificate}
                                onChange={setTravelMedicineCertificate}
                            />
                        </motion.div>

                        <div className="flex items-center gap-3 mt-8">
                            <button
                                onClick={() => goTo(0)}
                                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-button-secondary text-muted text-sm font-medium hover:text-heading transition-colors"
                            >
                                <LucideArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                            <button
                                onClick={() => goTo(2)}
                                disabled={!canProceedCredentials}
                                className="flex-1 py-3.5 rounded-2xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                Continue
                                <LucideArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="terms"
                        custom={direction}
                        variants={stepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                    >
                        <motion.h3
                            custom={0}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            className="text-2xl font-serif text-heading mb-2 leading-tight"
                        >
                            Declaration &amp; NDA
                        </motion.h3>
                        <motion.p
                            custom={1}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            className="text-sm text-body mb-6"
                        >
                            Review the confidentiality and conduct agreements
                            before submitting.
                        </motion.p>

                        <div
                            onScroll={handleTermsScroll}
                            className="max-h-[50vh] overflow-y-auto rounded-2xl border-2 border-border-light/60 bg-background-primary p-6 mb-6 space-y-5"
                        >
                            {TERMS_SECTIONS.map((section) => (
                                <div key={section.title}>
                                    <h4 className="text-sm font-semibold text-heading mb-1">
                                        {section.title}
                                    </h4>
                                    <p className="text-sm text-body leading-relaxed">
                                        {section.content}
                                    </p>
                                </div>
                            ))}
                            <p className="text-xs text-muted pt-3 border-t border-border-light/50">
                                For full details, see our{" "}
                                <a
                                    href="/terms"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-accent hover:underline"
                                >
                                    Terms of Service
                                </a>{" "}
                                and{" "}
                                <a
                                    href="/privacy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-accent hover:underline"
                                >
                                    Privacy Policy
                                </a>
                                .
                            </p>
                        </div>
                        {!scrolledToBottom && (
                            <p className="text-xs text-muted mb-4 text-center">
                                Scroll to the bottom to continue
                            </p>
                        )}

                        <div className="mb-6 space-y-3">
                            <label className="flex items-start gap-3 rounded-2xl border border-border-light/60 bg-background-primary p-4 text-sm text-body">
                                <input
                                    type="checkbox"
                                    checked={confidentialityAccepted}
                                    onChange={(e) =>
                                        setConfidentialityAccepted(
                                            e.target.checked,
                                        )
                                    }
                                    className="mt-1"
                                />
                                <span>
                                    I accept the confidentiality agreement and
                                    will protect traveller health information.
                                </span>
                            </label>
                            <label className="flex items-start gap-3 rounded-2xl border border-border-light/60 bg-background-primary p-4 text-sm text-body">
                                <input
                                    type="checkbox"
                                    checked={conductAccepted}
                                    onChange={(e) =>
                                        setConductAccepted(e.target.checked)
                                    }
                                    className="mt-1"
                                />
                                <span>
                                    I accept the conduct agreement and TMAG
                                    review protocols.
                                </span>
                            </label>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => goTo(1)}
                                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-button-secondary text-muted text-sm font-medium hover:text-heading transition-colors"
                            >
                                <LucideArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                            <button
                                onClick={handleAcceptTerms}
                                disabled={!canProceedDeclaration}
                                className="flex-1 py-3.5 rounded-2xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                Continue
                                <LucideArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="review"
                        custom={direction}
                        variants={stepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                    >
                        <motion.h3
                            custom={0}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            className="text-2xl font-serif text-heading mb-2 leading-tight"
                        >
                            Review Your Application
                        </motion.h3>
                        <motion.p
                            custom={1}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            className="text-sm text-body mb-6"
                        >
                            Confirm everything looks good before submitting.
                        </motion.p>

                        <motion.div
                            custom={2}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            className="space-y-3 mb-8"
                        >
                            <ReviewRow label="Applicant" onEdit={() => goTo(0)}>
                                <p className="text-sm text-heading font-medium">
                                    {firstName} {lastName}
                                </p>
                                <p className="text-xs text-muted">{email}</p>
                            </ReviewRow>

                            <ReviewRow
                                label="Specialty / Country"
                                onEdit={() => goTo(0)}
                            >
                                <p className="text-sm text-heading font-medium">
                                    {specialty}
                                </p>
                                <p className="text-xs text-muted">{country}</p>
                            </ReviewRow>

                            <ReviewRow
                                label="Licence Number"
                                onEdit={() => goTo(0)}
                            >
                                <p className="text-sm text-heading font-medium">
                                    {licenseNumber}
                                </p>
                            </ReviewRow>

                            <ReviewRow
                                label="Profile Picture"
                                onEdit={() => goTo(1)}
                            >
                                {profilePicture ? (
                                    <p className="text-sm text-heading font-medium truncate">
                                        {profilePicture.name}
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted italic">
                                        Not provided
                                    </p>
                                )}
                            </ReviewRow>

                            <ReviewRow label="Signature" onEdit={() => goTo(1)}>
                                <p className="text-sm text-heading font-medium truncate">
                                    {signature?.name}
                                </p>
                            </ReviewRow>

                            <ReviewRow
                                label="Stamp / Seal"
                                onEdit={() => goTo(1)}
                            >
                                {stamp ? (
                                    <p className="text-sm text-heading font-medium truncate">
                                        {stamp.name}
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted italic">
                                        Not provided
                                    </p>
                                )}
                            </ReviewRow>

                            <ReviewRow
                                label="Practicing License"
                                onEdit={() => goTo(1)}
                            >
                                {practicingLicense ? (
                                    <p className="text-sm text-heading font-medium truncate">
                                        {practicingLicense.name}
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted italic">
                                        Not provided
                                    </p>
                                )}
                            </ReviewRow>

                            <ReviewRow
                                label="Travel Medicine Certificate"
                                onEdit={() => goTo(1)}
                            >
                                {travelMedicineCertificate ? (
                                    <p className="text-sm text-heading font-medium truncate">
                                        {travelMedicineCertificate.name}
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted italic">
                                        Not provided
                                    </p>
                                )}
                            </ReviewRow>

                            <div className="flex items-center gap-3 p-4 rounded-2xl border border-border-light/60 bg-background-primary">
                                <div className="w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                                    <LucideCheck className="w-3 h-3" />
                                </div>
                                <p className="text-sm text-heading">
                                    Confidentiality agreement and conduct
                                    agreement accepted
                                </p>
                            </div>
                        </motion.div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => goTo(2)}
                                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-button-secondary text-muted text-sm font-medium hover:text-heading transition-colors"
                            >
                                <LucideArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isPending}
                                className="flex-1 py-3.5 rounded-2xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                {isPending ? (
                                    <LucideLoader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        Submit Application
                                        <LucideArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

const ReviewRow = ({
    label,
    children,
    onEdit,
}: {
    label: string;
    children: React.ReactNode;
    onEdit: () => void;
}) => (
    <div className="flex items-start justify-between p-4 rounded-2xl border border-border-light/60 bg-background-primary">
        <div className="min-w-0">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-0.5">
                {label}
            </p>
            {children}
        </div>
        <button
            type="button"
            onClick={onEdit}
            className="text-xs text-accent font-medium hover:underline shrink-0 ml-4"
        >
            Edit
        </button>
    </div>
);

// ─────────────────────────────────────────────────────────────
// Modal shell
// ─────────────────────────────────────────────────────────────

interface ModalProps {
    open: boolean;
    onClose: () => void;
    defaultFirstName: string;
    defaultLastName: string;
    defaultEmail: string;
    applyMutation: ApplyMutation;
}

const DoctorApplicationModal = ({
    open,
    onClose,
    defaultFirstName,
    defaultLastName,
    defaultEmail,
    applyMutation,
}: ModalProps) => {
    // Lock background scroll while open
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    // ESC to close
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:py-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="doctor-application-title"
                >
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-default"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.97 }}
                        transition={{
                            type: "spring",
                            stiffness: 320,
                            damping: 28,
                        }}
                        className="relative w-full max-w-2xl max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        <header className="flex items-center gap-3 px-6 sm:px-8 py-5 border-b border-border-light/60 bg-white">
                            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                                <LucideStethoscope className="w-4.5 h-4.5" />
                            </div>
                            <h2
                                id="doctor-application-title"
                                className="flex-1 text-lg font-serif text-heading"
                            >
                                Submit Your Application
                            </h2>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close"
                                className="w-9 h-9 rounded-full bg-button-secondary/60 text-muted hover:text-heading hover:bg-button-secondary flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <LucideX className="w-4 h-4" />
                            </button>
                        </header>

                        <div className="overflow-y-auto px-6 sm:px-8 py-6 flex-1">
                            <ApplicationWizard
                                defaultFirstName={defaultFirstName}
                                defaultLastName={defaultLastName}
                                defaultEmail={defaultEmail}
                                applyMutation={applyMutation}
                                onClose={onClose}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ─────────────────────────────────────────────────────────────
// Landing page (hero + left-stacked features + right CTA card)
// ─────────────────────────────────────────────────────────────

const ApplyAsDoctor = () => {
    const { user } = useAuth();
    const applyMutation = useApplyAsDoctor();
    const { isSuccess } = applyMutation;
    const [modalOpen, setModalOpen] = useState(false);

    const isDoctor = user?.extend?.role_name?.toLowerCase() === "doctor";
    if (isDoctor) return <Navigate to="/doctor" replace />;

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    return (
        <div className="min-h-screen bg-background-primary">
            <main className="pt-24 pb-20 px-4 sm:px-6 max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-16 items-start">
                    {/* Left column: hero + stacked features */}
                    <div className="space-y-10 lg:space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider mb-5">
                                <LucideStethoscope className="w-3.5 h-3.5" />
                                For Clinicians
                            </span>
                            <h1 className="text-4xl md:text-5xl font-serif text-heading mb-5 leading-tight">
                                Join TMAG as a Doctor
                            </h1>
                            <p className="text-body text-lg max-w-xl">
                                Help travellers worldwide with your medical
                                expertise. Review AI-generated travel health
                                plans and provide verified sign-off — on your
                                schedule.
                            </p>
                        </motion.div>

                        <div className="space-y-4">
                            {BENEFITS.map((b, i) => {
                                const Icon = b.icon;
                                return (
                                    <motion.div
                                        key={b.title}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            delay: 0.1 + i * 0.08,
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 28,
                                        }}
                                        className="flex items-start gap-4 p-5 rounded-2xl border border-border-light/50 bg-white"
                                    >
                                        <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-medium text-heading mb-1.5">
                                                {b.title}
                                            </h3>
                                            <p className="text-sm text-body leading-relaxed">
                                                {b.desc}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right column: sticky CTA card */}
                    <motion.aside
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12 }}
                        className="lg:sticky lg:top-24"
                    >
                        <div className="rounded-3xl border border-border-light/50 bg-white shadow-sm overflow-hidden">
                            <div className="p-7 sm:p-8 bg-gradient-to-br from-accent/5 to-transparent">
                                <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-5">
                                    <LucideStethoscope className="w-6 h-6" />
                                </div>

                                {isSuccess ? (
                                    <>
                                        <h2 className="text-xl font-serif text-heading mb-2">
                                            Application Submitted
                                        </h2>
                                        <p className="text-sm text-body mb-6">
                                            We&apos;ll verify your licence and
                                            email the decision. You can view
                                            your submission below.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={openModal}
                                            className="w-full py-3.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-sm hover:bg-emerald-100 transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <LucideCheckCircle2 className="w-4 h-4" />
                                            View Submission
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <h2 className="text-xl font-serif text-heading mb-2">
                                            Apply in minutes
                                        </h2>
                                        <p className="text-sm text-body mb-6">
                                            Tell us about your credentials,
                                            sign the declaration, and submit —
                                            all in one form.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={openModal}
                                            className="w-full py-3.5 rounded-2xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            Start Application
                                            <LucideArrowRight className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                            <div className="p-6 sm:p-7 border-t border-border-light/50 space-y-3">
                                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
                                    What to expect
                                </p>
                                {HIGHLIGHTS.map((h) => (
                                    <div
                                        key={h}
                                        className="flex items-start gap-3 text-sm text-body"
                                    >
                                        <span className="w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0.5">
                                            <LucideCheck className="w-3 h-3" />
                                        </span>
                                        <span className="leading-relaxed">
                                            {h}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.aside>
                </div>
            </main>

            <DoctorApplicationModal
                open={modalOpen}
                onClose={closeModal}
                defaultFirstName={user?.first_name ?? ""}
                defaultLastName={user?.last_name ?? ""}
                defaultEmail={user?.email ?? ""}
                applyMutation={applyMutation}
            />
        </div>
    );
};

export default ApplyAsDoctor;

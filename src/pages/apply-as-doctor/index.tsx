import { useRef, useState, type UIEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useApplyAsDoctor } from "../../api/hooks";

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
    { label: "Terms", icon: LucideScale },
    { label: "Documents", icon: LucideFileCheck },
    { label: "Review", icon: LucideEye },
] as const;

const FileField = ({
    label,
    required,
    file,
    onChange,
}: {
    label: string;
    required?: boolean;
    file: File | undefined;
    onChange: (f: File | undefined) => void;
}) => {
    const ref = useRef<HTMLInputElement>(null);
    return (
        <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <button
                type="button"
                onClick={() => ref.current?.click()}
                className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl border-2 border-border-light/60 bg-white text-base text-muted hover:text-heading hover:border-border transition-colors text-left"
            >
                <LucideUpload className="w-4 h-4 shrink-0" />
                <span className="truncate">{file ? file.name : `Upload ${label}`}</span>
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

const StepProgress = ({ current }: { current: number }) => (
    <div className="flex items-center justify-between mb-10">
        {STEPS.map((step, i) => {
            const done = i < current;
            const active = i === current;
            const Icon = step.icon;
            return (
                <div key={step.label} className="flex items-center">
                    <div
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                            done ? "bg-accent/10 text-accent"
                            : active ? "bg-dark text-white"
                            : "bg-button-secondary text-muted"
                        }`}
                    >
                        {done ?
                            <LucideCheck className="w-3.5 h-3.5" />
                        :   <Icon className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{step.label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div
                            className={`w-16 sm:w-40 md:w-48 xl:w-80 h-0.5 mx-1 ${done ? "bg-accent" : "bg-border-light/50"}`}
                        />
                    )}
                </div>
            );
        })}
    </div>
);

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
            "Your uploaded signature and stamp/seal will be applied to every travel health plan you approve. These documents become part of the official signed PDF delivered to the traveller. You are responsible for ensuring your signature and stamp are current and legible.",
    },
    {
        title: "Confidentiality & Data Handling",
        content:
            "You will have access to traveller health information, including medical conditions, vaccination history, and risk behaviours. This information is strictly confidential and must not be shared, stored outside the platform, or used for any purpose other than plan validation. All data handling is governed by our Privacy Policy and HIPAA compliance standards.",
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

const ApplyAsDoctor = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { mutate: apply, isPending, isSuccess, error } = useApplyAsDoctor();

    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(1);
    const [scrolledToBottom, setScrolledToBottom] = useState(false);

    const [licenseNumber, setLicenseNumber] = useState("");
    const [signature, setSignature] = useState<File | undefined>();
    const [stamp, setStamp] = useState<File | undefined>();

    const isDoctor = user?.extend?.role_name?.toLowerCase() === "doctor";

    if (isDoctor) return <Navigate to="/doctor" replace />;

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

    const handleAcceptTerms = () => {
        goTo(1);
    };

    const handleSubmit = () => {
        if (!signature) return;
        apply({ medicalLicenseNumber: licenseNumber, signature, stamp });
    };

    const canProceedDocs = licenseNumber.trim().length > 0 && !!signature;

    const benefits = [
        {
            icon: <LucideShieldCheck className="w-5 h-5" />,
            title: "Validate Travel Plans",
            desc: "Review and approve AI-generated travel medicine recommendations",
        },
        {
            icon: <LucideStar className="w-5 h-5" />,
            title: "Impact Global Health",
            desc: "Help travellers stay safe with expert medical oversight",
        },
        {
            icon: <LucideFileText className="w-5 h-5" />,
            title: "Sign Official Reports",
            desc: "Your signature and stamp appear on every approved plan",
        },
    ];

    return (
        <div className="min-h-screen bg-background-primary">
            <main className="pt-24 pb-20 px-4 max-w-5xl mx-auto">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/5 text-accent text-xs font-medium mb-6">
                        <LucideStethoscope className="w-3.5 h-3.5" />
                        Doctor Programme
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif text-heading mb-4 leading-tight">
                        Join TMAG as a Doctor
                    </h1>
                    <p className="text-body text-lg max-w-xl mx-auto">
                        Help travellers worldwide with your medical expertise.
                        Review generated travel health plans and provide
                        verified sign-off.
                    </p>
                </motion.div>

                {/* Benefits */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16"
                >
                    {benefits.map((b) => (
                        <div
                            key={b.title}
                            className="p-6 rounded-2xl border border-border-light/50 bg-background-primary"
                        >
                            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                                {b.icon}
                            </div>
                            <h3 className="font-medium text-heading mb-1.5">
                                {b.title}
                            </h3>
                            <p className="text-sm text-body">{b.desc}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Wizard */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14 }}
                    className="max-w-5xl mx-auto"
                >
                    {isSuccess ?
                        /* Success */
                        <div className="p-8 rounded-2xl border border-emerald-200 bg-emerald-50 text-center">
                            <LucideCheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-serif text-heading mb-2">
                                Application Submitted
                            </h2>
                            <p className="text-body text-sm">
                                Our team will review your credentials and get
                                back to you by email.
                            </p>
                        </div>
                    :   /* Wizard */
                        <div className="p-8 rounded-2xl border border-border-light/50 bg-white shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                    <LucideStethoscope className="w-4.5 h-4.5" />
                                </div>
                                <h2 className="text-lg font-serif text-heading">
                                    Submit Your Application
                                </h2>
                            </div>

                            <StepProgress current={step} />

                            {error && (
                                <div className="mb-5 px-4 py-3.5 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700">
                                    {(
                                        error as {
                                            response?: {
                                                data?: { message?: string };
                                            };
                                        }
                                    )?.response?.data?.message ??
                                        "Something went wrong. Please try again."}
                                </div>
                            )}

                            <AnimatePresence mode="wait" custom={direction}>
                                {step === 0 && (
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
                                            Doctor Programme
                                            <br />
                                            Terms &amp; Conditions
                                        </motion.h3>
                                        <motion.p
                                            custom={1}
                                            variants={fadeUp}
                                            initial="hidden"
                                            animate="visible"
                                            className="text-sm text-body mb-6"
                                        >
                                            Please review and accept before
                                            continuing.
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
                                        <button
                                            onClick={handleAcceptTerms}
                                            disabled={!scrolledToBottom}
                                            className="w-full py-3.5 rounded-2xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                                        >
                                            I Accept
                                            <LucideArrowRight className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                )}

                                {step === 1 && (
                                    <motion.div
                                        key="documents"
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
                                            Your Documents
                                        </motion.h3>
                                        <motion.p
                                            custom={1}
                                            variants={fadeUp}
                                            initial="hidden"
                                            animate="visible"
                                            className="text-sm text-body mb-8"
                                        >
                                            Provide your medical licence and
                                            upload your signature.
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
                                                    Medical License Number{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={licenseNumber}
                                                    onChange={(e) =>
                                                        setLicenseNumber(
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                    placeholder="e.g. MED-123456"
                                                    className="w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-3.5 text-base text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-colors duration-200"
                                                />
                                            </div>

                                            <FileField
                                                label="Signature"
                                                required
                                                file={signature}
                                                onChange={setSignature}
                                            />

                                            <FileField
                                                label="Stamp / Seal"
                                                file={stamp}
                                                onChange={setStamp}
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
                                                disabled={!canProceedDocs}
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
                                            Confirm everything looks good before
                                            submitting.
                                        </motion.p>

                                        <motion.div
                                            custom={2}
                                            variants={fadeUp}
                                            initial="hidden"
                                            animate="visible"
                                            className="space-y-3 mb-8"
                                        >
                                            {/* License */}
                                            <div className="flex items-start justify-between p-4 rounded-2xl border border-border-light/60 bg-background-primary">
                                                <div>
                                                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-0.5">
                                                        Medical License
                                                    </p>
                                                    <p className="text-sm text-heading font-medium">
                                                        {licenseNumber}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => goTo(1)}
                                                    className="text-xs text-accent font-medium hover:underline shrink-0 ml-4"
                                                >
                                                    Edit
                                                </button>
                                            </div>

                                            {/* Signature */}
                                            <div className="flex items-start justify-between p-4 rounded-2xl border border-border-light/60 bg-background-primary">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-0.5">
                                                        Signature
                                                    </p>
                                                    <p className="text-sm text-heading font-medium truncate">
                                                        {signature?.name}
                                                    </p>
                                                    {signature && (
                                                        <img
                                                            src={URL.createObjectURL(
                                                                signature,
                                                            )}
                                                            alt="Signature preview"
                                                            className="mt-2 h-12 w-auto rounded-lg border border-border-light bg-white object-contain"
                                                        />
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => goTo(1)}
                                                    className="text-xs text-accent font-medium hover:underline shrink-0 ml-4"
                                                >
                                                    Edit
                                                </button>
                                            </div>

                                            {/* Stamp */}
                                            <div className="flex items-start justify-between p-4 rounded-2xl border border-border-light/60 bg-background-primary">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-0.5">
                                                        Stamp / Seal
                                                    </p>
                                                    {stamp ?
                                                        <>
                                                            <p className="text-sm text-heading font-medium truncate">
                                                                {stamp.name}
                                                            </p>
                                                            <img
                                                                src={URL.createObjectURL(
                                                                    stamp,
                                                                )}
                                                                alt="Stamp preview"
                                                                className="mt-2 h-12 w-auto rounded-lg border border-border-light bg-white object-contain"
                                                            />
                                                        </>
                                                    :   <p className="text-sm text-muted italic">
                                                            Not provided
                                                        </p>
                                                    }
                                                </div>
                                                <button
                                                    onClick={() => goTo(1)}
                                                    className="text-xs text-accent font-medium hover:underline shrink-0 ml-4"
                                                >
                                                    Edit
                                                </button>
                                            </div>

                                            {/* Terms */}
                                            <div className="flex items-center gap-3 p-4 rounded-2xl border border-border-light/60 bg-background-primary">
                                                <div className="w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                                                    <LucideCheck className="w-3 h-3" />
                                                </div>
                                                <p className="text-sm text-heading">
                                                    Terms &amp; conditions
                                                    accepted
                                                </p>
                                            </div>
                                        </motion.div>

                                        {!isAuthenticated && (
                                            <div className="mb-5 px-4 py-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-700">
                                                You'll need an account to submit
                                                your application.
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => goTo(1)}
                                                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-button-secondary text-muted text-sm font-medium hover:text-heading transition-colors"
                                            >
                                                <LucideArrowLeft className="w-4 h-4" />
                                                Back
                                            </button>
                                            {isAuthenticated ?
                                                <button
                                                    onClick={handleSubmit}
                                                    disabled={isPending}
                                                    className="flex-1 py-3.5 rounded-2xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
                                                >
                                                    {isPending ?
                                                        <LucideLoader2 className="w-4 h-4 animate-spin" />
                                                    :   <>
                                                            Submit Application
                                                            <LucideArrowRight className="w-4 h-4" />
                                                        </>
                                                    }
                                                </button>
                                            :   <div className="flex-1 flex items-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            navigate(
                                                                "/login?redirect=/apply-as-doctor",
                                                            )
                                                        }
                                                        className="flex-1 py-3.5 rounded-2xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-all duration-200 flex items-center justify-center gap-2"
                                                    >
                                                        Sign in to Submit
                                                        <LucideArrowRight className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            navigate(
                                                                "/register?redirect=/apply-as-doctor",
                                                            )
                                                        }
                                                        className="px-5 py-3 rounded-2xl bg-button-secondary text-muted text-sm font-medium hover:text-heading transition-colors"
                                                    >
                                                        Register
                                                    </button>
                                                </div>
                                            }
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    }
                </motion.div>
            </main>
        </div>
    );
};

export default ApplyAsDoctor;

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    LucideCheck,
    LucideArrowRight,
    LucideArrowLeft,
    LucideCreditCard,
    LucideLoader2,
    LucidePlus,
    LucideX,
    LucideUsers,
    LucideUpload,
    LucideFileText,
    LucideDownload,
    LucideArmchair,
    LucideShieldCheck,
} from "lucide-react";
import Button from "../../components/ui/Button";
import {
    useSubmitCompanyOnboarding,
    useInitiateOnboardingPayment,
    useSeatOnboardingQuote,
} from "../../api/hooks";
import type { TeamMember, PlatformEmployee, CompanyOnboardingResponse } from "../../api/types";
import { useCurrencyStore } from "../../stores/currencyStore";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../../components/sections/Navbar";
import { getAffiliateReferralCode, getStoredAffiliateDiscountRate, refreshAffiliateDiscount } from "../../lib/affiliateTracking";

const steps = [
    { id: 1, title: "Seats", icon: <LucideArmchair className="w-4 h-4" /> },
    { id: 2, title: "Team", icon: <LucideUsers className="w-4 h-4" /> },
    { id: 3, title: "Review", icon: <LucideCheck className="w-4 h-4" /> },
    { id: 4, title: "Payment", icon: <LucideCreditCard className="w-4 h-4" /> },
];

const industries = [
    "Technology", "Finance & Banking", "Healthcare", "Oil & Gas", "Manufacturing",
    "Consulting", "Education", "Government", "Logistics & Transportation", "Other",
];

const MSA_DOC_URL = "/docs/TMAG-MSA.pdf";
const employeesCsvSample = "firstName,lastName,email\nJane,Doe,jane@example.com\nJohn,Smith,john@example.com\n";

const TIER_LABELS: Record<string, string> = {
    TIER_1: "Tier 1 · 1–49 seats",
    TIER_2: "Tier 2 · 50–199 seats",
    TIER_3: "Tier 3 · 200–499 seats",
    TIER_4: "Tier 4 · 500+ seats",
};

const parseEmployeesCsv = (csv: string): PlatformEmployee[] => {
    const rows = csv.split(/\r?\n/).map((row) => row.trim()).filter(Boolean);
    if (rows.length === 0) return [];
    const headers = rows[0].toLowerCase().split(",").map((h) => h.trim());
    const hasHeader = headers.some((column) => ["firstname", "first_name", "name", "email"].includes(column));
    return rows.slice(hasHeader ? 1 : 0).map((row, index) => {
        const cols = row.split(",").map((value) => value.trim());
        let firstName = "", lastName = "", email = "";
        if (cols.length >= 3) {
            firstName = cols[0]; lastName = cols[1]; email = cols[2];
        } else {
            const [rawName = "", rawEmail = ""] = cols;
            const nameParts = rawName.split(/\s+/);
            firstName = nameParts[0] || ""; lastName = nameParts.slice(1).join(" ") || ""; email = rawEmail;
        }
        if (!firstName || !email) {
            throw new Error(`Row ${index + (hasHeader ? 2 : 1)} must include first name and email.`);
        }
        return { email, firstName, lastName };
    });
};

// ── Shared styles (brand: warm bg, teal accent, gold, serif headings) ──
const field =
    "w-full rounded-xl border border-border-light bg-background-primary px-4 py-3 text-sm text-heading placeholder:text-muted/60 outline-none transition-colors focus:border-accent focus:ring-4 focus:ring-accent/10";
const compactField =
    "rounded-xl border border-border-light bg-background-primary px-3.5 py-2.5 text-sm text-heading placeholder:text-muted/60 outline-none transition-colors focus:border-accent focus:ring-4 focus:ring-accent/10";
const panel = "rounded-2xl border border-border-light/70 bg-white/70 backdrop-blur-sm p-6 shadow-[0_1px_3px_rgba(10,20,18,0.04)]";
const ghostBtn =
    "inline-flex items-center gap-1.5 rounded-xl border border-border-light bg-white px-3.5 py-2 text-xs font-semibold text-heading transition-colors hover:border-accent hover:text-accent";
const solidBtn =
    "inline-flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent/90";
const removeBtn =
    "flex items-center justify-center rounded-xl border border-border-light px-3 text-muted transition-colors hover:border-red-300 hover:text-red-500";

const SectionTitle = ({ eyebrow, title, hint }: { eyebrow: string; title: string; hint?: string }) => (
    <div className="mb-5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{eyebrow}</span>
        <h3 className="text-lg font-serif text-heading mt-1">{title}</h3>
        {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
);

const CompanyOnboarding = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [onboardingResult, setOnboardingResult] = useState<CompanyOnboardingResponse | null>(null);

    // Step 1 — seat count can be pre-filled from /pricing via ?seats=N
    const [searchParams] = useSearchParams();
    const initialSeats = (() => {
        const raw = searchParams.get("seats");
        const n = raw ? parseInt(raw, 10) : NaN;
        return Number.isFinite(n) && n > 0 ? String(n) : "10";
    })();
    const [seatCount, setSeatCount] = useState<string>(initialSeats);
    const [billingCurrency, setBillingCurrency] = useState("USD");
    const [affiliateDiscountRate, setAffiliateDiscountRate] = useState(getStoredAffiliateDiscountRate);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    // Step 2
    const [companyName, setCompanyName] = useState("");
    const [industry, setIndustry] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [website, setWebsite] = useState("");
    const [admins, setAdmins] = useState<TeamMember[]>([{ firstName: "", lastName: "", email: "", role: "admin" }]);
    const [employees, setEmployees] = useState<PlatformEmployee[]>([]);
    const [employeesCsv, setEmployeesCsv] = useState<File | null>(null);
    const [employeesCsvError, setEmployeesCsvError] = useState("");
    const [msaDocument, setMsaDocument] = useState<File | null>(null);

    const submitOnboarding = useSubmitCompanyOnboarding();
    const initiatePayment = useInitiateOnboardingPayment();
    const { selectedCurrency } = useCurrencyStore();

    const numericSeatCount = seatCount === "" ? 0 : Math.max(0, Math.floor(Number(seatCount)));
    const { data: quote, isLoading: quoteLoading } = useSeatOnboardingQuote(numericSeatCount, billingCurrency);

    useEffect(() => { setBillingCurrency(selectedCurrency || "USD"); }, [selectedCurrency]);

    useEffect(() => {
        let cancelled = false;
        void refreshAffiliateDiscount()
            .then((discount) => { if (!cancelled && discount?.active) setAffiliateDiscountRate(Number(discount.discount_rate)); })
            .catch(() => undefined);
        return () => { cancelled = true; };
    }, []);

    const currencySymbol = quote?.currencySymbol ?? (billingCurrency === "NGN" ? "₦" : "$");
    const includedPlans = quote?.includedPlansPerSeat ?? 4;

    const validAdmins = useMemo(() => admins.filter((a) => a.firstName.trim() && a.email.trim()), [admins]);
    const validEmployees = useMemo(() => employees.filter((e) => e.email.trim()), [employees]);
    const totalPeople = validAdmins.length + validEmployees.length;

    const canProceedStep1 = numericSeatCount >= 1;
    const seatsCoverTeam = numericSeatCount >= totalPeople;
    const canProceedStep2 = companyName.trim() && contactEmail.trim() && validAdmins.length >= 1 && seatsCoverTeam;

    const goToStep = (step: number) => { setDirection(step > currentStep ? 1 : -1); setCurrentStep(step); };

    const addAdmin = () => setAdmins([...admins, { firstName: "", lastName: "", email: "", role: "hr" }]);
    const removeAdmin = (i: number) => setAdmins(admins.filter((_, idx) => idx !== i));
    const updateAdmin = (i: number, f: keyof TeamMember, v: string) => setAdmins(admins.map((a, idx) => (idx === i ? { ...a, [f]: v } : a)));

    const addEmployee = () => setEmployees([...employees, { email: "", firstName: "", lastName: "" }]);
    const removeEmployee = (i: number) => setEmployees(employees.filter((_, idx) => idx !== i));
    const updateEmployee = (i: number, f: keyof PlatformEmployee, v: string) => setEmployees(employees.map((e, idx) => (idx === i ? { ...e, [f]: v } : e)));

    const handleEmployeesCsvUpload = async (file: File | null) => {
        setEmployeesCsvError("");
        if (!file) return;
        if (!file.name.toLowerCase().endsWith(".csv")) {
            setEmployeesCsv(null); setEmployeesCsvError("Please upload a CSV file."); return;
        }
        try {
            const imported = parseEmployeesCsv(await file.text());
            if (imported.length === 0) { setEmployeesCsvError("The CSV did not include any employees."); return; }
            const hasOnlyEmpty = employees.length === 0 || (employees.length === 1 && !employees[0].email.trim());
            setEmployees(hasOnlyEmpty ? imported : [...employees.filter((e) => e.email.trim()), ...imported]);
            setEmployeesCsv(file);
            toast.success(`${imported.length} employee${imported.length === 1 ? "" : "s"} imported from CSV`);
        } catch (err) {
            setEmployeesCsv(null);
            setEmployeesCsvError(err instanceof Error ? err.message : "Failed to read CSV file.");
        }
    };

    const downloadCsvSample = () => {
        const blob = new Blob([employeesCsvSample], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "tmag-employees-template.csv"; a.click();
        URL.revokeObjectURL(url);
    };

    const handleSubmit = async () => {
        if (!seatsCoverTeam) { toast.error("Seat count must cover everyone you've added."); return; }
        setSubmitting(true);
        try {
            const result = await submitOnboarding.mutateAsync({
                companyName, industry, contactEmail, contactPhone, website, billingCurrency,
                billingModel: "SEAT",
                seatCount: numericSeatCount,
                selectedPlanCode: "PREMIUM",
                sampleRequest: "",
                teamMembers: validAdmins,
                teamMembersCsv: employeesCsv,
                msaDocument,
                platformEmployees: validEmployees,
                affiliate_referral_code: affiliateDiscountRate > 0 ? getAffiliateReferralCode() : undefined,
            });
            setOnboardingResult(result);
            goToStep(4);
        } catch (err) {
            console.error("Submit failed:", err);
            toast.error("Failed to submit. Please check your inputs and try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handlePay = async () => {
        if (!onboardingResult) return;
        try {
            const payment = await initiatePayment.mutateAsync(onboardingResult.id);
            window.location.href = payment.paymentLink;
        } catch (err) {
            console.error("Payment initiation failed:", err);
            toast.error("Failed to initiate payment. Please try again.");
        }
    };

    const slide = {
        enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
    };

    const fmt = (n: number | undefined) => (n ?? 0).toLocaleString();

    // ── Live order summary (sticky sidebar, steps 1–3) ──
    const OrderSummary = () => (
        <div className={`${panel} lg:sticky lg:top-24`}>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Your order</span>
            <h3 className="text-lg font-serif text-heading mt-1 mb-5">Annual subscription</h3>

            {quoteLoading && numericSeatCount > 0 ? (
                <div className="flex items-center gap-2 text-sm text-muted py-6">
                    <LucideLoader2 className="h-4 w-4 animate-spin" /> Calculating…
                </div>
            ) : quote && numericSeatCount > 0 ? (
                <>
                    <span className="inline-block text-[11px] font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-full mb-4">
                        {TIER_LABELS[quote.tier] ?? quote.tier}
                    </span>
                    <dl className="space-y-2.5 text-sm">
                        <div className="flex justify-between"><dt className="text-muted">Seats</dt><dd className="font-semibold text-heading">{numericSeatCount}</dd></div>
                        <div className="flex justify-between"><dt className="text-muted">Per seat / year</dt><dd className="font-semibold text-heading">{currencySymbol}{fmt(quote.pricePerSeat)}</dd></div>
                        <div className="flex justify-between"><dt className="text-muted">Plans / seat</dt><dd className="font-semibold text-heading">{includedPlans} / year</dd></div>
                        {totalPeople > 0 && (
                            <div className="flex justify-between"><dt className="text-muted">People added</dt><dd className={`font-semibold ${seatsCoverTeam ? "text-heading" : "text-red-500"}`}>{totalPeople}</dd></div>
                        )}
                    </dl>
                    <div className="flex items-baseline justify-between border-t border-border-light/70 mt-4 pt-4">
                        <span className="text-sm font-semibold text-heading">Total / year</span>
                        <span className="text-3xl font-serif text-heading">{currencySymbol}{fmt(quote.totalAnnualAmount)}</span>
                    </div>
                </>
            ) : (
                <p className="text-sm text-muted py-6">Enter a seat count to see your annual price.</p>
            )}

            <ul className="space-y-2 mt-6 pt-5 border-t border-border-light/70">
                {[`${includedPlans} travel plans per seat / year`, "CSV employee onboarding"].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-body">
                        <LucideCheck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-accent" />{f}
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <main className="min-h-screen bg-background-primary">
            <Navbar />
            <Toaster position="top-center" />

            {/* Hero band */}
            <div className="border-b border-border-light/60">
                <div className="max-w-6xl mx-auto px-6 pt-28 pb-10 text-center">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">Company onboarding</span>
                    <h1 className="font-serif text-4xl md:text-5xl text-heading mt-3 leading-[1.05]">
                        Cover your team in <span className="italic">minutes</span>.
                    </h1>
                    <p className="mx-auto mt-4 max-w-md text-sm text-body">
                        Buy a seat per traveller each includes {includedPlans} travel plans a year. Pick seats,
                        add your roster, pay once.
                    </p>

                    {/* Stepper */}
                    <div className="mt-9 flex items-center justify-center gap-1.5 sm:gap-3">
                        {steps.map((step, i) => {
                            const active = step.id === currentStep;
                            const done = step.id < currentStep;
                            return (
                                <div key={step.id} className="flex items-center gap-1.5 sm:gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition-colors ${active ? "border-accent bg-accent text-white shadow-sm"
                                            : done ? "border-accent/40 bg-accent/10 text-accent"
                                                : "border-border-light bg-white text-muted"
                                            }`}>
                                            {done ? <LucideCheck className="h-4 w-4" /> : step.icon}
                                        </span>
                                        <span className={`hidden text-xs font-semibold sm:block ${active ? "text-heading" : "text-muted"}`}>{step.title}</span>
                                    </div>
                                    {i < steps.length - 1 && <span className={`h-px w-5 sm:w-8 ${done ? "bg-accent/40" : "bg-border-light"}`} />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className={`max-w-6xl mx-auto px-6 py-10 ${currentStep === 4 ? "" : "grid lg:grid-cols-[1fr_340px] gap-8 items-start"}`}>
                <div className="min-w-0">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div key={currentStep} custom={direction} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }}>

                            {/* ── Step 1 ── */}
                            {currentStep === 1 && (
                                <div className="space-y-5">
                                    <div className={panel}>
                                        <SectionTitle eyebrow="Step 1" title="How many seats do you need?" hint={`Each seat covers one employee and includes ${includedPlans} travel plans per year.`} />
                                        <input type="number" min={1} value={seatCount} onChange={(e) => setSeatCount(e.target.value)} className={`${field} text-lg font-semibold`} placeholder="e.g. 25" />
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {[10, 25, 50, 100, 250].map((n) => (
                                                <button key={n} type="button" onClick={() => setSeatCount(String(n))}
                                                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${numericSeatCount === n ? "border-accent bg-accent/10 text-accent" : "border-border-light text-muted hover:border-accent/50"}`}>
                                                    {n}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="mt-6">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Currency</p>
                                            <div className="flex gap-2">
                                                {["USD", "NGN"].map((c) => (
                                                    <button key={c} type="button" onClick={() => setBillingCurrency(c)}
                                                        className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${billingCurrency === c ? "border-accent bg-accent/10 text-accent" : "border-border-light text-muted hover:border-accent/50"}`}>
                                                        {c === "NGN" ? "₦ NGN" : "$ USD"}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-6 rounded-xl border border-accent/20 bg-accent/5 p-4">
                                            <p className="text-sm font-semibold text-heading flex items-center gap-2">
                                                <LucideShieldCheck className="w-4 h-4 text-accent" /> Premium reports for every traveller
                                            </p>
                                            <p className="mt-1 text-xs text-muted">
                                                All company travel plans are Premium physician-reviewed, with a doctor reviewed, with summary included at no extra cost.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Terms acceptance — required before adding company details */}
                                    <label className="flex items-start gap-3 cursor-pointer group rounded-2xl border border-border-light/70 bg-white/70 backdrop-blur-sm px-4 py-3.5 transition-colors hover:border-accent/40">
                                        <span className="relative mt-0.5 shrink-0">
                                            <input type="checkbox" className="sr-only" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
                                            <span className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors ${acceptedTerms ? "border-accent bg-accent" : "border-border-light bg-white group-hover:border-muted/50"}`}>
                                                {acceptedTerms && <LucideCheck className="h-3 w-3 text-white" />}
                                            </span>
                                        </span>
                                        <span className="text-sm text-body leading-relaxed">
                                            I have read and accept TMAG's{" "}
                                            <a href="/terms" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="font-semibold text-accent underline underline-offset-2 hover:opacity-80">
                                                Terms and Conditions
                                            </a>
                                            .
                                        </span>
                                    </label>

                                    <div className="flex justify-end">
                                        <Button
                                            icon={<LucideArrowRight className="ml-1 h-4 w-4" />}
                                            variant="secondary" disabled={!canProceedStep1} onClick={() => {
                                                if (!acceptedTerms) { toast.error("Please accept the Terms and Conditions to continue."); return; }
                                                goToStep(2);
                                            }}>
                                            Continue
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* ── Step 2 ── */}
                            {currentStep === 2 && (
                                <div className="space-y-5">
                                    <div className={panel}>
                                        <SectionTitle eyebrow="Step 2" title="Company details" />
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <input className={field} placeholder="Company name *" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                                            <select className={`${field} cursor-pointer`} value={industry} onChange={(e) => setIndustry(e.target.value)}>
                                                <option value="">Select industry</option>
                                                {industries.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                                            </select>
                                            <input className={field} placeholder="Contact email *" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                                            <input className={field} placeholder="Contact phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                                            <input className={`${field} sm:col-span-2`} placeholder="Website" value={website} onChange={(e) => setWebsite(e.target.value)} />
                                        </div>
                                    </div>

                                    <div className={panel}>
                                        <div className="flex items-center justify-between mb-4">
                                            <SectionTitle eyebrow="Admins" title="Account admins" hint="They manage seats & employees. Each admin uses a seat." />
                                            <button type="button" onClick={addAdmin} className={ghostBtn}><LucidePlus className="h-3.5 w-3.5" /> Add</button>
                                        </div>
                                        <div className="space-y-3">
                                            {admins.map((a, i) => (
                                                <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_1.4fr_auto]">
                                                    <input className={compactField} placeholder="First name *" value={a.firstName} onChange={(e) => updateAdmin(i, "firstName", e.target.value)} />
                                                    <input className={compactField} placeholder="Last name" value={a.lastName} onChange={(e) => updateAdmin(i, "lastName", e.target.value)} />
                                                    <input className={compactField} placeholder="Email *" type="email" value={a.email} onChange={(e) => updateAdmin(i, "email", e.target.value)} />
                                                    {admins.length > 1 && <button type="button" onClick={() => removeAdmin(i)} className={removeBtn}><LucideX className="h-4 w-4" /></button>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={panel}>
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                                            <SectionTitle eyebrow="Travellers" title="Employees" hint="Add the people who get travel plans, or upload a CSV." />
                                            <div className="flex gap-2">
                                                <button type="button" onClick={downloadCsvSample} className={ghostBtn}><LucideDownload className="h-3.5 w-3.5" /> Template</button>
                                                <label className={`${solidBtn} cursor-pointer`}>
                                                    <LucideUpload className="h-3.5 w-3.5" /> Upload CSV
                                                    <input type="file" accept=".csv" className="hidden" onChange={(e) => void handleEmployeesCsvUpload(e.target.files?.[0] ?? null)} />
                                                </label>
                                                <button type="button" onClick={addEmployee} className={ghostBtn}><LucidePlus className="h-3.5 w-3.5" /> Add</button>
                                            </div>
                                        </div>
                                        {employeesCsvError && <p className="mb-2 text-xs text-red-500">{employeesCsvError}</p>}
                                        {employeesCsv && <p className="mb-2 text-xs text-emerald-600 flex items-center gap-1"><LucideCheck className="w-3.5 h-3.5" /> {employeesCsv.name}</p>}
                                        {employees.length === 0 ? (
                                            <p className="rounded-xl border border-dashed border-border-light p-5 text-center text-xs text-muted">
                                                No employees yet. Upload a CSV or add them manually.
                                            </p>
                                        ) : (
                                            <div className="space-y-3">
                                                {employees.map((e, i) => (
                                                    <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_1.4fr_auto]">
                                                        <input className={compactField} placeholder="First name" value={e.firstName} onChange={(ev) => updateEmployee(i, "firstName", ev.target.value)} />
                                                        <input className={compactField} placeholder="Last name" value={e.lastName} onChange={(ev) => updateEmployee(i, "lastName", ev.target.value)} />
                                                        <input className={compactField} placeholder="Email *" type="email" value={e.email} onChange={(ev) => updateEmployee(i, "email", ev.target.value)} />
                                                        <button type="button" onClick={() => removeEmployee(i)} className={removeBtn}><LucideX className="h-4 w-4" /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className={panel}>
                                        <SectionTitle eyebrow="Documentation" title="MSA & company docs" hint="Download our Master Service Agreement, sign it, and upload the completed copy." />
                                        <div className="flex flex-wrap items-center gap-3">
                                            <a href={MSA_DOC_URL} download className={ghostBtn}><LucideFileText className="h-3.5 w-3.5" /> Download MSA</a>
                                            <label className={`${solidBtn} cursor-pointer`}>
                                                <LucideUpload className="h-3.5 w-3.5" /> Upload signed MSA
                                                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setMsaDocument(e.target.files?.[0] ?? null)} />
                                            </label>
                                            {msaDocument && <span className="text-xs text-emerald-600 flex items-center gap-1"><LucideCheck className="w-3.5 h-3.5" /> {msaDocument.name}</span>}
                                        </div>
                                    </div>

                                    {!seatsCoverTeam && (
                                        <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-center text-xs font-semibold text-red-600">
                                            You've added {totalPeople} people but only have {numericSeatCount} seats. Increase seats in step 1 or remove people.
                                        </p>
                                    )}

                                    <div className="flex justify-between">
                                        <Button icon={<LucideArrowLeft className="mr-1 h-4 w-4" />} variant="secondary" onClick={() => goToStep(1)}> Back</Button>
                                        <Button variant="primary" disabled={!canProceedStep2} onClick={() => goToStep(3)}>Review </Button>
                                    </div>
                                </div>
                            )}

                            {/* ── Step 3 ── */}
                            {currentStep === 3 && (
                                <div className="space-y-5">
                                    <div className={panel}>
                                        <SectionTitle eyebrow="Step 3" title="Review & confirm" />
                                        <dl className="divide-y divide-border-light/60 text-sm">
                                            {[
                                                ["Company", companyName],
                                                ["Industry", industry || "—"],
                                                ["Contact", contactEmail],
                                                ["Seats", String(numericSeatCount)],
                                                ["Report level", "Premium"],
                                                ["Admins", String(validAdmins.length)],
                                                ["Employees", String(validEmployees.length)],
                                                ["Employee CSV", employeesCsv ? employeesCsv.name : "—"],
                                                ["Signed MSA", msaDocument ? msaDocument.name : "Not attached"],
                                            ].map(([k, v]) => (
                                                <div key={k} className="flex items-center justify-between gap-4 py-2.5">
                                                    <dt className="text-muted">{k}</dt>
                                                    <dd className="font-semibold text-heading text-right truncate max-w-[60%]">{v}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                        <p className="mt-4 flex items-start gap-2 text-xs text-muted">
                                            <LucideShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
                                            Billed once for the year. Your subscription renews manually after 12 months and every seat's plans reset.
                                        </p>
                                    </div>

                                    <div className="flex justify-between">
                                        <Button icon={<LucideArrowLeft className="mr-1 h-4 w-4" />} variant="secondary" onClick={() => goToStep(2)}> Back</Button>
                                        <Button variant="primary" disabled={submitting} onClick={handleSubmit}>
                                            {submitting ? <><LucideLoader2 className="mr-1 h-4 w-4 animate-spin" /> Submitting…</> : <>Submit & pay </>}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* ── Step 4 ── */}
                            {currentStep === 4 && onboardingResult && (
                                <div className="max-w-md mx-auto">
                                    <div className={`${panel} text-center`}>
                                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                            <LucideCheck className="h-7 w-7" />
                                        </div>
                                        <h3 className="text-xl font-serif text-heading">Request submitted</h3>
                                        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                                            Complete your annual payment to activate <strong>{onboardingResult.companyName}</strong>.
                                            Our team then reviews and provisions your seats.
                                        </p>
                                        <div className="mx-auto mt-6 rounded-2xl bg-background-secondary/70 border border-border-light/60 p-5">
                                            <div className="flex items-baseline justify-between">
                                                <span className="text-sm text-muted">Total / year</span>
                                                <span className="text-3xl font-serif text-heading">{currencySymbol}{fmt(quote?.totalAnnualAmount ?? onboardingResult.paymentAmount)}</span>
                                            </div>
                                            <div className="flex items-baseline justify-between mt-1">
                                                <span className="text-xs text-muted">Seats</span>
                                                <span className="text-xs font-semibold text-heading">{numericSeatCount} · {includedPlans} plans each</span>
                                            </div>
                                        </div>
                                        <button onClick={handlePay} disabled={initiatePayment.isPending}
                                            className="mx-auto mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:opacity-50">
                                            {initiatePayment.isPending ? <><LucideLoader2 className="h-4 w-4 animate-spin" /> Redirecting…</> : <><LucideCreditCard className="h-4 w-4" /> Proceed to payment</>}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {currentStep !== 4 && <OrderSummary />}
            </div>
        </main>
    );
};

export default CompanyOnboarding;

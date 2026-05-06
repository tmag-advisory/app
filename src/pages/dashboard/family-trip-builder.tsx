import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import familyTripApi from "../../api/familyTrip";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import { DashboardAmbientBackground } from "../../components/dashboard/dashboardChrome";
import type {
    FamilyTripRequest,
    FamilyTripMemberRequest,
    FamilyTripPreviewResponse,
} from "../../api/types";
import toast from "react-hot-toast";
import {
    LucidePlus,
    LucideTrash,
    LucideSave,
    LucideCheckCircle,
    LucideChevronDown,
    LucideArrowRight,
    LucideArrowLeft,
} from "lucide-react";
import Button from "../../components/ui/Button";

type BuilderStep = "members" | "health" | "review";

interface MemberHealth {
    sex: string;
    pregnancyStatus: string;
    chronicConditions: string[];
    currentMedications: string;
    allergies: string;
    vaccinationHistory: string;
    immuneCompromised: string;
    mobilityLimitations: string[];
    recentIllnesses: string;
    priorTravelHealthIssues: string;
}

function defaultHealth(): MemberHealth {
    return {
        sex: "",
        pregnancyStatus: "N/A",
        chronicConditions: [],
        currentMedications: "",
        allergies: "",
        vaccinationHistory: "",
        immuneCompromised: "no",
        mobilityLimitations: [],
        recentIllnesses: "",
        priorTravelHealthIssues: "",
    };
}

const CHRONIC_OPTIONS = [
    "Diabetes",
    "Hypertension",
    "Asthma / COPD",
    "Heart disease",
    "Kidney disease",
    "Liver disease",
    "Cancer",
    "HIV / Immunodeficiency",
    "Thyroid disorder",
    "Epilepsy / Seizure disorder",
    "None",
];

const MOBILITY_OPTIONS = [
    "Uses wheelchair",
    "Uses walking aid",
    "Limited walking distance",
    "None",
];

function getAgeFromDob(dob: string): number | null {
    if (!dob) return null;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return isNaN(age) ? null : age;
}

export default function FamilyTripBuilder() {
    const navigate = useNavigate();
    const [step, setStep] = useState<BuilderStep>("members");
    const [expandedMember, setExpandedMember] = useState<number | null>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [previewData, setPreviewData] = useState<FamilyTripPreviewResponse | null>(null);

    const [request, setRequest] = useState<FamilyTripRequest>({
        packageType: "STANDARD",
        destination: "",
        country: "",
        duration: 7,
        purpose: "LEISURE",
        tripType: "RETURN",
        members: [
            {
                relationship: "SPOUSE",
                firstName: "",
                lastName: "",
                dateOfBirth: "",
                memberEmail: "",
            },
        ],
    });

    const [healthData, setHealthData] = useState<MemberHealth[]>([defaultHealth()]);

    // Load draft if exists
    useEffect(() => {
        familyTripApi
            .getLatestDraft()
            .then((res: any) => {
                if (res.data.data) {
                    const draft = res.data.data;
                    const members = draft.members.map((m: any) => ({
                        relationship: m.relationship,
                        firstName: m.firstName,
                        lastName: m.lastName,
                        memberEmail: m.memberEmail || "",
                        dateOfBirth: m.dateOfBirth || "",
                    }));
                    setRequest({
                        packageType: "STANDARD",
                        destination: draft.destination,
                        country: draft.country,
                        duration: draft.duration,
                        purpose: draft.purpose,
                        tripType: draft.tripType,
                        members,
                    });
                    setHealthData(members.map(() => defaultHealth()));
                }
            })
            .catch(() => {});
    }, []);

    // Keep healthData length in sync with members length
    const syncHealthData = (memberCount: number) => {
        setHealthData((prev) => {
            const next = [...prev];
            while (next.length < memberCount) next.push(defaultHealth());
            return next.slice(0, memberCount);
        });
    };

    const handleMemberChange = (index: number, field: keyof FamilyTripMemberRequest, value: string) => {
        const newMembers = [...request.members];
        newMembers[index] = { ...newMembers[index], [field]: value };
        setRequest({ ...request, members: newMembers });
    };

    const addMember = () => {
        const newCount = request.members.length + 1;
        setRequest({
            ...request,
            members: [
                ...request.members,
                { relationship: "CHILD", firstName: "", lastName: "", dateOfBirth: "", memberEmail: "" },
            ],
        });
        syncHealthData(newCount);
    };

    const removeMember = (index: number) => {
        const newMembers = [...request.members];
        newMembers.splice(index, 1);
        setRequest({ ...request, members: newMembers });
        const newHealth = [...healthData];
        newHealth.splice(index, 1);
        setHealthData(newHealth);
    };

    const updateHealth = (index: number, field: keyof MemberHealth, value: string | string[]) => {
        setHealthData((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const toggleCheckbox = (index: number, field: "chronicConditions" | "mobilityLimitations", option: string) => {
        const current: string[] = healthData[index][field] as string[];
        const updated = current.includes(option) ? current.filter((v) => v !== option) : [...current, option];
        updateHealth(index, field, updated);
    };

    const buildRequestWithHealth = (): FamilyTripRequest => ({
        ...request,
        members: request.members.map((m, i) => ({
            ...m,
            questionnaireResponses: JSON.stringify(healthData[i] ?? defaultHealth()),
        })),
    });

    const handlePreview = async () => {
        setIsPreviewing(true);
        try {
            const res = await familyTripApi.preview(request);
            setPreviewData(res.data.data);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to generate preview");
        } finally {
            setIsPreviewing(false);
        }
    };

    const handleSaveDraft = async () => {
        setIsSubmitting(true);
        try {
            await familyTripApi.saveDraft(buildRequestWithHealth());
            toast.success("Draft saved");
        } catch {
            toast.error("Failed to save draft");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const draftRes = await familyTripApi.saveDraft(buildRequestWithHealth());
            const tripId = draftRes.data.data.id;
            toast.success("Family trip created! Access codes sent to members.");
            navigate(`/dashboard/family-trip/${tripId}`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to create family trip");
        } finally {
            setIsSubmitting(false);
        }
    };

    const memberLabel = (m: FamilyTripMemberRequest, i: number) =>
        m.firstName ? `${m.firstName} ${m.lastName}`.trim() : `Member ${i + 1}`;

    const stepIndicator = (
        <div className="flex items-center gap-2 mb-8">
            {(["members", "health", "review"] as BuilderStep[]).map((s, idx) => {
                const labels = ["Members", "Health Info", "Review"];
                const active = s === step;
                const done = (step === "health" && idx === 0) || (step === "review" && idx <= 1);
                return (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                            active ? "bg-accent text-white" : done ? "bg-accent/15 text-accent" : "bg-background-secondary text-muted"
                        }`}>
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                active ? "bg-white text-accent" : done ? "bg-accent text-white" : "bg-muted/20 text-muted"
                            }`}>{idx + 1}</span>
                            {labels[idx]}
                        </div>
                        {idx < 2 && <div className="w-6 h-px bg-border-light" />}
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="relative min-h-screen font-sans">
            <DashboardAmbientBackground />
            <DashboardHeader title="Family Trip Builder" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 pb-14 md:px-12 pt-8">
                <div className="bg-white rounded-3xl shadow-[0_4px_16px_-6px_rgba(10,20,18,0.06)] border border-border-light overflow-hidden">
                    <div className="p-6 md:p-8 space-y-8">
                        {stepIndicator}

                        {/* ── STEP 1: Members ── */}
                        {step === "members" && (
                            <>
                                <section>
                                    <h3 className="text-xl font-serif text-heading mb-4">Trip Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Destination City</label>
                                            <input type="text" value={request.destination}
                                                onChange={(e) => setRequest({ ...request, destination: e.target.value })}
                                                className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                                                placeholder="e.g. Paris" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Country</label>
                                            <input type="text" value={request.country}
                                                onChange={(e) => setRequest({ ...request, country: e.target.value })}
                                                className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                                                placeholder="e.g. France" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Duration (Days)</label>
                                            <input type="number" value={request.duration}
                                                onChange={(e) => setRequest({ ...request, duration: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Purpose</label>
                                            <select value={request.purpose}
                                                onChange={(e) => setRequest({ ...request, purpose: e.target.value })}
                                                className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors duration-200">
                                                <option value="LEISURE">Leisure</option>
                                                <option value="BUSINESS">Business</option>
                                                <option value="VISITING_RELATIVES">Visiting Friends/Relatives</option>
                                            </select>
                                        </div>
                                    </div>
                                </section>

                                <hr className="border-border-light" />

                                <section>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-serif text-heading">Family Members</h3>
                                        <button type="button" onClick={addMember}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-accent bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors uppercase tracking-wider">
                                            <LucidePlus className="w-4 h-4" />Add Member
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {request.members.map((member, index) => (
                                            <div key={index} className="p-6 border border-border-light rounded-2xl bg-background-secondary relative">
                                                <button type="button" onClick={() => removeMember(index)}
                                                    className="absolute top-4 right-4 text-muted hover:text-red-500 transition-colors">
                                                    <LucideTrash className="w-5 h-5" />
                                                </button>
                                                {(() => {
                                                    const age = getAgeFromDob(member.dateOfBirth ?? "");
                                                    if (age === null) return null;
                                                    const isAdult = age >= 18;
                                                    return (
                                                        <div className={`mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                            isAdult ? "bg-accent/10 text-accent" : "bg-amber-50 text-amber-700 border border-amber-200"
                                                        }`}>
                                                            {isAdult
                                                                ? `Adult (age ${age})`
                                                                : `Child (age ${age}) — WHO paediatric grouping`}
                                                        </div>
                                                    );
                                                })()}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Relationship</label>
                                                        <select value={member.relationship}
                                                            onChange={(e) => handleMemberChange(index, "relationship", e.target.value)}
                                                            className="w-full bg-white border border-border-light rounded-xl px-4 py-2.5 text-sm text-heading outline-none focus:border-accent transition-colors">
                                                            <option value="SPOUSE">Spouse / Partner</option>
                                                            <option value="CHILD">Child</option>
                                                            <option value="PARENT">Parent</option>
                                                            <option value="DEPENDENT">Other Dependent</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Date of Birth</label>
                                                        <input type="date" value={member.dateOfBirth}
                                                            onChange={(e) => handleMemberChange(index, "dateOfBirth", e.target.value)}
                                                            className="w-full bg-white border border-border-light rounded-xl px-4 py-2.5 text-sm text-heading outline-none focus:border-accent transition-colors" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">First Name</label>
                                                        <input type="text" value={member.firstName}
                                                            onChange={(e) => handleMemberChange(index, "firstName", e.target.value)}
                                                            className="w-full bg-white border border-border-light rounded-xl px-4 py-2.5 text-sm text-heading outline-none focus:border-accent transition-colors" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Last Name</label>
                                                        <input type="text" value={member.lastName}
                                                            onChange={(e) => handleMemberChange(index, "lastName", e.target.value)}
                                                            className="w-full bg-white border border-border-light rounded-xl px-4 py-2.5 text-sm text-heading outline-none focus:border-accent transition-colors" />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Email (optional — for notifications)</label>
                                                        <input type="email" value={member.memberEmail}
                                                            onChange={(e) => handleMemberChange(index, "memberEmail", e.target.value)}
                                                            className="w-full bg-white border border-border-light rounded-xl px-4 py-2.5 text-sm text-heading outline-none focus:border-accent transition-colors"
                                                            placeholder="member@example.com" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <hr className="border-border-light" />

                                <section className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                    <Button variant="secondary" onClick={handlePreview} disabled={isPreviewing} className="w-full md:w-auto">
                                        {isPreviewing ? "Calculating..." : "Preview Cost"}
                                    </Button>
                                    <div className="flex gap-3 w-full md:w-auto">
                                        <Button variant="secondary" icon={<LucideSave className="w-4 h-4" />}
                                            onClick={handleSaveDraft} disabled={isSubmitting} className="flex-1 md:flex-none">
                                            Save Draft
                                        </Button>
                                        <Button variant="primary" icon={<LucideArrowRight className="w-4 h-4" />}
                                            onClick={() => {
                                                if (!request.destination || !request.country) {
                                                    toast.error("Enter destination and country first");
                                                    return;
                                                }
                                                syncHealthData(request.members.length);
                                                setExpandedMember(0);
                                                setStep("health");
                                            }}
                                            disabled={!request.destination || !request.country}
                                            className="flex-1 md:flex-none bg-dark text-background-primary hover:bg-darkest">
                                            Continue to Health Info
                                        </Button>
                                    </div>
                                </section>

                                {previewData && (
                                    <section className="bg-accent/5 border border-accent/20 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4">
                                        <h4 className="font-serif text-heading mb-4 text-lg">Cost Breakdown</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div className="bg-white p-4 rounded-xl shadow-sm border border-border-light">
                                                <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-1">Included</p>
                                                <p className="text-2xl font-serif text-heading">{previewData.includedMembers}</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl shadow-sm border border-border-light">
                                                <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-1">Extra</p>
                                                <p className="text-2xl font-serif text-heading">{previewData.additionalMembers}</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl shadow-sm border border-border-light">
                                                <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-1">Total Cost</p>
                                                <p className="text-2xl font-serif text-heading">
                                                    {previewData.currency === "NGN" ? "₦" : "$"}{(previewData.totalFiatCost / 100).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl shadow-sm border border-border-light">
                                                <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-1">Balance</p>
                                                <p className="text-lg font-serif text-heading">
                                                    {previewData.activePackageAllowance ? `${previewData.activePackageAllowance.tripsRemaining} Trip(s)` : "No active package"}
                                                </p>
                                            </div>
                                        </div>
                                        {previewData.paymentRequired && (
                                            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-200">
                                                Payment required before submission.
                                                You need to pay {previewData.currency === "NGN" ? "₦" : "$"}{(previewData.totalFiatCost / 100).toLocaleString()}.
                                            </div>
                                        )}
                                    </section>
                                )}
                            </>
                        )}

                        {/* ── STEP 2: Health Info ── */}
                        {step === "health" && (
                            <>
                                <div>
                                    <h3 className="text-xl font-serif text-heading mb-1">Health Information</h3>
                                    <p className="text-sm text-muted mb-6">Fill in health details for each member. This information is used to personalise each travel health plan.</p>

                                    <div className="space-y-3">
                                        {request.members.map((member, idx) => {
                                            const h = healthData[idx] ?? defaultHealth();
                                            const age = getAgeFromDob(member.dateOfBirth ?? "");
                                            const isExpanded = expandedMember === idx;
                                            return (
                                                <div key={idx} className="border border-border-light rounded-2xl overflow-hidden">
                                                    <button type="button"
                                                        onClick={() => setExpandedMember(isExpanded ? null : idx)}
                                                        className="w-full flex items-center justify-between px-5 py-4 bg-background-secondary hover:bg-accent/5 transition-colors text-left">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                                                                <span className="text-accent text-xs font-bold">{(member.firstName?.[0] ?? "?").toUpperCase()}</span>
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-heading text-sm">{memberLabel(member, idx)}</p>
                                                                <p className="text-xs text-muted capitalize">{member.relationship.toLowerCase()}{age !== null ? ` · ${age} yrs` : ""}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {h.sex && <span className="text-xs text-accent font-medium bg-accent/10 px-2 py-0.5 rounded-full">Filled</span>}
                                                            <LucideChevronDown className={`w-4 h-4 text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                                        </div>
                                                    </button>

                                                    {isExpanded && (
                                                        <div className="p-5 space-y-5 bg-white border-t border-border-light">
                                                            {/* Sex */}
                                                            <div>
                                                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Biological Sex</label>
                                                                <div className="flex gap-3">
                                                                    {["Male", "Female", "Other"].map((s) => (
                                                                        <label key={s} className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer text-sm font-medium transition-colors ${
                                                                            h.sex === s ? "border-accent bg-accent/10 text-accent" : "border-border-light text-body hover:border-accent/50"
                                                                        }`}>
                                                                            <input type="radio" className="sr-only" checked={h.sex === s} onChange={() => updateHealth(idx, "sex", s)} />
                                                                            {s}
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Pregnancy — only for female */}
                                                            {h.sex === "Female" && (
                                                                <div>
                                                                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Pregnancy Status</label>
                                                                    <div className="flex gap-3 flex-wrap">
                                                                        {["Not pregnant", "Pregnant", "Breastfeeding", "Trying to conceive"].map((s) => (
                                                                            <label key={s} className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer text-sm font-medium transition-colors ${
                                                                                h.pregnancyStatus === s ? "border-accent bg-accent/10 text-accent" : "border-border-light text-body hover:border-accent/50"
                                                                            }`}>
                                                                                <input type="radio" className="sr-only" checked={h.pregnancyStatus === s} onChange={() => updateHealth(idx, "pregnancyStatus", s)} />
                                                                                {s}
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Chronic conditions */}
                                                            <div>
                                                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Chronic Conditions (select all that apply)</label>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {CHRONIC_OPTIONS.map((opt) => (
                                                                        <label key={opt} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border cursor-pointer text-sm transition-colors ${
                                                                            h.chronicConditions.includes(opt) ? "border-accent bg-accent/10 text-accent" : "border-border-light text-body hover:border-accent/50"
                                                                        }`}>
                                                                            <input type="checkbox" className="sr-only"
                                                                                checked={h.chronicConditions.includes(opt)}
                                                                                onChange={() => toggleCheckbox(idx, "chronicConditions", opt)} />
                                                                            {opt}
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Immune compromised */}
                                                            <div>
                                                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Immune-compromised or on immunosuppressants?</label>
                                                                <div className="flex gap-3">
                                                                    {[["yes", "Yes"], ["no", "No"], ["unsure", "Unsure"]].map(([val, label]) => (
                                                                        <label key={val} className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer text-sm font-medium transition-colors ${
                                                                            h.immuneCompromised === val ? "border-accent bg-accent/10 text-accent" : "border-border-light text-body hover:border-accent/50"
                                                                        }`}>
                                                                            <input type="radio" className="sr-only" checked={h.immuneCompromised === val} onChange={() => updateHealth(idx, "immuneCompromised", val)} />
                                                                            {label}
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Current medications */}
                                                            <div>
                                                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Current Medications (if any)</label>
                                                                <textarea value={h.currentMedications}
                                                                    onChange={(e) => updateHealth(idx, "currentMedications", e.target.value)}
                                                                    rows={2}
                                                                    placeholder="e.g. Metformin 500mg, Lisinopril 10mg — or 'None'"
                                                                    className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors resize-none" />
                                                            </div>

                                                            {/* Allergies */}
                                                            <div>
                                                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Drug / Food Allergies</label>
                                                                <input type="text" value={h.allergies}
                                                                    onChange={(e) => updateHealth(idx, "allergies", e.target.value)}
                                                                    placeholder="e.g. Penicillin, Sulfa drugs — or 'None'"
                                                                    className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors" />
                                                            </div>

                                                            {/* Vaccination history */}
                                                            <div>
                                                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Known Vaccination History</label>
                                                                <textarea value={h.vaccinationHistory}
                                                                    onChange={(e) => updateHealth(idx, "vaccinationHistory", e.target.value)}
                                                                    rows={2}
                                                                    placeholder="e.g. Yellow fever (2022), COVID-19 (boosted), Hepatitis B series complete"
                                                                    className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors resize-none" />
                                                            </div>

                                                            {/* Mobility */}
                                                            <div>
                                                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Mobility / Accessibility Needs</label>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {MOBILITY_OPTIONS.map((opt) => (
                                                                        <label key={opt} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border cursor-pointer text-sm transition-colors ${
                                                                            h.mobilityLimitations.includes(opt) ? "border-accent bg-accent/10 text-accent" : "border-border-light text-body hover:border-accent/50"
                                                                        }`}>
                                                                            <input type="checkbox" className="sr-only"
                                                                                checked={h.mobilityLimitations.includes(opt)}
                                                                                onChange={() => toggleCheckbox(idx, "mobilityLimitations", opt)} />
                                                                            {opt}
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Recent illnesses */}
                                                            <div>
                                                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Recent Illnesses or Hospitalisations (past 12 months)</label>
                                                                <input type="text" value={h.recentIllnesses}
                                                                    onChange={(e) => updateHealth(idx, "recentIllnesses", e.target.value)}
                                                                    placeholder="e.g. Appendectomy June 2024 — or 'None'"
                                                                    className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors" />
                                                            </div>

                                                            {/* Prior travel health issues */}
                                                            <div>
                                                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Prior Travel Health Issues</label>
                                                                <input type="text" value={h.priorTravelHealthIssues}
                                                                    onChange={(e) => updateHealth(idx, "priorTravelHealthIssues", e.target.value)}
                                                                    placeholder="e.g. Severe altitude sickness in 2023 — or 'None'"
                                                                    className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <hr className="border-border-light" />

                                <div className="flex gap-3 justify-between">
                                    <Button variant="secondary" icon={<LucideArrowLeft className="w-4 h-4" />}
                                        onClick={() => setStep("members")}>
                                        Back
                                    </Button>
                                    <div className="flex gap-3">
                                        <Button variant="secondary" icon={<LucideSave className="w-4 h-4" />}
                                            onClick={handleSaveDraft} disabled={isSubmitting}>
                                            Save Draft
                                        </Button>
                                        <Button variant="primary" icon={<LucideArrowRight className="w-4 h-4" />}
                                            onClick={() => setStep("review")}
                                            className="bg-dark text-background-primary hover:bg-darkest">
                                            Review & Submit
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── STEP 3: Review ── */}
                        {step === "review" && (
                            <>
                                <div>
                                    <h3 className="text-xl font-serif text-heading mb-1">Review Your Family Trip</h3>
                                    <p className="text-sm text-muted mb-6">Confirm details before submitting. Access codes will be sent to members with emails.</p>

                                    <div className="bg-background-secondary rounded-2xl p-5 mb-5 space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted font-semibold uppercase tracking-wider text-xs">Destination</span>
                                            <span className="text-heading font-medium">{request.destination}, {request.country}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted font-semibold uppercase tracking-wider text-xs">Duration</span>
                                            <span className="text-heading font-medium">{request.duration} days</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted font-semibold uppercase tracking-wider text-xs">Purpose</span>
                                            <span className="text-heading font-medium capitalize">{request.purpose.replace("_", " ").toLowerCase()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted font-semibold uppercase tracking-wider text-xs">Members</span>
                                            <span className="text-heading font-medium">{request.members.length}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {request.members.map((m, i) => {
                                            const h = healthData[i] ?? defaultHealth();
                                            const age = getAgeFromDob(m.dateOfBirth ?? "");
                                            const healthFilled = !!h.sex;
                                            return (
                                                <div key={i} className="flex items-center justify-between px-4 py-3 border border-border-light rounded-xl bg-white">
                                                    <div>
                                                        <p className="text-sm font-semibold text-heading">{memberLabel(m, i)}</p>
                                                        <p className="text-xs text-muted capitalize">{m.relationship.toLowerCase()}{age !== null ? ` · ${age} yrs` : ""}</p>
                                                    </div>
                                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                                        healthFilled ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                                                    }`}>
                                                        {healthFilled ? "Health info filled" : "Health info missing"}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <hr className="border-border-light" />

                                <div className="flex gap-3 justify-between">
                                    <Button variant="secondary" icon={<LucideArrowLeft className="w-4 h-4" />}
                                        onClick={() => setStep("health")}>
                                        Back
                                    </Button>
                                    <Button variant="primary" icon={<LucideCheckCircle className="w-4 h-4" />}
                                        onClick={handleSubmit} disabled={isSubmitting}
                                        className="bg-dark text-background-primary hover:bg-darkest">
                                        {isSubmitting ? "Creating..." : "Create Family Trip"}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

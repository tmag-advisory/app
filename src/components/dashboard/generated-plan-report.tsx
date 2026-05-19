import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { GeneratedPlanContent, TravelPlanResponse } from "../../api/types";
import {
    LucideAlertTriangle,
    LucideBuilding2,
    LucideCalendarRange,
    LucideHeartPulse,
    LucideNavigation,
    LucideListChecks,
    LucideMapPin,
    LucidePhone,
    LucidePlane,
    LucideShieldCheck,
    LucideStethoscope,
    LucideSyringe,
    LucideUser,
} from "lucide-react";

// eslint-disable-next-line react-refresh/only-export-components
export function parseGeneratedPlanContent(raw: string | null | undefined): GeneratedPlanContent | null {
    if (!raw || !String(raw).trim()) {
        return null;
    }
    try {
        const v = JSON.parse(raw) as unknown;
        if (v && typeof v === "object" && !Array.isArray(v)) {
            return v as GeneratedPlanContent;
        }
        return null;
    } catch {
        return null;
    }
}

function afterReturnHasContent(a: GeneratedPlanContent["afterReturn"]): boolean {
    if (!a) {
        return false;
    }
    return !!(
        (a.within1Week && a.within1Week.length > 0) ||
        (a.within4Weeks && a.within4Weeks.length > 0) ||
        (a.beyond4Weeks && a.beyond4Weeks.length > 0) ||
        (a.redFlag && a.redFlag.trim())
    );
}

function medicalCareHasContent(m: GeneratedPlanContent["medicalCare"]): boolean {
    if (!m) {
        return false;
    }
    return !!(
        (m.clinics && m.clinics.length > 0) ||
        (m.embassyContacts && m.embassyContacts.length > 0) ||
        (m.emergencyContacts && m.emergencyContacts.length > 0)
    );
}

/** True when the parsed JSON has at least one section worth rendering in the structured layout. */
// eslint-disable-next-line react-refresh/only-export-components
export function hasGeneratedPlanLayout(c: GeneratedPlanContent): boolean {
    if (c.tripAtGlance && Object.values(c.tripAtGlance).some((v) => v !== undefined && v !== null && String(v).trim() !== "")) {
        return true;
    }
    if (c.healthRiskOverview && c.healthRiskOverview.length > 0) {
        return true;
    }
    if (c.vaccinations && c.vaccinations.length > 0) {
        return true;
    }
    if (c.recommendations && c.recommendations.length > 0) {
        return true;
    }
    if (afterReturnHasContent(c.afterReturn)) {
        return true;
    }
    if (medicalCareHasContent(c.medicalCare)) {
        return true;
    }
    if (
        c.itineraryGuidance &&
        (
            (c.itineraryGuidance.summary && c.itineraryGuidance.summary.trim()) ||
            (c.itineraryGuidance.routeAdvice && c.itineraryGuidance.routeAdvice.length > 0) ||
            (c.itineraryGuidance.returnGuidance && c.itineraryGuidance.returnGuidance.length > 0)
        )
    ) {
        return true;
    }
    if (c.nextSteps && c.nextSteps.length > 0) {
        return true;
    }
    if (c.medicalDisclaimer && c.medicalDisclaimer.trim()) {
        return true;
    }
    if (c.reportTitle?.trim() || c.travelDates?.trim() || c.travellerName?.trim()) {
        return true;
    }
    return false;
}

function levelStyles(level: string): { text: string; ring: string; badgeBg: string } {
    const u = level.toUpperCase();
    if (u === "HIGH") {
        return { text: "text-red-700", ring: "ring-red-200", badgeBg: "bg-red-50" };
    }
    if (u === "MODERATE") {
        return { text: "text-amber-800", ring: "ring-gold/30", badgeBg: "bg-gold/10" };
    }
    return { text: "text-accent", ring: "ring-accent/25", badgeBg: "bg-accent/10" };
}

function SectionCard({
    icon,
    title,
    children,
    className = "",
}: {
    icon: ReactNode;
    title: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className={`rounded-2xl border border-border-light/50 bg-white p-5 shadow-sm md:p-6 ${className}`}
        >
            <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-dark text-background-primary [&_svg]:h-4 [&_svg]:w-4">
                    {icon}
                </div>
                <h3 className="font-serif text-base font-semibold text-heading md:text-lg">{title}</h3>
            </div>
            {children}
        </motion.section>
    );
}

function GlanceItem({ label, value }: { label: string; value: string }) {
    if (!value.trim()) {
        return null;
    }
    return (
        <div className="rounded-xl border border-border-light/60 bg-background-secondary/40 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</p>
            <p className="mt-0.5 text-sm font-medium text-heading">{value}</p>
        </div>
    );
}

export function GeneratedPlanReport({ content }: { content: GeneratedPlanContent }) {
    const glance = content.tripAtGlance;

    return (
        <div className="space-y-6">
            {glance && (
                <SectionCard icon={<LucidePlane />} title="Trip at a glance">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <GlanceItem
                            label="Duration"
                            value={
                                glance.durationDays != null ? `${glance.durationDays} days` : ""
                            }
                        />
                        <GlanceItem label="Purpose" value={glance.purpose ?? ""} />
                        <GlanceItem label="Travelling" value={glance.travelling ?? ""} />
                        <GlanceItem label="Accommodation" value={glance.accommodation ?? ""} />
                        <GlanceItem label="Insurance" value={glance.insurance ?? ""} />
                    </div>
                </SectionCard>
            )}

            {content.healthRiskOverview && content.healthRiskOverview.length > 0 && (
                <SectionCard icon={<LucideHeartPulse />} title="Health risk overview">
                    <ul className="space-y-3">
                        {content.healthRiskOverview.map((item, i) => {
                            const st = levelStyles(item.level || "LOW");
                            return (
                                <li
                                    key={`${item.category}-${i}`}
                                    className={`rounded-xl border border-border-light/50 p-4 ring-1 ${st.ring} bg-white/90`}
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <p className="font-medium text-heading">{item.category}</p>
                                        <span
                                            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${st.text} ${st.badgeBg}`}
                                        >
                                            {item.level || "—"}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm leading-relaxed text-body">{item.summary}</p>
                                </li>
                            );
                        })}
                    </ul>
                </SectionCard>
            )}

            {content.vaccinations && content.vaccinations.length > 0 && (
                <SectionCard icon={<LucideSyringe />} title="Vaccinations">
                    <div className="space-y-3">
                        {content.vaccinations.map((v, i) => (
                            <div
                                key={`${v.vaccine}-${i}`}
                                className="rounded-xl border border-border-light/40 bg-background-secondary/30 p-4"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="font-semibold text-heading">{v.vaccine}</p>
                                    <span className="rounded-full bg-dark/8 px-2.5 py-0.5 text-xs font-semibold text-heading">
                                        {v.status}
                                    </span>
                                </div>
                                {v.recommendation ? (
                                    <p className="mt-2 text-sm text-body">{v.recommendation}</p>
                                ) : null}
                                {v.action ? (
                                    <p className="mt-2 text-xs font-medium text-accent">{v.action}</p>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}

            {content.recommendations && content.recommendations.length > 0 && (
                <SectionCard icon={<LucideStethoscope />} title="Medical advice & recommendations">
                    <ul className="space-y-4">
                        {content.recommendations.map((r, i) => (
                            <li
                                key={`${r.title}-${i}`}
                                className="border-l-4 border-accent/50 pl-4"
                            >
                                <p className="font-semibold text-heading">{r.title}</p>
                                <p className="mt-1.5 text-sm leading-relaxed text-body whitespace-pre-wrap">
                                    {r.details}
                                </p>
                            </li>
                        ))}
                    </ul>
                </SectionCard>
            )}

            {content.afterReturn && (
                <SectionCard icon={<LucideCalendarRange />} title="After you return">
                    <div className="space-y-5">
                        {content.afterReturn.redFlag ? (
                            <div className="rounded-xl border border-red-200 bg-red-50/80 p-4">
                                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-800">
                                    <LucideAlertTriangle className="h-4 w-4" aria-hidden />
                                    Red flags — seek care if needed
                                </p>
                                <p className="mt-2 text-sm text-red-900/90 whitespace-pre-wrap">
                                    {content.afterReturn.redFlag}
                                </p>
                            </div>
                        ) : null}
                        {content.afterReturn.within1Week && content.afterReturn.within1Week.length > 0 ? (
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                                    Within 1 week
                                </p>
                                <ul className="list-inside list-disc space-y-1.5 text-sm text-body">
                                    {content.afterReturn.within1Week.map((line, i) => (
                                        <li key={i}>{line}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                        {content.afterReturn.within4Weeks && content.afterReturn.within4Weeks.length > 0 ? (
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                                    Within 4 weeks
                                </p>
                                <ul className="list-inside list-disc space-y-1.5 text-sm text-body">
                                    {content.afterReturn.within4Weeks.map((line, i) => (
                                        <li key={i}>{line}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                        {content.afterReturn.beyond4Weeks && content.afterReturn.beyond4Weeks.length > 0 ? (
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                                    Beyond 4 weeks
                                </p>
                                <ul className="list-inside list-disc space-y-1.5 text-sm text-body">
                                    {content.afterReturn.beyond4Weeks.map((line, i) => (
                                        <li key={i}>{line}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                    </div>
                </SectionCard>
            )}

            {content.medicalCare &&
                (content.medicalCare.clinics?.length ||
                    content.medicalCare.embassyContacts?.length ||
                    content.medicalCare.emergencyContacts?.length) ? (
                <SectionCard icon={<LucideBuilding2 />} title="Medical care & contacts">
                    <div className="space-y-6">
                        {content.medicalCare.clinics && content.medicalCare.clinics.length > 0 ? (
                            <div>
                                <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                                    <LucideMapPin className="h-3.5 w-3.5" aria-hidden />
                                    Clinics & facilities
                                </p>
                                <ul className="space-y-3">
                                    {content.medicalCare.clinics.map((c, i) => (
                                        <li
                                            key={`${c.name}-${i}`}
                                            className="rounded-xl border border-border-light/50 bg-background-secondary/25 p-4 text-sm"
                                        >
                                            <p className="font-semibold text-heading">{c.name}</p>
                                            {c.address ? (
                                                <p className="mt-1 text-body">{c.address}</p>
                                            ) : null}
                                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                                                {c.phone ? (
                                                    <span className="inline-flex items-center gap-1">
                                                        <LucidePhone className="h-3 w-3" aria-hidden />
                                                        {c.phone}
                                                    </span>
                                                ) : null}
                                                {c.distance ? <span>{c.distance}</span> : null}
                                            </div>
                                            {c.notes ? (
                                                <p className="mt-2 text-xs text-body/90">{c.notes}</p>
                                            ) : null}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}

                        {content.medicalCare.embassyContacts &&
                        content.medicalCare.embassyContacts.length > 0 ? (
                            <div>
                                <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                                    <LucideShieldCheck className="h-3.5 w-3.5" aria-hidden />
                                    Embassy & consular
                                </p>
                                <ul className="space-y-2">
                                    {content.medicalCare.embassyContacts.map((e, i) => (
                                        <li
                                            key={`${e.name}-${i}`}
                                            className="rounded-lg border border-border-light/40 px-3 py-2 text-sm"
                                        >
                                            <span className="font-medium text-heading">{e.name}</span>
                                            {e.details ? (
                                                <p className="mt-1 text-body">{e.details}</p>
                                            ) : null}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}

                        {content.medicalCare.emergencyContacts &&
                        content.medicalCare.emergencyContacts.length > 0 ? (
                            <div>
                                <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                                    <LucidePhone className="h-3.5 w-3.5" aria-hidden />
                                    Emergency numbers
                                </p>
                                <ul className="divide-y divide-border-light/50 rounded-xl border border-border-light/50">
                                    {content.medicalCare.emergencyContacts.map((ec, i) => (
                                        <li
                                            key={`${ec.label}-${i}`}
                                            className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm"
                                        >
                                            <span className="text-muted">{ec.label}</span>
                                            <span className="font-semibold text-heading">{ec.value}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                    </div>
                </SectionCard>
            ) : null}

            {content.itineraryGuidance &&
            (
                (content.itineraryGuidance.summary && content.itineraryGuidance.summary.trim()) ||
                (content.itineraryGuidance.routeAdvice && content.itineraryGuidance.routeAdvice.length > 0) ||
                (content.itineraryGuidance.returnGuidance && content.itineraryGuidance.returnGuidance.length > 0)
            ) ? (
                <SectionCard icon={<LucideNavigation />} title="Itinerary-specific guidance">
                    <div className="space-y-4">
                        {content.itineraryGuidance.tripType ? (
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                                Trip type: {content.itineraryGuidance.tripType.replaceAll("_", " ")}
                            </p>
                        ) : null}
                        {content.itineraryGuidance.summary ? (
                            <p className="text-sm leading-relaxed text-body">
                                {content.itineraryGuidance.summary}
                            </p>
                        ) : null}
                        {content.itineraryGuidance.routeAdvice && content.itineraryGuidance.routeAdvice.length > 0 ? (
                            <ul className="space-y-3">
                                {content.itineraryGuidance.routeAdvice.map((r, i) => (
                                    <li key={`${r.stop}-${r.country}-${i}`} className="rounded-xl border border-border-light/50 bg-background-secondary/25 p-3">
                                        <p className="text-sm font-semibold text-heading">
                                            {[r.stop, r.country].filter(Boolean).join(", ")}
                                        </p>
                                        <p className="mt-1 text-sm text-body">{r.guidance}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                        {content.itineraryGuidance.returnGuidance && content.itineraryGuidance.returnGuidance.length > 0 ? (
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                                    Return leg guidance
                                </p>
                                <ul className="list-inside list-disc space-y-1.5 text-sm text-body">
                                    {content.itineraryGuidance.returnGuidance.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                    </div>
                </SectionCard>
            ) : null}

            {content.nextSteps && content.nextSteps.length > 0 && (
                <SectionCard icon={<LucideListChecks />} title="Next steps">
                    <ul className="space-y-2">
                        {content.nextSteps.map((step, i) => (
                            <li key={i} className="flex gap-2 text-sm text-body">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                                <span>{step}</span>
                            </li>
                        ))}
                    </ul>
                </SectionCard>
            )}

            {content.medicalDisclaimer ? (
                <p className="rounded-xl border border-border-light/40 bg-background-secondary/50 px-4 py-3 text-xs leading-relaxed text-muted">
                    {content.medicalDisclaimer}
                </p>
            ) : null}
        </div>
    );
}

export function GeneratedPlanHeroMeta({
    plan,
    content,
}: {
    plan: TravelPlanResponse;
    content: GeneratedPlanContent | null;
}) {
    const title = content?.reportTitle?.trim() || plan.destination;
    const dates = content?.travelDates?.trim();
    const traveller = content?.travellerName?.trim();

    return (
        <div className="space-y-3">
            <div>
                <h2 className="font-serif text-xl text-heading md:text-2xl">{title}</h2>
                <p className="mt-1 text-sm text-muted">
                    {[plan.country, plan.duration ? `${plan.duration} days` : null, plan.purpose]
                        .filter(Boolean)
                        .join(" · ")}
                </p>
                {dates ? (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-heading/90">
                        <LucideCalendarRange className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
                        {dates}
                    </p>
                ) : null}
                {traveller ? (
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-muted">
                        <LucideUser className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        {traveller}
                    </p>
                ) : null}
            </div>
        </div>
    );
}
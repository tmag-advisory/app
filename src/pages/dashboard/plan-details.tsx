import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion, LayoutGroup } from "framer-motion";
import { travelPlansApi } from "../../api/api";
import { cn } from "../../lib/utils";
import {
  canDownloadTravelPlanPdf,
  canDownloadTravelPlanSummaryPdf,
  isPaidTravelPlanTier,
} from "../../lib/travel-plan-pdf";
import { DASHBOARD_GLASS_SURFACE } from "../../components/dashboard/dashboardChrome";
import { isTravelPlanGeneratingStatus, useTravelPlan, useTravelPlanSummaryPdf } from "../../api/hooks";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import {
  GeneratedPlanHeroMeta,
  GeneratedPlanReport,
  GenerationMetaLine,
  hasGeneratedPlanLayout,
  parseGeneratedPlanContent,
} from "../../components/dashboard/generated-plan-report";
import {
  LucideArrowLeft,
  LucideDownload,
  LucideSyringe,
  LucideAlertTriangle,
  LucideShieldCheck,
  LucidePill,
  LucideDroplets,
  LucidePhone,
  LucideHeartPulse,
  LucideSparkles,
  LucideCheck,

  LucideLayers,

  LucidePlane,
  LucideFileText,
  LucideGlobe,
  LucideActivity,
  LucideLoader2,
  LucideBug,
  LucideMapPin,
  LucideShieldCheck as LucideShieldCheckIcon,
  LucideShieldAlert,
  LucideClock,
  LucideUsers,
} from "lucide-react";

// ─── Processing Phases (warm, travel-health tone) ─────────────────

const processingPhases = [
  {
    title: "Opening your travel dossier",
    subtitle: "Gathering context for your trip and getting our bearings…",
    icon: "globe" as const,
  },
  {
    title: "Layering in trusted guidance",
    subtitle: "WHO, CDC, and international vaccine schedules — distilled for you…",
    icon: "syringe" as const,
  },
  {
    title: "Skies, seasons & what’s in the air",
    subtitle: "Weather patterns, heat, rain, and air quality where you’re headed…",
    icon: "heartPulse" as const,
  },
  {
    title: "Mapping risks to your route",
    subtitle: "Health alerts, advisories, and what they mean for your dates…",
    icon: "shield" as const,
  },
  {
    title: "Making meds and precautions personal",
    subtitle: "Cross-checking recommendations with your health profile, gently…",
    icon: "pill" as const,
  },
  {
    title: "Drafting your advisory sections",
    subtitle: "Vaccinations, alerts, medications, food & water, emergency contacts…",
    icon: "phone" as const,
  },
  {
    title: "Adding warmth and clarity",
    subtitle: "Polishing the tone so it feels human — not a textbook…",
    icon: "sparkles" as const,
  },
  {
    title: "Almost ready to unwrap",
    subtitle: "Final pass — your plan will appear here in a moment…",
    icon: "check" as const,
  },
];

/** Sources we “gather” — list reorders while items are still in progress. */
const WORKSPACE_SOURCES: {
  id: string;
  label: string;
  Icon: typeof LucideSyringe;
}[] = [
    { id: "personal_information", label: "Personal Information", Icon: LucideShieldCheck },
    { id: "travel_details", label: "Travel Itinerary", Icon: LucidePlane },
    { id: "accommodation_environment", label: "Accommodation & Environment", Icon: LucideShieldCheck },
    { id: "planned_activities", label: "Planned Activities", Icon: LucideBug },
    { id: "medical_history", label: "Medical History", Icon: LucideHeartPulse },
    { id: "vaccination_history", label: "Vaccinations & Past Travel History", Icon: LucideSyringe },
    { id: "awareness_preparation", label: "Awareness & Preparation", Icon: LucideShieldCheck },
    { id: "personal_health_risk_behaviours", label: "Personal Health & Risk Behaviours", Icon: LucideBug },
  ];

function indexedSourceCount(phaseIndex: number, phaseTotal: number, sourceCount: number): number {
  if (phaseTotal <= 1) return 0;
  return Math.min(sourceCount, Math.floor(((phaseIndex + 1) / phaseTotal) * sourceCount));
}

function activityLinesForPhase(phaseIndex: number, place: string): string[] {
  const where = place.trim() || "your destination";
  const rows: string[][] = [
    [
      `Setting the table for something wonderful — ${where} is worth the extra care.`,
      `A little curiosity, a lot of heart. We're so glad you're here.`,
      `Good things simmer slowly; we're just getting started.`,
    ],
    [
      `Pulling together trusted WHO & CDC guidance for your route.`,
      `Layering in vaccine smarts without the overwhelm — you've got this.`,
      `Spice level: thoughtful. We're making sure nothing important gets missed.`,
    ],
    [
      `Checking current weather patterns and seasons around ${where}…`,
      `Heat, rain, humidity — we fold all of it into practical tips.`,
      `Skies and forecasts, translated into plain English for your trip.`,
    ],
    [
      `Mapping health risks to your exact dates and stops.`,
      `Connecting advisories to what they mean for you — not generic noise.`,
      `Creating goodness: clarity where travel health often feels fuzzy.`,
    ],
    [
      `Making sure medications and precautions fit you, not a one-size template.`,
      `Gentle cross-checks for safety — peace of mind in every paragraph.`,
      `Adding a dash of “we’ve got your back” to every recommendation.`,
    ],
    [
      `Drafting vaccination notes you'll actually want to read.`,
      `Health alerts without the jargon wall — promise.`,
      `Sprinkling in water, food safety, and who-to-call goodness.`,
    ],
    [
      `Polishing until it feels human — warmth beats clinical every time.`,
      `This is the part where we make something super cool just for you.`,
      `Creating something you'll be proud to pack alongside your passport.`,
    ],
    [
      `Putting a bow on your personalized travel health plan.`,
      `Almost there — we think you're going to love what's inside.`,
      `Finishing touches… this page will refresh the moment it's ready.`,
    ],
  ];
  return rows[Math.min(phaseIndex, rows.length - 1)] ?? rows[rows.length - 1];
}

const phaseIconMap = {
  globe: LucideGlobe,
  syringe: LucideSyringe,
  heartPulse: LucideHeartPulse,
  shield: LucideShieldCheck,
  pill: LucidePill,
  phone: LucidePhone,
  sparkles: LucideSparkles,
  check: LucideCheck,
} as const;

/** Softer easing + springs for fluid motion on high-refresh displays (120Hz-friendly pacing). */
const EASE_SMOOTH = [0.22, 1, 0.36, 1] as const;
const EASE_IN_OUT_SMOOTH = [0.45, 0, 0.55, 1] as const;
const layoutSpring = { type: "spring" as const, stiffness: 240, damping: 28, mass: 0.92, restDelta: 0.001 };

/** Source list with layout-driven reordering while items are still in progress. */
function WorkspaceSourceRail({
  phaseIndex,
  reduceMotion,
  place,
}: {
  phaseIndex: number;
  reduceMotion: boolean;
  place: string;
}) {
  const done = indexedSourceCount(phaseIndex, processingPhases.length, WORKSPACE_SOURCES.length);
  const [restOrder, setRestOrder] = useState<string[]>(() => WORKSPACE_SOURCES.map((f) => f.id));

  useEffect(() => {
    const rest = WORKSPACE_SOURCES.slice(done).map((f) => f.id);
    const valid = restOrder.filter((id) => rest.includes(id));
    const missing = rest.filter((id) => !valid.includes(id));
    if (JSON.stringify(restOrder) !== JSON.stringify([...missing, ...valid])) {
      setRestOrder([...missing, ...valid]);
    }
  }, [done, restOrder]);

  useEffect(() => {
    if (reduceMotion || done >= WORKSPACE_SOURCES.length) return;
    const iv = setInterval(() => {
      setRestOrder((prev) => {
        if (prev.length < 2) return prev;
        const next = [...prev];
        const a = Math.floor(Math.random() * next.length);
        let b = Math.floor(Math.random() * next.length);
        if (a === b) b = (b + 1) % next.length;
        [next[a], next[b]] = [next[b], next[a]];
        return next;
      });
    }, 720);
    return () => clearInterval(iv);
  }, [reduceMotion, done]);

  const indexedIds = WORKSPACE_SOURCES.slice(0, done).map((f) => f.id);
  const orderedIds = [...indexedIds, ...restOrder];
  const tripLabel = place.trim() || "your trip";

  return (
    <motion.div
      className="w-full overflow-hidden rounded-2xl border border-border-light/70 bg-linear-to-b from-accent/6 to-background-secondary/80 p-4 shadow-inner"
      animate={reduceMotion ? {} : { y: [0, -4, 0] }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 7.2, repeat: Infinity, ease: EASE_IN_OUT_SMOOTH }
      }
      style={reduceMotion ? undefined : { willChange: "transform" }}
    >
      <div className="mb-3 flex flex-col gap-1 border-b border-border-light/50 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
          <LucideLayers className="h-3.5 w-3.5 text-accent" aria-hidden />
          <span>Sources we're blending</span>
        </div>
        <span className="line-clamp-2 text-[10px] font-medium leading-snug text-heading/80 sm:max-w-[55%] sm:text-right">
          Trip · {tripLabel}
        </span>
      </div>
      <LayoutGroup id="workspace-sources">
        <ul className="space-y-1.5">
          {orderedIds.map((id) => {
            const src = WORKSPACE_SOURCES.find((f) => f.id === id);
            if (!src) return null;
            const idx = indexedIds.indexOf(id);
            const isReady = idx >= 0;
            const isActive = !isReady && id === restOrder[0];
            const SrcIcon = src.Icon;
            return (
              <motion.li
                key={id}
                layout={!reduceMotion}
                transition={layoutSpring}
                style={reduceMotion ? undefined : { willChange: "transform" }}
                className="flex items-center gap-2 rounded-lg border border-border-light/40 bg-white/80 px-2.5 py-2 text-left shadow-sm"
              >
                <SrcIcon
                  className={`h-3.5 w-3.5 shrink-0 ${isReady ? "text-accent" : isActive ? "text-gold" : "text-muted/60"
                    }`}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate text-[10px] font-medium leading-snug text-heading sm:text-[11px]">
                  {src.label}
                </span>
                <span className="shrink-0 text-[9px] font-semibold tracking-wide">
                  {isReady ? (
                    <span className="flex items-center gap-0.5 text-accent">
                      <LucideCheck className="h-3 w-3" aria-hidden />
                      ready
                    </span>
                  ) : isActive ? (
                    <span className="animate-pulse text-gold">on it</span>
                  ) : (
                    <span className="text-muted/50">up next</span>
                  )}
                </span>
              </motion.li>
            );
          })}
        </ul>
      </LayoutGroup>
    </motion.div>
  );
}

const logLineContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};

const logLineItem = {
  hidden: { opacity: 0, x: -8 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.28, ease: EASE_SMOOTH },
  },
};

function WhatsHappeningPanel({
  phaseIndex,
  place,
  reduceMotion,
}: {
  phaseIndex: number;
  place: string;
  reduceMotion: boolean;
}) {
  const lines = activityLinesForPhase(phaseIndex, place);
  const tickerTape = lines.join("    ◆    ");
  const fakeTick =
    `TMAG.ADV +${(42 + phaseIndex * 3.7).toFixed(1)}%  ·  RISKIDX ${(88 - phaseIndex * 2).toFixed(0)}  ·  TRIP.${place.slice(0, 3).toUpperCase() || "INT"}  ·  `;

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-emerald-500/25 bg-[#0c1412] shadow-[inset_0_1px_0_rgba(52,211,153,0.08),0_8px_32px_-8px_rgba(0,0,0,0.35)]"
      role="log"
      aria-live="polite"
      aria-label="What we're doing while your plan generates"
    >
      {/* Subtle scan / market grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(52,211,153,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.4) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden
      />
      {!reduceMotion && (
        <motion.div
          className="pointer-events-none absolute inset-0 bg-linear-to-b from-emerald-400/5 via-transparent to-transparent"
          style={{ willChange: "transform" }}
          animate={{ y: ["-100%", "100%"] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
          aria-hidden
        />
      )}

      <div className="relative z-10 border-b border-emerald-500/20 px-3 py-2.5 sm:px-4">
        <div className="flex flex-wrap items-center gap-2">
          <LucideActivity className="h-3.5 w-3.5 shrink-0 text-emerald-400/80" aria-hidden />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-300/95">
            What's happening right now
          </span>
          <span className="ml-auto flex items-center gap-1.5 font-mono text-[9px] tabular-nums text-emerald-500/70">
            {!reduceMotion && (
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                style={{ willChange: "opacity" }}
                animate={{ opacity: [1, 0.38, 1] }}
                transition={{ duration: 1.65, repeat: Infinity, ease: EASE_IN_OUT_SMOOTH }}
                aria-hidden
              />
            )}
            <span className="text-emerald-400/90">LIVE</span>
            <span className="text-emerald-600/80">PHASE {phaseIndex + 1}/{processingPhases.length}</span>
          </span>
        </div>
      </div>

      {/* Stock-style scrolling ticker */}
      <div className="relative z-10 overflow-hidden border-b border-emerald-500/15 bg-emerald-950/40 py-2">
        {reduceMotion ? (
          <p className="px-3 font-mono text-[10px] leading-relaxed text-emerald-200/85 sm:px-4 sm:text-[11px]">
            {tickerTape}
          </p>
        ) : (
          <motion.div
            className="flex w-max"
            style={{ willChange: "transform" }}
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
          >
            <span className="shrink-0 whitespace-nowrap px-4 font-mono text-[10px] text-emerald-300/90 sm:text-[11px]">
              <span className="text-emerald-500/80">{fakeTick}</span>
              {tickerTape}
            </span>
            <span className="shrink-0 whitespace-nowrap px-4 font-mono text-[10px] text-emerald-300/90 sm:text-[11px]">
              <span className="text-emerald-500/80">{fakeTick}</span>
              {tickerTape}
            </span>
          </motion.div>
        )}
      </div>

      {/* Static detail lines (terminal body) */}
      <div className="relative z-10 space-y-1.5 px-3 py-3 sm:px-4">
        {reduceMotion ? (
          lines.map((line, i) => (
            <div
              key={`${phaseIndex}-${i}`}
              className="wrap-break-word font-mono text-[10px] leading-relaxed text-emerald-100/88 sm:text-[11px]"
            >
              <span className="select-none text-emerald-500/60">{">"} </span>
              {line}
            </div>
          ))
        ) : (
          <motion.div
            key={phaseIndex}
            variants={logLineContainer}
            initial="hidden"
            animate="show"
            className="space-y-1.5"
          >
            {lines.map((line, i) => (
              <motion.div
                key={`${phaseIndex}-${i}-${line.slice(0, 16)}`}
                variants={logLineItem}
                className="wrap-break-word font-mono text-[10px] leading-relaxed text-emerald-100/88 sm:text-[11px]"
              >
                <span className="select-none text-emerald-500/60">{">"} </span>
                {line}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────

const riskColors: Record<string, string> = { Low: "text-accent", Moderate: "text-gold", High: "text-red-600" };
const riskBg: Record<string, string> = { Low: "bg-accent/10", Moderate: "bg-gold/10", High: "bg-red-50" };

const validationStatusColors: Record<string, { text: string; bg: string }> = {
  PENDING: { text: "text-amber-700", bg: "bg-amber-50" },
  APPROVED: { text: "text-emerald-700", bg: "bg-emerald-50" },
  REJECTED: { text: "text-amber-700", bg: "bg-amber-50" },
  ELEVATED: { text: "text-blue-700", bg: "bg-blue-50" },
  NOT_REQUIRED: { text: "text-gray-700", bg: "bg-gray-50" },
};

const validationStatusLabels: Record<string, string> = {
  PENDING: "Doctor review: In progress",
  APPROVED: "Doctor review: Validated",
  REJECTED: "Doctor review: Support follow-up",
  ELEVATED: "Doctor review: Senior review",
  NOT_REQUIRED: "Doctor review",
};

const SUPPORT_CONTACT_PATH = "/contact?type=SUPPORT";
const PLAN_NOT_READY_MESSAGE = "Your plan is still being prepared. Please check back shortly.";
const DOWNLOAD_SUPPORT_MESSAGE = "We couldn't prepare that download right now. Please contact support and we'll help.";

function DoctorAssignmentIndicator({ assignedDoctors, openToAllDoctors }: {
  assignedDoctors?: { firstName?: string; lastName?: string; email?: string }[];
  openToAllDoctors?: boolean;
}) {
  if (openToAllDoctors) {
    return (
      <div className="mt-2 flex items-center gap-2 text-xs text-muted">
        <LucideUsers className="h-3.5 w-3.5" />
        <span>Open to all doctors</span>
      </div>
    );
  }
  if (assignedDoctors && assignedDoctors.length > 0) {
    return (
      <div className="mt-2 text-xs text-muted">
        <span className="font-medium text-heading">Assigned doctors:</span>{" "}
        {assignedDoctors.map((d) => `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim() || d.email).join(", ")}
      </div>
    );
  }
  return null;
}

function ValidationStatusBadge({ status, validatedAt, validatedByName }: {
  status?: string;
  validatedAt?: string | null;
  validatedByName?: string | null;
}) {
  if (!status || status === "NOT_REQUIRED") return null;
  const colors = validationStatusColors[status] ?? validationStatusColors.NOT_REQUIRED;
  return (
    <div className="mt-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        {status === "APPROVED" ? (
          <LucideShieldCheckIcon className="h-4 w-4 text-emerald-600" />
        ) : status === "PENDING" ? (
          <LucideClock className="h-4 w-4 text-amber-600" />
        ) : status === "ELEVATED" ? (
          <LucideShieldAlert className="h-4 w-4 text-blue-600" />
        ) : (
          <LucideAlertTriangle className="h-4 w-4 text-red-600" />
        )}
        <span className={`text-xs font-semibold uppercase tracking-wider ${colors.text}`}>
          {validationStatusLabels[status] ?? "Doctor review"}
        </span>
      </div>
      {status === "APPROVED" && validatedAt && (
        <p className="text-xs text-gray-500">
          Approved by Dr. {validatedByName} on {new Date(validatedAt).toLocaleDateString()}
        </p>
      )}
      {status === "ELEVATED" && (
        <div className="mt-2 rounded-lg bg-blue-50 p-2.5">
          <p className="text-xs text-blue-700">
            Our medical team is taking another look and will update you when the review is complete.
          </p>
        </div>
      )}
      {status === "REJECTED" && (
        <div className="mt-2 rounded-lg bg-amber-50 p-2.5">
          <p className="text-xs text-amber-700">
            Our support team can help with the next steps for this review.
          </p>
        </div>
      )}
      {status === "PENDING" && (
        <p className="text-xs text-gray-500">
          Your plan is awaiting review by a verified travel medicine doctor. You will be notified once validation is complete.
        </p>
      )}
    </div>
  );
}

const planStatusConfig: Record<string, { label: string; text: string; bg: string; icon: typeof LucideCheck }> = {
  COMPLETED: { label: "Completed", text: "text-emerald-700", bg: "bg-emerald-50", icon: LucideCheck },
  PROCESSING: { label: "Processing", text: "text-amber-700", bg: "bg-amber-50", icon: LucideLoader2 },
  QUEUED: { label: "Queued", text: "text-gray-600", bg: "bg-gray-100", icon: LucideClock },
  PENDING: { label: "Pending", text: "text-amber-700", bg: "bg-amber-50", icon: LucideClock },
  FAILED: { label: "Needs attention", text: "text-amber-700", bg: "bg-amber-50", icon: LucideAlertTriangle },
  ERROR: { label: "Needs attention", text: "text-amber-700", bg: "bg-amber-50", icon: LucideAlertTriangle },
};

function PlanStatusBadge({ status }: { status: string }) {
  const config = planStatusConfig[status] ?? { label: status, text: "text-gray-600", bg: "bg-gray-100", icon: LucideFileText };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${config.text} ${config.bg}`}>
      <Icon className={`h-3.5 w-3.5 ${status === "PROCESSING" ? "animate-spin" : ""}`} aria-hidden />
      {config.label}
    </span>
  );
}

const getRiskLabel = (score: number) => {
  if (score <= 1) return "Low";
  if (score === 2) return "Moderate";
  return "High";
};

const safeParse = (str: string | undefined, fallback: unknown = []) => {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

const RING_SIZE = 132;
const RING_STROKE = 4;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

const ORBIT_DIAM = 216;
const ORBIT_R = ORBIT_DIAM / 2;

/** Horizontal “flight paths” across the generating view (planes & PDFs). */
function FlyingAcrossLayer({ reduceMotion }: { reduceMotion: boolean }) {
  if (reduceMotion) return null;
  const flights = [
    { id: "p1", top: "8%", dur: 14, delay: 0, flip: false, node: <LucidePlane className="h-7 w-7 text-accent/50 drop-shadow-sm" strokeWidth={1.75} aria-hidden /> },
    {
      id: "pdf1", top: "22%", dur: 18, delay: 4, flip: false, node: (
        <div className="flex items-center gap-1 rounded-lg border border-red-500/25 bg-white/90 px-2 py-1 shadow-sm">
          <LucideFileText className="h-5 w-5 text-red-600/70" strokeWidth={1.75} aria-hidden />
          <span className="font-mono text-[9px] font-bold uppercase tracking-tight text-red-700/80">pdf</span>
        </div>
      )
    },
    { id: "p2", top: "38%", dur: 12, delay: 2, flip: true, node: <LucidePlane className="h-6 w-6 text-accent/40 drop-shadow-sm" strokeWidth={1.75} aria-hidden /> },
    {
      id: "pdf2", top: "52%", dur: 20, delay: 7, flip: false, node: (
        <div className="flex items-center gap-1 rounded-lg border border-red-500/20 bg-white/85 px-1.5 py-0.5 shadow-sm">
          <LucideFileText className="h-4 w-4 text-red-600/65" strokeWidth={1.75} aria-hidden />
          <span className="font-mono text-[8px] font-bold text-red-700/75">PDF</span>
        </div>
      )
    },
    { id: "p3", top: "68%", dur: 15, delay: 8, flip: false, node: <LucidePlane className="h-5 w-5 text-gold/55" strokeWidth={1.75} aria-hidden /> },
  ] as const;
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-1 h-[min(520px,78vh)] overflow-x-clip overflow-y-visible"
      aria-hidden
    >
      {flights.map((f) => (
        <motion.div
          key={f.id}
          className={`absolute left-0 ${f.flip ? "scale-x-[-1]" : ""}`}
          style={{ top: f.top, willChange: "transform" }}
          initial={{ x: "-20%", opacity: 0 }}
          animate={{
            x: ["-20%", "120%"],
            opacity: [0, 0.88, 0.88, 0],
          }}
          transition={{
            duration: f.dur,
            repeat: Infinity,
            delay: f.delay,
            ease: "linear",
            times: [0, 0.07, 0.93, 1],
          }}
        >
          <motion.div
            style={{ willChange: "transform" }}
            animate={{ y: [0, -5, 0, 4, 0] }}
            transition={{
              duration: 5.5 + f.delay * 0.08,
              repeat: Infinity,
              ease: EASE_IN_OUT_SMOOTH,
            }}
          >
            {f.node}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

/** Small icons orbiting the central progress ring (counter-rotated so they stay upright). */
function OrbitGlyphs({ reduceMotion }: { reduceMotion: boolean }) {
  if (reduceMotion) return null;
  const orbitDuration = 52;
  const slots = [
    { angle: 0, node: <LucidePlane className="h-5 w-5 text-accent/55" strokeWidth={1.85} /> },
    {
      angle: 72, node: (
        <div className="flex items-center gap-0.5 rounded border border-red-500/30 bg-white/90 px-1 py-0.5 shadow-sm">
          <LucideFileText className="h-3.5 w-3.5 text-red-600/75" strokeWidth={2} />
          <span className="text-[7px] font-bold uppercase text-red-700/80">pdf</span>
        </div>
      )
    },
    { angle: 144, node: <LucidePlane className="h-4 w-4 scale-x-[-1] text-accent/40" strokeWidth={1.85} /> },
    { angle: 216, node: <LucideSparkles className="h-4 w-4 text-gold/60" strokeWidth={1.85} /> },
    {
      angle: 288, node: (
        <div className="flex items-center gap-0.5 rounded border border-red-500/25 bg-white/90 px-1 py-0.5 shadow-sm">
          <LucideFileText className="h-3.5 w-3.5 text-red-600/70" strokeWidth={2} />
        </div>
      )
    },
  ];
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2"
      style={{ width: ORBIT_DIAM, height: ORBIT_DIAM, willChange: "transform" }}
      animate={{ rotate: 360 }}
      transition={{ duration: orbitDuration, repeat: Infinity, ease: "linear" }}
      aria-hidden
    >
      {slots.map((s) => (
        <div
          key={s.angle}
          className="absolute left-1/2 top-1/2 h-0 w-0"
          style={{
            transform: `rotate(${s.angle}deg) translateY(-${ORBIT_R}px)`,
          }}
        >
          <motion.div
            className="-translate-x-1/2 -translate-y-1/2"
            style={{ willChange: "transform" }}
            animate={{ rotate: -360 }}
            transition={{ duration: orbitDuration, repeat: Infinity, ease: "linear" }}
          >
            {s.node}
          </motion.div>
        </div>
      ))}
    </motion.div>
  );
}

type PhaseIconComponent = (typeof phaseIconMap)[keyof typeof phaseIconMap];

/** Phase medical icon with “twinkle” / star-like pulse (glow + scale), not a star shape. */
function PulsingPhaseCore({
  phaseKey,
  Icon,
  reduceMotion,
}: {
  phaseKey: string;
  Icon: PhaseIconComponent;
  reduceMotion: boolean;
}) {
  return (
    <div
      className="relative flex h-23 w-23 items-center justify-center"
      style={reduceMotion ? undefined : { willChange: "transform" }}
      aria-hidden
    >
      {!reduceMotion && (
        <>
          <motion.div
            className="absolute rounded-full bg-gold/20 blur-2xl"
            style={{ width: 104, height: 104, willChange: "transform, opacity" }}
            animate={{ scale: [0.75, 1.12, 0.75], opacity: [0.32, 0.68, 0.32] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: EASE_IN_OUT_SMOOTH }}
          />
          <motion.div
            className="absolute rounded-full bg-accent/18 blur-xl"
            style={{ width: 90, height: 90, willChange: "transform, opacity" }}
            animate={{ scale: [1, 1.18, 1], opacity: [0.22, 0.48, 0.22] }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: EASE_IN_OUT_SMOOTH,
              delay: 0.25,
            }}
          />
          <motion.div
            className="absolute h-26.5 w-26.5 rounded-full border border-gold/30"
            style={{ willChange: "transform, opacity" }}
            animate={{ scale: [1, 1.05, 1], opacity: [0.18, 0.42, 0.18] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: EASE_IN_OUT_SMOOTH }}
          />
        </>
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={phaseKey}
          className="relative z-10"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 26, mass: 0.85 }}
        >
          <motion.div
            animate={
              reduceMotion
                ? {}
                : {
                  scale: [1, 1.08, 1],
                }
            }
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: EASE_IN_OUT_SMOOTH,
            }}
            style={reduceMotion ? undefined : { willChange: "transform" }}
          >
            <Icon
              className="h-9 w-9 text-accent drop-shadow-[0_0_20px_rgba(42,122,106,0.45)] sm:h-10 sm:w-10"
              strokeWidth={1.75}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
      {!reduceMotion && (
        <motion.div
          className="pointer-events-none absolute z-20 text-white/90"
          style={{ top: "6%", right: "10%", willChange: "transform, opacity" }}
          animate={{
            opacity: [0, 0.95, 0],
            scale: [0.5, 1.05, 0.5],
          }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: EASE_IN_OUT_SMOOTH,
            delay: 0.6,
          }}
        >
          <LucideSparkles className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.75} />
        </motion.div>
      )}
    </div>
  );
}

// ─── Loading skeleton ───────────────────────────────────────

function PlanDetailsSkeleton({ reduceMotion }: { reduceMotion: boolean }) {
  const pulse = reduceMotion
    ? {}
    : { opacity: [0.45, 0.75, 0.45] };
  const pulseTransition = reduceMotion
    ? undefined
    : { duration: 2, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <div className="space-y-6">
      <motion.div
        className="h-4 w-28 rounded-md bg-border-light/60"
        animate={pulse}
        transition={pulseTransition}
      />
      <motion.div
        className={cn(DASHBOARD_GLASS_SURFACE, "p-6 md:p-8 space-y-6 overflow-hidden")}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.35, ease: "easeOut" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-3 flex-1">
            <motion.div
              className="h-8 max-w-sm rounded-lg bg-heading/10"
              animate={pulse}
              transition={pulseTransition}
            />
            <motion.div
              className="h-4 max-w-xs rounded-md bg-border-light/70"
              animate={pulse}
              transition={{ ...pulseTransition, delay: 0.15 }}
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <motion.div
              className="h-9 w-24 rounded-full bg-border-light/60"
              animate={pulse}
              transition={pulseTransition}
            />
            <motion.div
              className="h-9 w-32 rounded-xl bg-border-light/60"
              animate={pulse}
              transition={{ ...pulseTransition, delay: 0.08 }}
            />
          </div>
        </div>
        <motion.div
          className="h-3 w-full max-w-md rounded-full bg-border-light/50"
          animate={pulse}
          transition={{ ...pulseTransition, delay: 0.1 }}
        />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={cn(DASHBOARD_GLASS_SURFACE, "p-6 space-y-4 h-48")}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.4,
              delay: reduceMotion ? 0 : 0.05 * i,
              ease: "easeOut",
            }}
          >
            <div className="flex items-center gap-2">
              <motion.div
                className="h-7 w-7 rounded-lg bg-heading/15"
                animate={pulse}
                transition={{ ...pulseTransition, delay: i * 0.05 }}
              />
              <motion.div
                className="h-4 flex-1 max-w-[40%] rounded-md bg-border-light/60"
                animate={pulse}
                transition={{ ...pulseTransition, delay: i * 0.05 + 0.05 }}
              />
            </div>
            <div className="space-y-2 pt-2">
              {[1, 2, 3].map((j) => (
                <motion.div
                  key={j}
                  className="h-3 rounded-md bg-border-light/45"
                  style={{ width: `${88 - j * 12}%` }}
                  animate={pulse}
                  transition={{
                    ...pulseTransition,
                    delay: 0.1 * j + i * 0.04,
                  }}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-center text-xs text-muted">
        Fetching your travel health advisory…
      </p>
    </div>
  );
}

// ─── Processing Screen ──────────────────────────────────────

const PlanProcessing = ({ destination, country }: { destination?: string; country?: string }) => {
  const reduceMotion = useReducedMotion();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % processingPhases.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) {
      setProgress(40);
      return;
    }
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        const increment = Math.random() * 2.8 + 0.4;
        return Math.min(prev + increment, 92);
      });
    }, 650);
    return () => clearInterval(interval);
  }, [reduceMotion, setProgress]);

  const phase = processingPhases[phaseIndex];
  const place = destination || country || "your destination";
  const PhaseIcon = phaseIconMap[phase.icon];
  const strokeDashoffset = RING_CIRC * (1 - progress / 100);

  const textTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 280, damping: 30, mass: 0.88 };

  return (
    <div className="relative mx-auto max-w-3xl overflow-x-clip px-4 py-10 sm:py-14">
      <FlyingAcrossLayer reduceMotion={!!reduceMotion} />
      {/* Ambient glow */}
      {!reduceMotion && (
        <motion.div
          className="pointer-events-none absolute left-1/2 top-28 z-1 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/12 blur-3xl"
          style={{ willChange: "transform, opacity" }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.34, 0.52, 0.34] }}
          transition={{ duration: 6.4, repeat: Infinity, ease: EASE_IN_OUT_SMOOTH }}
        />
      )}

      <div className="relative z-2 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,1fr)] lg:items-start lg:gap-12">
        {/* Left: hero */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          {/* Ring + orbit + orb + phase icon */}
          <div className="relative mb-8 flex h-[min(220px,42vw)] w-[min(220px,42vw)] max-h-55 max-w-55 shrink-0 items-center justify-center lg:mx-0">
            <OrbitGlyphs reduceMotion={!!reduceMotion} />
            <div className="relative z-10 flex items-center justify-center" style={{ width: RING_SIZE, height: RING_SIZE }}>
              <svg
                width={RING_SIZE}
                height={RING_SIZE}
                className="absolute -rotate-90"
                aria-hidden
              >
                <circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_RADIUS}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={RING_STROKE}
                  className="text-border-light/50"
                />
                <motion.circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_RADIUS}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={RING_STROKE}
                  strokeLinecap="round"
                  className="text-accent"
                  strokeDasharray={RING_CIRC}
                  initial={false}
                  animate={{ strokeDashoffset }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.9,
                    ease: reduceMotion ? "linear" : EASE_SMOOTH,
                  }}
                />
              </svg>

              <div className="relative flex h-23 w-23 items-center justify-center rounded-full bg-linear-to-br from-white/95 to-accent/8 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-gold/25">
                <PulsingPhaseCore
                  phaseKey={`${phase.icon}-${phaseIndex}`}
                  Icon={PhaseIcon}
                  reduceMotion={!!reduceMotion}
                />
              </div>
            </div>
          </div>

          {/* Phase copy */}
          <div className="relative min-h-22 w-full max-w-md px-1 lg:max-w-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={phaseIndex}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
                transition={textTransition}
                aria-live="polite"
              >
                <h2 className="text-2xl sm:text-3xl font-serif text-heading mb-2 tracking-tight lg:mx-0 mx-auto max-w-md">
                  {phase.title}
                </h2>
                <p className="text-sm text-muted leading-relaxed max-w-md lg:mx-0 mx-auto lg:max-w-lg">
                  {phase.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Destination chip */}
          <motion.div
            className="mt-6 flex items-center gap-2 rounded-full border border-accent/20 bg-accent/8 px-4 py-2.5 shadow-sm"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: reduceMotion ? 0 : 0.2, duration: 0.4 }}
          >
            <LucideMapPin className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
            <span className="max-w-60 truncate text-xs font-semibold text-accent sm:max-w-xs">
              {place}
            </span>
            {!reduceMotion && (
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/50 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
            )}
          </motion.div>
        </div>

        {/* Right: sorting file stack */}
        <WorkspaceSourceRail phaseIndex={phaseIndex} reduceMotion={!!reduceMotion} place={place} />
      </div>

      <div className="relative mt-10">
        <WhatsHappeningPanel phaseIndex={phaseIndex} place={place} reduceMotion={!!reduceMotion} />
      </div>

      {/* Step indicators */}
      <div
        className="mb-6 mt-10 flex flex-wrap items-center justify-center gap-1.5 px-2"
        role="status"
        aria-live="polite"
        aria-label={`Phase ${phaseIndex + 1} of ${processingPhases.length}`}
      >
        {processingPhases.map((_, i) => {
          const active = i === phaseIndex;
          const done = i < phaseIndex;
          return (
            <motion.div
              key={i}
              className={`h-2 rounded-full ${done || active ? "bg-accent" : "bg-border-light/70"
                }`}
              initial={false}
              animate={{
                width: active ? 20 : 6,
                opacity: done ? 0.45 : active ? 1 : 0.35,
              }}
              transition={layoutSpring}
              style={reduceMotion ? undefined : { willChange: "width, opacity" }}
            />
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mx-auto w-full max-w-sm">
        <div className="relative h-2 overflow-hidden rounded-full bg-border-light/60">
          {!reduceMotion && (
            <motion.div
              className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-white/35 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
              style={{ width: "45%", willChange: "transform" }}
            />
          )}
          <motion.div
            className="h-full rounded-full bg-linear-to-r from-accent/90 to-accent"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{
              duration: reduceMotion ? 0 : 0.75,
              ease: EASE_IN_OUT_SMOOTH,
            }}
            style={reduceMotion ? undefined : { willChange: "width" }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
          <span>
            Phase {phaseIndex + 1} / {processingPhases.length}
          </span>
          <span className="tabular-nums font-medium text-heading/80">{Math.round(progress)}%</span>
        </div>
      </div>

      <motion.p
        className="mt-8 max-w-md text-center text-xs leading-relaxed text-muted/70 mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduceMotion ? 0 : 0.35 }}
      >
        Most plans finish in 30–60 seconds. We'll refresh this page as soon as yours is ready it's fine to
        leave the tab open.
      </motion.p>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────

const listContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.08 },
  },
};

const listItem = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 380, damping: 30 },
  },
};

/** Framer requires defined keys when using initial="hidden" animate="show". */
const staticListVariants = {
  hidden: { opacity: 1 },
  show: { opacity: 1, transition: { duration: 0 } },
};

const PlanDetails = () => {
  const { id } = useParams<{ id: string }>();
  const planId = parseInt(id || "0", 10);
  const { data: plan, isLoading } = useTravelPlan(planId);
  const { mutateAsync: downloadSummaryPdfBlob } = useTravelPlanSummaryPdf();
  const reduceMotion = useReducedMotion();
  const sectionContainerVariants = reduceMotion ? staticListVariants : listContainer;
  const sectionItemVariants = reduceMotion ? staticListVariants : listItem;

  const parsedContent = parseGeneratedPlanContent(plan?.generatedPlan?.planJson ?? null);
  const useStructuredLayout = parsedContent != null && hasGeneratedPlanLayout(parsedContent);
  const canDownloadPdf = canDownloadTravelPlanPdf(plan?.status);
  const canDownloadSummaryPdf = canDownloadTravelPlanSummaryPdf(plan?.status, plan?.planTier);
  const showSummaryPdfButton = isPaidTravelPlanTier(plan?.planTier);

  const [pdfLoading, setPdfLoading] = useState(false);
  const [summaryPdfLoading, setSummaryPdfLoading] = useState(false);

  const downloadBlob = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, []);

  const planFilenameSlug = useCallback((destination: string | null | undefined) => {
    return (
      destination
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 48) || "travel-health-plan"
    );
  }, []);

  const handleDownloadPdf = useCallback(async () => {
    if (!plan) {
      return;
    }
    if (plan.status !== "COMPLETED") {
      toast(PLAN_NOT_READY_MESSAGE);
      return;
    }
    setPdfLoading(true);

    if (plan.doctorValidationStatus === "APPROVED" && plan.signedPdfUrl) {
      window.open(plan.signedPdfUrl, "_blank", "noopener");
      setPdfLoading(false);
      return;
    }

    try {
      const blob = await travelPlansApi.downloadPdfBlob(plan.id);
      const slug = planFilenameSlug(plan.destination);
      downloadBlob(blob, `${slug}-travel-health.pdf`);
      toast.success("Travel health plan downloaded");
    } catch (err) {
      console.error(err);
      toast(DOWNLOAD_SUPPORT_MESSAGE);
    } finally {
      setPdfLoading(false);
    }
  }, [downloadBlob, plan, planFilenameSlug]);

  const handleDownloadSummaryPdf = useCallback(async () => {
    if (!plan) {
      return;
    }
    if (plan.status !== "COMPLETED") {
      toast(PLAN_NOT_READY_MESSAGE);
      return;
    }
    if (!isPaidTravelPlanTier(plan.planTier)) {
      return;
    }

    const summaryPdfUrl = plan.summaryPdfUrl ?? plan.generatedPlan?.summaryPdfUrl;
    setSummaryPdfLoading(true);

    if (summaryPdfUrl) {
      window.open(summaryPdfUrl, "_blank", "noopener");
      setSummaryPdfLoading(false);
      return;
    }

    try {
      const blob = await downloadSummaryPdfBlob(plan.id);
      const slug = planFilenameSlug(plan.destination);
      downloadBlob(blob, `${slug}-travel-health-summary.pdf`);
      toast.success("Travel health summary downloaded");
    } catch (err) {
      console.error(err);
      toast(DOWNLOAD_SUPPORT_MESSAGE);
    } finally {
      setSummaryPdfLoading(false);
    }
  }, [downloadBlob, downloadSummaryPdfBlob, plan, planFilenameSlug]);

  if (isLoading) {
    return (
      <div>
        <DashboardHeader title="Plan details" />
        <PlanDetailsSkeleton reduceMotion={!!reduceMotion} />
      </div>
    );
  }

  if (!plan) {
    return (
      <div>
        <DashboardHeader title="Plan not found" />
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.3 }}
        >
          <p className="text-sm text-body">This plan doesn't exist or has been deleted.</p>
          <Link
            to="/dashboard/plans"
            className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
          >
            Back to plans
          </Link>
        </motion.div>
      </div>
    );
  }

  if (isTravelPlanGeneratingStatus(plan.status)) {
    return (
      <div>
        <DashboardHeader title="Generating your plan" />
        <Link
          to="/dashboard/plans"
          className="mb-2 inline-flex items-center gap-1 text-xs text-muted transition-colors duration-200 hover:text-heading"
        >
          <LucideArrowLeft className="h-3 w-3" /> Back to plans
        </Link>
        <PlanProcessing destination={plan.destination} country={plan.country} />
      </div>
    );
  }

  if (plan.status === "FAILED") {
    return (
      <div>
        <DashboardHeader title="Plan needs attention" />
        <Link
          to="/dashboard/plans"
          className="mb-6 inline-flex items-center gap-1 text-xs text-muted transition-colors duration-200 hover:text-heading"
        >
          <LucideArrowLeft className="h-3 w-3" /> Back to plans
        </Link>
        <motion.div
          className="rounded-2xl border border-amber-200/80 bg-amber-50/90 p-6 shadow-sm"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
        >
          <div className="flex items-start gap-3">
            <LucideShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
            <div className="min-w-0 space-y-3">
              <div className="space-y-2">
                <p className="font-semibold text-amber-950">
                  We&apos;re taking a closer look at this plan.
                </p>
                <p className="text-sm text-amber-900/85">
                  Something didn&apos;t finish as expected, but you don&apos;t need to troubleshoot it here.
                  Our support team can help get this sorted.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  to={SUPPORT_CONTACT_PATH}
                  className="inline-flex items-center rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white transition-colors duration-200 hover:bg-accent-dark"
                >
                  Contact support
                </Link>
                <Link
                  to="/dashboard/plans"
                  className="inline-flex items-center rounded-xl border border-amber-200 bg-white/75 px-4 py-2 text-xs font-semibold text-amber-900 transition-colors duration-200 hover:bg-white"
                >
                  View all plans
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const needsDoctorApproval =
    plan.doctorValidationStatus === "PENDING" || plan.doctorValidationStatus === "ELEVATED" || plan.doctorValidationStatus === "REJECTED";
  const isElevated = plan.doctorValidationStatus === "ELEVATED";
  const isRejected = plan.doctorValidationStatus === "REJECTED";
  const doctorReviewNotice = needsDoctorApproval ? (
    <motion.div
      className={cn(
        DASHBOARD_GLASS_SURFACE,
        "mb-6 p-6 md:p-8",
        isElevated ? "border-blue-200/80" : isRejected ? "border-red-200/80" : "border-amber-200/80",
      )}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
    >
      <div className="flex items-start gap-3">
        {isElevated ? (
          <LucideShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden />
        ) : isRejected ? (
          <LucideAlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden />
        ) : (
          <LucideClock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
        )}
        <div className="min-w-0 space-y-2">
          <p className={`font-semibold ${isElevated ? "text-blue-900" : isRejected ? "text-red-900" : "text-amber-900"}`}>
            {isElevated
              ? "Your plan has been elevated for senior review."
              : isRejected
              ? "Your plan needs support follow-up."
              : "Your plan is awaiting review by a verified travel medicine doctor."}
          </p>
          <p className={`text-sm ${isElevated ? "text-blue-900/85" : isRejected ? "text-red-900/85" : "text-amber-900/85"}`}>
            {isElevated
              ? "Your travel health plan has been escalated for further expert review by our senior medical team. You can preview and download the current plan below while we complete the review."
              : isRejected
              ? "The reviewing doctor asked our team to help with next steps. You can still preview and download the current plan below while we support you."
              : "You can preview and download the plan below while the doctor completes their review. We'll notify you once validation is complete."}
          </p>
          {(isElevated || isRejected) && (
            <div className={`mt-3 rounded-lg border ${isElevated ? "border-blue-200/60 bg-blue-50/80" : "border-amber-200/60 bg-amber-50/80"} p-3`}>
              <p className={`text-sm ${isElevated ? "text-blue-700" : "text-amber-700"}`}>
                {isElevated
                  ? "Our medical team is taking another look and will update you when the review is complete."
                  : "Our support team can walk you through the next steps for this review."}
              </p>
            </div>
          )}
          {isRejected && plan.validatedByName && plan.validatedAt && (
            <p className="text-xs text-red-700/70">
              Reviewed by Dr. {plan.validatedByName} on {new Date(plan.validatedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  ) : null;

  if (useStructuredLayout) {
    const riskLabel = getRiskLabel(plan.riskScore);
    return (
      <div>
        <DashboardHeader title="Plan details" />

        <Link
          to="/dashboard/plans"
          className="mb-6 inline-flex items-center gap-1 text-xs text-muted transition-colors duration-200 hover:text-heading"
        >
          <LucideArrowLeft className="h-3 w-3" /> Back to plans
        </Link>

        {doctorReviewNotice}

        <motion.div
          className={cn(DASHBOARD_GLASS_SURFACE, "mb-6 p-6 md:p-8")}
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
        >
          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <GeneratedPlanHeroMeta plan={plan} content={parsedContent} />
            <div className="flex flex-wrap items-center gap-3">
              <PlanStatusBadge status={plan.status} />
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${riskColors[riskLabel]} ${riskBg[riskLabel]}`}
              >
                {riskLabel} risk
              </span>
              <button
                type="button"
                disabled={pdfLoading || !canDownloadPdf}
                title={!canDownloadPdf ? "Download is available when your plan is completed." : undefined}
                onClick={() => void handleDownloadPdf()}
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-button-secondary px-4 py-2 text-xs font-semibold text-heading transition-colors duration-200 hover:bg-border-light disabled:cursor-not-allowed disabled:opacity-55"
              >
                {pdfLoading ? (
                  <LucideLoader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                ) : (
                  <LucideDownload className="h-3.5 w-3.5 shrink-0" aria-hidden />
                )}
                {pdfLoading ? "Preparing PDF…" : "Download PDF"}
              </button>
              {showSummaryPdfButton && (
                <button
                  type="button"
                  disabled={summaryPdfLoading || !canDownloadSummaryPdf}
                  title={!canDownloadPdf ? "Summary download is available when your plan is completed." : undefined}
                  onClick={() => void handleDownloadSummaryPdf()}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-accent/20 bg-accent/10 px-4 py-2 text-xs font-semibold text-accent transition-colors duration-200 hover:bg-accent/15 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {summaryPdfLoading ? (
                    <LucideLoader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                  ) : (
                    <LucideFileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  )}
                  {summaryPdfLoading ? "Preparing summary…" : "Download Summary"}
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1 text-xs text-muted sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-1">
            <span>Recorded: {new Date(plan.createdAt).toLocaleDateString()}</span>
            <span className="hidden sm:inline">·</span>
            <span>1 credit consumed</span>
          </div>
          <div className="mt-2">
            <GenerationMetaLine plan={plan} />
          </div>
          <ValidationStatusBadge
            status={plan.doctorValidationStatus}
            validatedAt={plan.validatedAt}
            validatedByName={plan.validatedByName}
          />
          <DoctorAssignmentIndicator
            assignedDoctors={plan.assignedDoctors}
            openToAllDoctors={plan.openToAllDoctors}
          />
        </motion.div>

        <GeneratedPlanReport content={parsedContent} />
      </div>
    );
  }

  const vaccinations = safeParse(plan.vaccinations);
  const healthAlerts = safeParse(plan.healthAlerts);
  const safetyAdvisories = safeParse(plan.safetyAdvisories);
  const medications = safeParse(plan.medications);
  const waterFood = safeParse(plan.waterFood);
  const emergencyContacts = safeParse(plan.emergencyContacts);

  const riskLabel = getRiskLabel(plan.riskScore);

  const sections = [
    {
      icon: <LucideSyringe className="h-4 w-4" />,
      title: "Vaccinations",
      content: (
        <div className="space-y-2">
          {Array.isArray(vaccinations) ? (
            vaccinations.map((v: { name?: string; vaccine?: string; status: string }, i: number) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <span className="text-sm text-heading">{v.name ?? v.vaccine ?? ""}</span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${v.status === "Required"
                    ? "bg-red-50 text-red-600"
                    : v.status === "Recommended"
                      ? "bg-gold/10 text-gold"
                      : "bg-button-secondary text-muted"
                    }`}
                >
                  {v.status}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-body">{plan.vaccinations}</p>
          )}
        </div>
      ),
    },
    {
      icon: <LucideAlertTriangle className="h-4 w-4" />,
      title: "Health alerts",
      content: (
        <ul className="space-y-2">
          {Array.isArray(healthAlerts) ? (
            healthAlerts.map((a: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-body">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                {a}
              </li>
            ))
          ) : (
            <p className="text-sm text-body">{plan.healthAlerts}</p>
          )}
        </ul>
      ),
    },
    {
      icon: <LucideShieldCheck className="h-4 w-4" />,
      title: "Safety advisories",
      content: (
        <ul className="space-y-2">
          {Array.isArray(safetyAdvisories) ? (
            safetyAdvisories.map((a: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-body">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {a}
              </li>
            ))
          ) : (
            <p className="text-sm text-body">{plan.safetyAdvisories}</p>
          )}
        </ul>
      ),
    },
    {
      icon: <LucidePill className="h-4 w-4" />,
      title: "Medications",
      content: (
        <ul className="space-y-2">
          {Array.isArray(medications) ? (
            medications.map((m: string, i: number) => (
              <li key={i} className="text-sm text-body">
                {m}
              </li>
            ))
          ) : (
            <p className="text-sm text-body">{plan.medications}</p>
          )}
        </ul>
      ),
    },
    {
      icon: <LucideDroplets className="h-4 w-4" />,
      title: "Water & food safety",
      content: (
        <ul className="space-y-2">
          {Array.isArray(waterFood) ? (
            waterFood.map((w: string, i: number) => (
              <li key={i} className="text-sm text-body">
                {w}
              </li>
            ))
          ) : (
            <p className="text-sm text-body">{plan.waterFood}</p>
          )}
        </ul>
      ),
    },
    {
      icon: <LucidePhone className="h-4 w-4" />,
      title: "Emergency contacts",
      content: (
        <div className="space-y-2">
          {Array.isArray(emergencyContacts) ? (
            emergencyContacts.map((c: { label: string; value: string }, i: number) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted">{c.label}</span>
                <span className="text-sm font-medium text-heading">{c.value}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-body">{plan.emergencyContacts}</p>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <DashboardHeader title="Plan details" />

      <Link
        to="/dashboard/plans"
        className="mb-6 inline-flex items-center gap-1 text-xs text-muted transition-colors duration-200 hover:text-heading"
      >
        <LucideArrowLeft className="h-3 w-3" /> Back to plans
      </Link>

      {doctorReviewNotice}

      <motion.div
        className={cn(DASHBOARD_GLASS_SURFACE, "mb-6 p-6 md:p-8")}
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
      >
        <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-serif text-xl text-heading md:text-2xl">{plan.destination}</h2>
            <p className="mt-1 text-sm text-muted">
              {plan.country} · {plan.duration} days · {plan.purpose}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <PlanStatusBadge status={plan.status} />
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${riskColors[riskLabel]} ${riskBg[riskLabel]}`}
            >
              {riskLabel} risk
            </span>
            <button
              type="button"
              disabled={pdfLoading || !canDownloadPdf}
              title={!canDownloadPdf ? "Download is available when your plan is completed." : undefined}
              onClick={() => void handleDownloadPdf()}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-button-secondary px-4 py-2 text-xs font-semibold text-heading transition-colors duration-200 hover:bg-border-light disabled:cursor-not-allowed disabled:opacity-55"
            >
              {pdfLoading ? (
                <LucideLoader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
              ) : (
                <LucideDownload className="h-3.5 w-3.5 shrink-0" aria-hidden />
              )}
              {pdfLoading ? "Preparing PDF…" : "Download PDF"}
            </button>
            {showSummaryPdfButton && (
              <button
                type="button"
                disabled={summaryPdfLoading || !canDownloadSummaryPdf}
                title={!canDownloadPdf ? "Summary download is available when your plan is completed." : undefined}
                onClick={() => void handleDownloadSummaryPdf()}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-accent/20 bg-accent/10 px-4 py-2 text-xs font-semibold text-accent transition-colors duration-200 hover:bg-accent/15 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {summaryPdfLoading ? (
                  <LucideLoader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                ) : (
                  <LucideFileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
                )}
                {summaryPdfLoading ? "Preparing summary…" : "Download Summary"}
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span>Generated: {new Date(plan.createdAt).toLocaleDateString()}</span>
          <span className="hidden sm:inline">·</span>
          <span>1 credit consumed</span>
        </div>
        <ValidationStatusBadge
          status={plan.doctorValidationStatus}
          validatedAt={plan.validatedAt}
          validatedByName={plan.validatedByName}
        />
        <DoctorAssignmentIndicator
          assignedDoctors={plan.assignedDoctors}
          openToAllDoctors={plan.openToAllDoctors}
        />
        {plan.medicalConsiderations && (
          <div className="mt-4 rounded-xl border border-gold/10 bg-gold/5 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gold">
              Medical considerations
            </p>
            <p className="text-sm text-heading">{plan.medicalConsiderations}</p>
          </div>
        )}
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-6 md:grid-cols-2"
        variants={sectionContainerVariants}
        initial="hidden"
        animate="show"
      >
        {sections.map((section) => (
          <motion.div
            key={section.title}
            variants={sectionItemVariants}
            className={cn(DASHBOARD_GLASS_SURFACE, "p-6")}
          >
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-dark text-background-primary">
                {section.icon}
              </div>
              <h3 className="text-sm font-semibold text-heading">{section.title}</h3>
            </div>
            {section.content}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default PlanDetails;

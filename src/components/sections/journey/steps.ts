import type { LucideIcon } from "lucide-react";
import {
    LucideUserPlus,
    LucideClipboardList,
    LucideSparkles,
    LucideStethoscope,
    LucideMailCheck,
} from "lucide-react";

/**
 * Cubic-bezier easings shared across the journey animation. Mirrors the pacing
 * used by the dashboard plan-processing experience for a consistent feel.
 * Typed as a mutable 4-tuple so framer-motion accepts it as a `BezierDefinition`.
 */
export const EASE_SMOOTH = [0.22, 1, 0.36, 1] as [number, number, number, number];
export const EASE_IN_OUT_SMOOTH = [0.45, 0, 0.55, 1] as [number, number, number, number];

export interface JourneyStep {
    /** Stable key, also used to pick the matching in-phone screen. */
    id: string;
    /** Two-digit ordinal shown in the copy column, e.g. "01". */
    index: string;
    /** Short uppercase eyebrow describing the step. */
    label: string;
    title: string;
    description: string;
    /**
     * Supporting prose rendered beside the phone. This carries the meaning the
     * animation merely illustrates, so the process stays fully readable without
     * motion (accessibility + reduced-motion fallback).
     */
    insight: string;
    Icon: LucideIcon;
}

/**
 * The five-step journey to a doctor-approved travel plan. Drives both the copy
 * column and the ordering of the in-phone screens — add a step here and a
 * matching screen in `screens.tsx` to extend the walkthrough.
 */
export const JOURNEY_STEPS: readonly JourneyStep[] = [
    {
        id: "register",
        index: "01",
        label: "Create account",
        title: "Start with a free account",
        description:
            "Sign up in seconds with your name and email  no card required to build your travel health profile.",
        insight:
            "One secure account covers every trip you take. Your details stay encrypted and are never sold.",
        Icon: LucideUserPlus,
    },
    {
        id: "questionnaire",
        index: "02",
        label: "Tell us your trip",
        title: "Answer a short, guided questionnaire",
        description:
            "Share your destination, dates, purpose of travel, and a quick medical history.",
        insight:
            "Smart branching means you only answer what's relevant to where  and who  you are.",
        Icon: LucideClipboardList,
    },
    {
        id: "processing",
        index: "03",
        label: "Plan generated",
        title: "We build your personalised plan",
        description:
            "Our engine cross-references WHO and CDC guidance, live outbreak data, and your health profile.",
        insight:
            "Destination requirements, vaccines, and medication checks  analysed in moments, not weeks.",
        Icon: LucideSparkles,
    },
    {
        id: "doctor-review",
        index: "04",
        label: "Physician review",
        title: "A licensed doctor reviews it",
        description:
            "Every plan that needs clinical judgement is checked and signed off by a travel-medicine physician.",
        insight:
            "Real oversight, not just an algorithm. Approved plans carry the Dr. Reviewed seal.",
        Icon: LucideStethoscope,
    },
    {
        id: "email",
        index: "05",
        label: "Delivered",
        title: "Your plan lands in your inbox",
        description:
            "Receive a polished, downloadable travel health plan  ready to share with clinics or insurers.",
        insight:
            "PDF summary, medication lists, and emergency contacts, delivered the moment it's approved.",
        Icon: LucideMailCheck,
    },
];

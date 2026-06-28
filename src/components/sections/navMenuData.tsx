import type { ComponentType } from "react";
import {
    LucideInfo,
    LucideSparkles,
    LucideDollarSign,
    LucideBuilding2,
    LucideShoppingBag,
    LucideRoute,
    LucideStethoscope,
    LucideUsers,
    LucideHandshake,
} from "lucide-react";

type IconType = ComponentType<{ className?: string }>;

export interface MenuLink {
    label: string;
    href: string;
    desc: string;
    icon: IconType;
    badge?: string;
}

export interface MenuFeature {
    eyebrow: string;
    title: string;
    body: string;
    href: string;
    cta: string;
}

export interface MenuCategory {
    id: string;
    title: string;
    blurb: string;
    icon: IconType;
    links: MenuLink[];
    feature: MenuFeature;
}

export interface DirectLink {
    label: string;
    href: string;
}

/**
 * Mega-menu categories. Each one renders as a hoverable trigger in the navbar
 * and expands into a three-region panel (intro · links grid · promo card).
 * Account actions (Sign in / Get Started / Dashboard) live in the navbar's
 * right cluster, and "Contact" is surfaced via DIRECT_LINKS, so every link
 * from the previous full-page menu remains reachable.
 */
export const MENU: MenuCategory[] = [
    {
        id: "explore",
        title: "Explore",
        blurb: "Discover what TMAG does and how we approach travel medicine.",
        icon: LucideRoute,
        links: [
            { label: "About Us", href: "/about", desc: "Our mission, team, and the people behind TMAG.", icon: LucideInfo },
            { label: "How It Works", href: "/how-it-works", desc: "From questionnaire to validated travel plan.", icon: LucideSparkles },
            { label: "Plans", href: "/pricing", desc: "Personal plans and credit options that scale.", icon: LucideDollarSign },
            { label: "For Organizations", href: "/for-companies", desc: "Travel health programs for teams and HR.", icon: LucideBuilding2 },
            { label: "Shop", href: "/shop", desc: "E-books and travel health essentials.", icon: LucideShoppingBag },
        ],
        feature: {
            eyebrow: "New",
            title: "Plan a trip in minutes",
            body: "Get a doctor-validated travel health plan tailored to your itinerary and medical history.",
            href: "/pricing",
            cta: "Start a plan",
        },
    },
    {
        id: "partners",
        title: "Partners",
        blurb: "Partner with TMAG as a physician reviewer or affiliate.",
        icon: LucideHandshake,
        links: [
            { label: "Become a physician reviewer", href: "/apply-as-doctor", desc: "Validate travel health assessments and join our clinical network.", icon: LucideStethoscope },
            { label: "Become an affiliate", href: "/apply-as-affiliate", desc: "Earn commissions by referring travellers and organizations.", icon: LucideUsers },
        ],
        feature: {
            eyebrow: "Earn",
            title: "Become an affiliate",
            body: "Share TMAG with your audience and earn on every traveler you bring in.",
            href: "/apply-as-affiliate",
            cta: "Apply now",
        },
    },
];

/** Top-level links rendered inline beside the mega-menu triggers. */
export const DIRECT_LINKS: DirectLink[] = [
    { label: "Contact", href: "/contact" },
];

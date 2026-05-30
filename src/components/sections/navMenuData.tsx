import type { ComponentType } from "react";
import {
    LucideInfo,
    LucideSparkles,
    LucideDollarSign,
    LucideBuilding2,
    LucideShoppingBag,
    LucideRoute,
    LucideBookOpen,
    LucideLifeBuoy,
    LucideHelpCircle,
    LucideNewspaper,
    LucideActivity,
    LucideStethoscope,
    LucideUsers,
    LucideMap,
    LucideGlobe,
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
            { label: "For Companies", href: "/for-companies", desc: "Travel health programs for teams and HR.", icon: LucideBuilding2 },
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
        id: "resources",
        title: "Resources",
        blurb: "Stay informed before, during, and after your trip.",
        icon: LucideBookOpen,
        links: [
            { label: "Blog", href: "/blog", desc: "Travel medicine insights and field notes.", icon: LucideBookOpen, badge: "Soon" },
            { label: "Help Center", href: "/help", desc: "Step-by-step answers to common questions.", icon: LucideLifeBuoy },
            { label: "FAQ", href: "/faq", desc: "Quick answers about plans, billing, and care.", icon: LucideHelpCircle },
            { label: "Press", href: "/press", desc: "Coverage, media kits, and announcements.", icon: LucideNewspaper },
            { label: "System Status", href: "/status", desc: "Live uptime for the TMAG platform.", icon: LucideActivity },
        ],
        feature: {
            eyebrow: "FAQ",
            title: "Answers to common questions",
            body: "Quick answers about plans, billing, and care.",
            href: "/faq",
            cta: "View FAQs",
        },
    },
    {
        id: "partners",
        title: "Partners",
        blurb: "Build with us — clinicians, companies, and creators.",
        icon: LucideHandshake,
        links: [
            { label: "Apply as Doctor", href: "/apply-as-doctor", desc: "Validate plans and join our clinician network.", icon: LucideStethoscope },
            { label: "Affiliate Program", href: "/apply-as-affiliate", desc: "Earn by referring travelers and companies.", icon: LucideUsers },
            { label: "Careers", href: "/careers", desc: "Open roles at TMAG.", icon: LucideMap },
            { label: "Community", href: "/community", desc: "Join the conversation with other travelers.", icon: LucideGlobe },
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

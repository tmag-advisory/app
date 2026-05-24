import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    LucideX,
    LucideInfo,
    LucideDollarSign,
    LucideHelpCircle,
    LucideShoppingBag,
    LucideBookOpen,
    LucideMap,
    LucideGlobe,
    LucideLogIn,
    LucideUserPlus,
    LucideLayoutDashboard,
    LucideInstagram,
    LucideTwitter,
    LucideLinkedin,
    LucideFacebook,
    LucideArrowUpRight,
    LucideBriefcase,
    LucideStethoscope,
    LucideUsers,
    LucideBuilding2,
    LucideLifeBuoy,
    LucideFileText,
    LucideNewspaper,
    LucideActivity,
    LucideSparkles,
    LucideHandshake,
    LucideRoute,
    LucideShield,

} from "lucide-react";

interface MenuLink {
    label: string;
    href: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
}

interface MenuCategory {
    id: string;
    title: string;
    eyebrow: string;
    blurb: string;
    icon: React.ComponentType<{ className?: string }>;
    links: MenuLink[];
    feature?: {
        eyebrow: string;
        title: string;
        body: string;
        href: string;
        cta: string;
    };
}

const CATEGORIES: MenuCategory[] = [
    {
        id: "explore",
        title: "Explore",
        eyebrow: "01",
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
        eyebrow: "02",
        blurb: "Stay informed before, during, and after your trip.",
        icon: LucideBookOpen,
        links: [
            { label: "Blog", href: "/blog", desc: "Travel medicine insights and field notes.", icon: LucideBookOpen, badge: "Soon" },
            { label: "Help Center", href: "/help", desc: "Step-by-step answers to common questions.", icon: LucideLifeBuoy },
            { label: "FAQ", href: "/faq", desc: "Quick answers about plans, billing, and care.", icon: LucideHelpCircle },
            { label: "Documentation", href: "/docs", desc: "API and integration documentation.", icon: LucideFileText },
            { label: "Press", href: "/press", desc: "Coverage, media kits, and announcements.", icon: LucideNewspaper },
            { label: "System Status", href: "/status", desc: "Live uptime for the TMAG platform.", icon: LucideActivity },
        ],
        feature: {
            eyebrow: "Guide",
            title: "Country health profiles",
            body: "Vaccination requirements, advisories, and risks for every destination.",
            href: "/blog",
            cta: "Browse guides",
        },
    },
    {
        id: "partners",
        title: "Partners",
        eyebrow: "03",
        blurb: "Build with us — clinicians, companies, and creators.",
        icon: LucideHandshake,
        links: [
            { label: "For Companies", href: "/for-companies", desc: "Manage employee travel health at scale.", icon: LucideBriefcase },
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
    {
        id: "account",
        title: "Account",
        eyebrow: "04",
        blurb: "Sign in, get started, or jump back into your dashboard.",
        icon: LucideShield,
        links: [
            { label: "Sign In", href: "/login", desc: "Access your dashboard and saved plans.", icon: LucideLogIn },
            { label: "Get Started", href: "/pricing", desc: "Set up a personal or family account in under 2 minutes.", icon: LucideUserPlus },
            { label: "Dashboard", href: "/dashboard", desc: "Manage trips, plans, and family members.", icon: LucideLayoutDashboard },
            { label: "Contact Us", href: "/contact", desc: "Talk to our team about anything.", icon: LucideHelpCircle },
        ],
        feature: {
            eyebrow: "Free",
            title: "Get Started with TMAG",
            body: "Save itineraries, get doctor-validated plans, and unlock family travel features.",
            href: "/pricing",
            cta: "Sign up",
        },
    },
];

const FOOTER_LINKS = [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Medical Disclaimer", href: "/medical-disclaimer" },
    { label: "NDPR / HIPAA", href: "/ndpr" },
    { label: "Contact", href: "/contact" },
    { label: "Support", href: "/contact?type=SUPPORT" },
];

const SOCIAL_LINKS = [
    { label: "Instagram", href: "https://instagram.com/tmag", icon: LucideInstagram },
    { label: "X / Twitter", href: "https://twitter.com/tmag", icon: LucideTwitter },
    { label: "LinkedIn", href: "https://linkedin.com/company/tmag", icon: LucideLinkedin },
    { label: "Facebook", href: "https://facebook.com/tmag", icon: LucideFacebook },
];

interface FullPageMenuProps {
    open: boolean;
    onClose: () => void;
}

const overlay = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3, ease: "easeOut" as const } },
    exit: { opacity: 0, transition: { duration: 0.2, ease: "easeIn" as const } },
};

const screen = {
    hidden: { opacity: 0, y: -12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
    },
    exit: {
        opacity: 0,
        y: -12,
        transition: { duration: 0.3, ease: "easeIn" as const },
    },
};

const railStagger = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.15 },
    },
    exit: { opacity: 0 },
};

const railItem = {
    hidden: { opacity: 0, x: -16 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { type: "spring" as const, stiffness: 320, damping: 28 },
    },
};

const paneStagger = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.035, delayChildren: 0.05 },
    },
    exit: { opacity: 0, transition: { duration: 0.12 } },
};

const paneItem = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring" as const, stiffness: 340, damping: 30 },
    },
};

const FullPageMenu = ({ open, onClose }: FullPageMenuProps) => {
    const [activeId, setActiveId] = useState<string>(CATEGORIES[0].id);

    const active = CATEGORIES.find((c) => c.id === activeId) ?? CATEGORIES[0];

    useEffect(() => {
        if (!open) return;
        setActiveId(CATEGORIES[0].id);

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50">
                    {/* Backdrop */}
                    <motion.button
                        variants={overlay}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        aria-label="Close menu"
                        onClick={onClose}
                        className="absolute inset-0 w-full h-full bg-darkest/30 backdrop-blur-sm cursor-default"
                    />

                    {/* Full-screen panel */}
                    <motion.section
                        variants={screen}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Main menu"
                        className="absolute inset-0 bg-background-primary flex flex-col overflow-hidden"
                    >
                        {/* Decorative gradients (desktop only) */}
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 overflow-hidden hidden lg:block"
                        >
                            <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-accent/8 blur-3xl" />
                            <div className="absolute -bottom-40 -left-40 w-[520px] h-[520px] rounded-full bg-gold/8 blur-3xl" />
                        </div>

                        {/* Header */}
                        <div className="relative flex items-center justify-between px-6 sm:px-10 lg:px-16 py-5 border-b border-border-light/60">
                            <Link
                                to="/"
                                onClick={onClose}
                                className="text-heading tracking-tight text-xl font-serif font-medium"
                            >
                                TMAG
                            </Link>
                            <button
                                onClick={onClose}
                                aria-label="Close menu"
                                className="group p-2.5 rounded-full border border-border-light/80 hover:border-heading hover:bg-background-secondary transition-all cursor-pointer"
                            >
                                <LucideX className="w-4 h-4 text-heading group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        {/* Body: mobile (tabs + single column) */}
                        <div className="relative flex-1 min-h-0 overflow-y-auto lg:hidden flex flex-col">
                            {/* Primary CTAs — always visible above the fold */}
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.35 }}
                                className="px-5 sm:px-8 pt-5 pb-4 grid grid-cols-2 gap-2.5"
                            >
                                <Link
                                    to="/login"
                                    onClick={onClose}
                                    className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-border bg-background-primary text-heading text-sm font-medium active:bg-background-secondary transition-colors"
                                >
                                    <LucideLogIn className="w-4 h-4" />
                                    Sign in
                                </Link>
                                <Link
                                    to="/pricing"
                                    onClick={onClose}
                                    className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-dark text-background-primary text-sm font-medium active:bg-darkest transition-colors"
                                >
                                    Get Started
                                    <LucideArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                            </motion.div>

                            {/* Segmented category tabs (horizontal scroll, sticky) */}
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15, duration: 0.35 }}
                                className="sticky top-0 z-10 bg-background-primary/95 backdrop-blur-md border-y border-border-light/60"
                            >
                                <div
                                    role="tablist"
                                    aria-label="Menu categories"
                                    className="flex items-center gap-1.5 overflow-x-auto px-5 sm:px-8 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                                >
                                    {CATEGORIES.map((cat) => {
                                        const isActive = cat.id === activeId;
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                role="tab"
                                                aria-selected={isActive}
                                                onClick={() => setActiveId(cat.id)}
                                                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${isActive
                                                    ? "bg-dark text-background-primary"
                                                    : "bg-background-secondary text-muted active:bg-button-secondary"
                                                    }`}
                                            >
                                                {cat.title}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>

                            {/* Active category content */}
                            <div className="flex-1 px-5 sm:px-8 pt-5 pb-8">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={active.id}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                    >
                                        {/* Eyebrow + blurb */}
                                        <div className="mb-5">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent mb-2">
                                                {active.eyebrow} · {active.title}
                                            </p>
                                            <p className="font-serif text-xl text-heading leading-snug">
                                                {active.blurb}
                                            </p>
                                        </div>

                                        {/* Link list */}
                                        <ul className="space-y-1 mb-5">
                                            {active.links.map((link) => (
                                                <li key={link.href}>
                                                    <Link
                                                        to={link.href}
                                                        onClick={onClose}
                                                        className="group flex items-center gap-3.5 p-3 -mx-1 rounded-2xl active:bg-background-secondary transition-colors"
                                                    >
                                                        <span className="shrink-0 w-10 h-10 rounded-xl bg-background-secondary flex items-center justify-center">
                                                            <link.icon className="w-4 h-4 text-heading" />
                                                        </span>
                                                        <span className="flex-1 min-w-0">
                                                            <span className="flex items-center gap-2">
                                                                <span className="text-[15px] font-medium text-heading">
                                                                    {link.label}
                                                                </span>
                                                                {link.badge && (
                                                                    <span className="text-[9px] font-semibold uppercase tracking-wider text-muted bg-button-secondary px-1.5 py-0.5 rounded-full">
                                                                        {link.badge}
                                                                    </span>
                                                                )}
                                                            </span>
                                                            <span className="block text-[13px] text-muted mt-0.5 leading-snug truncate">
                                                                {link.desc}
                                                            </span>
                                                        </span>
                                                        <LucideArrowUpRight className="shrink-0 w-4 h-4 text-muted" />
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Feature card */}
                                        {active.feature && (
                                            <Link
                                                to={active.feature.href}
                                                onClick={onClose}
                                                className="relative overflow-hidden rounded-2xl bg-dark text-background-primary p-5 flex items-center justify-between gap-4 active:bg-darkest transition-colors"
                                            >
                                                <div
                                                    aria-hidden
                                                    className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-accent/30 blur-3xl"
                                                />
                                                <div className="relative flex-1 min-w-0">
                                                    <span className="block text-[9px] font-bold uppercase tracking-[0.22em] text-gold mb-1.5">
                                                        {active.feature.eyebrow}
                                                    </span>
                                                    <span className="block font-serif text-lg leading-tight mb-1">
                                                        {active.feature.title}
                                                    </span>
                                                    <span className="block text-xs text-background-primary/70">
                                                        {active.feature.cta}
                                                    </span>
                                                </div>
                                                <LucideArrowUpRight className="relative shrink-0 w-5 h-5 text-background-primary/80" />
                                            </Link>
                                        )}
                                    </motion.div>
                                </AnimatePresence>

                                {/* Socials */}
                                <div className="mt-8 pt-5 border-t border-border-light/70">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
                                            Follow us
                                        </p>
                                        <div className="flex items-center gap-1.5">
                                            {SOCIAL_LINKS.map((s) => (
                                                <a
                                                    key={s.label}
                                                    href={s.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label={s.label}
                                                    className="w-9 h-9 rounded-xl bg-background-secondary flex items-center justify-center text-muted active:text-accent transition-colors"
                                                >
                                                    <s.icon className="w-4 h-4" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Body: desktop two-pane mega menu */}
                        <div className="relative flex-1 min-h-0 hidden lg:grid lg:grid-cols-[minmax(280px,360px)_1fr] overflow-hidden">
                            {/* Left rail: categories */}
                            <motion.nav
                                variants={railStagger}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                aria-label="Menu categories"
                                className="relative border-r border-border-light/60 bg-background-secondary/40 px-12 py-12 overflow-y-auto"
                            >
                                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted mb-6">
                                    Browse
                                </p>
                                <ul className="space-y-1">
                                    {CATEGORIES.map((cat) => {
                                        const isActive = cat.id === activeId;
                                        return (
                                            <motion.li key={cat.id} variants={railItem}>
                                                <button
                                                    type="button"
                                                    onMouseEnter={() => setActiveId(cat.id)}
                                                    onFocus={() => setActiveId(cat.id)}
                                                    onClick={() => setActiveId(cat.id)}
                                                    aria-pressed={isActive}
                                                    className={`group w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all cursor-pointer ${isActive
                                                        ? "bg-background-primary shadow-sm"
                                                        : "hover:bg-background-primary/60"
                                                        }`}
                                                >
                                                    <span
                                                        className={`shrink-0 text-[10px] font-mono tracking-wider transition-colors ${isActive ? "text-accent" : "text-muted"
                                                            }`}
                                                    >
                                                        {cat.eyebrow}
                                                    </span>
                                                    <span className="flex-1 min-w-0">
                                                        <span
                                                            className={`block font-serif text-2xl leading-tight transition-colors ${isActive
                                                                ? "text-heading"
                                                                : "text-heading/70 group-hover:text-heading"
                                                                }`}
                                                        >
                                                            {cat.title}
                                                        </span>
                                                    </span>
                                                    <LucideArrowUpRight
                                                        className={`shrink-0 w-4 h-4 transition-all ${isActive
                                                            ? "text-accent translate-x-0 opacity-100"
                                                            : "text-muted -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                                                            }`}
                                                    />
                                                </button>
                                            </motion.li>
                                        );
                                    })}
                                </ul>

                                {/* Rail footer: socials */}
                                <div className="mt-12 pt-8 border-t border-border-light/70">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted mb-4">
                                        Follow
                                    </p>
                                    <div className="flex items-center gap-2">
                                        {SOCIAL_LINKS.map((s) => (
                                            <a
                                                key={s.label}
                                                href={s.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={s.label}
                                                className="w-9 h-9 rounded-xl bg-background-primary border border-border-light/60 flex items-center justify-center text-muted hover:text-accent hover:border-accent/40 hover:bg-accent/5 transition-all"
                                            >
                                                <s.icon className="w-4 h-4" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </motion.nav>

                            {/* Right pane: active category content */}
                            <div className="relative overflow-y-auto px-16 py-14">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={active.id}
                                        variants={paneStagger}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="max-w-6xl mx-auto"
                                    >
                                        {/* Pane header */}
                                        <motion.div variants={paneItem} className="mb-10 flex items-start gap-4">
                                            <span className="flex shrink-0 w-12 h-12 rounded-2xl bg-accent/10 items-center justify-center">
                                                <active.icon className="w-5 h-5 text-accent" />
                                            </span>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent mb-2">
                                                    {active.title}
                                                </p>
                                                <h2 className="font-serif text-4xl text-heading leading-tight max-w-xl">
                                                    {active.blurb}
                                                </h2>
                                            </div>
                                        </motion.div>

                                        {/* Links grid + feature card */}
                                        <div className="grid grid-cols-1 xl:grid-cols-[1fr_minmax(280px,340px)] gap-10">
                                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {active.links.map((link) => (
                                                    <motion.li key={link.href} variants={paneItem}>
                                                        <Link
                                                            to={link.href}
                                                            onClick={onClose}
                                                            className="group flex items-start gap-4 p-4 rounded-2xl border border-transparent hover:border-border-light hover:bg-background-secondary/70 transition-all h-full"
                                                        >
                                                            <span className="shrink-0 w-11 h-11 rounded-xl bg-background-secondary group-hover:bg-accent/10 flex items-center justify-center transition-colors">
                                                                <link.icon className="w-4.5 h-4.5 text-heading group-hover:text-accent transition-colors" />
                                                            </span>
                                                            <span className="flex-1 min-w-0">
                                                                <span className="flex items-center gap-2">
                                                                    <span className="text-base font-serif text-heading group-hover:text-accent transition-colors">
                                                                        {link.label}
                                                                    </span>
                                                                    {link.badge && (
                                                                        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted bg-button-secondary px-1.5 py-0.5 rounded-full">
                                                                            {link.badge}
                                                                        </span>
                                                                    )}
                                                                    <LucideArrowUpRight className="w-3.5 h-3.5 text-muted opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-accent transition-all" />
                                                                </span>
                                                                <span className="block text-sm text-muted mt-1 leading-snug">
                                                                    {link.desc}
                                                                </span>
                                                            </span>
                                                        </Link>
                                                    </motion.li>
                                                ))}
                                            </ul>

                                            {active.feature && (
                                                <motion.aside
                                                    variants={paneItem}
                                                    className="relative overflow-hidden rounded-3xl bg-dark text-background-primary p-7 flex flex-col justify-between min-h-[280px]"
                                                >
                                                    <div
                                                        aria-hidden
                                                        className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-accent/30 blur-3xl"
                                                    />
                                                    <div
                                                        aria-hidden
                                                        className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-gold/20 blur-3xl"
                                                    />
                                                    <div className="relative">
                                                        <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.22em] text-gold mb-4">
                                                            {active.feature.eyebrow}
                                                        </span>
                                                        <h3 className="font-serif text-2xl leading-tight mb-3">
                                                            {active.feature.title}
                                                        </h3>
                                                        <p className="text-sm text-background-primary/70 leading-relaxed">
                                                            {active.feature.body}
                                                        </p>
                                                    </div>
                                                    <Link
                                                        to={active.feature.href}
                                                        onClick={onClose}
                                                        className="relative inline-flex items-center gap-2 mt-6 text-sm font-medium text-background-primary group/cta self-start"
                                                    >
                                                        <span className="border-b border-background-primary/40 group-hover/cta:border-background-primary pb-0.5 transition-colors">
                                                            {active.feature.cta}
                                                        </span>
                                                        <LucideArrowUpRight className="w-4 h-4 transition-transform group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
                                                    </Link>
                                                </motion.aside>
                                            )}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Footer */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 16 }}
                            transition={{ delay: 0.3, duration: 0.35 }}
                            className="relative border-t border-border-light/60 px-6 sm:px-10 lg:px-16 py-5 bg-background-secondary/50"
                        >
                            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
                                <ul className="flex flex-wrap gap-x-5 gap-y-2">
                                    {FOOTER_LINKS.map((l) => (
                                        <li key={l.href}>
                                            <Link
                                                to={l.href}
                                                onClick={onClose}
                                                className="text-[11px] text-muted hover:text-heading transition-colors"
                                            >
                                                {l.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                                <span className="text-[11px] text-muted">
                                    © {new Date().getFullYear()} TMAG
                                    <span className="hidden sm:inline"> · Travel Medicine Advisory Global</span>
                                </span>
                            </div>
                        </motion.div>
                    </motion.section>
                </div>
            )}
        </AnimatePresence>
    );
};

export default FullPageMenu;

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LucideArrowRight } from "lucide-react";
import type { MenuCategory } from "./navMenuData";

interface MegaMenuPanelProps {
    category: MenuCategory;
    onNavigate: () => void;
    onMouseEnter: () => void;
}

const container = {
    hidden: { opacity: 0, y: 8 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const, staggerChildren: 0.03, delayChildren: 0.04 },
    },
    exit: { opacity: 0, y: 6, transition: { duration: 0.12, ease: "easeIn" as const } },
};

const item = {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const } },
};

const MegaMenuPanel = ({ category, onNavigate, onMouseEnter }: MegaMenuPanelProps) => {
    const { feature } = category;

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            exit="exit"
            onMouseEnter={onMouseEnter}
            className="absolute left-0 right-0 top-full z-30 pt-3"
        >
            <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-border-light bg-background-secondary shadow-[0_28px_70px_-24px_rgba(42,30,20,0.35)]">
                <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.75fr_1fr]">
                    {/* Intro */}
                    <motion.div
                        variants={item}
                        className="flex flex-col gap-4 border-b border-border-light/70 bg-background-primary/40 p-8 lg:border-b-0 lg:border-r"
                    >
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
                            <category.icon className="h-5 w-5 text-accent" />
                        </span>
                        <div>
                            <h3 className="font-serif text-2xl leading-tight text-heading">{category.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted">{category.blurb}</p>
                        </div>
                    </motion.div>

                    {/* Links grid */}
                    <div className="p-5 sm:p-6">
                        <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                            {category.links.map((link) => (
                                <motion.li key={link.href} variants={item}>
                                    <Link
                                        to={link.href}
                                        onClick={onNavigate}
                                        className="group flex h-full items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-background-primary"
                                    >
                                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border-light/60 bg-background-primary transition-colors group-hover:border-accent/30 group-hover:bg-accent/10">
                                            <link.icon className="h-4 w-4 text-heading transition-colors group-hover:text-accent" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-heading transition-colors group-hover:text-accent">
                                                    {link.label}
                                                </span>
                                                {link.badge && (
                                                    <span className="rounded-full bg-button-secondary px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted">
                                                        {link.badge}
                                                    </span>
                                                )}
                                            </span>
                                            <span className="mt-0.5 block text-xs leading-snug text-muted">{link.desc}</span>
                                        </span>
                                    </Link>
                                </motion.li>
                            ))}
                        </ul>
                    </div>

                    {/* Promo card */}
                    <motion.div variants={item} className="p-3">
                        <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-dark p-6 text-background-primary">
                            <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-accent/30 blur-3xl" />
                            <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-gold/20 blur-3xl" />
                            <div className="relative">
                                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">{feature.eyebrow}</span>
                                <h4 className="mt-3 font-serif text-xl leading-tight">{feature.title}</h4>
                                <p className="mt-2 text-xs leading-relaxed text-background-primary/70">{feature.body}</p>
                            </div>
                            <Link
                                to={feature.href}
                                onClick={onNavigate}
                                className="relative mt-6 inline-flex items-center gap-1.5 self-start rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent/90"
                            >
                                {feature.cta}
                                <LucideArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default MegaMenuPanel;
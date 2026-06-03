import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LucideShoppingCart,
    LucideMenu,
    LucideX,
    LucideChevronDown,
    LucideArrowRight,
    LucideLogIn,
    LucideLayoutDashboard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../../stores/cartStore";
import { useAuth } from "../../context/AuthContext";
import { MENU, DIRECT_LINKS } from "./navMenuData";
import MegaMenuPanel from "./MegaMenuPanel";

const Navbar = () => {
    const [openId, setOpenId] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { pathname } = useLocation();
    const { itemCount, togglePanel } = useCartStore();
    const { isAuthenticated } = useAuth();

    const isShopPage = pathname.startsWith("/shop");
    const count = isShopPage ? itemCount() : 0;
    const active = MENU.find((c) => c.id === openId) ?? null;

    const cancelClose = () => {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
    };
    const scheduleClose = () => {
        cancelClose();
        closeTimer.current = setTimeout(() => setOpenId(null), 140);
    };
    const openMenu = (id: string) => {
        cancelClose();
        setOpenId(id);
    };

    const isDirectLinkActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
    // Close everything on navigation.
    useEffect(() => {
        setOpenId(null);
        setMobileOpen(false);
        setMobileExpanded(null);
    }, [pathname]);

    // Escape closes any open surface.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setOpenId(null);
                setMobileOpen(false);
            }
        };
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("keydown", onKey);
            cancelClose();
        };
    }, []);

    // Lock body scroll while the mobile sheet is open.
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileOpen]);

    const triggerBase =
        "flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer";

    return (
        <header className="relative z-50">
            {/* Desktop backdrop */}
            <AnimatePresence>
                {active && (
                    <motion.button
                        key="mega-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        aria-label="Close menu"
                        onClick={() => setOpenId(null)}
                        className="fixed inset-0 hidden cursor-default bg-darkest/10 backdrop-blur-[1px] lg:block"
                    />
                )}
            </AnimatePresence>

            <nav
                className="relative z-10 mx-auto max-w-350 px-6 py-5 sm:px-8 lg:px-16"
                onMouseLeave={scheduleClose}
                onMouseEnter={cancelClose}
            >
                <div className="flex items-center justify-between gap-4">
                    <Link
                        to="/"
                        className="font-serif text-xl font-medium tracking-tight text-heading"
                    >
                        TMAG
                    </Link>

                    {/* Desktop center nav */}
                    <div className="hidden items-center gap-1 lg:flex">
                        {MENU.map((cat) => {
                            const isOpen = openId === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    aria-expanded={isOpen}
                                    aria-haspopup="true"
                                    onMouseEnter={() => openMenu(cat.id)}
                                    onFocus={() => openMenu(cat.id)}
                                    onClick={() => setOpenId(isOpen ? null : cat.id)}
                                    className={`${triggerBase} ${
                                        isOpen
                                            ? "bg-background-secondary text-accent"
                                            : "text-heading hover:bg-background-secondary"
                                    }`}
                                >
                                    {cat.title}
                                    <LucideChevronDown
                                        className={`h-4 w-4 transition-transform duration-200 ${
                                            isOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>
                            );
                        })}
                        {DIRECT_LINKS.map((link) => {
                            const isActive = isDirectLinkActive(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    onMouseEnter={() => setOpenId(null)}
                                    onFocus={() => setOpenId(null)}
                                    aria-current={isActive ? "page" : undefined}
                                    className={`${triggerBase} ${
                                        isActive
                                            ? "bg-background-secondary text-accent"
                                            : "text-heading hover:bg-background-secondary"
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right cluster */}
                    <div className="flex items-center gap-2">
                        {isShopPage && (
                            <button
                                onClick={togglePanel}
                                className="relative rounded-lg p-2 transition-colors hover:bg-background-secondary"
                                aria-label="Shopping cart"
                            >
                                <LucideShoppingCart className="h-5 w-5 text-heading" />
                                {count > 0 && (
                                    <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-h-4.5 w-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                                        {count}
                                    </span>
                                )}
                            </button>
                        )}

                        {/* Desktop auth actions */}
                        <div className="hidden items-center gap-2 lg:flex">
                            {isAuthenticated ? (
                                <Link
                                    to="/dashboard"
                                    onMouseEnter={() => setOpenId(null)}
                                    className="flex items-center gap-1.5 rounded-xl bg-dark px-4 py-2.5 text-sm font-semibold text-background-primary transition-colors hover:bg-darkest"
                                >
                                    <LucideLayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        onMouseEnter={() => setOpenId(null)}
                                        className="flex items-center gap-1.5 rounded-xl bg-dark px-4 py-2.5 text-sm font-semibold text-background-primary transition-colors hover:bg-darkest"
                                    >
                                        Sign In
                                        <LucideArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile toggle */}
                        <button
                            type="button"
                            onClick={() => setMobileOpen((v) => !v)}
                            aria-label={mobileOpen ? "Close menu" : "Open menu"}
                            aria-expanded={mobileOpen}
                            className="flex items-center justify-center rounded-xl p-2.5 transition-colors hover:bg-background-secondary lg:hidden"
                        >
                            {mobileOpen ? (
                                <LucideX className="h-5 w-5 text-heading" />
                            ) : (
                                <LucideMenu className="h-5 w-5 text-heading" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Desktop mega-menu panel */}
                <AnimatePresence>
                    {active && (
                        <MegaMenuPanel
                            key={active.id}
                            category={active}
                            onNavigate={() => setOpenId(null)}
                            onMouseEnter={cancelClose}
                        />
                    )}
                </AnimatePresence>
            </nav>

            {/* Mobile sheet */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.button
                            key="mobile-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            aria-label="Close menu"
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 z-40 cursor-default bg-darkest/30 backdrop-blur-sm lg:hidden"
                        />
                        <motion.div
                            key="mobile-sheet"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute inset-x-0 top-full z-50 max-h-[calc(100vh-5rem)] overflow-y-auto border-t border-border-light bg-background-primary px-6 pb-8 pt-4 shadow-xl sm:px-8 lg:hidden"
                        >
                            {/* Auth actions */}
                            <div className="grid grid-cols-2 gap-2.5">
                                {isAuthenticated ? (
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setMobileOpen(false)}
                                        className="col-span-2 flex items-center justify-center gap-1.5 rounded-xl bg-dark px-4 py-3 text-sm font-semibold text-background-primary"
                                    >
                                        <LucideLayoutDashboard className="h-4 w-4" />
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background-primary px-4 py-3 text-sm font-medium text-heading"
                                        >
                                            <LucideLogIn className="h-4 w-4" />
                                            Sign in
                                        </Link>
                                        <Link
                                            to="/pricing"
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center justify-center gap-1.5 rounded-xl bg-dark px-4 py-3 text-sm font-medium text-background-primary"
                                        >
                                            Get Started
                                            <LucideArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Category accordions */}
                            <div className="mt-4 divide-y divide-border-light/70 border-y border-border-light/70">
                                {MENU.map((cat) => {
                                    const expanded = mobileExpanded === cat.id;
                                    return (
                                        <div key={cat.id}>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setMobileExpanded((prev) => (prev === cat.id ? null : cat.id))
                                                }
                                                aria-expanded={expanded}
                                                className="flex w-full items-center justify-between gap-3 py-3.5 text-left"
                                            >
                                                <span className="flex items-center gap-3">
                                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-background-secondary">
                                                        <cat.icon className="h-4 w-4 text-heading" />
                                                    </span>
                                                    <span className="text-[15px] font-semibold text-heading">
                                                        {cat.title}
                                                    </span>
                                                </span>
                                                <LucideChevronDown
                                                    className={`h-4 w-4 text-muted transition-transform duration-200 ${
                                                        expanded ? "rotate-180" : ""
                                                    }`}
                                                />
                                            </button>
                                            <AnimatePresence initial={false}>
                                                {expanded && (
                                                    <motion.ul
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                                                        className="overflow-hidden"
                                                    >
                                                        {cat.links.map((link) => (
                                                            <li key={link.href}>
                                                                <Link
                                                                    to={link.href}
                                                                    onClick={() => setMobileOpen(false)}
                                                                    className="flex items-start gap-3 rounded-xl p-3 active:bg-background-secondary"
                                                                >
                                                                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background-secondary">
                                                                        <link.icon className="h-4 w-4 text-heading" />
                                                                    </span>
                                                                    <span className="min-w-0 flex-1">
                                                                        <span className="flex items-center gap-2">
                                                                            <span className="text-sm font-medium text-heading">
                                                                                {link.label}
                                                                            </span>
                                                                            {link.badge && (
                                                                                <span className="rounded-full bg-button-secondary px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted">
                                                                                    {link.badge}
                                                                                </span>
                                                                            )}
                                                                        </span>
                                                                        <span className="mt-0.5 block text-xs leading-snug text-muted">
                                                                            {link.desc}
                                                                        </span>
                                                                    </span>
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </motion.ul>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Direct links */}
                            <div className="mt-2">
                                {DIRECT_LINKS.map((link) => {
                                    const isActive = isDirectLinkActive(link.href);
                                    return (
                                        <Link
                                            key={link.href}
                                            to={link.href}
                                            onClick={() => setMobileOpen(false)}
                                            aria-current={isActive ? "page" : undefined}
                                            className={`flex items-center justify-between py-3.5 text-[15px] font-semibold ${
                                                isActive ? "text-accent" : "text-heading"
                                            }`}
                                        >
                                            {link.label}
                                            <LucideArrowRight className="h-4 w-4 text-muted" />
                                        </Link>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;

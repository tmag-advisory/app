import { LucideArrowUpRight, LucideMail, LucideMapPin, LucidePhone } from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = [
    {
        heading: "Product",
        links: [
            { label: "Learn More", href: "/how-it-works" },
            { label: "Pricing", href: "/pricing" },
            { label: "For Organizations", href: "/for-companies" },
            { label: "Ebook Shop", href: "/shop" },
            { label: "FAQ", href: "/faq" },
        ],
    },
    {
        heading: "Organization",
        links: [
            { label: "About us", href: "/about" },
            { label: "Careers", href: "/careers" },
            { label: "Blog", href: "/blog" },
            { label: "Press", href: "/press" },
            { label: "Apply as Doctor", href: "/apply-as-doctor" },
            { label: "Apply as Affiliate", href: "/apply-as-affiliate" },
        ],
    },
    // Note: "Apply as Affiliate" is rendered as a button (opens modal), not a link
    {
        heading: "Resources",
        links: [
            { label: "Help center", href: "/help" },
            { label: "Documentation", href: "/docs" },
            { label: "Status", href: "/status" },
            { label: "Community", href: "/community" },
        ],
    },
    {
        heading: "Legal",
        links: [
            { label: "Privacy policy", href: "/privacy" },
            { label: "Terms of service", href: "/terms" },
            { label: "Medical disclaimer", href: "/medical-disclaimer" },
            { label: "NDPR compliance", href: "/ndpr" },
        ],
    },
];

const FooterSection = () => {
    return (
        <footer className="relative bg-darkest text-white min-h-screen flex flex-col overflow-hidden">
            {/* Ambient orbs */}
            <div
                className="absolute rounded-full pointer-events-none"
                style={{
                    width: 600,
                    height: 600,
                    filter: "blur(160px)",
                    opacity: 0.15,
                    background:
                        "radial-gradient(circle, #2a7a6a 0%, #1a6a7a 50%, transparent 100%)",
                    top: "10%",
                    left: "-10%",
                }}
            />
            <div
                className="absolute rounded-full pointer-events-none"
                style={{
                    width: 500,
                    height: 500,
                    filter: "blur(140px)",
                    opacity: 0.12,
                    background:
                        "radial-gradient(circle, #e8c87a 0%, #c8760a 50%, transparent 100%)",
                    bottom: "15%",
                    right: "-8%",
                }}
            />
            <div
                className="absolute rounded-full pointer-events-none"
                style={{
                    width: 350,
                    height: 350,
                    filter: "blur(120px)",
                    opacity: 0.08,
                    background:
                        "radial-gradient(circle, #d4724a 0%, transparent 70%)",
                    top: "50%",
                    left: "40%",
                }}
            />

            {/* Dot grid texture */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />

            {/* Main content — pushed to bottom of viewport */}
            <div className="relative z-10 flex-1 flex flex-col justify-between px-8 lg:px-16 max-w-7xl mx-auto w-full">
                {/* Top area: giant brand statement */}
                <div className="pt-24 md:pt-32 lg:pt-40">
                    <h2 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-serif text-white/9 leading-[0.9] select-none">
                        Travel healthy.
                        <br />
                        Travel smart.
                    </h2>
                </div>

                {/* Middle: newsletter + contact info */}
                <div className="py-16 md:py-20">
                    <div className="flex flex-col lg:flex-row gap-14 lg:gap-20">
                        {/* Contact info */}
                        <div className="lg:w-1/2 flex flex-col sm:flex-row gap-8">
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-lg bg-white/6 flex items-center justify-center shrink-0 mt-0.5">
                                    <LucideMail className="w-4 h-4 text-white/40" />
                                </div>
                                <div>
                                    <p className="text-xs text-white/30 uppercase tracking-wider font-semibold mb-1">
                                        Email
                                    </p>
                                    <a
                                        href="#"
                                        className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                                    >
                                        info@travelmedicineadvisory.com
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-lg bg-white/6 flex items-center justify-center shrink-0 mt-0.5">
                                    <LucidePhone className="w-4 h-4 text-white/40" />
                                </div>
                                <div>
                                    <p className="text-xs text-white/30 uppercase tracking-wider font-semibold mb-1">
                                        Phone
                                    </p>
                                    <a
                                        href="#"
                                        className="text-sm text-nowrap text-white/60 hover:text-white transition-colors duration-200"
                                    >
                                        +234 916 261 9043
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-lg bg-white/6 flex items-center justify-center shrink-0 mt-0.5">
                                    <LucideMapPin className="w-4 h-4 text-white/40" />
                                </div>
                                <div>
                                    <p className="text-xs text-white/30 uppercase tracking-wider font-semibold mb-1">
                                        Location
                                    </p>
                                    <span className="text-sm text-white/60 text-nowrap">
                                        Plot 199 Adetokunbo Ademola Crescent. <br /> Wuse II. FCT
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/6" />

                {/* Link columns */}
                <div className="py-14">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 lg:gap-8">
                        {footerLinks.map((col) => (
                            <div key={col.heading}>
                                <h4 className="text-xs uppercase tracking-wider text-white/25 font-semibold mb-5">
                                    {col.heading}
                                </h4>
                                <ul className="space-y-3.5">
                                    {col.links.map((link) => (
                                        <li key={link.label}>
                                            <Link
                                                to={link.href}
                                                className="text-sm text-white/45 hover:text-white transition-colors duration-200"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/6" />

                {/* Bottom bar */}
                <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-white/20">
                        © {new Date().getFullYear()} TMAG · Travel Medicine
                        Advisory Global. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/privacy"
                            className="text-xs text-white/25 hover:text-white transition-colors duration-200"
                        >
                            Privacy Policy
                        </Link>
                        <span className="text-white/10">·</span>
                        <Link
                            to="/terms"
                            className="text-xs text-white/25 hover:text-white transition-colors duration-200"
                        >
                            Terms of Service
                        </Link>
                    </div>
                    <div className="flex items-center gap-6">
                        {["Twitter", "LinkedIn", "GitHub", "Instagram"].map(
                            (social) => (
                                <a
                                    key={social}
                                    href="#"
                                    className="text-xs text-white/30 hover:text-white transition-colors duration-200 flex items-center gap-1 group"
                                >
                                    {social}
                                    <LucideArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                </a>
                            ),
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterSection;

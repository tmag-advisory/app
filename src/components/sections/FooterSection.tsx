import { LucideArrowUpRight, LucideMail, LucideMapPin, LucidePhone } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

const footerLinks = [
    {
        heading: "Product",
        links: [
            { label: "How it works", href: "/how-it-works" },
            { label: "Pricing", href: "/pricing" },
            { label: "For Companies", href: "/for-companies" },
            { label: "FAQ", href: "/faq" },
        ],
    },
    {
        heading: "Company",
        links: [
            { label: "About us", href: "/about" },
            { label: "Careers", href: "/careers" },
            { label: "Blog", href: "/blog" },
            { label: "Press", href: "/press" },
        ],
    },
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
            { label: "HIPAA compliance", href: "/hipaa" },
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
                        {/* Newsletter */}
                        <div className="lg:w-1/2">
                            <span className="text-xl font-serif font-medium tracking-tight">
                                TMAG
                            </span>
                            <p className="text-sm text-white/40 leading-relaxed mt-4 max-w-sm">
                                Stay ahead of travel health risks. Get weekly
                                destination alerts, outbreak updates, and expert
                                tips—straight to your inbox.
                            </p>
                            <div className="flex items-stretch gap-3 mt-6 max-w-md">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/25 transition-colors duration-200"
                                />
                                <Button
                                    variant="primary"
                                    className="bg-white! text-dark! hover:bg-white/90! shrink-0"
                                >
                                    Subscribe
                                </Button>
                            </div>
                        </div>

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
                                    <a href="#" className="text-sm text-white/60 hover:text-white transition-colors duration-200">
                                        hello@tmag.health
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
                                    <a href="#" className="text-sm text-white/60 hover:text-white transition-colors duration-200">
                                        +1 (800) 555-TMAG
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
                                    <span className="text-sm text-white/60">
                                        San Francisco, CA
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

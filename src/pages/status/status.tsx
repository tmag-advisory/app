import { LucideCheckCircle, LucideAlertTriangle, LucideClock } from "lucide-react";
import { motion } from "framer-motion";
import AnimateIn from "../../components/animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../../components/animations/StaggerGroup";
import SEOHead from "../../lib/seo";

const services = [
    {
        name: "Platform",
        status: "operational",
        description: "Web application and user dashboard",
    },
    {
        name: "API",
        status: "operational",
        description: "REST API for plan generation and integrations",
    },
    {
        name: "Plan Generation",
        status: "operational",
        description: "Intelligent travel health plan engine",
    },
    {
        name: "Health Data Pipeline",
        status: "operational",
        description: "Real-time data from WHO, CDC, and ECDC",
    },
    {
        name: "Authentication",
        status: "operational",
        description: "Login, registration, and session management",
    },
    {
        name: "Payment Processing",
        status: "operational",
        description: "Credit purchases and billing",
    },
];

const recentIncidents = [
    {
        date: "Feb 25, 2026",
        title: "Scheduled maintenance completed",
        description:
            "Database migration completed successfully. No user impact.",
        severity: "maintenance",
    },
    {
        date: "Feb 18, 2026",
        title: "Elevated API latency",
        description:
            "Brief period of elevated API response times due to increased traffic. Resolved within 15 minutes.",
        severity: "minor",
    },
];

const statusConfig = {
    operational: {
        icon: <LucideCheckCircle className="w-5 h-5" />,
        label: "Operational",
        color: "text-green-500",
    },
    degraded: {
        icon: <LucideAlertTriangle className="w-5 h-5" />,
        label: "Degraded",
        color: "text-yellow-500",
    },
    maintenance: {
        icon: <LucideClock className="w-5 h-5" />,
        label: "Maintenance",
        color: "text-blue-400",
    },
};

const severityConfig: Record<string, string> = {
    maintenance: "bg-blue-500/10 text-blue-400",
    minor: "bg-yellow-500/10 text-yellow-500",
    major: "bg-red-500/10 text-red-400",
};

const Status = () => {
    const allOperational = services.every((s) => s.status === "operational");

    return (
        <main>
            <SEOHead title="Status — Travel Medicine Advisory Global" description="Check the current status of TMAG services and platform availability." path="/status" robots="noindex, follow" />
            {/* Hero */}
            <AnimateIn as="section" className="flex flex-col items-center text-center pt-20 pb-12 px-6">
                <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                    Status
                </span>
                <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[0.9] text-heading font-serif max-w-3xl">
                    System{" "}
                    <span className="italic">status.</span>
                </h1>
                {allOperational && (
                    <div className="flex items-center gap-2 mt-6 text-green-500">
                        <LucideCheckCircle className="w-5 h-5" />
                        <span className="text-sm font-semibold">
                            All systems operational
                        </span>
                    </div>
                )}
            </AnimateIn>

            {/* Services */}
            <section className="px-8 lg:px-16 pb-24 max-w-4xl mx-auto">
                <StaggerGroup stagger={0.06} className="space-y-3">
                    {services.map((service) => {
                        const config =
                            statusConfig[
                                service.status as keyof typeof statusConfig
                            ];
                        return (
                            <motion.div
                                key={service.name}
                                variants={staggerItem}
                                className="bg-button-secondary rounded-2xl p-5 flex items-center justify-between gap-4"
                            >
                                <div>
                                    <h3 className="text-sm font-semibold text-heading">
                                        {service.name}
                                    </h3>
                                    <p className="text-xs text-muted mt-0.5">
                                        {service.description}
                                    </p>
                                </div>
                                <div
                                    className={`flex items-center gap-2 shrink-0 ${config.color}`}
                                >
                                    {config.icon}
                                    <span className="text-xs font-semibold hidden sm:inline">
                                        {config.label}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </StaggerGroup>
            </section>

            {/* Recent incidents */}
            <div className="bg-background-secondary">
                <section className="px-8 lg:px-16 py-24 max-w-4xl mx-auto">
                    <AnimateIn className="mb-10">
                        <h2 className="text-2xl font-serif text-heading">
                            Recent incidents
                        </h2>
                    </AnimateIn>
                    <StaggerGroup stagger={0.1} className="space-y-4">
                        {recentIncidents.map((incident) => (
                            <motion.div
                                key={incident.title}
                                variants={staggerItem}
                                className="bg-background-primary rounded-2xl p-6"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <span
                                        className={`text-xs font-semibold rounded-lg px-2.5 py-0.5 ${severityConfig[incident.severity]}`}
                                    >
                                        {incident.severity}
                                    </span>
                                    <span className="text-xs text-muted">
                                        {incident.date}
                                    </span>
                                </div>
                                <h3 className="text-sm font-semibold text-heading mb-1">
                                    {incident.title}
                                </h3>
                                <p className="text-sm text-body leading-relaxed">
                                    {incident.description}
                                </p>
                            </motion.div>
                        ))}
                    </StaggerGroup>
                </section>
            </div>

            {/* Uptime note */}
            <section className="px-8 lg:px-16 py-24 max-w-4xl mx-auto text-center">
                <AnimateIn type="fade">
                    <h2 className="text-3xl md:text-4xl text-heading leading-[1.1] font-serif mb-4">
                        99.9% uptime SLA.
                    </h2>
                    <p className="text-sm text-body leading-relaxed max-w-md mx-auto">
                        We monitor all services 24/7. Subscribe to status updates
                        to get notified of any incidents or scheduled maintenance.
                    </p>
                </AnimateIn>
            </section>
        </main>
    );
};

export default Status;

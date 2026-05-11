import { Link } from "react-router-dom";
import { LucideShieldCheck } from "lucide-react";
import AnimateIn from "../../components/animations/AnimateIn";

const NDPRCompliance = () => {
    return (
        <main>
            <section className="px-8 lg:px-16 pt-20 pb-24 max-w-4xl mx-auto">
                <AnimateIn>
                    <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                        Legal
                    </span>
                    <h1 className="text-4xl md:text-5xl text-heading font-serif leading-[1.1] mb-4">
                        NDPR Compliance
                    </h1>
                    <p className="text-sm text-muted mb-12">
                        Last updated: February 2026
                    </p>
                </AnimateIn>

                <AnimateIn type="fade" delay={0.15}>
                    {/* Prominent notice */}
                    <div className="bg-button-secondary rounded-2xl p-6 md:p-8 mb-12 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-dark text-background-primary flex items-center justify-center shrink-0">
                            <LucideShieldCheck className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-heading leading-relaxed font-medium">
                            TMAG follows NDPR-aligned practices for handling
                            personal health information. We implement
                            administrative, physical, and technical safeguards to
                            protect the confidentiality, integrity, and
                            availability of your health data.
                        </p>
                    </div>
                </AnimateIn>

                <AnimateIn type="fade" delay={0.15}>
                    <div className="space-y-10 text-sm text-body leading-relaxed">
                        <section>
                            <h2 className="text-lg font-serif text-heading mb-3">
                                1. Our Commitment
                            </h2>
                            <p>
                                TMAG is committed to maintaining the privacy and
                                security of your personal health information in
                                accordance with Nigeria Data Protection Regulation
                                principles and related data protection standards.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-serif text-heading mb-3">
                                2. Administrative Safeguards
                            </h2>
                            <p className="mb-2">
                                <strong className="text-heading">
                                    Security officer:
                                </strong>{" "}
                                A designated security officer oversees all NDPR
                                compliance activities and data protection
                                policies.
                            </p>
                            <p className="mb-2">
                                <strong className="text-heading">
                                    Employee training:
                                </strong>{" "}
                                All team members complete NDPR awareness training
                                and annual refresher courses on data handling
                                procedures.
                            </p>
                            <p className="mb-2">
                                <strong className="text-heading">
                                    Access controls:
                                </strong>{" "}
                                Access to personal health information is restricted to authorized
                                personnel on a need-to-know basis, with
                                role-based permissions and regular access reviews.
                            </p>
                            <p>
                                <strong className="text-heading">
                                    Incident response:
                                </strong>{" "}
                                We maintain a documented incident response plan
                                for security breaches, including notification
                                procedures within required timeframes.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-serif text-heading mb-3">
                                3. Technical Safeguards
                            </h2>
                            <p className="mb-2">
                                <strong className="text-heading">
                                    Encryption:
                                </strong>{" "}
                                All data is encrypted in transit using TLS 1.3
                                and at rest using AES-256 encryption.
                            </p>
                            <p className="mb-2">
                                <strong className="text-heading">
                                    Authentication:
                                </strong>{" "}
                                Multi-factor authentication is available for all
                                accounts and required for administrative access.
                            </p>
                            <p className="mb-2">
                                <strong className="text-heading">
                                    Audit logging:
                                </strong>{" "}
                                All access to personal health information is logged with timestamps, user
                                identification, and action details for audit
                                purposes.
                            </p>
                            <p>
                                <strong className="text-heading">
                                    Automatic session management:
                                </strong>{" "}
                                Sessions automatically expire after periods of
                                inactivity to prevent unauthorized access.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-serif text-heading mb-3">
                                4. Physical Safeguards
                            </h2>
                            <p>
                                Our infrastructure is hosted with cloud providers
                                that maintain SOC 2 Type II, ISO 27001, and
                                relevant security and privacy certifications. Physical access
                                to data centers is restricted with multi-layer
                                security controls including biometric access,
                                24/7 surveillance, and environmental protections.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-serif text-heading mb-3">
                                5. Data Minimization
                            </h2>
                            <p>
                                We collect only the minimum health information
                                necessary to generate your travel health plan. We
                                do not request or store information beyond what
                                is needed for the service. You can delete your
                                health profile and all associated data at any
                                time.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-serif text-heading mb-3">
                                6. Business Associate Agreements
                            </h2>
                            <p>
                                We maintain data protection agreements with
                                third-party service providers who may process
                                personal health information. These agreements
                                require appropriate confidentiality, security,
                                and lawful processing controls.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-serif text-heading mb-3">
                                7. Breach Notification
                            </h2>
                            <p>
                                In the event of a data breach involving personal
                                health information, we will notify affected
                                individuals and regulators where required by
                                applicable data protection law. Notification will include a
                                description of the breach, the types of
                                information involved, and steps individuals can
                                take to protect themselves.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-serif text-heading mb-3">
                                8. Your Rights
                            </h2>
                            <p>
                                You have the right to: access your health
                                information held by TMAG; request corrections to
                                inaccurate data; request deletion of your data;
                                receive an accounting of disclosures of your personal health information;
                                and request restrictions on certain uses of your
                                information.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-serif text-heading mb-3">
                                Contact
                            </h2>
                            <p>
                                For NDPR-related inquiries or to exercise your
                                rights, contact our security officer at{" "}
                                <a
                                    href="mailto:privacy@tmag.health"
                                    className="text-accent underline"
                                >
                                    privacy@tmag.health
                                </a>
                                . Also see our{" "}
                                <Link
                                    to="/privacy"
                                    className="text-accent underline"
                                >
                                    Privacy Policy
                                </Link>{" "}
                                and{" "}
                                <Link
                                    to="/medical-disclaimer"
                                    className="text-accent underline"
                                >
                                    Medical Disclaimer
                                </Link>
                                .
                            </p>
                        </section>
                    </div>
                </AnimateIn>
            </section>
        </main>
    );
};

export default NDPRCompliance;

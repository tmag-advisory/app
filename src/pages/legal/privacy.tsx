import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
    return (
        <main>
            <section className="px-8 lg:px-16 pt-20 pb-24 max-w-4xl mx-auto">
                <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                    Legal
                </span>
                <h1 className="text-4xl md:text-5xl text-heading font-serif leading-[1.1] mb-4">
                    Privacy Policy
                </h1>
                <p className="text-sm text-muted mb-12">
                    Last updated: February 2026
                </p>

                <div className="space-y-10 text-sm text-body leading-relaxed">
                    <section>
                        <h2 className="text-lg font-serif text-heading mb-3">
                            1. Information We Collect
                        </h2>
                        <p className="mb-2">
                            <strong className="text-heading">Account information:</strong>{" "}
                            Name, email address, and password when you create an account.
                        </p>
                        <p className="mb-2">
                            <strong className="text-heading">Health profile:</strong>{" "}
                            Pre-existing conditions, medications, allergies, and other health details you voluntarily provide to generate personalized plans.
                        </p>
                        <p className="mb-2">
                            <strong className="text-heading">Travel details:</strong>{" "}
                            Destinations, dates, planned activities, and travel companions.
                        </p>
                        <p>
                            <strong className="text-heading">Usage data:</strong>{" "}
                            Pages visited, features used, and general interaction patterns to improve the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-heading mb-3">
                            2. How We Use Your Information
                        </h2>
                        <p>
                            We use your information to: generate personalized travel health plans; improve the accuracy and quality of our AI recommendations; communicate with you about your account, plans, and service updates; and comply with legal obligations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-heading mb-3">
                            3. What We Don't Do
                        </h2>
                        <p>
                            We do not sell your personal or health data to third parties. We do not use your personal health data to train our AI models. We do not share your data with advertisers. We do not retain data longer than necessary for the purposes described in this policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-heading mb-3">
                            4. Data Security
                        </h2>
                        <p>
                            Your data is encrypted in transit (TLS 1.3) and at rest (AES-256). We follow HIPAA-compliant data handling practices. Access to personal data is restricted to authorized personnel and subject to audit logging.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-heading mb-3">
                            5. Data Retention
                        </h2>
                        <p>
                            Your account data and generated plans are retained as long as your account is active. You can delete individual plans or your entire account at any time. Upon account deletion, all personal data is permanently removed within 30 days.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-heading mb-3">
                            6. Your Rights
                        </h2>
                        <p>
                            You have the right to: access your personal data; correct inaccurate data; delete your data and account; export your data in a portable format; and withdraw consent for optional data processing at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-heading mb-3">
                            7. Cookies
                        </h2>
                        <p>
                            We use essential cookies for authentication and session management. We use optional analytics cookies to understand usage patterns. You can disable non-essential cookies in your browser settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-heading mb-3">
                            8. Third-Party Services
                        </h2>
                        <p>
                            We use third-party services for payment processing, email delivery, and infrastructure hosting. These providers are contractually bound to protect your data and may only process it as instructed by us.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-heading mb-3">
                            9. Changes to This Policy
                        </h2>
                        <p>
                            We may update this policy from time to time. Material changes will be communicated via email or in-app notification at least 30 days before taking effect.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif text-heading mb-3">
                            Contact
                        </h2>
                        <p>
                            For privacy-related inquiries, contact us at{" "}
                            <a href="mailto:privacy@tmag.health" className="text-accent underline">
                                privacy@tmag.health
                            </a>
                            . Also see our{" "}
                            <Link to="/terms" className="text-accent underline">
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link to="/medical-disclaimer" className="text-accent underline">
                                Medical Disclaimer
                            </Link>
                            .
                        </p>
                    </section>
                </div>
            </section>
        </main>
    );
};

export default PrivacyPolicy;

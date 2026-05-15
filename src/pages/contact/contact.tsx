import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { LucideCheckCircle, LucideArrowLeft } from "lucide-react";
import AnimateIn from "../../components/animations/AnimateIn";
import { useSubmitContact } from "../../api/hooks";
import type { ContactInquiryType } from "../../api/types";
import SEOHead from "../../lib/seo";

const INQUIRY_LABELS: Record<ContactInquiryType, string> = {
    SUPPORT: "Support request",
    DEMO: "Request a demo",
    SALES: "Talk to sales",
    GENERAL: "General inquiry",
};

const VALID_TYPES = Object.keys(INQUIRY_LABELS) as ContactInquiryType[];

const ContactPage = () => {
    const [searchParams] = useSearchParams();

    const paramType = searchParams
        .get("type")
        ?.toUpperCase() as ContactInquiryType;
    const initialType: ContactInquiryType =
        VALID_TYPES.includes(paramType) ? paramType : "GENERAL";

    const [form, setForm] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
        inquiryType: initialType,
    });

    const {
        mutate: submit,
        isPending,
        isSuccess,
        isError,
        error,
    } = useSubmitContact();

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submit({
            ...form,
            inquiryType: form.inquiryType as ContactInquiryType,
        });
    };

    if (isSuccess) {
        return (
            <main>
                <SEOHead title="Contact — Travel Medicine Advisory Global" description="Get in touch with the TMAG team. We're here to help with travel health questions, support, and partnerships." path="/contact" />
                <section className="flex flex-col items-center text-center pt-20 pb-24 px-6 max-w-2xl mx-auto">
                    <AnimateIn type="fade">
                        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                            <LucideCheckCircle className="w-8 h-8 text-accent" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-serif text-heading mb-3">
                            Message received.
                        </h1>
                        <p className="text-sm text-body leading-relaxed max-w-sm mx-auto mb-2">
                            Thanks for reaching out! We'll get back to{" "}
                            <strong className="text-heading">
                                {form.email}
                            </strong>{" "}
                            within 24–48 hours.
                        </p>
                        <p className="text-xs text-muted mb-8">
                            Inquiry type:{" "}
                            <span className="font-semibold">
                                {INQUIRY_LABELS[form.inquiryType]}
                            </span>
                        </p>
                        <Link
                            to="/"
                            className="text-sm text-accent font-medium hover:underline"
                        >
                            Back to home
                        </Link>
                    </AnimateIn>
                </section>
            </main>
        );
    }

    return (
        <main>
            <SEOHead title="Contact — Travel Medicine Advisory Global" description="Get in touch with the TMAG team. We're here to help with travel health questions, support, and partnerships." path="/contact" />
            {/* Hero */}
            <AnimateIn
                as="section"
                className="flex flex-col items-center text-center pt-20 pb-10 px-6"
            >
                <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                    Get in touch
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl text-heading leading-[1.1] font-serif max-w-3xl mb-4">
                    How can we help?
                </h1>
                <p className="text-sm text-body leading-relaxed max-w-md">
                    Whether you need support, want to see a demo, or just have a
                    question — we're here.
                </p>
            </AnimateIn>

            {/* Form card */}
            <AnimateIn type="fade" className="px-6 pb-24 max-w-2xl mx-auto">
                <div className="bg-white border border-border-light rounded-2xl p-8 md:p-10">
                    {isError && (
                        <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                            {(
                                error as {
                                    response?: { data?: { message?: string } };
                                }
                            )?.response?.data?.message ??
                                "Something went wrong. Please try again."}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                    Full name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Jane Smith"
                                    required
                                    className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="jane@example.com"
                                    required
                                    className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                Inquiry type
                            </label>
                            <select
                                name="inquiryType"
                                value={form.inquiryType}
                                onChange={handleChange}
                                className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors duration-200 cursor-pointer"
                            >
                                {VALID_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {INQUIRY_LABELS[type]}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                Subject
                            </label>
                            <input
                                type="text"
                                name="subject"
                                value={form.subject}
                                onChange={handleChange}
                                placeholder="Brief summary of your inquiry"
                                required
                                className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                Message
                            </label>
                            <textarea
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                placeholder="Tell us more…"
                                required
                                rows={6}
                                className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200 resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? "Sending…" : "Send message"}
                        </button>
                    </form>

                    <p className="text-xs text-muted text-center mt-5">
                        We typically respond within 24–48 hours.{" "}
                        <Link to="/faq" className="text-accent hover:underline">
                            Check the FAQ
                        </Link>{" "}
                        for quick answers.
                    </p>
                </div>

                <div className="mt-6 text-center">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1 text-xs text-muted hover:text-heading transition-colors duration-200"
                    >
                        <LucideArrowLeft className="w-3 h-3" /> Back to home
                    </Link>
                </div>
            </AnimateIn>
        </main>
    );
};

export default ContactPage;

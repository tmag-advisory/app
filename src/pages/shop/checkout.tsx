import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useEbooks, useEbookCheckout, useCartCheckout } from "../../api/hooks";
import { useAuth } from "../../context/AuthContext";
import { useCartStore } from "../../stores/cartStore";
import { useCurrencyStore } from "../../stores/currencyStore";
import {
    LucideArrowLeft, LucideLoader2, LucideLock, LucideBookOpen,
    LucideGlobe, LucideShieldCheck, LucideAlertCircle
} from "lucide-react";
import { cn } from "../../lib/utils";
import toast from "react-hot-toast";
import SEOHead from "../../lib/seo";
import { useLaunchDiscount } from "../../api";
import { applyLaunchToBase } from "../../lib/launchDiscount";
import LaunchDiscountBanner from "../../components/sections/LaunchDiscountBanner";

export default function CheckoutPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { clearCart } = useCartStore();
    const { convertFrom, symbol } = useCurrencyStore();

    const versionId = searchParams.get("versionId");
    const ebookId = searchParams.get("ebookId");
    const cartParam = searchParams.get("cart");

    const isCartCheckout = !!cartParam;
    const cartVersionIds = cartParam ? cartParam.split(",").map(Number).filter(Boolean) : [];

    const { data: ebooks, isLoading: ebooksLoading } = useEbooks();
    const { mutate: initiateCheckout, isPending: singlePending } = useEbookCheckout();
    const { mutate: initiateCartCheckout, isPending: cartPending } = useCartCheckout();
    const isPending = singlePending || cartPending;

    const [form, setForm] = useState({ name: "", email: "", phone: "" });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // For single-item checkout
    const ebook = ebooks?.find(e => e.id === Number(ebookId));
    const version = ebook?.versions.find(v => v.id === Number(versionId));

    // For cart checkout
    const cartItems = isCartCheckout
        ? cartVersionIds.map(vid => {
            const foundEbook = ebooks?.find(e => e.versions.some(v => v.id === vid));
            const foundVersion = foundEbook?.versions.find(v => v.id === vid);
            return foundEbook && foundVersion ? { ebook: foundEbook, version: foundVersion } : null;
        }).filter(Boolean) as { ebook: NonNullable<typeof ebooks>[0]; version: NonNullable<typeof ebooks>[0]["versions"][0] }[]
        : [];

    const { data: launchDiscount } = useLaunchDiscount();
    const launchPct = launchDiscount?.active ? launchDiscount.percentage : 0;
    const applyLaunch = (n: number) => (launchPct > 0 ? applyLaunchToBase(n, launchPct) : n);
    const formatMoney = (n: number) =>
        n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const originalCartTotal = cartItems.reduce(
        (sum, item) => sum + convertFrom(item.version.price, item.version.currency),
        0,
    );
    const cartTotal = applyLaunch(originalCartTotal);
    const cartSymbol = symbol();

    useEffect(() => {
        if (user) {
            const name = [user.first_name, user.last_name].filter(Boolean).join(" ");
            setForm({ name, email: user.email ?? "", phone: "" });
        }
    }, [user]);

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!user) {
            if (!form.name.trim()) errs.name = "Name is required";
            if (!form.email.trim()) errs.email = "Email is required";
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email";
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        if (isCartCheckout) {
            if (cartVersionIds.length === 0) return;
            initiateCartCheckout(
                {
                    ebookVersionIds: cartVersionIds,
                    ...(user ? {} : {
                        guestEmail: form.email.trim().toLowerCase(),
                        guestName: form.name.trim(),
                        guestPhone: form.phone.trim() || undefined,
                    }),
                },
                {
                    onSuccess: (data) => {
                        if (data.paymentLink) {
                            clearCart();
                            window.location.href = data.paymentLink;
                        } else {
                            toast.error("Could not initiate payment. Please try again.");
                        }
                    },
                    onError: (err: unknown) => {
                        const msg = (err as { message?: string })?.message ?? "Checkout failed. Please try again.";
                        toast.error(msg);
                    },
                }
            );
        } else {
            if (!version) return;
            initiateCheckout(
                {
                    ebookVersionId: version.id,
                    ...(user ? {} : {
                        guestEmail: form.email.trim().toLowerCase(),
                        guestName: form.name.trim(),
                        guestPhone: form.phone.trim() || undefined,
                    }),
                },
                {
                    onSuccess: (data) => {
                        if (data.paymentLink) {
                            window.location.href = data.paymentLink;
                        } else {
                            toast.error("Could not initiate payment. Please try again.");
                        }
                    },
                    onError: (err: unknown) => {
                        const msg = (err as { message?: string })?.message ?? "Checkout failed. Please try again.";
                        toast.error(msg);
                    },
                }
            );
        }
    };

    if (ebooksLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LucideLoader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        );
    }

    const hasValidItems = isCartCheckout ? cartItems.length > 0 : (!!ebook && !!version);

    if (!hasValidItems) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-primary">
                <div className="text-center">
                    <LucideAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="font-serif text-2xl text-heading mb-2">
                        {isCartCheckout ? "Cart items not found" : "Edition not found"}
                    </h2>
                    <p className="text-muted mb-6">
                        {isCartCheckout
                            ? "Some items in your cart may no longer be available."
                            : "The selected edition is no longer available."}
                    </p>
                    <Link to="/shop" className="text-accent underline hover:text-accent/80">
                        ← Back to shop
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-primary">
            <SEOHead title="Checkout — Travel Medicine Advisory Global" path="/shop/checkout" robots="noindex, follow" />
            {/* Header */}
            <div className="bg-white border-b border-border-light">
                <div className="max-w-4xl mx-auto px-6 py-5 flex items-center gap-4">
                    <button onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-sm text-muted hover:text-heading transition-colors">
                        <LucideArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <span className="text-muted/40">/</span>
                    <span className="text-sm text-heading font-medium">Checkout</span>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="grid md:grid-cols-5 gap-8">
                    {/* Form */}
                    <div className="md:col-span-3">
                        <h1 className="font-serif text-3xl text-heading mb-2">Complete your purchase</h1>
                        <p className="text-muted text-sm mb-8">
                            Your {isCartCheckout && cartItems.length > 1 ? "ebooks" : "ebook"} will be emailed to you immediately after payment confirmation.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {user ? (
                                <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4">
                                    <p className="text-sm font-medium text-heading">
                                        Purchasing as {user.first_name} {user.last_name}
                                    </p>
                                    <p className="text-xs text-muted mt-0.5">{user.email}</p>
                                    <p className="text-xs text-accent mt-2">
                                        Your {isCartCheckout && cartItems.length > 1 ? "ebooks" : "ebook"} will appear in your dashboard under "My Ebooks".
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-background-secondary border border-border-light rounded-2xl p-4">
                                        <p className="text-xs text-muted mb-2">
                                            Already have an account?{" "}
                                            <Link to={`/login?redirect=/shop`}
                                                className="text-accent hover:underline">
                                                Sign in
                                            </Link>{" "}
                                            to purchase and access your {isCartCheckout && cartItems.length > 1 ? "ebooks" : "ebook"} from your dashboard.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-heading uppercase tracking-wider mb-1.5">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                            placeholder="Your full name"
                                            className={cn(
                                                "w-full px-4 py-3 rounded-xl border bg-white text-sm text-heading placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all",
                                                errors.name ? "border-red-300" : "border-border-light"
                                            )}
                                        />
                                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-heading uppercase tracking-wider mb-1.5">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                            placeholder="your@email.com"
                                            className={cn(
                                                "w-full px-4 py-3 rounded-xl border bg-white text-sm text-heading placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all",
                                                errors.email ? "border-red-300" : "border-border-light"
                                            )}
                                        />
                                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                                        <p className="text-xs text-muted mt-1">
                                            Your {isCartCheckout && cartItems.length > 1 ? "ebooks" : "ebook"} download link will be sent to this address.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-heading uppercase tracking-wider mb-1.5">
                                            Phone (optional)
                                        </label>
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                            placeholder="+1 234 567 8900"
                                            className="w-full px-4 py-3 rounded-xl border border-border-light bg-white text-sm text-heading placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                                        />
                                    </div>
                                </>
                            )}

                            <button
                                type="submit"
                                disabled={isPending}
                                className={cn(
                                    "w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-semibold text-sm transition-all",
                                    isPending
                                        ? "bg-dark/50 text-white/50 cursor-not-allowed"
                                        : "bg-dark text-white hover:bg-darkest"
                                )}
                            >
                                {isPending ? (
                                    <>
                                        <LucideLoader2 className="w-4 h-4 animate-spin" />
                                        Redirecting to payment...
                                    </>
                                ) : (
                                    <>
                                        <LucideLock className="w-4 h-4" />
                                        Proceed to Secure Payment — {isCartCheckout ? cartSymbol : symbol()}{formatMoney(isCartCheckout ? cartTotal : applyLaunch(convertFrom(version?.price ?? 0, version?.currency ?? "USD")))}
                                    </>
                                )}
                            </button>

                            <div className="flex items-center justify-center gap-2 text-xs text-muted">
                                <LucideShieldCheck className="w-3.5 h-3.5 text-accent" />
                                <span>Secured by Flutterwave</span>
                            </div>
                        </form>
                    </div>

                    {/* Order summary */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-2xl border border-border-light p-6 sticky top-8">
                            <h3 className="text-xs font-bold tracking-wider text-muted uppercase mb-4">Order Summary</h3>

                            <LaunchDiscountBanner variant="inline" className="mb-4" />

                            {isCartCheckout ? (
                                <div className="space-y-3 mb-5">
                                    {cartItems.map(({ ebook: eb, version: ver }) => (
                                        <div key={ver.id} className="flex gap-3">
                                            <div className="w-12 h-15 rounded-lg bg-darkest flex items-center justify-center shrink-0">
                                                {eb.coverUrl ? (
                                                    <img src={eb.coverUrl} alt={eb.title}
                                                        className="w-full h-full object-cover rounded-lg" />
                                                ) : (
                                                    <LucideBookOpen className="w-5 h-5 text-accent/60" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-heading leading-tight line-clamp-1">
                                                    {eb.title}
                                                </p>
                                                <p className="text-xs text-muted mt-0.5">{ver.label}</p>
                                                <p className="text-sm font-semibold text-heading mt-1">
                                                    {(() => {
                                                        const original = convertFrom(ver.price, ver.currency);
                                                        const discounted = applyLaunch(original);
                                                        if (launchPct > 0 && discounted !== original) {
                                                            return (
                                                                <>
                                                                    <span className="line-through text-muted mr-1">{symbol()}{formatMoney(original)}</span>
                                                                    {symbol()}{formatMoney(discounted)}
                                                                </>
                                                            );
                                                        }
                                                        return <>{symbol()}{formatMoney(original)}</>;
                                                    })()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex gap-3 mb-5">
                                    <div className="w-14 h-18 rounded-lg bg-darkest flex items-center justify-center shrink-0">
                                        {ebook?.coverUrl ? (
                                            <img src={ebook.coverUrl} alt={ebook.title}
                                                className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <LucideBookOpen className="w-6 h-6 text-accent/60" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-heading leading-tight line-clamp-2">
                                            {ebook?.title}
                                        </p>
                                        <p className="text-xs text-muted mt-1">{ebook?.author}</p>
                                    </div>
                                </div>
                            )}

                            {!isCartCheckout && version && (
                                <div className="space-y-2 border-t border-border-light pt-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-1.5 text-body">
                                            <LucideGlobe className="w-3.5 h-3.5 text-accent" />
                                            Edition
                                        </span>
                                        <span className="font-medium text-heading">{version.label}</span>
                                    </div>
                                    {version.countryName && version.countryName !== version.label && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-body">Region</span>
                                            <span className="text-muted">{version.countryName}</span>
                                        </div>
                                    )}
                                    {version.fileSizeMb && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-body">File size</span>
                                            <span className="text-muted">{version.fileSizeMb} MB PDF</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {isCartCheckout && cartItems.length > 1 && (
                                <div className="space-y-2 border-t border-border-light pt-4">
                                    {cartItems.map(({ version: ver }) => (
                                        <div key={ver.id} className="flex items-center justify-between text-sm">
                                            <span className="text-body truncate mr-2">{ver.label}</span>
                                            <span className="font-medium text-heading whitespace-nowrap">
                                                {(() => {
                                                    const original = convertFrom(ver.price, ver.currency);
                                                    const discounted = applyLaunch(original);
                                                    return launchPct > 0 && discounted !== original
                                                        ? `${symbol()}${formatMoney(discounted)}`
                                                        : `${symbol()}${formatMoney(original)}`;
                                                })()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="border-t border-border-light mt-4 pt-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-heading">Total</span>
                                    <span className="text-xl font-bold text-accent">
                                        {isCartCheckout ? cartSymbol : symbol()}{formatMoney(isCartCheckout ? cartTotal : applyLaunch(convertFrom(version?.price ?? 0, version?.currency ?? "USD")))}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-5 space-y-2">
                                {[
                                    "PDF format, readable on all devices",
                                    "Lifetime access — no expiry",
                                    "Delivered instantly by email",
                                ].map(t => (
                                    <div key={t} className="flex items-start gap-2 text-xs text-muted">
                                        <span className="text-accent mt-0.5">✓</span>
                                        {t}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

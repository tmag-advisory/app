import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useEbook, useSyncCart } from "../../api/hooks";
import { useAuth } from "../../context/AuthContext";
import { useCartStore, type CartItem } from "../../stores/cartStore";
import { useCurrencyStore } from "../../stores/currencyStore";
import CurrencySelector from "../../components/ui/CurrencySelector";
import type { EbookVersionResponse } from "../../api/types";
import {
    LucideBookOpen, LucideLoader2, LucideGlobe, LucideUser,
    LucideCalendar, LucideFileText, LucideShoppingCart,
    LucideChevronDown, LucideArrowLeft, LucideShieldCheck,
    LucideDownload, LucideMail, LucideCheck
} from "lucide-react";
import { cn } from "../../lib/utils";
import toast from "react-hot-toast";
import SEOHead from "../../lib/seo";

export default function EbookDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { data: ebook, isLoading } = useEbook(slug ?? "");
    const { addItem, hasItem, items } = useCartStore();
    const { mutate: syncCart } = useSyncCart();
    const { convertFrom, symbol } = useCurrencyStore();

    const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
    const [versionDropdownOpen, setVersionDropdownOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-primary">
                <LucideLoader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        );
    }

    if (!ebook) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-primary">
                <div className="text-center">
                    <LucideBookOpen className="w-12 h-12 text-muted mx-auto mb-4" />
                    <h2 className="font-serif text-2xl text-heading mb-2">Ebook not found</h2>
                    <Link to="/shop" className="text-accent underline text-sm">Back to shop</Link>
                </div>
            </div>
        );
    }

    const activeVersions = ebook.versions.filter(v => v.isActive);
    const selectedVersion = activeVersions.find(v => v.id === selectedVersionId) ?? activeVersions[0] ?? null;

    const handleSelectVersion = (versionId: number) => {
        setSelectedVersionId(versionId);
        setVersionDropdownOpen(false);
    };

    const handleBuyNow = () => {
        if (!selectedVersion) return;
        navigate(`/shop/checkout?versionId=${selectedVersion.id}&ebookId=${ebook.id}`);
    };

    const handleAddToCart = (version: EbookVersionResponse) => {
        if (!ebook) return;
        const cartItem: CartItem = {
            ebookVersionId: version.id,
            ebookId: ebook.id,
            ebookTitle: ebook.title,
            ebookSlug: ebook.slug,
            coverUrl: ebook.coverUrl,
            versionLabel: version.label,
            countryName: version.countryName,
            price: version.price,
            currency: version.currency,
            currencySymbol: version.currencySymbol,
        };
        addItem(cartItem);
        toast.success(`Added "${ebook.title} — ${version.label}" to cart`);

        if (isAuthenticated) {
            syncCart(
                [...items, cartItem]
                    .filter((item, idx, arr) =>
                        arr.findIndex(i => i.ebookVersionId === item.ebookVersionId) === idx
                    )
                    .map(i => ({ ebookVersionId: i.ebookVersionId }))
            );
        }
    };

    return (
        <div className="min-h-screen bg-background-primary">
            <SEOHead title="Ebook — Travel Medicine Advisory Global" description="Browse our collection of travel health ebooks and guides." path="/shop/:slug" />
            {/* Breadcrumb bar */}
            <div className="bg-white border-b border-border-light">
                <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
                    <Link to="/shop" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors">
                        <LucideArrowLeft className="w-3.5 h-3.5" />
                        Back to Shop
                    </Link>
                    <CurrencySelector />
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-6xl mx-auto px-6 py-10">
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
                    {/* Left: Cover image */}
                    <div>
                        <div className="bg-gradient-to-br from-darkest to-dark rounded-2xl overflow-hidden aspect-[3/4] flex items-center justify-center sticky top-8">
                            {ebook.coverUrl ? (
                                <img
                                    src={ebook.coverUrl}
                                    alt={ebook.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <LucideBookOpen className="w-24 h-24 text-white/20" />
                            )}
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="flex flex-col">
                        {/* Title & meta */}
                        <div>
                            {ebook.isFeatured && (
                                <span className="inline-block text-[10px] font-bold tracking-[3px] text-gold uppercase mb-2">
                                    TMAG Featured Publication
                                </span>
                            )}
                            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-heading leading-tight mb-4">
                                {ebook.title}
                            </h1>

                            <div className="flex flex-wrap gap-4 text-sm text-muted mb-6">
                                <span className="flex items-center gap-1.5">
                                    <LucideUser className="w-4 h-4" />
                                    {ebook.author}
                                </span>
                                {ebook.publishedYear && (
                                    <span className="flex items-center gap-1.5">
                                        <LucideCalendar className="w-4 h-4" />
                                        {ebook.publishedYear}
                                    </span>
                                )}
                                {ebook.pageCount && (
                                    <span className="flex items-center gap-1.5">
                                        <LucideFileText className="w-4 h-4" />
                                        {ebook.pageCount} pages
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <LucideGlobe className="w-4 h-4" />
                                    {activeVersions.length} {activeVersions.length === 1 ? "edition" : "editions"}
                                </span>
                            </div>
                        </div>

                        {/* Short description */}
                        {ebook.shortDescription && (
                            <p className="text-body leading-relaxed mb-6">
                                {ebook.shortDescription}
                            </p>
                        )}

                        {/* Purchase card */}
                        {activeVersions.length > 0 && selectedVersion && (
                            <div className="bg-white rounded-2xl border border-border-light p-6 space-y-5 mb-8">
                                {/* Version selector */}
                                <div>
                                    <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                                        Select your edition
                                    </label>
                                    <div className="relative">
                                        <button
                                            onClick={() => setVersionDropdownOpen(!versionDropdownOpen)}
                                            className="w-full flex items-center justify-between px-4 py-3 bg-background-primary border border-border-light rounded-xl text-sm font-medium text-heading hover:border-accent/40 transition-colors"
                                        >
                                            <span className="flex items-center gap-2">
                                                <LucideGlobe className="w-4 h-4 text-accent" />
                                                {selectedVersion.label}
                                                {selectedVersion.countryName && selectedVersion.countryName !== selectedVersion.label && (
                                                    <span className="text-muted text-xs">({selectedVersion.countryName})</span>
                                                )}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <strong className="text-accent">
                                                    {selectedVersion.currencySymbol}{selectedVersion.price.toLocaleString()}
                                                </strong>
                                                {selectedVersion.currency !== useCurrencyStore.getState().selectedCurrency && (
                                                    <span className="text-xs text-muted">
                                                        ≈ {symbol()}{convertFrom(selectedVersion.price, selectedVersion.currency).toLocaleString()}
                                                    </span>
                                                )}
                                                <LucideChevronDown className={cn("w-4 h-4 text-muted transition-transform", versionDropdownOpen && "rotate-180")} />
                                            </span>
                                        </button>

                                        {versionDropdownOpen && (
                                            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-border-light rounded-xl shadow-lg z-20 overflow-hidden">
                                                {activeVersions.map(version => (
                                                    <button
                                                        key={version.id}
                                                        onClick={() => handleSelectVersion(version.id)}
                                                        className={cn(
                                                            "w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-background-primary transition-colors",
                                                            selectedVersion.id === version.id && "bg-accent/5 text-accent font-medium"
                                                        )}
                                                    >
                                                        <span className="flex flex-col items-start">
                                                            <span className="font-medium text-heading">{version.label}</span>
                                                            {version.countryName && version.countryName !== version.label && (
                                                                <span className="text-xs text-muted">{version.countryName}</span>
                                                            )}
                                                        </span>
                                                        <span className="flex items-center gap-2">
                                                            <strong className="text-accent">
                                                                {version.currencySymbol}{version.price.toLocaleString()}
                                                            </strong>
                                                            {version.currency !== useCurrencyStore.getState().selectedCurrency && (
                                                                <span className="text-xs text-muted">
                                                                    ≈ {symbol()}{convertFrom(version.price, version.currency).toLocaleString()}
                                                                </span>
                                                            )}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Price display */}
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-serif font-semibold text-heading">
                                            {selectedVersion.currencySymbol}{selectedVersion.price.toLocaleString()}
                                        </span>
                                        <span className="text-sm text-muted">{selectedVersion.currency}</span>
                                    </div>
                                    {selectedVersion.currency !== useCurrencyStore.getState().selectedCurrency && (
                                        <p className="text-sm text-muted mt-1">
                                            ≈ {symbol()}{convertFrom(selectedVersion.price, selectedVersion.currency).toLocaleString()} {useCurrencyStore.getState().selectedCurrency}
                                        </p>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleBuyNow}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-dark text-white text-sm font-semibold rounded-xl hover:bg-darkest transition-colors"
                                    >
                                        <LucideShoppingCart className="w-4 h-4" />
                                        Buy Now
                                    </button>
                                    {hasItem(selectedVersion.id) ? (
                                        <button
                                            disabled
                                            className="px-5 py-3.5 border border-accent/30 text-accent text-sm font-semibold rounded-xl bg-accent/5 cursor-default"
                                        >
                                            <LucideCheck className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleAddToCart(selectedVersion)}
                                            className="px-5 py-3.5 border border-border-light text-heading text-sm font-semibold rounded-xl hover:border-accent/40 hover:text-accent transition-colors"
                                        >
                                            <LucideShoppingCart className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {user && (
                                    <p className="text-xs text-accent text-center flex items-center justify-center gap-1">
                                        <LucideCheck className="w-3.5 h-3.5" />
                                        Logged in — checkout will be faster
                                    </p>
                                )}

                                {ebook.previewUrl && (
                                    <a href={ebook.previewUrl} target="_blank" rel="noopener noreferrer"
                                        className="text-xs text-accent underline hover:text-accent/80 transition-colors text-center block">
                                        Preview sample pages
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Trust badges */}
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            {[
                                { icon: LucideShieldCheck, text: "Clinically reviewed" },
                                { icon: LucideDownload, text: "Instant PDF download" },
                                { icon: LucideMail, text: "Email delivery" },
                            ].map(({ icon: Icon, text }) => (
                                <div key={text} className="flex flex-col items-center gap-1.5 bg-white rounded-xl border border-border-light p-3 text-center">
                                    <Icon className="w-4 h-4 text-accent" />
                                    <span className="text-[11px] text-muted leading-tight">{text}</span>
                                </div>
                            ))}
                        </div>

                        {/* ISBN */}
                        {ebook.isbn && (
                            <p className="text-xs text-muted mb-2">ISBN: {ebook.isbn}</p>
                        )}
                    </div>
                </div>

                {/* Full description & Author bio below */}
                <div className="mt-14 grid md:grid-cols-2 gap-10">
                    {ebook.description && (
                        <div className="bg-white rounded-2xl border border-border-light p-8">
                            <h3 className="font-serif text-xl text-heading mb-4">About this book</h3>
                            <div className="text-sm text-body leading-relaxed whitespace-pre-line">
                                {ebook.description}
                            </div>
                        </div>
                    )}

                    {ebook.authorBio && (
                        <div className="bg-white rounded-2xl border border-border-light p-8">
                            <h3 className="font-serif text-xl text-heading mb-4">About the authors</h3>
                            <p className="text-sm text-body leading-relaxed">
                                {ebook.authorBio}
                            </p>
                        </div>
                    )}
                </div>

                {/* All editions table */}
                {activeVersions.length > 1 && (
                    <div className="mt-10 bg-white rounded-2xl border border-border-light overflow-hidden">
                        <div className="px-6 py-4 border-b border-border-light">
                            <h3 className="font-serif text-lg text-heading">Available Editions</h3>
                            <p className="text-xs text-muted mt-0.5">Choose the edition best suited for your destination</p>
                        </div>
                        <div className="divide-y divide-border-light">
                            {activeVersions.map(version => {
                                const inCart = hasItem(version.id);
                                return (
                                    <div key={version.id} className="flex items-center justify-between px-6 py-4">
                                        <div>
                                            <p className="text-sm font-medium text-heading">{version.label}</p>
                                            <div className="flex gap-3 text-xs text-muted mt-0.5">
                                                {version.countryName && version.countryName !== version.label && (
                                                    <span>{version.countryName}</span>
                                                )}
                                                {version.region && (
                                                    <span>{version.region}</span>
                                                )}
                                                {version.fileSizeMb && (
                                                    <span>{version.fileSizeMb} MB</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <span className="text-lg font-semibold text-heading block">
                                                    {version.currencySymbol}{version.price.toLocaleString()}
                                                </span>
                                                {version.currency !== useCurrencyStore.getState().selectedCurrency && (
                                                    <span className="text-xs text-muted">
                                                        ≈ {symbol()}{convertFrom(version.price, version.currency).toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                            {inCart ? (
                                                <span className="px-3 py-2 text-xs font-semibold text-accent bg-accent/5 rounded-lg flex items-center gap-1">
                                                    <LucideCheck className="w-3.5 h-3.5" />
                                                    In Cart
                                                </span>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleAddToCart(version)}
                                                        className="p-2 border border-border-light text-heading rounded-lg hover:border-accent/40 hover:text-accent transition-colors"
                                                        title="Add to cart"
                                                    >
                                                        <LucideShoppingCart className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/shop/checkout?versionId=${version.id}&ebookId=${ebook.id}`)}
                                                        className="px-4 py-2 bg-dark text-white text-xs font-semibold rounded-lg hover:bg-darkest transition-colors"
                                                    >
                                                        Buy
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer strip */}
            <div className="border-t border-border-light py-10 text-center mt-10">
                <p className="text-xs text-muted">
                    All ebooks are delivered as PDF downloads immediately after payment confirmation.
                    {" "}
                    <a href="/medical-disclaimer" className="text-accent hover:underline">Medical Disclaimer</a>
                    {" | "}
                    <a href="/contact" className="text-accent hover:underline">Support</a>
                </p>
            </div>
        </div>
    );
}

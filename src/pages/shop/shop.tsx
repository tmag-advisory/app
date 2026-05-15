import { Link } from "react-router-dom";
import { useEbooks, useSyncCart } from "../../api/hooks";
import { useCartStore, type CartItem } from "../../stores/cartStore";
import { useCurrencyStore } from "../../stores/currencyStore";
import { useAuth } from "../../context/AuthContext";
import CurrencySelector from "../../components/ui/CurrencySelector";
import {
    LucideBookOpen, LucideLoader2, LucideGlobe,
    LucideShieldCheck, LucideDownload, LucideStar,
    LucideUser, LucideArrowRight, LucideShoppingCart,
    LucideCheck
} from "lucide-react";
import toast from "react-hot-toast";
import SEOHead from "../../lib/seo";

export default function ShopPage() {
    const { data: ebooks, isLoading } = useEbooks();
    const { addItem, hasItem, items } = useCartStore();
    const { isAuthenticated } = useAuth();
    const { mutate: syncCart } = useSyncCart();
    const { convertFrom, symbol } = useCurrencyStore();

    const handleAddToCart = (e: React.MouseEvent, ebook: NonNullable<typeof ebooks>[0], version: typeof ebook.versions[0]) => {
        e.preventDefault();
        e.stopPropagation();

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
        toast.success(`Added "${ebook.title}" to cart`);

        if (isAuthenticated) {
            const updatedItems = [...items, cartItem].filter((item, idx, arr) =>
                arr.findIndex(i => i.ebookVersionId === item.ebookVersionId) === idx
            );
            syncCart(updatedItems.map(i => ({ ebookVersionId: i.ebookVersionId })));
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-primary">
                <LucideLoader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-primary">
            <SEOHead title="Shop — Travel Medicine Advisory Global" description="Browse travel health ebooks, guides, and resources from TMAG." path="/shop" />
            {/* Hero */}
            <div className="bg-darkest text-white">
                <div className="max-w-6xl mx-auto px-6 py-20 text-center">
                    <span className="inline-block text-[10px] font-semibold tracking-[5px] text-gold uppercase mb-4">
                        Travel Health Resources
                    </span>
                    <h1 className="font-serif text-4xl sm:text-5xl font-light text-white mb-5 leading-tight">
                        TMAG Ebook Store
                    </h1>
                    <p className="text-muted max-w-xl mx-auto text-base leading-relaxed">
                        Expert-authored guides to keep you healthy on every international journey.
                        Written by certified travel medicine physicians.
                    </p>
                </div>
            </div>

            {/* Trust strip + Currency selector */}
            <div className="border-b border-border-light bg-white">
                <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap justify-center gap-8">
                        {[
                            { icon: LucideShieldCheck, text: "Clinically reviewed" },
                            { icon: LucideDownload, text: "Instant download" },
                            { icon: LucideGlobe, text: "Regional editions" },
                            { icon: LucideStar, text: "Expert authors" },
                        ].map(({ icon: Icon, text }) => (
                            <div key={text} className="flex items-center gap-2 text-sm text-body">
                                <Icon className="w-4 h-4 text-accent" />
                                <span>{text}</span>
                            </div>
                        ))}
                    </div>
                    <CurrencySelector />
                </div>
            </div>

            {/* Product grid */}
            <div className="max-w-6xl mx-auto px-6 py-16">
                {(!ebooks || ebooks.length === 0) ? (
                    <div className="text-center py-20">
                        <LucideBookOpen className="w-12 h-12 text-muted mx-auto mb-4" />
                        <p className="text-muted">No ebooks available yet. Check back soon.</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {ebooks.map(ebook => {
                            const activeVersions = ebook.versions.filter(v => v.isActive);
                            const cheapestVersion = activeVersions.reduce<typeof activeVersions[0] | null>((best, v) => {
                                const convertedPrice = convertFrom(v.price, v.currency);
                                const bestPrice = best ? convertFrom(best.price, best.currency) : Infinity;
                                return best === null || convertedPrice < bestPrice ? v : best;
                            }, null);
                            const inCart = cheapestVersion ? hasItem(cheapestVersion.id) : false;

                            return (
                                <Link
                                    key={ebook.id}
                                    to={`/shop/${ebook.slug}`}
                                    className="group bg-white rounded-2xl border border-border-light overflow-hidden hover:shadow-lg hover:border-accent/20 transition-all duration-300"
                                >
                                    {/* Cover image */}
                                    <div className="relative bg-gradient-to-br from-darkest to-dark aspect-[4/3] flex items-center justify-center overflow-hidden">
                                        {ebook.coverUrl ? (
                                            <img
                                                src={ebook.coverUrl}
                                                alt={ebook.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <LucideBookOpen className="w-16 h-16 text-white/20" />
                                        )}
                                        {ebook.isFeatured && (
                                            <span className="absolute top-3 left-3 text-[10px] font-bold tracking-[2px] uppercase bg-gold/90 text-white px-3 py-1 rounded-full">
                                                Featured
                                            </span>
                                        )}
                                        {activeVersions.length > 0 && (
                                            <span className="absolute top-3 right-3 text-xs font-medium bg-white/90 text-dark px-2.5 py-1 rounded-full flex items-center gap-1">
                                                <LucideGlobe className="w-3 h-3" />
                                                {activeVersions.length} {activeVersions.length === 1 ? "edition" : "editions"}
                                            </span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <h3 className="font-serif text-lg font-semibold text-heading leading-snug mb-1.5 group-hover:text-accent transition-colors">
                                            {ebook.title}
                                        </h3>

                                        <div className="flex items-center gap-1.5 text-xs text-muted mb-3">
                                            <LucideUser className="w-3 h-3" />
                                            <span className="truncate">{ebook.author}</span>
                                        </div>

                                        {ebook.shortDescription && (
                                            <p className="text-sm text-body leading-relaxed line-clamp-2 mb-4">
                                                {ebook.shortDescription}
                                            </p>
                                        )}

                                        <div className="flex items-end justify-between pt-3 border-t border-border-light">
                                            <div>
                                                {cheapestVersion && (
                                                    <div>
                                                        <span className="text-xs text-muted">From</span>
                                                        <p className="text-xl font-serif font-semibold text-heading">
                                                            {cheapestVersion.currencySymbol}{cheapestVersion.price.toLocaleString()}
                                                            {activeVersions.length > 1 && (() => {
                                                                const mostExpensive = activeVersions.reduce<typeof activeVersions[0]>((max, v) => v.price > max.price ? v : max, activeVersions[0]);
                                                                if (mostExpensive.price !== cheapestVersion.price) {
                                                                    return (
                                                                        <span className="text-sm text-muted font-normal ml-1">
                                                                            — {mostExpensive.currencySymbol}{mostExpensive.price.toLocaleString()}
                                                                        </span>
                                                                    );
                                                                }
                                                                return null;
                                                            })()}
                                                        </p>
                                                        {(() => {
                                                            const selectedCurrency = useCurrencyStore.getState().selectedCurrency;
                                                            if (cheapestVersion.currency !== selectedCurrency) {
                                                                return (
                                                                    <p className="text-xs text-muted mt-0.5">
                                                                        ≈ {symbol()}{convertFrom(cheapestVersion.price, cheapestVersion.currency).toLocaleString()} {selectedCurrency}
                                                                    </p>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                            {inCart ? (
                                                <span className="flex items-center gap-1 text-xs font-medium text-accent">
                                                    <LucideCheck className="w-3.5 h-3.5" />
                                                    In Cart
                                                </span>
                                            ) : cheapestVersion ? (
                                                <button
                                                    onClick={(e) => handleAddToCart(e, ebook, cheapestVersion)}
                                                    className="flex items-center gap-1 text-xs font-medium text-accent hover:gap-2 transition-all"
                                                >
                                                    <LucideShoppingCart className="w-3.5 h-3.5" />
                                                    Add to Cart
                                                </button>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs font-medium text-accent group-hover:gap-2 transition-all">
                                                    View Details
                                                    <LucideArrowRight className="w-3.5 h-3.5" />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer strip */}
            <div className="border-t border-border-light py-10 text-center">
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

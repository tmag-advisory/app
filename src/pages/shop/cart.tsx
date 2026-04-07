import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../../stores/cartStore";
import { useCurrencyStore } from "../../stores/currencyStore";
import { useAuth } from "../../context/AuthContext";
import { useRemoveFromCart, useClearCart } from "../../api/hooks";
import CurrencySelector from "../../components/ui/CurrencySelector";
import {
    LucideArrowLeft, LucideShoppingCart, LucideTrash2,
    LucideBookOpen, LucideGlobe, LucideArrowRight,
    LucideShieldCheck, LucideLock
} from "lucide-react";
import toast from "react-hot-toast";

export default function CartPage() {
    const navigate = useNavigate();
    const { items, removeItem, clearCart } = useCartStore();
    const { isAuthenticated } = useAuth();
    const { mutate: removeFromServer } = useRemoveFromCart();
    const { mutate: clearServerCart } = useClearCart();
    const { convertFrom, symbol } = useCurrencyStore();

    const total = items.reduce((sum, item) => sum + convertFrom(item.price, item.currency), 0);

    const handleRemove = (ebookVersionId: number) => {
        removeItem(ebookVersionId);
        if (isAuthenticated) {
            removeFromServer(ebookVersionId);
        }
    };

    const handleClear = () => {
        clearCart();
        if (isAuthenticated) {
            clearServerCart();
        }
        toast.success("Cart cleared");
    };

    const handleCheckout = () => {
        if (items.length === 0) return;
        const versionIds = items.map(i => i.ebookVersionId).join(",");
        navigate(`/shop/checkout?cart=${versionIds}`);
    };

    return (
        <div className="min-h-screen bg-background-primary">
            {/* Header */}
            <div className="bg-white border-b border-border-light">
                <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/shop" className="flex items-center gap-1.5 text-sm text-muted hover:text-heading transition-colors">
                            <LucideArrowLeft className="w-4 h-4" />
                            Continue Shopping
                        </Link>
                        <span className="text-muted/40">/</span>
                        <span className="text-sm text-heading font-medium">Cart</span>
                    </div>
                    <CurrencySelector />
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-12">
                {items.length === 0 ? (
                    <div className="text-center py-20">
                        <LucideShoppingCart className="w-16 h-16 text-muted/20 mx-auto mb-5" />
                        <h2 className="font-serif text-2xl text-heading mb-2">Your cart is empty</h2>
                        <p className="text-muted mb-6">Browse our collection of travel health ebooks.</p>
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-dark text-white text-sm font-semibold rounded-xl hover:bg-darkest transition-colors"
                        >
                            Browse the Shop
                            <LucideArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Cart items */}
                        <div className="md:col-span-2">
                            <div className="flex items-center justify-between mb-5">
                                <h1 className="font-serif text-2xl text-heading">
                                    Cart ({items.length} {items.length === 1 ? "item" : "items"})
                                </h1>
                                <button
                                    onClick={handleClear}
                                    className="text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
                                >
                                    <LucideTrash2 className="w-3.5 h-3.5" />
                                    Clear all
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl border border-border-light divide-y divide-border-light">
                                {items.map(item => (
                                    <div key={item.ebookVersionId} className="flex gap-4 p-5">
                                        <Link to={`/shop/${item.ebookSlug}`} className="w-16 h-20 rounded-lg bg-darkest flex-shrink-0 overflow-hidden">
                                            {item.coverUrl ? (
                                                <img src={item.coverUrl} alt={item.ebookTitle} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <LucideBookOpen className="w-6 h-6 text-white/30" />
                                                </div>
                                            )}
                                        </Link>
                                        <div className="flex-1 min-w-0">
                                            <Link to={`/shop/${item.ebookSlug}`} className="text-sm font-semibold text-heading hover:text-accent transition-colors line-clamp-1">
                                                {item.ebookTitle}
                                            </Link>
                                            <div className="flex items-center gap-1 text-xs text-muted mt-1">
                                                <LucideGlobe className="w-3 h-3" />
                                                {item.versionLabel}
                                                {item.countryName && item.countryName !== item.versionLabel && (
                                                    <span> — {item.countryName}</span>
                                                )}
                                            </div>
                                            <p className="text-base font-semibold text-accent mt-2">
                                                {item.currencySymbol}{item.price.toLocaleString()}
                                                {item.currency !== useCurrencyStore.getState().selectedCurrency && (
                                                    <span className="text-xs text-muted font-normal ml-1.5">
                                                        ≈ {symbol()}{convertFrom(item.price, item.currency).toLocaleString()}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(item.ebookVersionId)}
                                            className="self-start p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <LucideTrash2 className="w-4 h-4 text-red-400" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order summary */}
                        <div>
                            <div className="bg-white rounded-2xl border border-border-light p-6 sticky top-8">
                                <h3 className="text-xs font-bold tracking-wider text-muted uppercase mb-4">Order Summary</h3>

                                <div className="space-y-3 border-b border-border-light pb-4 mb-4">
                                    {items.map(item => (
                                        <div key={item.ebookVersionId} className="flex justify-between text-sm">
                                            <span className="text-body truncate mr-2">{item.ebookTitle}</span>
                                            <div className="text-right shrink-0">
                                                <span className="text-heading font-medium block">
                                                    {item.currencySymbol}{item.price.toLocaleString()}
                                                </span>
                                                {item.currency !== useCurrencyStore.getState().selectedCurrency && (
                                                    <span className="text-xs text-muted">
                                                        ≈ {symbol()}{convertFrom(item.price, item.currency).toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-sm font-semibold text-heading">Total</span>
                                    <span className="text-xl font-bold text-accent">
                                        {symbol()}{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full flex items-center justify-center gap-2 py-4 bg-dark text-white text-sm font-semibold rounded-xl hover:bg-darkest transition-colors"
                                >
                                    <LucideLock className="w-4 h-4" />
                                    Proceed to Checkout
                                </button>

                                <div className="flex items-center justify-center gap-2 text-xs text-muted mt-3">
                                    <LucideShieldCheck className="w-3.5 h-3.5 text-accent" />
                                    <span>Secured by Flutterwave</span>
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
                )}
            </div>
        </div>
    );
}

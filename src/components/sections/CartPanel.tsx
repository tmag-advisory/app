import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../../stores/cartStore";
import { useAuth } from "../../context/AuthContext";
import { useCart, useSyncCart } from "../../api/hooks";
import {
    LucideX, LucideShoppingCart, LucideTrash2,
    LucideBookOpen, LucideArrowRight, LucideGlobe
} from "lucide-react";

export default function CartPanel() {
    const { items, panelOpen, closePanel, removeItem, setItems, totalAmount, currencySymbol } = useCartStore();
    const { isAuthenticated } = useAuth();

    // For authenticated users, use backend cart
    const { data: serverCart } = useCart(isAuthenticated && panelOpen);
    const { mutate: syncCart } = useSyncCart();

    // Sync local cart to server when user becomes authenticated
    useEffect(() => {
        if (isAuthenticated && items.length > 0 && !serverCart) {
            syncCart(
                items.map(i => ({ ebookVersionId: i.ebookVersionId })),
                {
                    onSuccess: (serverItems) => {
                        if (serverItems) {
                            setItems(serverItems.map(si => ({
                                ebookVersionId: si.ebookVersionId,
                                ebookId: si.ebookId,
                                ebookTitle: si.ebookTitle,
                                ebookSlug: si.ebookSlug,
                                coverUrl: si.coverUrl,
                                versionLabel: si.versionLabel,
                                countryName: si.countryName,
                                price: si.price,
                                currency: si.currency,
                                currencySymbol: si.currencySymbol,
                            })));
                        }
                    },
                }
            );
        }
    }, [isAuthenticated]);

    // When server cart loads, update local store
    useEffect(() => {
        if (isAuthenticated && serverCart) {
            setItems(serverCart.map(si => ({
                ebookVersionId: si.ebookVersionId,
                ebookId: si.ebookId,
                ebookTitle: si.ebookTitle,
                ebookSlug: si.ebookSlug,
                coverUrl: si.coverUrl,
                versionLabel: si.versionLabel,
                countryName: si.countryName,
                price: si.price,
                currency: si.currency,
                currencySymbol: si.currencySymbol,
            })));
        }
    }, [serverCart, isAuthenticated]);

    const handleRemove = (ebookVersionId: number) => {
        removeItem(ebookVersionId);
        // If authenticated, the backend removal is handled by the remove button in the cart page
    };

    const total = totalAmount();
    const symbol = currencySymbol();

    return (
        <>
            {/* Overlay */}
            {panelOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 transition-opacity"
                    onClick={closePanel}
                />
            )}

            {/* Panel */}
            <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ${panelOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-border-light">
                        <div className="flex items-center gap-2">
                            <LucideShoppingCart className="w-5 h-5 text-heading" />
                            <h2 className="font-serif text-lg font-semibold text-heading">
                                Your Cart
                            </h2>
                            {items.length > 0 && (
                                <span className="bg-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {items.length}
                                </span>
                            )}
                        </div>
                        <button onClick={closePanel} className="p-2 hover:bg-background-primary rounded-lg transition-colors">
                            <LucideX className="w-5 h-5 text-muted" />
                        </button>
                    </div>

                    {/* Items */}
                    <div className="flex-1 overflow-y-auto">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                                <LucideShoppingCart className="w-12 h-12 text-muted/30 mb-4" />
                                <p className="font-serif text-heading mb-1">Your cart is empty</p>
                                <p className="text-sm text-muted">Browse the store to find your next read.</p>
                                <Link
                                    to="/shop"
                                    onClick={closePanel}
                                    className="mt-4 text-sm text-accent hover:underline"
                                >
                                    Visit the Shop
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-border-light">
                                {items.map(item => (
                                    <div key={item.ebookVersionId} className="flex gap-3 p-4">
                                        <div className="w-14 h-18 rounded-lg bg-darkest flex-shrink-0 overflow-hidden">
                                            {item.coverUrl ? (
                                                <img src={item.coverUrl} alt={item.ebookTitle} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <LucideBookOpen className="w-5 h-5 text-white/30" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-heading leading-tight line-clamp-2">
                                                {item.ebookTitle}
                                            </p>
                                            <div className="flex items-center gap-1 text-xs text-muted mt-1">
                                                <LucideGlobe className="w-3 h-3" />
                                                {item.versionLabel}
                                            </div>
                                            <p className="text-sm font-semibold text-accent mt-1">
                                                {item.currencySymbol}{item.price.toLocaleString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(item.ebookVersionId)}
                                            className="self-start p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <LucideTrash2 className="w-4 h-4 text-red-400" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                        <div className="border-t border-border-light p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-body">Subtotal</span>
                                <span className="text-lg font-serif font-semibold text-heading">
                                    {symbol}{total.toLocaleString()}
                                </span>
                            </div>
                            <p className="text-xs text-muted">
                                Taxes and payment processing handled at checkout.
                            </p>
                            <Link
                                to="/shop/cart"
                                onClick={closePanel}
                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-dark text-white text-sm font-semibold rounded-xl hover:bg-darkest transition-colors"
                            >
                                View Cart
                                <LucideArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

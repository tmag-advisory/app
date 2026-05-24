import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LucideShoppingCart, LucideMenu } from "lucide-react";
import { useCartStore } from "../../stores/cartStore";
import FullPageMenu from "./FullPageMenu";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { pathname } = useLocation();
    const { itemCount, togglePanel } = useCartStore();

    const isShopPage = pathname.startsWith("/shop");
    const count = isShopPage ? itemCount() : 0;

    return (
        <>
            <nav className="px-8 lg:px-16 py-5 max-w-350 mx-auto">
                <div className="flex items-center justify-between">
                    <Link
                        to="/"
                        className="text-heading tracking-tight text-xl font-serif font-medium"
                    >
                        TMAG
                    </Link>

                    <div className="flex items-center gap-3">
                        {isShopPage && (
                            <button
                                onClick={togglePanel}
                                className="relative p-2 hover:bg-background-primary rounded-lg transition-colors"
                                aria-label="Shopping cart"
                            >
                                <LucideShoppingCart className="w-5 h-5 text-heading" />
                                {count > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center min-w-4.5 min-h-4.5">
                                        {count}
                                    </span>
                                )}
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => setMenuOpen(true)}
                            aria-label="Open menu"
                            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-background-secondary transition-colors cursor-pointer"
                        >
                            <LucideMenu className="w-5 h-5 text-heading" />
                            <span className="hidden sm:inline text-sm font-medium text-heading">
                                Menu
                            </span>
                        </button>
                    </div>
                </div>
            </nav>
            <FullPageMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
        </>
    );
};

export default Navbar;

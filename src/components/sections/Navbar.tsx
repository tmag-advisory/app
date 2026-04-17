import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Button from "../ui/Button";
import NavLink from "../ui/NavLink";
import { useCartStore } from "../../stores/cartStore";
import { LucideShoppingCart } from "lucide-react";

const Navbar = () => {
    const [open, setOpen] = useState(false);
    const { pathname } = useLocation();
    const { itemCount, togglePanel } = useCartStore();
    const count = itemCount();

    const isShopPage = pathname.startsWith("/shop");

    return (
        <nav className="px-8 lg:px-16 py-5 max-w-350 mx-auto">
            {/* Desktop row */}
            <div className="flex justify-between md:grid grid-cols-3 items-center">
                <div className="hidden md:flex items-center gap-6 font-medium">
                    <NavLink href="/about">About Us</NavLink>
                    <NavLink href="/pricing">Pricing</NavLink>
                </div>

                <Link to="/" className="text-heading tracking-tight text-xl font-serif font-medium text-center">
                    TMAG
                </Link>

                <div className="flex justify-end items-center gap-3">
                    {/* Cart icon — only on shop pages */}
                    {isShopPage && (
                        <button
                            onClick={togglePanel}
                            className="relative p-2 hover:bg-background-primary rounded-lg transition-colors"
                            aria-label="Shopping cart"
                        >
                            <LucideShoppingCart className="w-5 h-5 text-heading" />
                            {count > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center min-w-[18px] min-h-[18px]">
                                    {count}
                                </span>
                            )}
                        </button>
                    )}

                    <div className="hidden md:flex items-center gap-3">
                        <NavLink href="/login">Sign In</NavLink>
                        <Button variant="secondary" link="/register">Get My Free Plan</Button>
                    </div>
                    <button
                        className="md:hidden flex flex-col gap-1.5 p-1 cursor-pointer self-end"
                        onClick={() => setOpen((o) => !o)}
                        aria-label="Toggle menu"
                    >
                        <span
                            className={`block h-0.5 w-6 bg-heading rounded transition-transform duration-300 origin-center ${open ? "translate-y-2 rotate-45" : ""}`}
                        />
                        <span
                            className={`block h-0.5 w-6 bg-heading rounded transition-opacity duration-300 ${open ? "opacity-0" : ""}`}
                        />
                        <span
                            className={`block h-0.5 w-6 bg-heading rounded transition-transform duration-300 origin-center ${open ? "-translate-y-2 -rotate-45" : ""}`}
                        />
                    </button>
                </div>
            </div>

            {/* Mobile drawer */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ${open ? "max-h-80 mt-4" : "max-h-0"}`}
            >
                <div className="flex flex-col gap-4 pb-4 font-medium border-t border-border-light pt-4">
                    <NavLink href="/how-it-works">How It Works</NavLink>
                    <NavLink href="/pricing">Pricing</NavLink>
                    <NavLink href="/for-companies">For Companies</NavLink>
                    <NavLink href="/about">About</NavLink>
                    <NavLink href="/faq">FAQ</NavLink>
                    <NavLink href="/login">Sign In</NavLink>
                    <Button variant="secondary" className="self-start" link="/register">Get My Free Plan</Button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

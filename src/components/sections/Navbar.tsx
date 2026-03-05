import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import NavLink from "../ui/NavLink";

const Navbar = () => {
    const [open, setOpen] = useState(false);

    return (
        <nav className="px-8 lg:px-16 py-5 max-w-350 mx-auto">
            {/* Desktop row */}
            <div className="flex  justify-between md:grid grid-cols-3 items-center">
                <div className="hidden md:flex items-center gap-6 font-medium">
                    <NavLink href="/about">About</NavLink>
                    <NavLink href="/pricing">Pricing</NavLink>
                    <NavLink href="/for-companies">For Companies</NavLink>
                </div>

                <Link to="/" className="text-heading tracking-tight text-xl font-serif font-medium text-center">
                    TMAG
                </Link>

                <div className="flex justify-end">
                    <div className="hidden md:block">
                        <Button variant="secondary" link="/pricing">Get Started</Button>
                    </div>
                    <button
                        className="md:hidden flex flex-col gap-1.5 p-1 cursor-pointer  self-end"
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
                    <NavLink href="/about">About</NavLink>
                    <NavLink href="/how-it-works">How It Works</NavLink>
                    <NavLink href="/pricing">Pricing</NavLink>
                    <NavLink href="/for-companies">For Companies</NavLink>
                    <NavLink href="/faq">FAQ</NavLink>
                    <Button variant="secondary" className="self-start" link="/pricing">Get Started</Button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

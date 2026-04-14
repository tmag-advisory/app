import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/sections/Navbar";
import FooterSection from "../components/sections/FooterSection";
import CartPanel from "../components/sections/CartPanel";
import PageTransitionLayout from "../components/transitions/PageTransitionLayout";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";

const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

const HomeLayout = () => {
    return (
        <PageTransitionLayout>
            <AnimatePresence mode="wait">
                <div className="min-h-screen bg-background-primary">
                    <ScrollToTop />
                    <Toaster position="top-right" containerStyle={{ fontSize: "14px" }} />
                    <Navbar />
                    <Outlet />
                    <FooterSection />
                    <CartPanel />
                </div>
            </AnimatePresence>
        </PageTransitionLayout>
    );
};

export default HomeLayout;

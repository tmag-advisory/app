import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/sections/Navbar";
import FooterSection from "../components/sections/FooterSection";

const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

const HomeLayout = () => {
    return (
        <div className="min-h-screen bg-background-primary">
            <ScrollToTop />
            <Navbar />
            <Outlet />
            <FooterSection />
        </div>
    );
};

export default HomeLayout;

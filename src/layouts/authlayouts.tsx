import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router-dom";
import Navbar from "../components/sections/Navbar";

const AuthLayout = () => {
    return (
        <>
            <Toaster />
            <Navbar />
            <div className="min-h-screen bg-background-primary flex flex-col w-full">
                {/* Trust bar */}
                <div className="border-y border-border-light py-2.5 px-8 text-center pt-20">
                    <p className="text-xs text-muted">
                        <span className="font-medium text-heading">HIPAA-compliant</span>
                        {" · "}
                        No credit card required
                        {" · "}
                        First plan free
                    </p>
                </div>

                {/* Centered content */}
                <div className="flex-1 flex items-center justify-center px-6 pb-16 pt-10">
                    <div className="w-full max-w-md">
                        <Outlet />
                    </div>
                </div>
            </div>
        </>
    );
};

export default AuthLayout;

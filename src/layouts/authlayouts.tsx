import { Toaster } from "react-hot-toast";
import { Link, Outlet } from "react-router-dom";

const AuthLayout = () => {
    return (
        <>
            <Toaster />
            <div className="min-h-screen bg-background-primary flex flex-col">
                {/* Simple top bar */}
                <div className="px-8 py-5 flex items-center justify-between">
                    <Link to="/" className="text-heading tracking-tight text-xl font-serif font-medium">
                        TMAG
                    </Link>
                    <Link to="/login" className="text-sm text-muted hover:text-heading transition-colors">
                        Sign in
                    </Link>
                </div>

                {/* Trust bar */}
                <div className="border-y border-border-light py-2.5 px-8 text-center">
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

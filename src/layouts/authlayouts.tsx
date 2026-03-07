import { Toaster } from "react-hot-toast";
import { Link, Outlet } from "react-router-dom";

const AuthLayout = () => {
    return (
        <>
            <Toaster />
            <div className="min-h-screen bg-background-primary flex flex-col">
                {/* Simple top bar */}
                <div className="px-8 py-5">
                    <Link to="/" className="text-heading tracking-tight text-xl font-serif font-medium">
                        TMAG
                    </Link>
                </div>

                {/* Centered content */}
                <div className="flex-1 flex items-center justify-center px-6 pb-16">
                    <div className="w-full max-w-md">
                        <Outlet />
                    </div>
                </div>
            </div>
        </>
    );
};

export default AuthLayout;

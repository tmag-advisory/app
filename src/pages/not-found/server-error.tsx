import { Link } from "react-router-dom";
import { LucideServerCrash, LucideHome, LucideRefreshCw } from "lucide-react";

const ServerError = () => {
    return (
        <div className="min-h-screen bg-background-primary flex flex-col">
            <div className="px-6 sm:px-8 py-5">
                <Link to="/" className="text-heading tracking-tight text-xl font-serif font-medium">
                    TMAG
                </Link>
            </div>

            <div className="flex-1 flex items-center justify-center px-6 pb-20">
                <div className="text-center max-w-md">
                    <div className="relative mx-auto w-24 h-24 mb-8">
                        <div className="absolute inset-0 rounded-full bg-red-500/10 animate-pulse" />
                        <div className="relative w-24 h-24 rounded-full bg-button-secondary flex items-center justify-center">
                            <LucideServerCrash className="w-10 h-10 text-red-500" />
                        </div>
                    </div>

                    <h1 className="text-8xl sm:text-9xl font-serif text-heading/10 font-medium select-none mb-2">
                        500
                    </h1>
                    <h2 className="text-xl sm:text-2xl font-serif text-heading mb-3">
                        Something went wrong
                    </h2>
                    <p className="text-sm text-body leading-relaxed mb-8">
                        Our servers hit unexpected turbulence. We're working on it — please try again in a moment or head back to safety.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center gap-2 py-3 px-6 rounded-xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors duration-200 cursor-pointer"
                        >
                            <LucideRefreshCw className="w-4 h-4" /> Try again
                        </button>
                        <Link
                            to="/"
                            className="flex items-center gap-2 py-3 px-6 rounded-xl bg-button-secondary text-heading font-semibold text-sm hover:bg-border-light transition-colors duration-200"
                        >
                            <LucideHome className="w-4 h-4" /> Back to home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServerError;

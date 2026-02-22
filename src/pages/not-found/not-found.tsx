import { Link } from "react-router-dom";
import { LucideCompass, LucideArrowLeft, LucideHome } from "lucide-react";

const NotFound = () => {
    return (
        <div className="min-h-screen bg-background-primary flex flex-col">
            {/* Top bar */}
            <div className="px-6 sm:px-8 py-5">
                <Link to="/" className="text-heading tracking-tight text-xl font-serif font-medium">
                    TMAG
                </Link>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center px-6 pb-20">
                <div className="text-center max-w-md">
                    {/* Animated compass */}
                    <div className="relative mx-auto w-24 h-24 mb-8">
                        <div className="absolute inset-0 rounded-full bg-accent/10 animate-ping opacity-20" />
                        <div className="relative w-24 h-24 rounded-full bg-button-secondary flex items-center justify-center">
                            <LucideCompass className="w-10 h-10 text-accent" />
                        </div>
                    </div>

                    {/* 404 */}
                    <h1 className="text-8xl sm:text-9xl font-serif text-heading/10 font-medium select-none mb-2">
                        404
                    </h1>
                    <h2 className="text-xl sm:text-2xl font-serif text-heading mb-3">
                        Destination not found
                    </h2>
                    <p className="text-sm text-body leading-relaxed mb-8">
                        Looks like this route isn't on our map. Let's get you back on track — your next health-safe trip is just a click away.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            to="/"
                            className="flex items-center gap-2 py-3 px-6 rounded-xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors duration-200"
                        >
                            <LucideHome className="w-4 h-4" /> Back to home
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center gap-2 py-3 px-6 rounded-xl bg-button-secondary text-heading font-semibold text-sm hover:bg-border-light transition-colors duration-200 cursor-pointer"
                        >
                            <LucideArrowLeft className="w-4 h-4" /> Go back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;

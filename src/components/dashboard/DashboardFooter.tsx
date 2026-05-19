import { Link } from "react-router-dom";

const DashboardFooter = () => {
    return (
        <footer className="relative lg:ml-64 border-t border-border-light/40 mt-auto">
            <div className="px-4 sm:px-6 lg:px-12 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl">
                <p className="text-xs text-muted">
                    © {new Date().getFullYear()} TMAG · Travel Medicine Advisory Global. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                    <Link
                        to="/privacy"
                        className="text-xs text-muted hover:text-heading transition-colors"
                    >
                        Privacy Policy
                    </Link>
                    <Link
                        to="/terms"
                        className="text-xs text-muted hover:text-heading transition-colors"
                    >
                        Terms of Service
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default DashboardFooter;

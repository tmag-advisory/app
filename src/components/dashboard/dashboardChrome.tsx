/**
 * Shared visual tokens for dashboard + HR (aligned with create-plan flow).
 */
export const DASHBOARD_GLASS_SURFACE =
    "rounded-3xl border border-border-light/60 bg-white";

export function DashboardAmbientBackground() {
    return (
        <div
            className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
            aria-hidden
        >
            <div className="absolute -top-10 right-0 h-52 w-52 rounded-full bg-accent/10 blur-3xl sm:h-64 sm:w-64" />
            <div className="absolute left-0 top-40 h-56 w-56 rounded-full bg-gold/10 blur-3xl sm:top-52 sm:h-72 sm:w-72" />
            <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-accent/[0.07] blur-3xl" />
            
        </div>
    );
}

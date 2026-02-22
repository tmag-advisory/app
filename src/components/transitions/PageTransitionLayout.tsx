import { useRef, useEffect, createContext, useContext } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";

/* ------------------------------------------------------------------ */
/*  Context so any component can toggle the transition on/off          */
/* ------------------------------------------------------------------ */
const TransitionContext = createContext<React.RefObject<boolean> | null>(null);

/** Returns the ref controlling the page transition. Set `.current` to `false` to disable. */
export const usePageTransition = () => {
    const ref = useContext(TransitionContext);
    if (!ref)
        throw new Error(
            "usePageTransition must be used inside PageTransitionLayout",
        );
    return ref;
};

/* ------------------------------------------------------------------ */
/*  Root layout with GSAP page-transition overlay                      */
/* ------------------------------------------------------------------ */
const PageTransitionLayout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const overlayRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);
    const enabledRef = useRef(false); // Start with transitions disabled until after the first load
    const isFirst = useRef(true);
    const animating = useRef(false);

    useEffect(() => {
        // Skip the very first render (initial page load)
        if (isFirst.current) {
            isFirst.current = false;
            return;
        }
        if (!enabledRef.current || animating.current) return;

        const overlay = overlayRef.current;
        const text = textRef.current;
        if (!overlay || !text) return;

        animating.current = true;

        const tl = gsap.timeline({
            onComplete: () => {
                animating.current = false;
            },
        });

        tl.set(overlay, { yPercent: 100, display: "flex" })
            .set(text, { opacity: 0, scale: 0.92 })
            // Overlay slides up to cover the viewport
            .to(overlay, { yPercent: 0, duration: 0.45, ease: "power4.inOut" })
            // "TMAG" text fades in
            .to(
                text,
                { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" },
                "-=0.1",
            )
            // Brief hold, then text fades out
            .to(
                text,
                { opacity: 0, scale: 1.04, duration: 0.25, ease: "power2.in" },
                "+=0.15",
            )
            // Overlay slides away upward
            .to(
                overlay,
                { yPercent: -100, duration: 0.45, ease: "power4.inOut" },
                "-=0.1",
            )
            .set(overlay, { display: "none" });
    }, [location.pathname]);

    return (
        <TransitionContext.Provider value={enabledRef}>
            {/* Transition overlay */}
            <div
                ref={overlayRef}
                className="fixed inset-0 z-9999 flex items-center justify-center pointer-events-none"
                style={{ display: "none", backgroundColor: "#2a1e14" }}
            >
                <span
                    ref={textRef}
                    className="text-5xl md:text-7xl font-serif select-none"
                    style={{ color: "#f6f0e9" }}
                >
                    TMAG
                </span>
            </div>

            {/* Actual page content */}
            {children}
        </TransitionContext.Provider>
    );
};

export default PageTransitionLayout;

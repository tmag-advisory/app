import { AnimatePresence, motion } from "framer-motion";
import { LucideBell } from "lucide-react";
import {
    DoctorReviewScreen,
    EmailScreen,
    ProcessingScreen,
    QuestionnaireScreen,
    RegisterScreen,
} from "./screens";
import { EASE_SMOOTH } from "./steps";

/** In-phone screens, index-aligned with `JOURNEY_STEPS` in `steps.ts`. */
const SCREENS = [
    RegisterScreen,
    QuestionnaireScreen,
    ProcessingScreen,
    DoctorReviewScreen,
    EmailScreen,
];

interface PhoneFrameProps {
    /** Index of the screen to display (clamped to the available screens). */
    screen: number;
    /**
     * When true, collapse the in-phone micro-animations to a single fade with
     * final states (mobile + reduced motion). When false, screens play their
     * full sequence on each swap (desktop sticky-scroll).
     */
    lite: boolean;
}

/**
 * Reusable device chrome shared by the journey walkthrough. The frame, notch,
 * status bar, and app header stay fixed while only the inner screen content
 * cross-fades. Add a future screen by exporting it from `screens.tsx`,
 * registering it in `SCREENS` below, and adding a matching step in `steps.ts`.
 *
 * Decorative: marked `aria-hidden` because the copy column carries the meaning.
 */
export default function PhoneFrame({ screen, lite }: PhoneFrameProps) {
    const index = Math.min(Math.max(screen, 0), SCREENS.length - 1);
    const Screen = SCREENS[index];

    return (
        <div
            aria-hidden
            className="relative mx-auto h-[30rem] w-[15rem] rounded-[2.5rem] border-[10px] border-dark bg-dark shadow-2xl lg:h-[35rem] lg:w-[18rem]"
        >
            {/* Notch */}
            <div className="absolute left-1/2 top-0 z-20 h-6 w-24 -translate-x-1/2 rounded-b-2xl bg-dark" />

            {/* Screen */}
            <div className="absolute inset-0 flex flex-col overflow-hidden rounded-[2rem] bg-background-primary">
                {/* Dot grid */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.12]"
                    style={{
                        backgroundImage: "radial-gradient(circle,#7a6a5a 1px,transparent 1px)",
                        backgroundSize: "18px 18px",
                    }}
                />

                {/* Status bar */}
                <div className="relative flex items-center justify-between px-6 pb-1 pt-3 text-[10px] font-bold tabular-nums text-heading">
                    <span>9:41</span>
                    <span className="block h-1.5 w-3 rounded-sm border border-heading">
                        <span className="block h-full w-full rounded-[1px] bg-heading" />
                    </span>
                </div>

                {/* App header */}
                <div className="relative flex items-center justify-between px-5 pb-2 pt-1">
                    <span className="font-serif text-lg font-bold text-heading">TMAG</span>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-button-secondary">
                        <LucideBell width={13} height={13} strokeWidth={2} className="text-heading" />
                    </div>
                </div>

                {/* Screen content (cross-fades between steps) */}
                <div className="relative min-h-0 flex-1">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={index}
                            className="absolute inset-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.32, ease: EASE_SMOOTH }}
                        >
                            <Screen active lite={lite} />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

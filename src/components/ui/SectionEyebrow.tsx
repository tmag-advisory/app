import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface SectionEyebrowProps {
    children: ReactNode;
    className?: string;
}

/**
 * Small uppercase label flanked by hairlines, used as a section eyebrow above the main heading.
 * Visually mirrors the "The TMAG promise" treatment in MissionSection.
 */
const SectionEyebrow = ({ children, className }: SectionEyebrowProps) => (
    <div className={cn("inline-flex items-center gap-3", className)}>
        <span aria-hidden className="h-px w-12 bg-border" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            {children}
        </span>
        <span aria-hidden className="h-px w-12 bg-border" />
    </div>
);

export default SectionEyebrow;

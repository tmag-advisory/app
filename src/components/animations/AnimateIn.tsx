import { motion, type TargetAndTransition } from "framer-motion";
import { useMemo, type ReactNode, type CSSProperties } from "react";

type AnimationType = "fadeUp" | "fadeDown" | "fadeLeft" | "fadeRight" | "fade" | "scaleUp";

const hidden: Record<AnimationType, TargetAndTransition> = {
    fadeUp: { opacity: 0, y: 40 },
    fadeDown: { opacity: 0, y: -40 },
    fadeLeft: { opacity: 0, x: -40 },
    fadeRight: { opacity: 0, x: 40 },
    fade: { opacity: 0 },
    scaleUp: { opacity: 0, scale: 0.92 },
};

const visible: TargetAndTransition = { opacity: 1, x: 0, y: 0, scale: 1 };

interface AnimateInProps {
    children: ReactNode;
    type?: AnimationType;
    delay?: number;
    duration?: number;
    className?: string;
    style?: CSSProperties;
    as?: "div" | "section" | "span" | "li" | "ul";
}

const AnimateIn = ({
    children,
    type = "fadeUp",
    delay = 0,
    duration = 0.6,
    className,
    style,
    as = "div",
}: AnimateInProps) => {
    const Component = useMemo(() => motion.create(as), [as]);

    return (
        <Component
            initial={hidden[type]}
            whileInView={visible}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
            className={className}
            style={style}
        >
            {children}
        </Component>
    );
};

export default AnimateIn;

import { motion } from "framer-motion";
import type { ReactNode, CSSProperties } from "react";

interface StaggerGroupProps {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    stagger?: number;
    as?: "div" | "ul" | "section";
}

const container = (stagger: number) => ({
    hidden: {},
    visible: {
        transition: { staggerChildren: stagger },
    },
});

export const staggerItem = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
    },
};

const StaggerGroup = ({
    children,
    className,
    style,
    stagger = 0.1,
    as = "div",
}: StaggerGroupProps) => {
    const Component = motion.create(as);

    return (
        <Component
            variants={container(stagger)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className={className}
            style={style}
        >
            {children}
        </Component>
    );
};

export default StaggerGroup;

import { useEffect, useRef, useState } from "react";

// Travel + health: Swiss Alps mountain landscape (Unsplash)
const BG_IMAGE = "/hero-image.jpg";

const DotOverlay = () => {
    const rows = 7;
    const cols = 20;
    return (
        <div className="absolute inset-0 flex flex-col justify-evenly py-6 px-6 pointer-events-none">
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <div key={rowIdx} className="flex justify-evenly">
                    {Array.from({ length: cols }).map((_, colIdx) => (
                        <div
                            key={colIdx}
                            className="w-1.5 md:w-3.5 h-1.5 md:h-3.5 rounded-full bg-white opacity-30"
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

const HeroImage = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const animRef = useRef<number>(0);
    const mouseRef = useRef({ x: 0.5, y: 0.5 });
    const smoothRef = useRef({ x: 0.5, y: 0.5 });
    const [smooth, setSmooth] = useState({ x: 0.5, y: 0.5 });

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            mouseRef.current = {
                x: (e.clientX - rect.left) / rect.width,
                y: (e.clientY - rect.top) / rect.height,
            };
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: 0.5, y: 0.5 };
        };

        el.addEventListener("mousemove", handleMouseMove);
        el.addEventListener("mouseleave", handleMouseLeave);

        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

        const tick = () => {
            smoothRef.current.x = lerp(
                smoothRef.current.x,
                mouseRef.current.x,
                0.05,
            );
            smoothRef.current.y = lerp(
                smoothRef.current.y,
                mouseRef.current.y,
                0.05,
            );
            setSmooth({ x: smoothRef.current.x, y: smoothRef.current.y });
            animRef.current = requestAnimationFrame(tick);
        };

        animRef.current = requestAnimationFrame(tick);

        return () => {
            el.removeEventListener("mousemove", handleMouseMove);
            el.removeEventListener("mouseleave", handleMouseLeave);
            cancelAnimationFrame(animRef.current);
        };
    }, []);

    const px = smooth.x;
    const py = smooth.y;

    // Background image drifts subtly opposite to mouse (depth illusion)
    const imgX = (px - 0.5) * -20;
    const imgY = (py - 0.5) * -12;

    // Each orb moves at a different parallax depth — warm app palette
    const orb1 = { x: (px - 0.5) * -55, y: (py - 0.5) * -55 }; // amber/gold
    const orb2 = { x: (px - 0.5) * 70, y: (py - 0.5) * 45 }; // terracotta
    const orb3 = { x: (px - 0.5) * 35, y: (py - 0.5) * -70 }; // sage/olive
    const orb4 = { x: (px - 0.5) * -25, y: (py - 0.5) * 60 }; // warm cream

    return (
        <section className="px-6 lg:px-16 max-w-7xl mx-auto">
            <div
                ref={containerRef}
                className="relative rounded-3xl overflow-hidden h-87.5 md:h-100 lg:h-112.5"
            >
                {/* Background photo with parallax */}
                <div
                    className="absolute bg-center bg-cover"
                    style={{
                        inset: "-3%",
                        backgroundImage: `url(${BG_IMAGE})`,
                        transform: `translate(${imgX}px, ${imgY}px) scale(1.06)`,
                        willChange: "transform",
                        backgroundPosition: "top center",
                    }}
                />

                {/* Warm dark vignette grounding the image in app palette (#2a1e14, #3d2c1e) */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(135deg, rgba(42,30,20,0.70) 0%, rgba(61,44,30,0.42) 10%, rgba(26,15,8,0.62) 100%)",
                    }}
                />

                {/* Orb 1 — amber/gold (#e8c87a from original palette) */}
                <div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        width: 420,
                        height: 420,
                        filter: "blur(110px)",
                        opacity: 0.5,
                        background:
                            "radial-gradient(circle, #e8c87a 0%, #c8760a 55%, transparent 100%)",
                        top: `calc(-10% + ${orb1.y}px)`,
                        left: `calc(-5%  + ${orb1.x}px)`,
                        animation: "pulse-orb 7s ease-in-out infinite",
                    }}
                />

                {/* Orb 2 — terracotta (warm red-brown, echoes #3d2c1e) */}
                <div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        width: 380,
                        height: 380,
                        filter: "blur(100px)",
                        opacity: 0.38,
                        background:
                            "radial-gradient(circle, #d4724a 0%, #9a3820 60%, transparent 100%)",
                        bottom: `calc(-5%  + ${-orb2.y}px)`,
                        right: `calc(-5%  + ${-orb2.x}px)`,
                        animation: "pulse-orb 9s ease-in-out infinite reverse",
                    }}
                />

                {/* Orb 3 — sage/olive green (nature + health) */}
                <div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        width: 300,
                        height: 300,
                        filter: "blur(90px)",
                        opacity: 0.32,
                        background:
                            "radial-gradient(circle, #8aab6a 0%, #4a6a38 60%, transparent 100%)",
                        bottom: `calc(5%  + ${-orb3.y}px)`,
                        left: `calc(30% + ${orb3.x}px)`,
                        animation: "pulse-orb 8s ease-in-out infinite 2s",
                    }}
                />

                {/* Orb 4 — warm cream (#f6f0e9 app background) */}
                <div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        width: 240,
                        height: 240,
                        filter: "blur(80px)",
                        opacity: 0.22,
                        background:
                            "radial-gradient(circle, #f6f0e9 0%, #efe7dd 60%, transparent 100%)",
                        top: `calc(8%  + ${orb4.y}px)`,
                        right: `calc(28% + ${-orb4.x}px)`,
                        animation: "pulse-orb 10s ease-in-out infinite 1s",
                    }}
                />

                {/* Warm amber spotlight that follows cursor */}
                <div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        width: 260,
                        height: 260,
                        background:
                            "radial-gradient(circle, rgba(255,255,255,0.23) 20%, transparent 70%)",
                        left: `calc(${px * 100}% - 130px)`,
                        top: `calc(${py * 100}% - 130px)`,
                    }}
                />

                {/* Dot grid that drifts gently against mouse */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, rgba(246,240,233,0.2) 1px, transparent 1px)",
                        backgroundSize: "38px 38px",
                        transform: `translate(${(px - 0.5) * -8}px, ${(py - 0.5) * -8}px)`,
                    }}
                />

                <DotOverlay />
            </div>

            <style>{`
                @keyframes pulse-orb {
                    0%, 100% { transform: scale(1);    opacity: 0.45; }
                    50%       { transform: scale(1.18); opacity: 0.65; }
                }
            `}</style>
        </section>
    );
};

export default HeroImage;

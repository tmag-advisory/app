import { LucideArrowRight } from "lucide-react";
import Button from "../ui/Button";
import AnimateIn from "../animations/AnimateIn";

const FinalCTASection = () => {
    return (
        <section className="px-8 lg:px-16 pt-16 pb-24 max-w-7xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden px-8 py-20 md:py-24 text-center">
                {/* Gradient background */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(135deg, #2a7a6a 0%, #1a6a7a 30%, #187080 55%, #1a6878 80%, #246858 100%)",
                    }}
                />

                {/* Warm glow */}
                <div
                    className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-80 h-80 rounded-full"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(240,160,96,0.6) 0%, rgba(232,120,80,0.2) 40%, transparent 70%)",
                        filter: "blur(50px)",
                    }}
                />

                <AnimateIn type="scaleUp" className="relative z-10 max-w-xl mx-auto">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl text-white leading-[1.1] font-serif mb-4">
                        Travel healthy.{" "}
                        <span className="italic">Travel&nbsp;smart.</span>
                    </h2>
                    <p className="text-sm text-white/70 leading-relaxed max-w-md mx-auto mb-8">
                        Get your personalized travel health plan in under two
                        minutes—free to start, no credit card required.
                    </p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <Button
                            variant="primary"
                            className="bg-white !text-dark hover:bg-white/90"
                        >
                            Get your free plan
                        </Button>
                        <Button
                            variant="secondary"
                            icon={<LucideArrowRight />}
                            className="!bg-white/15 !text-white hover:!bg-white/25 border-none"
                        >
                            Talk to sales
                        </Button>
                    </div>
                </AnimateIn>
            </div>
        </section>
    );
};

export default FinalCTASection;

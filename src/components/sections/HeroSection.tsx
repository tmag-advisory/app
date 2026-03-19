import { LucideArrowRight } from "lucide-react";
import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import Button from "../ui/Button";
import StarRating from "../ui/StarRating";

const HeroSection = () => {
    const sectionRef = useRef<HTMLElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from("[data-hero-anim]", {
                y: 32,
                opacity: 0,
                duration: 0.7,
                ease: "power2.out",
                stagger: 0.12,
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="flex flex-col items-center text-center pt-16 pb-12 px-6">
            <div data-hero-anim>
                <StarRating count={5} />
            </div>

            <p data-hero-anim className="text-sm text-muted mt-3 font-medium">
                Physician-designed. Evidence-based.
            </p>

            <h1 data-hero-anim className="text-5xl md:text-6xl lg:text-7xl leading-[0.9] text-heading mt-6  max-w-3xl font-serif">
                From Travel Health Confusion to Clarity.
            </h1>

            <p data-hero-anim className="sm:text-lg text-body mt-6 max-w-xl leading-relaxed">
                We identify travel health risks and provide expert medical
                advice, then build personalized plans that keep you safe abroad.
            </p>

            <div data-hero-anim className="flex items-center gap-4 mt-8">
                <Button variant="primary" link="/register">Get a free Plan</Button>
                <Button variant="secondary" link="/how-it-works" icon={<LucideArrowRight />}>
                    How it work's
                </Button>
            </div>
        </section>
    );
};

export default HeroSection;

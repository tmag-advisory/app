import { LucideArrowRight } from "lucide-react";
import Button from "../ui/Button";
import StarRating from "../ui/StarRating";

const HeroSection = () => {
    return (
        <section className="flex flex-col items-center text-center pt-16 pb-12 px-6">
            <StarRating count={5} />

            <p className="text-sm text-muted mt-3 font-medium">
                Trusted by 100+ travelers worldwide
            </p>

            <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[0.9] text-heading mt-6  max-w-3xl font-serif">
                From Travel Health Confusion to Clarity.
            </h1>

            <p className="sm:text-lg text-body mt-6 max-w-xl leading-relaxed">
                We identify travel health risks and provide expert medical
                advice, then build personalized plans that keep you safe abroad.
            </p>

            <div className="flex items-center gap-4 mt-8">
                <Button variant="primary">Get a free Guide</Button>
                <Button variant="secondary" link="/how-it-works" icon={<LucideArrowRight />}>
                    How it work's
                </Button>
            </div>
        </section>
    );
};

export default HeroSection;

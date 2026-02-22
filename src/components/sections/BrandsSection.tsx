const brands = [
    "MedTravel",
    "GlobalHealth",
    "SafeJourney",
    "TravelCare",
    "WellVoyage",
    "CureVoyage",
    "HealthRoute",
];

import AnimateIn from "../animations/AnimateIn";

const BrandLogo = ({ name }: { name: string }) => (
    <span className="text-2xl md:text-3xl font-bold text-brand-muted tracking-tight whitespace-nowrap select-none">
        {name}
    </span>
);

const Divider = () => (
    <span className="text-border text-2xl font-light select-none">·</span>
);

const MarqueeRow = () => (
    <div className="flex items-center gap-10">
        {brands.map((brand, i) => (
            <span key={i} className="flex items-center gap-10">
                <BrandLogo name={brand} />
                <Divider />
            </span>
        ))}
    </div>
);

const BrandsSection = () => {
    return (
        <AnimateIn as="section" type="fade" className="py-10 max-w-7xl mx-auto overflow-hidden">
            <p className="text-sm text-muted text-center mb-6 px-8">
                Organizations we've helped stay healthy
            </p>

            {/* Marquee track */}
            <div className="relative">
                {/* Fade masks */}
                <div className="absolute left-0 top-0 h-full w-24 z-10 pointer-events-none"
                    style={{ background: "linear-gradient(to right, #f6f0e9, transparent)" }} />
                <div className="absolute right-0 top-0 h-full w-24 z-10 pointer-events-none"
                    style={{ background: "linear-gradient(to left, #f6f0e9, transparent)" }} />

                {/* Scrolling strip — duplicated for seamless loop */}
                <div
                    className="flex gap-10"
                    style={{ animation: "marquee 28s linear infinite" }}
                >
                    <MarqueeRow />
                    <MarqueeRow />
                </div>
            </div>

            <style>{`
                @keyframes marquee {
                    from { transform: translateX(0); }
                    to   { transform: translateX(-50%); }
                }
            `}</style>
        </AnimateIn>
    );
};

export default BrandsSection;

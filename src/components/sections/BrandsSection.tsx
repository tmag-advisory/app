import AnimateIn from "../animations/AnimateIn";

const stats = [
    { value: "1,500+", label: "Travelers protected" },
    { value: "120+", label: "Countries covered" },
    { value: "< 2 min", label: "Average plan generation" },
];

const BrandsSection = () => {
    return (
        <AnimateIn as="section" type="fade" className="py-12 px-8 lg:px-16 max-w-4xl mx-auto">
            <p className="text-xs text-muted text-center uppercase tracking-widest font-semibold mb-8">
                Trusted by travelers worldwide
            </p>
            <div className="grid grid-cols-3 gap-6 text-center">
                {stats.map((s) => (
                    <div key={s.label} className="flex flex-col items-center gap-1">
                        <span className="text-3xl md:text-4xl font-serif font-bold text-heading">{s.value}</span>
                        <span className="text-xs text-muted">{s.label}</span>
                    </div>
                ))}
            </div>
        </AnimateIn>
    );
};

export default BrandsSection;

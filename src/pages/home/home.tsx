import { useMemo } from "react";
import AudienceSection from "../../components/sections/AudienceSection";
import BrandsSection from "../../components/sections/BrandsSection";
import FAQSection from "../../components/sections/FAQSection";
import FinalCTASection from "../../components/sections/FinalCTASection";
import HeroSection from "../../components/sections/HeroSection";
import HowItWorksSection from "../../components/sections/HowItWorksSection";
import PricingSection from "../../components/sections/PricingSection";
import SamplePlanSection from "../../components/sections/SamplePlanSection";
import TrustSection from "../../components/sections/TrustSection";
import WhatAICoversSection from "../../components/sections/WhatAICoversSection";
import WhoWeAreSection from "../../components/sections/WhoWeAreSection";

const Home = () => {
    const heroLayout = useMemo(() => Math.floor(Math.random() * 7), []);

    return (
        <main>
            <HeroSection layout={heroLayout} />
            <BrandsSection />
            <HowItWorksSection />
            <SamplePlanSection />
            <WhatAICoversSection />
            <AudienceSection />
            <WhoWeAreSection />
            <TrustSection />
            <PricingSection />
            <FAQSection />
            <FinalCTASection />
        </main>
    );
};

export default Home;

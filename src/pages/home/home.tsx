import AudienceSection from "../../components/sections/AudienceSection";
import BrandsSection from "../../components/sections/BrandsSection";
import FAQSection from "../../components/sections/FAQSection";
import FinalCTASection from "../../components/sections/FinalCTASection";
import HeroImage from "../../components/sections/HeroImage";
import HeroSection from "../../components/sections/HeroSection";
import HowItWorksSection from "../../components/sections/HowItWorksSection";
import PricingSection from "../../components/sections/PricingSection";
import SamplePlanSection from "../../components/sections/SamplePlanSection";
import TrustSection from "../../components/sections/TrustSection";
import WhatAICoversSection from "../../components/sections/WhatAICoversSection";
import WhoWeAreSection from "../../components/sections/WhoWeAreSection";

const Home = () => {
    return (
        <main>
            <HeroSection />
            <HeroImage />
            <BrandsSection />
            <WhoWeAreSection />
            <HowItWorksSection />
            <WhatAICoversSection />
            <AudienceSection />
            <TrustSection />
            <SamplePlanSection />
            <PricingSection />
            <FAQSection />
            <FinalCTASection />
        </main>
    );
};

export default Home;

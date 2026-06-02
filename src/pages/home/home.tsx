import AudienceSection from "../../components/sections/AudienceSection";
import FAQSection from "../../components/sections/FAQSection";
import FeaturesSection from "../../components/sections/FeaturesSection";
import FinalCTASection from "../../components/sections/FinalCTASection";
import HeroSection from "../../components/sections/HeroSection";
import MissionSection from "../../components/sections/MissionSection";
import TrustSection from "../../components/sections/TrustSection";
import SEOHead from "../../lib/seo";

const Home = () => {
    return (
        <main className="overflow-x-clip">
            <SEOHead
                title="Travel Medicine Advisory Global  Personalized Travel Health Intelligence"
                description="AI-driven risk assessment and physician-validated travel health for individuals and globally mobile teams."
                path="/"
            />
            <HeroSection />
            <MissionSection />
            <FeaturesSection />
            <AudienceSection />
            <TrustSection />
            <FAQSection />
            <FinalCTASection />
        </main>
    );
};

export default Home;

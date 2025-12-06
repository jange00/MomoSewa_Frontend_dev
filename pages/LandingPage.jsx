import Hero from "../features/landing/components/Hero";
import Features from "../features/landing/components/Features";
import HowItWorks from "../features/landing/components/HowItWorks";
import MenuPreview from "../features/landing/components/MenuPreview";
import Testimonials from "../features/landing/components/Testimonials";
import CTA from "../features/landing/components/CTA";
import Footer from "../features/landing/components/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <MenuPreview />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
};

export default LandingPage;


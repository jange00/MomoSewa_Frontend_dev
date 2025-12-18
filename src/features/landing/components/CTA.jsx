import Button from "../../../ui/buttons/Button";
import Section from "../../../ui/sections/Section";

const CTA = () => {
  return (
    <Section className="bg-gradient-to-br from-deep-maroon via-[#7a2533] to-deep-maroon text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>
      
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <h2 className="text-4xl lg:text-5xl xl:text-6xl font-black mb-6 leading-tight">
          Ready to Enjoy Fresh Momo?
        </h2>
        <p className="text-xl lg:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
          Join thousands of customers and vendors on MomoSewa. Order now or become a vendor today!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button variant="outline" size="lg" to="/menu">
            Order Now
          </Button>
          <Button variant="outline" size="lg" to="/signup/vendor">
            Become a Vendor
          </Button>
        </div>
      </div>
    </Section>
  );
};

export default CTA;

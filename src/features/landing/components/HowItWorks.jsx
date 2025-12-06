import { FiSearch, FiShoppingCart, FiTruck, FiCheckCircle } from "react-icons/fi";
import Section from "../../../ui/sections/Section";

const HowItWorks = () => {
  const steps = [
    {
      icon: FiSearch,
      title: "Browse & Customize",
      description: "Explore vendors, customize your momo with preferred fillings and achar.",
      number: "01",
    },
    {
      icon: FiShoppingCart,
      title: "Place Order",
      description: "Add to cart, review your customized order, and checkout securely.",
      number: "02",
    },
    {
      icon: FiTruck,
      title: "Track Delivery",
      description: "Monitor your order in real-time from preparation to delivery.",
      number: "03",
    },
    {
      icon: FiCheckCircle,
      title: "Enjoy Fresh Momo",
      description: "Receive your fresh, customized momo at your doorstep.",
      number: "04",
    },
  ];

  return (
    <Section className="bg-gradient-to-b from-white via-charcoal-grey/2 to-white">
      <div className="text-center mb-16">
        <h2 className="text-4xl lg:text-5xl font-black text-charcoal-grey mb-4">
          How It <span className="text-deep-maroon">Works</span>
        </h2>
        <p className="text-lg text-charcoal-grey/70 max-w-2xl mx-auto">
          Ordering your favorite momo is just a few clicks away.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className="relative text-center opacity-0 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.15}s`, animationFillMode: "forwards" }}
          >
            {/* Step Number */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-deep-maroon to-[#7a2533] text-white font-black text-lg flex items-center justify-center shadow-lg z-10">
              {step.number}
            </div>
            
            {/* Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 pt-12 border border-charcoal-grey/10 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 rounded-xl bg-golden-amber/10 flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-8 h-8 text-golden-amber" />
              </div>
              <h3 className="font-bold text-charcoal-grey text-xl mb-2">{step.title}</h3>
              <p className="text-charcoal-grey/60 text-sm">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default HowItWorks;



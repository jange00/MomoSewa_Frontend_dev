import { FiShoppingCart, FiPackage, FiUsers, FiBarChart2, FiSettings, FiShield } from "react-icons/fi";
import Section from "../../../ui/sections/Section";
import FeatureCard from "../../../ui/cards/FeatureCard";

const Features = () => {
  const customerFeatures = [
    {
      icon: FiShoppingCart,
      title: "Customize Your Order",
      description: "Choose your fillings, achar, and spice level to create your perfect momo.",
    },
    {
      icon: FiPackage,
      title: "Track Orders",
      description: "Real-time order tracking from kitchen to your doorstep.",
    },
    {
      icon: FiUsers,
      title: "Local Vendors",
      description: "Discover and order from premium local momo vendors in your area.",
    },
  ];

  const vendorFeatures = [
    {
      icon: FiBarChart2,
      title: "Manage Menu",
      description: "Easily update your menu, prices, and availability in real-time.",
    },
    {
      icon: FiSettings,
      title: "Order Management",
      description: "Streamlined dashboard to manage and fulfill orders efficiently.",
    },
    {
      icon: FiShield,
      title: "Sales Analytics",
      description: "Track your sales, revenue, and customer insights with detailed analytics.",
    },
  ];

  return (
    <Section className="bg-gradient-to-b from-white to-charcoal-grey/2">
      <div className="text-center mb-16">
        <h2 className="text-4xl lg:text-5xl font-black text-charcoal-grey mb-4">
          Why Choose <span className="text-deep-maroon">MomoSewa</span>?
        </h2>
        <p className="text-lg text-charcoal-grey/70 max-w-2xl mx-auto">
          A complete platform for customers, vendors, and admins to enjoy the best momo experience.
        </p>
      </div>

      {/* Customer Features */}
      <div className="mb-20">
        <h3 className="text-2xl font-bold text-charcoal-grey mb-10 text-center">For Customers</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {customerFeatures.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>

      {/* Vendor Features */}
      <div>
        <h3 className="text-2xl font-bold text-charcoal-grey mb-10 text-center">For Vendors</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendorFeatures.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </Section>
  );
};

export default Features;

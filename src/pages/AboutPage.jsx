import { FiHeart, FiUsers, FiTarget, FiAward, FiTruck, FiClock } from "react-icons/fi";
import Card from "../ui/cards/Card";

const AboutPage = () => {
  const features = [
    {
      icon: FiHeart,
      title: "Authentic Taste",
      description: "We bring you the most authentic Nepali momo experience, made with traditional recipes and fresh ingredients.",
    },
    {
      icon: FiUsers,
      title: "Community First",
      description: "Supporting local vendors and bringing communities together through the love of delicious momos.",
    },
    {
      icon: FiTarget,
      title: "Quality Assured",
      description: "Every vendor on our platform is verified and committed to delivering the highest quality momos.",
    },
    {
      icon: FiAward,
      title: "Award Winning",
      description: "Recognized for excellence in food delivery and customer service in the Nepali cuisine space.",
    },
    {
      icon: FiTruck,
      title: "Fast Delivery",
      description: "Quick and reliable delivery service to bring hot, fresh momos right to your doorstep.",
    },
    {
      icon: FiClock,
      title: "24/7 Available",
      description: "Order your favorite momos anytime, anywhere. We're always here to serve you.",
    },
  ];

  const stats = [
    { number: "10K+", label: "Happy Customers" },
    { number: "500+", label: "Vendors" },
    { number: "50K+", label: "Orders Delivered" },
    { number: "4.8", label: "Average Rating" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-grey/3 via-white to-golden-amber/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-deep-maroon via-[#7a2533] to-deep-maroon py-20">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-black text-white mb-6">
            About <span className="text-golden-amber">MomoSewa</span>
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Your trusted platform for authentic Nepali momos, connecting food lovers with the best local vendors.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Story Section */}
        <Card className="p-8 lg:p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-charcoal-grey mb-4">Our Story</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-deep-maroon to-golden-amber mx-auto rounded-full"></div>
          </div>
          <div className="prose prose-lg max-w-3xl mx-auto text-charcoal-grey/80">
            <p className="text-lg leading-relaxed mb-6">
              MomoSewa was born from a simple passion: to bring authentic Nepali momos to every doorstep. 
              Founded with the vision of supporting local vendors and making traditional Nepali cuisine accessible to everyone, 
              we've grown into a platform that connects food lovers with the finest momo vendors in the community.
            </p>
            <p className="text-lg leading-relaxed mb-6">
              Our journey started with a love for the rich flavors and cultural significance of momos. We recognized 
              that many amazing local vendors struggled to reach their customers, while food enthusiasts were always 
              searching for authentic, high-quality momos. MomoSewa bridges this gap, creating a seamless experience 
              for both vendors and customers.
            </p>
            <p className="text-lg leading-relaxed">
              Today, we're proud to be a part of thousands of happy customers' dining experiences and hundreds of 
              vendors' success stories. Every order placed on MomoSewa supports local businesses and brings the 
              authentic taste of Nepal to your table.
            </p>
          </div>
        </Card>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 text-center">
              <div className="text-4xl lg:text-5xl font-black text-deep-maroon mb-2">
                {stat.number}
              </div>
              <div className="text-charcoal-grey/70 font-semibold">
                {stat.label}
              </div>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-charcoal-grey mb-4">Why Choose MomoSewa?</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-deep-maroon to-golden-amber mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6 hover:shadow-xl transition-all duration-300 group">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-deep-maroon" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal-grey mb-2">{feature.title}</h3>
                  <p className="text-charcoal-grey/70">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <Card className="p-8 bg-gradient-to-br from-deep-maroon/5 via-golden-amber/5 to-deep-maroon/5">
            <h3 className="text-3xl font-black text-charcoal-grey mb-4">Our Mission</h3>
            <p className="text-charcoal-grey/80 leading-relaxed">
              To make authentic Nepali momos accessible to everyone while supporting local vendors and 
              preserving the rich culinary traditions of Nepal. We strive to create a platform where 
              quality, authenticity, and community come together.
            </p>
          </Card>
          <Card className="p-8 bg-gradient-to-br from-golden-amber/5 via-deep-maroon/5 to-golden-amber/5">
            <h3 className="text-3xl font-black text-charcoal-grey mb-4">Our Vision</h3>
            <p className="text-charcoal-grey/80 leading-relaxed">
              To become the leading platform for Nepali cuisine, connecting millions of food lovers 
              with authentic momo vendors worldwide. We envision a future where traditional Nepali 
              flavors are celebrated and accessible to everyone, everywhere.
            </p>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="p-12 bg-gradient-to-r from-deep-maroon via-[#7a2533] to-deep-maroon text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-black mb-4">Join the MomoSewa Family</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Whether you're a food lover looking for authentic momos or a vendor wanting to grow your business, 
            we'd love to have you on board!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup/customer"
              className="px-8 py-4 rounded-xl bg-white text-deep-maroon font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Order Now
            </a>
            <a
              href="/signup/vendor"
              className="px-8 py-4 rounded-xl border-2 border-white text-white font-bold text-lg hover:bg-white hover:text-deep-maroon transition-all duration-300"
            >
              Become a Vendor
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;


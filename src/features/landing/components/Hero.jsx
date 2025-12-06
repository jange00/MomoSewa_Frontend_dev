import { FiClock, FiMapPin, FiAward, FiCheck } from "react-icons/fi";
import Button from "../../../ui/buttons/Button";
import Badge from "../../../ui/badges/Badge";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-charcoal-grey/3 via-white to-golden-amber/5 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-deep-maroon/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-golden-amber/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-deep-maroon/5 rounded-full blur-3xl"></div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Section - Image */}
          <div className="relative animate-scale-in order-2 lg:order-1">
            <div className="relative rounded-3xl overflow-hidden bg-white/80 backdrop-blur-lg shadow-2xl border border-charcoal-grey/10">
              {/* Image Container */}
              <div className="relative aspect-square lg:h-[600px] bg-gradient-to-br from-deep-maroon/5 via-white to-golden-amber/5 flex items-center justify-center overflow-hidden">
                {/* Placeholder for image */}
                <div className="relative z-10 text-center space-y-4">
                  <div className="w-64 h-64 mx-auto rounded-full bg-gradient-to-br from-deep-maroon/20 via-golden-amber/15 to-deep-maroon/20 flex items-center justify-center shadow-2xl border-4 border-white">
                    <span className="text-7xl">🥟</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-charcoal-grey/50 text-sm">Add your momo image</p>
                  </div>
                </div>

                {/* Floating Badges */}
                <div className="absolute top-8 right-8 bg-white/95 backdrop-blur-md rounded-xl px-4 py-2.5 shadow-lg border border-charcoal-grey/10 z-20 animate-fade-in-up" style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-2 h-2 rounded-full bg-golden-amber"></div>
                    <span className="text-xs font-bold text-charcoal-grey">Fresh Daily</span>
                  </div>
                  <p className="text-[10px] text-charcoal-grey/60">Made to order</p>
                </div>

                <div className="absolute bottom-8 right-8 bg-white/95 backdrop-blur-md rounded-xl px-4 py-2.5 shadow-lg border border-charcoal-grey/10 z-20 animate-fade-in-up" style={{ animationDelay: "1s", animationFillMode: "forwards" }}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-2 h-2 rounded-full bg-deep-maroon"></div>
                    <span className="text-xs font-bold text-charcoal-grey">Spice Level</span>
                  </div>
                  <p className="text-[10px] text-charcoal-grey/60">Customizable</p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-golden-amber/10 blur-2xl"></div>
                <div className="absolute bottom-20 left-12 w-40 h-40 rounded-full bg-deep-maroon/10 blur-2xl"></div>
              </div>
            </div>
          </div>

          {/* Right Section - Content */}
          <div className="space-y-8 relative z-10 order-1 lg:order-2 lg:pl-8">
            {/* Badge */}
            <div className="mb-4 animate-fade-in-up">
              <Badge icon={FiCheck} variant="default">
                Authentic Nepali Cuisine
              </Badge>
            </div>

            {/* Main Heading */}
            <div className="space-y-4 animate-slide-in-left">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1]">
                <span className="block text-charcoal-grey mb-2">Authentic</span>
                <span className="block text-deep-maroon">Nepali Momos</span>
              </h1>
              <p className="text-xl lg:text-2xl font-bold text-charcoal-grey/80 mt-4">
                Delivered Fresh to Your Door
              </p>
            </div>

            {/* Description */}
            <div className="animate-fade-in-up" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
              <p className="text-base lg:text-lg text-charcoal-grey/70 leading-relaxed max-w-lg">
                Experience the taste of the Himalayas with our handcrafted momos, traditional thukpa, and authentic Nepali cuisine. Made with love, served with pride.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4 animate-fade-in-up" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
              <Button variant="primary" size="md" to="/menu">
                Order Now →
              </Button>
              
              <Button variant="secondary" size="md" to="/menu">
                View Menu
              </Button>
            </div>

            {/* Feature Highlights - Card Style */}
            <div className="grid grid-cols-3 gap-4 pt-6 animate-fade-in-up" style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-charcoal-grey/10 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-golden-amber/10 flex items-center justify-center mb-3 group-hover:bg-golden-amber/20 transition-colors">
                  <FiClock className="w-6 h-6 text-golden-amber" />
                </div>
                <h3 className="font-bold text-charcoal-grey text-sm mb-1">Fast Delivery</h3>
                <p className="text-xs text-charcoal-grey/60">30 mins</p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-charcoal-grey/10 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-golden-amber/10 flex items-center justify-center mb-3 group-hover:bg-golden-amber/20 transition-colors">
                  <FiMapPin className="w-6 h-6 text-golden-amber" />
                </div>
                <h3 className="font-bold text-charcoal-grey text-sm mb-1">Wide Coverage</h3>
                <p className="text-xs text-charcoal-grey/60">Kathmandu</p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-charcoal-grey/10 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-golden-amber/10 flex items-center justify-center mb-3 group-hover:bg-golden-amber/20 transition-colors">
                  <FiAward className="w-6 h-6 text-golden-amber" />
                </div>
                <h3 className="font-bold text-charcoal-grey text-sm mb-1">Premium</h3>
                <p className="text-xs text-charcoal-grey/60">Fresh</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

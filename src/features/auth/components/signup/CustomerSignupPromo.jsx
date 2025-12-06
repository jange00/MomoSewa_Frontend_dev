const CustomerSignupPromo = () => {
  return (
    <div className="hidden lg:flex relative bg-gradient-to-br from-deep-maroon via-[#7a2533] to-[#6a1f2d] p-8 xl:p-10 flex flex-col justify-center overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-golden-amber/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-golden-amber/5 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-white">
        {/* Brand Name */}
        <div className="mb-8">
          <h2 className="text-4xl xl:text-5xl font-black text-golden-amber mb-2">
            Momo<span className="text-white">Sewa</span>
          </h2>
          <p className="text-white/70 text-base">Authentic Nepali Cuisine</p>
        </div>

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-5xl xl:text-6xl font-black mb-3 leading-tight">
            Join as Customer
          </h1>
          <p className="text-white/80 text-lg mb-4">
            Order delicious momos and get them delivered to your doorstep
          </p>
          <div className="inline-block px-5 py-2.5 bg-golden-amber/20 rounded-full border border-golden-amber/30">
            <p className="text-sm text-golden-amber font-semibold">स्वागत छ - Welcome</p>
          </div>
        </div>

        {/* Feature Box */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-golden-amber/20 mb-8">
          <h3 className="text-xl font-bold text-white mb-2">
            Customer Benefits
          </h3>
          <ul className="text-white/80 text-sm leading-relaxed mb-3 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-golden-amber mt-1">✓</span>
              <span>Browse and order from multiple vendors</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-golden-amber mt-1">✓</span>
              <span>Real-time order tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-golden-amber mt-1">✓</span>
              <span>Fast and reliable delivery</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-golden-amber mt-1">✓</span>
              <span>Exclusive deals and offers</span>
            </li>
          </ul>
          <div className="pt-3 border-t border-white/10">
            <p className="text-golden-amber text-sm font-semibold italic">
              "ताजा मोमो, तुरुन्त वितरण"
            </p>
            <p className="text-white/60 text-xs mt-1">Fresh Momos, Instant Delivery</p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 border-t border-white/10">
          <p className="text-white/60 text-xs mb-2 uppercase tracking-wider">Join Our Community</p>
          <p className="text-white font-bold text-lg mb-2">10K+ Happy Customers</p>
          <p className="text-golden-amber/90 text-sm font-medium">
            "हाम्रो ग्राहक हाम्रो परिवार"
          </p>
          <p className="text-white/50 text-xs mt-1">Our Customers, Our Family</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerSignupPromo;


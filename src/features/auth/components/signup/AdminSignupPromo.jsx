const AdminSignupPromo = () => {
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
            Admin Access
          </h1>
          <p className="text-white/80 text-lg mb-4">
            Restricted access for platform administrators
          </p>
          <div className="inline-block px-5 py-2.5 bg-purple-500/30 rounded-full border border-purple-400/40">
            <p className="text-sm text-purple-200 font-semibold">प्रशासक - Administrator</p>
          </div>
        </div>

        {/* Warning Box */}
        <div className="bg-red-500/20 backdrop-blur-sm rounded-2xl p-6 border border-red-400/30 mb-8">
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Restricted Access
          </h3>
          <p className="text-white/80 text-sm leading-relaxed mb-3">
            Admin access is restricted and requires an authorized admin code. Only authorized personnel should proceed with admin account creation.
          </p>
        </div>

        {/* Feature Box */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-golden-amber/20 mb-8">
          <h3 className="text-xl font-bold text-white mb-2">
            Admin Responsibilities
          </h3>
          <ul className="text-white/80 text-sm leading-relaxed mb-3 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-golden-amber mt-1">✓</span>
              <span>Manage vendors and customers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-golden-amber mt-1">✓</span>
              <span>Oversee platform operations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-golden-amber mt-1">✓</span>
              <span>Monitor system analytics</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-golden-amber mt-1">✓</span>
              <span>Approve vendor registrations</span>
            </li>
          </ul>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 border-t border-white/10">
          <p className="text-white/60 text-xs mb-2 uppercase tracking-wider">Need Help?</p>
          <p className="text-white font-bold text-lg mb-2">Contact System Administrator</p>
          <p className="text-golden-amber/90 text-sm font-medium">
            "सुरक्षित र विश्वसनीय"
          </p>
          <p className="text-white/50 text-xs mt-1">Secure & Trusted</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSignupPromo;


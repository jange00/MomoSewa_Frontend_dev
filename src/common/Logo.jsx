const Logo = ({ size = "default" }) => {
  const sizeClasses = {
    small: "h-12 w-12 text-base",
    default: "h-16 w-16 text-xl",
    large: "h-20 w-20 text-2xl",
  };

  const textSizes = {
    small: "text-lg",
    default: "text-xl",
    large: "text-2xl",
  };

  return (
    <div className={`relative group ${sizeClasses[size] || sizeClasses.default}`}>
      {/* Outer glow ring */}
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-golden-amber/20 via-deep-maroon/10 to-golden-amber/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
      
      {/* Main Logo Container */}
      <div className="relative h-full w-full rounded-2xl bg-gradient-to-br from-deep-maroon via-[#7a2533] to-[#6a1f2d] shadow-xl overflow-hidden group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105 border border-deep-maroon/20">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-golden-amber/15 via-transparent to-golden-amber/10 opacity-60"></div>
        
        {/* Decorative Pattern Background - Enhanced */}
        <div className="absolute inset-0 opacity-25">
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Traditional Nepali-inspired mandala pattern */}
            <circle cx="32" cy="32" r="2" fill="currentColor" className="text-golden-amber" />
            <circle cx="32" cy="32" r="8" stroke="currentColor" strokeWidth="0.5" className="text-golden-amber/40" fill="none" />
            <circle cx="32" cy="32" r="14" stroke="currentColor" strokeWidth="0.5" className="text-golden-amber/30" fill="none" />
            {/* Corner accents */}
            <circle cx="16" cy="16" r="1.5" fill="currentColor" className="text-golden-amber/60" />
            <circle cx="48" cy="16" r="1.5" fill="currentColor" className="text-golden-amber/60" />
            <circle cx="16" cy="48" r="1.5" fill="currentColor" className="text-golden-amber/60" />
            <circle cx="48" cy="48" r="1.5" fill="currentColor" className="text-golden-amber/60" />
            {/* Decorative lines */}
            <path d="M32 20 L32 44 M20 32 L44 32" stroke="currentColor" strokeWidth="0.5" className="text-golden-amber/25" />
            <path d="M26 26 L38 38 M38 26 L26 38" stroke="currentColor" strokeWidth="0.5" className="text-golden-amber/20" />
          </svg>
        </div>
        
        {/* Logo Text - Enhanced */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <div className="relative">
            {/* Text shadow for depth */}
            <span 
              className={`absolute inset-0 font-extrabold text-white/20 blur-sm ${textSizes[size] || textSizes.default}`}
              style={{ fontFamily: 'Georgia, serif' }}
            >
              MS
            </span>
            {/* Main text */}
            <span 
              className={`relative font-extrabold text-white leading-none tracking-tighter drop-shadow-lg ${textSizes[size] || textSizes.default}`}
              style={{ fontFamily: 'Georgia, serif', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
            >
              MS
            </span>
          </div>
          
          {/* Decorative accent line - Enhanced */}
          <div className="mt-1 w-10 h-0.5 bg-gradient-to-r from-transparent via-golden-amber to-transparent shadow-sm"></div>
          <div className="mt-0.5 w-6 h-0.5 bg-gradient-to-r from-transparent via-golden-amber/60 to-transparent"></div>
        </div>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 transform -skew-x-12 -translate-x-full group-hover:translate-x-full"></div>
        
        {/* Golden overlay on hover - Enhanced */}
        <div className="absolute inset-0 bg-gradient-to-br from-golden-amber/25 via-transparent to-golden-amber/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>

      {/* Inner border glow */}
      <div className="absolute inset-0.5 rounded-2xl border border-golden-amber/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  );
};

export default Logo;


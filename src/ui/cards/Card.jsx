const Card = ({ 
  children, 
  className = "",
  hover = true,
  variant = "default", // "default", "elevated", "flat", "outlined"
  padding = "default", // "none", "sm", "default", "md", "lg"
  leftBorder = false, // Color for left border accent (e.g., "yellow-500", "blue-500", etc.)
  ...props 
}) => {
  // Base styles matching the order card design - clean and minimal
  const baseStyles = "bg-white/60 backdrop-blur-sm rounded-2xl border border-charcoal-grey/10 transition-all duration-300";
  
  // Variant styles - subtle and clean
  const variantStyles = {
    default: "shadow-sm",
    elevated: "shadow-md shadow-charcoal-grey/5",
    flat: "shadow-none",
    outlined: "shadow-none border-charcoal-grey/15",
  };
  
  // Left border accent (4px thick, matching admin order card design)
  const leftBorderColors = {
    "yellow-500": "border-l-yellow-500",
    "blue-500": "border-l-blue-500",
    "purple-500": "border-l-purple-500",
    "green-500": "border-l-green-500",
    "red-500": "border-l-red-500",
    "deep-maroon": "border-l-deep-maroon",
    "golden-amber": "border-l-golden-amber",
  };
  
  const leftBorderStyle = leftBorder 
    ? `border-l-4 ${leftBorderColors[leftBorder] || `border-l-${leftBorder}`}` 
    : "";
  
  // Hover styles - subtle lift effect matching order card
  const hoverStyles = hover 
    ? "hover:shadow-lg hover:shadow-charcoal-grey/5 hover:-translate-y-0.5 cursor-pointer" 
    : "";
  
  // Padding variants
  const paddingStyles = {
    none: "",
    sm: "p-4",
    default: "p-6",
    md: "p-8",
    lg: "p-10",
  };
  
  return (
    <div 
      className={`
        ${baseStyles}
        ${variantStyles[variant] || variantStyles.default}
        ${leftBorderStyle}
        ${hoverStyles}
        ${paddingStyles[padding] || ""}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;





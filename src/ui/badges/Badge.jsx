const Badge = ({ 
  children, 
  variant = "default", 
  icon: Icon,
  className = "" 
}) => {
  const variants = {
    default: "bg-golden-amber/10 border border-golden-amber/20 text-charcoal-grey",
    success: "bg-green-500/10 border border-green-500/20 text-green-700",
    info: "bg-blue-500/10 border border-blue-500/20 text-blue-700",
    warning: "bg-golden-amber/10 border border-golden-amber/20 text-golden-amber",
  };
  
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${variants[variant]} ${className}`}>
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
    </div>
  );
};

export default Badge;





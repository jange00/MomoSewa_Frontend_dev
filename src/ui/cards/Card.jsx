const Card = ({ 
  children, 
  className = "",
  hover = true,
  ...props 
}) => {
  const hoverStyles = hover 
    ? "hover:shadow-xl hover:scale-105 transition-all duration-300" 
    : "";
  
  return (
    <div 
      className={`bg-white/60 backdrop-blur-sm rounded-2xl border border-charcoal-grey/10 ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;




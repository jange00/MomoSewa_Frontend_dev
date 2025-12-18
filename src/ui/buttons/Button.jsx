import { Link } from "react-router-dom";

const Button = ({ 
  children, 
  to, 
  onClick, 
  variant = "primary", 
  size = "md",
  className = "",
  disabled = false,
  ...props 
}) => {
  const baseStyles = "font-bold transition-all duration-300 inline-flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-deep-maroon via-[#7a2533] to-deep-maroon text-white hover:shadow-2xl hover:scale-105 active:scale-95 shadow-lg relative overflow-hidden group",
    secondary: "border-2 border-deep-maroon text-deep-maroon hover:bg-deep-maroon hover:text-white bg-white/80 backdrop-blur-sm",
    outline: "border-2 border-white text-white hover:bg-white hover:text-deep-maroon bg-white/15 backdrop-blur-sm",
    ghost: "text-charcoal-grey hover:bg-charcoal-grey/5",
  };
  
  const sizes = {
    sm: "px-6 py-2.5 text-sm rounded-lg",
    md: "px-8 py-4 text-base rounded-xl",
    lg: "px-10 py-5 text-lg rounded-xl",
  };
  
  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`;
  
  const content = (
    <>
      <span className="relative z-10">{children}</span>
      {variant === "primary" && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-golden-amber/20 via-transparent to-golden-amber/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </>
      )}
    </>
  );
  
  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  
  // Extract type from props to avoid passing it twice
  const { type, ...buttonProps } = props;
  
  return (
    <button 
      type={type || "button"} 
      onClick={onClick} 
      className={classes} 
      disabled={disabled} 
      {...buttonProps}
    >
      {content}
    </button>
  );
};

export default Button;





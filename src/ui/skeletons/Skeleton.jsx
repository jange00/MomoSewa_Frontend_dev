/**
 * Skeleton Component
 * Reusable skeleton loader for various content types
 */

const Skeleton = ({ 
  className = "", 
  variant = "default", 
  width, 
  height,
  rounded = "md",
  ...props 
}) => {
  const baseClasses = "animate-pulse bg-charcoal-grey/10";
  
  const roundedClasses = {
    none: "",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
  };

  const variantClasses = {
    default: "",
    text: "h-4",
    heading: "h-6",
    title: "h-8",
    avatar: "h-12 w-12 rounded-full",
    image: "h-48 w-full",
    button: "h-10 w-24 rounded-lg",
    card: "h-64 w-full rounded-xl",
  };

  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${roundedClasses[rounded]} ${className}`}
      style={style}
      {...props}
    />
  );
};

export default Skeleton;





const Section = ({ 
  children, 
  className = "",
  container = true,
  ...props 
}) => {
  return (
    <section className={`py-16 lg:py-24 ${className}`} {...props}>
      {container ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
};

export default Section;





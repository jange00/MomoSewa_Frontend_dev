const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description,
  className = "",
  style = {}
}) => {
  return (
    <div 
      className={`bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-charcoal-grey/10 hover:shadow-xl hover:scale-105 transition-all duration-300 group ${className}`}
      style={style}
    >
      <div className="w-14 h-14 rounded-xl bg-golden-amber/10 flex items-center justify-center mb-4 group-hover:bg-golden-amber/20 transition-colors">
        {Icon && <Icon className="w-7 h-7 text-golden-amber" />}
      </div>
      <h3 className="font-bold text-charcoal-grey text-lg mb-2">{title}</h3>
      <p className="text-sm text-charcoal-grey/60 font-medium">{description}</p>
    </div>
  );
};

export default FeatureCard;




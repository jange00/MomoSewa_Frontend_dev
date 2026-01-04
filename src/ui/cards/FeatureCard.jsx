import Card from "./Card";

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description,
  className = "",
  style = {}
}) => {
  return (
    <Card 
      className={`p-6 group ${className}`}
      style={style}
      hover={true}
      variant="elevated"
    >
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-golden-amber/10 via-golden-amber/5 to-golden-amber/10 flex items-center justify-center mb-4 group-hover:from-golden-amber/20 group-hover:via-golden-amber/10 group-hover:to-golden-amber/20 transition-all duration-300">
        {Icon && <Icon className="w-7 h-7 text-golden-amber" />}
      </div>
      <h3 className="font-bold text-charcoal-grey text-lg mb-2">{title}</h3>
      <p className="text-sm text-charcoal-grey/60 font-medium">{description}</p>
    </Card>
  );
};

export default FeatureCard;




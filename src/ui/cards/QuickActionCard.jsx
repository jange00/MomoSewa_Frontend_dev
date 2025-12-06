import { Link } from "react-router-dom";
import Card from "./Card";

const QuickActionCard = ({ icon: Icon, title, description, to, onClick, className = "" }) => {
  const content = (
    <Card className={`p-6 text-center group cursor-pointer ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center mx-auto mb-4 group-hover:from-deep-maroon/20 group-hover:via-golden-amber/10 group-hover:to-deep-maroon/20 transition-all duration-300">
        {Icon && <Icon className="w-8 h-8 text-deep-maroon" />}
      </div>
      <h3 className="font-bold text-charcoal-grey mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-charcoal-grey/60">{description}</p>
      )}
    </Card>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  if (onClick) {
    return <div onClick={onClick}>{content}</div>;
  }

  return content;
};

export default QuickActionCard;


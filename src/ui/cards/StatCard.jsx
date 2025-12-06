import Card from "./Card";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

const StatCard = ({ title, value, trend, icon: Icon, className = "" }) => {
  const isPositive = trend && trend > 0;
  
  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center">
          {Icon && <Icon className="w-6 h-6 text-deep-maroon" />}
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
              isPositive
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {isPositive ? (
              <FiTrendingUp className="w-4 h-4" />
            ) : (
              <FiTrendingDown className="w-4 h-4" />
            )}
            <span className="text-xs font-bold">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-sm font-semibold text-charcoal-grey/60 mb-1">{title}</h3>
      <p className="text-2xl font-black text-charcoal-grey">{value}</p>
    </Card>
  );
};

export default StatCard;



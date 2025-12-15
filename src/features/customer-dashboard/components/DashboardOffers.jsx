import { Link } from "react-router-dom";
import Card from "../../../ui/cards/Card";
import Button from "../../../ui/buttons/Button";

const DashboardOffers = () => {
  return (
    <div>
      <h2 className="text-2xl font-black text-charcoal-grey mb-6">
        Special Offers
      </h2>
      <Card className="p-6 bg-gradient-to-r from-deep-maroon/10 via-golden-amber/10 to-deep-maroon/10 border-2 border-golden-amber/30">
        <div className="flex items-center gap-4">
          <div className="text-5xl">🎉</div>
          <div className="flex-1">
            <h3 className="font-bold text-charcoal-grey text-lg mb-1">
              Weekend Special Discount!
            </h3>
            <p className="text-charcoal-grey/70 mb-3">
              Get 15% off on all orders above Rs. 500. Use code: WEEKEND15
            </p>
            <Link to="/menu">
              <Button variant="primary" size="sm">
                Order Now
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardOffers;


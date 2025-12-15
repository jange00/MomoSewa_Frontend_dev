import { useState } from "react";
import { FiTag, FiCheck, FiX } from "react-icons/fi";
import Input from "../../../ui/inputs/Input";
import Button from "../../../ui/buttons/Button";

const PromoCodeBox = ({ onApplyPromo, appliedPromo = null, discount = 0 }) => {
  const [promoCode, setPromoCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleApply = async () => {
    if (!promoCode.trim()) return;
    
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (onApplyPromo) {
      onApplyPromo(promoCode.trim());
    }
    
    setIsLoading(false);
  };

  const handleRemove = () => {
    setPromoCode("");
    if (onApplyPromo) {
      onApplyPromo(null);
    }
  };

  if (appliedPromo) {
    return (
      <div className="bg-gradient-to-r from-golden-amber/10 via-golden-amber/5 to-golden-amber/10 rounded-2xl border-2 border-golden-amber/30 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-golden-amber/20 flex items-center justify-center">
              <FiTag className="w-5 h-5 text-golden-amber" />
            </div>
            <div>
              <p className="font-bold text-charcoal-grey text-sm">Promo Code Applied</p>
              <p className="text-xs text-charcoal-grey/60">{appliedPromo}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {discount > 0 && (
              <span className="text-sm font-bold text-golden-amber">
                - Rs. {discount.toFixed(2)}
              </span>
            )}
            <button
              onClick={handleRemove}
              className="p-2 rounded-lg hover:bg-golden-amber/20 text-charcoal-grey/60 hover:text-charcoal-grey transition-all duration-200"
              aria-label="Remove promo code"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-charcoal-grey/10 p-6">
      <div className="flex items-center gap-2 mb-4">
        <FiTag className="w-5 h-5 text-golden-amber" />
        <h3 className="text-lg font-bold text-charcoal-grey">Promo Code</h3>
      </div>
      
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Enter promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            icon={FiTag}
            onKeyPress={(e) => e.key === "Enter" && handleApply()}
          />
        </div>
        <Button
          onClick={handleApply}
          disabled={!promoCode.trim() || isLoading}
          variant="primary"
          size="md"
          className="whitespace-nowrap"
        >
          {isLoading ? "Applying..." : "Apply"}
        </Button>
      </div>
      
      <p className="text-xs text-charcoal-grey/50 mt-3">
        Have a promo code? Enter it above to get discounts on your order.
      </p>
    </div>
  );
};

export default PromoCodeBox;


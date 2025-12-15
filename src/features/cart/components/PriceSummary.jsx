const PriceSummary = ({ subtotal, discount = 0, deliveryFee = 0 }) => {
  const total = subtotal + deliveryFee - discount;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-charcoal-grey/10 p-6 space-y-4">
      <h3 className="text-xl font-bold text-charcoal-grey mb-6">Price Summary</h3>
      
      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <span className="text-charcoal-grey/70 font-medium">Subtotal</span>
          <span className="text-charcoal-grey font-semibold">Rs. {subtotal.toFixed(2)}</span>
        </div>

        {/* Delivery Fee */}
        {deliveryFee > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-charcoal-grey/70 font-medium">Delivery Fee</span>
            <span className="text-charcoal-grey font-semibold">Rs. {deliveryFee.toFixed(2)}</span>
          </div>
        )}

        {/* Discount */}
        {discount > 0 && (
          <div className="flex justify-between items-center text-golden-amber">
            <span className="font-medium">Discount</span>
            <span className="font-semibold">- Rs. {discount.toFixed(2)}</span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-charcoal-grey/10 my-4"></div>

        {/* Total */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-xl font-bold text-charcoal-grey">Total</span>
          <span className="text-2xl font-bold text-deep-maroon">Rs. {total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default PriceSummary;


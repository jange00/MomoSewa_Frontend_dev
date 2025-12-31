import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";

const CartItem = ({ item, itemIndex, onQuantityChange, onRemove }) => {
  // According to backend: itemId is the index of the item in the cart array
  const itemId = itemIndex !== undefined ? itemIndex : (item._id || item.id || 0);
  
  const handleDecrease = () => {
    if (item.quantity > 1) {
      onQuantityChange(itemId, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    onQuantityChange(itemId, item.quantity + 1);
  };

  const handleRemove = () => {
    onRemove(itemId);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-charcoal-grey/10 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex gap-6">
        {/* Item Image */}
        <div className="flex-shrink-0">
          <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center overflow-hidden border border-charcoal-grey/10">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">🥟</span>
            )}
          </div>
        </div>

        {/* Item Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-charcoal-grey mb-1">{item.name}</h3>
            {item.description && (
              <p className="text-sm text-charcoal-grey/60 mb-2 line-clamp-2">{item.description}</p>
            )}
            {item.variant && (
              <p className="text-xs text-charcoal-grey/50 mb-2">Variant: {item.variant}</p>
            )}
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-6">
              {/* Quantity Control */}
              <div className="flex items-center gap-3 bg-charcoal-grey/5 rounded-xl p-1">
                <button
                  onClick={handleDecrease}
                  disabled={item.quantity <= 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white hover:bg-deep-maroon hover:text-white text-charcoal-grey transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-charcoal-grey shadow-sm"
                  aria-label="Decrease quantity"
                >
                  <FiMinus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-charcoal-grey">{item.quantity}</span>
                <button
                  onClick={handleIncrease}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white hover:bg-deep-maroon hover:text-white text-charcoal-grey transition-all duration-200 shadow-sm"
                  aria-label="Increase quantity"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>

              {/* Price */}
              <div>
                {(() => {
                  const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
                  const quantity = item.quantity || 1;
                  const totalPrice = price * quantity;
                  
                  if (price === 0 || isNaN(price)) {
                    return (
                      <p className="text-lg font-bold text-charcoal-grey/50">
                        Price unavailable
                      </p>
                    );
                  }
                  
                  return (
                    <>
                      <p className="text-lg font-bold text-deep-maroon">
                        Rs. {totalPrice.toFixed(2)}
                      </p>
                      {quantity > 1 && (
                        <p className="text-xs text-charcoal-grey/50">
                          Rs. {price.toFixed(2)} each
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemove}
              className="p-2.5 rounded-xl hover:bg-red-50 hover:text-red-600 text-charcoal-grey/60 transition-all duration-200 group"
              aria-label="Remove item"
            >
              <FiTrash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;


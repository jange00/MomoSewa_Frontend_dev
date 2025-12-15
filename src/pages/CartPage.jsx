import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { FiShoppingBag, FiArrowLeft } from "react-icons/fi";
import CartItem from "../features/cart/components/CartItem";
import PriceSummary from "../features/cart/components/PriceSummary";
import PromoCodeBox from "../features/cart/components/PromoCodeBox";
import Button from "../ui/buttons/Button";

// Mock cart data - replace with actual state management
const initialCartItems = [
  {
    id: 1,
    name: "Steam Momo (10 pcs)",
    description: "Traditional Nepali steamed momos with juicy chicken filling",
    variant: "Chicken",
    price: 250.00,
    quantity: 2,
    image: null,
  },
  {
    id: 2,
    name: "Fried Momo (8 pcs)",
    description: "Crispy fried momos with vegetable filling",
    variant: "Vegetable",
    price: 280.00,
    quantity: 1,
    image: null,
  },
  {
    id: 3,
    name: "Jhol Momo (10 pcs)",
    description: "Steamed momos served with spicy tomato-based sauce",
    variant: "Buff",
    price: 300.00,
    quantity: 1,
    image: null,
  },
];

const CartPage = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoDiscount, setPromoDiscount] = useState(0);

  const handleQuantityChange = (itemId, newQuantity) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const handleApplyPromo = (code) => {
    if (!code) {
      setAppliedPromo(null);
      setPromoDiscount(0);
      return;
    }

    // Mock promo code validation
    const validPromos = {
      WELCOME10: 10,
      MOMO20: 20,
      SAVE50: 50,
    };

    const discountPercent = validPromos[code.toUpperCase()];
    if (discountPercent) {
      setAppliedPromo(code.toUpperCase());
      const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      setPromoDiscount((subtotal * discountPercent) / 100);
    } else {
      toast.error("Invalid promo code. Try WELCOME10, MOMO20, or SAVE50");
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const deliveryFee = subtotal > 500 ? 0 : 50; // Free delivery above Rs. 500

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal-grey/3 via-white to-golden-amber/5 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center mb-6">
              <FiShoppingBag className="w-16 h-16 text-charcoal-grey/30" />
            </div>
            <h2 className="text-3xl font-bold text-charcoal-grey mb-4">
              Your cart is empty
            </h2>
            <p className="text-charcoal-grey/60 mb-8 max-w-md">
              Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
            </p>
            <Button variant="primary" size="md" to="/menu">
              Browse Menu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-grey/3 via-white to-golden-amber/5 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-charcoal-grey/70 hover:text-deep-maroon transition-colors duration-200 mb-4 group"
          >
            <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Continue Shopping</span>
          </Link>
          <h1 className="text-4xl font-black text-charcoal-grey mb-2">
            Shopping Cart
          </h1>
          <p className="text-charcoal-grey/60">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Promo Code Box */}
            <PromoCodeBox
              onApplyPromo={handleApplyPromo}
              appliedPromo={appliedPromo}
              discount={promoDiscount}
            />

            {/* Price Summary */}
            <PriceSummary
              subtotal={subtotal}
              discount={promoDiscount}
              deliveryFee={deliveryFee}
            />

            {/* Checkout Button */}
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              to="/checkout"
            >
              Proceed to Checkout
            </Button>

            {/* Additional Info */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-charcoal-grey/10 p-5">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-golden-amber/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal-grey">Free Delivery</p>
                    <p className="text-charcoal-grey/60">
                      Orders above Rs. 500 qualify for free delivery
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-golden-amber/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal-grey">Secure Payment</p>
                    <p className="text-charcoal-grey/60">
                      Your payment information is safe and encrypted
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;


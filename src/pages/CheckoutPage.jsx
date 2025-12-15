import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import DeliveryForm from "../features/checkout/components/DeliveryForm";
import PaymentMethod from "../features/checkout/components/PaymentMethod";
import OrderSummary from "../features/checkout/components/OrderSummary";
import Button from "../ui/buttons/Button";

// Mock cart data - in real app, this would come from state management or route state
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

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cartItems] = useState(initialCartItems);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("khalti");
  const [deliveryForm, setDeliveryForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    area: "",
    postalCode: "",
    instructions: "",
  });

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = subtotal > 500 ? 0 : 50;
  const discount = 0; // Can be passed from cart if promo was applied
  const total = subtotal + deliveryFee - discount;

  const handleFormChange = (newFormData) => {
    setDeliveryForm(newFormData);
  };

  const handlePlaceOrder = async () => {
    // Validate form
    if (!deliveryForm.fullName || !deliveryForm.phone || !deliveryForm.address || !deliveryForm.city || !deliveryForm.area) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    setIsProcessing(true);

    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsProcessing(false);

    // In real app, navigate to order confirmation page
    // For now, show success message
    toast.success("Order placed successfully! You will be redirected to order confirmation.");
    // navigate("/order-confirmation");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-grey/3 via-white to-golden-amber/5 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-charcoal-grey/70 hover:text-deep-maroon transition-colors duration-200 mb-4 group"
          >
            <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Cart</span>
          </Link>
          <h1 className="text-4xl font-black text-charcoal-grey mb-2">
            Checkout
          </h1>
          <p className="text-charcoal-grey/60">
            Complete your order details to proceed
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Information */}
            <DeliveryForm formData={deliveryForm} onChange={handleFormChange} />

            {/* Payment Method */}
            <PaymentMethod
              selectedMethod={paymentMethod}
              onSelect={setPaymentMethod}
            />
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1 space-y-6">
            <OrderSummary
              items={cartItems}
              subtotal={subtotal}
              discount={discount}
              deliveryFee={deliveryFee}
            />

            {/* Place Order Button */}
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handlePlaceOrder}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Processing...
                </>
              ) : (
                <>
                  <FiCheckCircle className="w-5 h-5" />
                  Place Order
                </>
              )}
            </Button>

            {/* Additional Info */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-charcoal-grey/10 p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-golden-amber/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-charcoal-grey text-sm">Free Delivery</p>
                  <p className="text-charcoal-grey/60 text-xs">
                    Orders above Rs. 500 qualify for free delivery
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-golden-amber/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-charcoal-grey text-sm">Estimated Delivery</p>
                  <p className="text-charcoal-grey/60 text-xs">
                    30-45 minutes from order confirmation
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-golden-amber/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-charcoal-grey text-sm">Secure Payment</p>
                  <p className="text-charcoal-grey/60 text-xs">
                    Your payment information is safe and encrypted
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;


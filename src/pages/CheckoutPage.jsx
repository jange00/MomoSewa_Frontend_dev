import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import DeliveryForm from "../features/checkout/components/DeliveryForm";
import PaymentMethod from "../features/checkout/components/PaymentMethod";
import OrderSummary from "../features/checkout/components/OrderSummary";
import Button from "../ui/buttons/Button";
import { useGet, usePost } from "../hooks/useApi";
import { API_ENDPOINTS } from "../api/config";

const CheckoutPage = () => {
  const navigate = useNavigate();

  // Fetch cart from API
  const { data: cartData, isLoading: cartLoading } = useGet(
    'cart',
    API_ENDPOINTS.CART,
    { showErrorToast: true }
  );

  // Fetch all products to enrich cart items with product data
  const { data: productsData } = useGet(
    'products',
    API_ENDPOINTS.PRODUCTS,
    { 
      showErrorToast: false,
      enabled: cartData?.data?.cart?.items?.length > 0
    }
  );

  const products = productsData?.data?.products || productsData?.data || [];

  // Backend returns: { success: true, data: { cart: { items: [], promoCode: null } } }
  const rawCartItems = Array.isArray(cartData?.data?.cart?.items) 
    ? cartData.data.cart.items 
    : Array.isArray(cartData?.data?.items) 
    ? cartData.data.items 
    : Array.isArray(cartData?.data) 
    ? cartData.data 
    : [];

  // Enrich cart items with product data
  const cartItems = useMemo(() => {
    if (!rawCartItems.length || !products.length) return rawCartItems;
    
    return rawCartItems.map(cartItem => {
      const product = products.find(p => 
        (p._id === cartItem.productId) || (p.id === cartItem.productId)
      );
      
      if (product) {
        return {
          ...cartItem,
          name: product.name,
          price: product.price,
          image: product.image || (product.images && product.images[0]) || null,
          description: product.description,
          productId: cartItem.productId,
          variant: cartItem.variant,
          quantity: cartItem.quantity || 1,
        };
      }
      
      return {
        ...cartItem,
        quantity: cartItem.quantity || 1,
      };
    });
  }, [rawCartItems, products]);

  // Create order mutation
  const createOrderMutation = usePost('orders', API_ENDPOINTS.ORDERS, {
    showSuccessToast: true,
    showErrorToast: true,
  });
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

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0);
  }, [cartItems]);
  
  const deliveryFee = useMemo(() => subtotal > 500 ? 0 : 50, [subtotal]);
  const discount = 0; // Can be passed from cart if promo was applied
  const total = useMemo(() => subtotal + deliveryFee - discount, [subtotal, deliveryFee]);

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal-grey/3 via-white to-golden-amber/5 py-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal-grey/3 via-white to-golden-amber/5 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-charcoal-grey mb-4">Your cart is empty</h2>
            <p className="text-charcoal-grey/60 mb-8">Add items to your cart before checkout</p>
            <Button variant="primary" size="md" to="/menu">
              Browse Menu
            </Button>
          </div>
        </div>
      </div>
    );
  }

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

    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId || item.product?._id || item.product?.id,
          quantity: item.quantity || 1,
        })),
        deliveryAddress: {
          fullName: deliveryForm.fullName,
          phone: deliveryForm.phone,
          address: deliveryForm.address,
          city: deliveryForm.city,
          area: deliveryForm.area,
          postalCode: deliveryForm.postalCode,
          instructions: deliveryForm.instructions,
        },
        paymentMethod: paymentMethod,
        total: total,
      };

      const result = await createOrderMutation.mutateAsync(orderData);

      if (result?.success) {
        navigate(`/customer/orders/${result.data?.order?._id || result.data?._id}`);
      }
    } catch (error) {
      console.error("Failed to place order:", error);
    } finally {
      setIsProcessing(false);
    }
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


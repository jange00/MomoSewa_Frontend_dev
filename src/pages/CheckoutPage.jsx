import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import DeliveryForm from "../features/checkout/components/DeliveryForm";
import PaymentMethod from "../features/checkout/components/PaymentMethod";
import OrderSummary from "../features/checkout/components/OrderSummary";
import Button from "../ui/buttons/Button";
import { useGet, usePost } from "../hooks/useApi";
import { API_ENDPOINTS } from "../api/config";
import { useAuth } from "../hooks/useAuth";
import { USER_ROLES } from "../common/roleConstants";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading: authLoading } = useAuth();

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
  const [selectedAddressId, setSelectedAddressId] = useState(null);

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

  // Validate delivery address - either a saved address must be selected OR all required fields must be filled
  // MUST be before any early returns to follow Rules of Hooks
  const isAddressValid = useMemo(() => {
    // If a saved address is selected, it's valid
    if (selectedAddressId) {
      return true;
    }
    
    // Otherwise, check if all required fields are filled
    const hasFullName = !!deliveryForm.fullName?.trim();
    const hasPhone = !!deliveryForm.phone?.trim();
    const hasAddress = !!deliveryForm.address?.trim();
    const hasCity = !!deliveryForm.city?.trim();
    const hasArea = !!deliveryForm.area?.trim();
    
    return hasFullName && hasPhone && hasAddress && hasCity && hasArea;
  }, [selectedAddressId, deliveryForm]);

  // Get missing required fields for better error message
  // MUST be before any early returns to follow Rules of Hooks
  const getMissingFields = useMemo(() => {
    if (selectedAddressId) return [];
    
    const missing = [];
    if (!deliveryForm.fullName?.trim()) missing.push("Full Name");
    if (!deliveryForm.phone?.trim()) missing.push("Phone");
    if (!deliveryForm.address?.trim()) missing.push("Address");
    if (!deliveryForm.city?.trim()) missing.push("City");
    if (!deliveryForm.area?.trim()) missing.push("Area");
    return missing;
  }, [selectedAddressId, deliveryForm]);

  // Check authentication and redirect if needed
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        toast.error("Please login to proceed to checkout");
        navigate("/login");
        return;
      }
      if (user?.role && user.role !== USER_ROLES.CUSTOMER) {
        toast.error("Only customers can checkout");
        navigate("/");
        return;
      }
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  const handleFormChange = (newFormData) => {
    setDeliveryForm(newFormData);
  };

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal-grey/3 via-white to-golden-amber/5 py-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon"></div>
      </div>
    );
  }

  // If not authenticated or not a customer, don't render (redirect will happen in useEffect)
  if (!isAuthenticated || (user?.role && user.role !== USER_ROLES.CUSTOMER)) {
    return null;
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

  const handlePlaceOrder = async () => {
    // Validate address - either selected saved address or all required fields filled
    if (!isAddressValid) {
      if (getMissingFields.length > 0) {
        toast.error(`Please fill in: ${getMissingFields.join(", ")}`);
      } else {
        toast.error("Please select a saved address or fill in all required delivery fields");
      }
      return;
    }

    // Validate payment method
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
            <DeliveryForm 
              formData={deliveryForm} 
              onChange={handleFormChange}
              selectedAddressId={selectedAddressId}
              onAddressSelect={(addressId) => setSelectedAddressId(addressId)}
            />

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
              disabled={isProcessing || !isAddressValid}
              title={!isAddressValid ? "Please select a saved address or fill in all required delivery fields" : ""}
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
            
            {/* Validation Message */}
            {!isAddressValid && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-2">
                <p className="text-sm font-semibold text-red-800 mb-1">
                  Address Required
                </p>
                <p className="text-xs text-red-600">
                  {selectedAddressId 
                    ? "Please ensure address is selected"
                    : getMissingFields.length > 0
                    ? `Missing: ${getMissingFields.join(", ")}`
                    : "Please select a saved address or fill in all required delivery fields"
                  }
                </p>
              </div>
            )}

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


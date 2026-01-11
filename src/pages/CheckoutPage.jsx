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
import { useDeliveryFee } from "../hooks/useDeliveryFee";
import * as paymentService from "../services/paymentService";

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
    showSuccessToast: false,
    showErrorToast: true,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash-on-delivery");
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

  // Fetch delivery fee settings
  const { calculateDeliveryFee, getAmountNeededForFreeDelivery } = useDeliveryFee();

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0);
  }, [cartItems]);
  
  const discount = 0; // Can be passed from cart if promo was applied
  
  // Calculate delivery fee using backend settings (uses subtotal - discount)
  const deliveryFee = useMemo(() => {
    return calculateDeliveryFee(subtotal, discount);
  }, [subtotal, discount, calculateDeliveryFee]);

  // Get amount needed for free delivery
  const amountNeededForFreeDelivery = useMemo(() => {
    return getAmountNeededForFreeDelivery(subtotal, discount);
  }, [subtotal, discount, getAmountNeededForFreeDelivery]);
  
  const total = useMemo(() => subtotal + deliveryFee - discount, [subtotal, deliveryFee, discount]);

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
      // Ensure payment method is valid and not empty
      if (!paymentMethod || paymentMethod.trim() === '') {
        toast.error("Please select a payment method");
        setIsProcessing(false);
        return;
      }

      // Prepare payment method - ensure it's a valid string
      const finalPaymentMethod = paymentMethod?.trim() || paymentMethod;
      
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId || item.product?._id || item.product?.id,
          quantity: item.quantity || 1,
        })),
        deliveryAddress: {
          fullName: deliveryForm.fullName,
          phone: deliveryForm.phone,
          address: deliveryForm.address || deliveryForm.nearestLandmark, // Required field
          nearestLandmark: deliveryForm.address || deliveryForm.nearestLandmark, // Optional field
          city: deliveryForm.city,
          area: deliveryForm.area,
          postalCode: deliveryForm.postalCode || undefined,
          instructions: deliveryForm.instructions || undefined,
          // Include latitude/longitude if available
          ...(deliveryForm.latitude && deliveryForm.longitude && {
            latitude: deliveryForm.latitude,
            longitude: deliveryForm.longitude,
          }),
        },
        paymentMethod: finalPaymentMethod,
        total: total,
      };

      // Debug: Log order data being sent
      if (process.env.NODE_ENV === 'development') {
        console.log('=== ORDER CREATION DEBUG ===');
        console.log('Payment method state:', paymentMethod);
        console.log('Payment method type:', typeof paymentMethod);
        console.log('Payment method length:', paymentMethod?.length);
        console.log('Final payment method:', finalPaymentMethod);
        console.log('Full order data:', JSON.stringify(orderData, null, 2));
        console.log('===========================');
      }

      const result = await createOrderMutation.mutateAsync(orderData);

      if (result?.success) {
        // Extract orderId from various possible response structures
        // Backend might use 'orderId' (human-readable) or '_id' (MongoDB ObjectId)
        // Try 'orderId' first as it's more likely what the payment endpoint expects
        let orderId = result.data?.order?.orderId ||  // Human-readable order ID (e.g., "ORD-MJTOUNN5-EXTGB")
                     result.data?.order?._id ||        // MongoDB ObjectId
                     result.data?.order?.id || 
                     result.data?.orderId ||
                     result.data?._id || 
                     result.data?.id ||
                     result.order?.orderId ||
                     result.order?._id ||
                     result.order?.id ||
                     result.orderId;
        
        // If orderId is an object, try to extract the string value
        if (orderId && typeof orderId === 'object') {
          orderId = orderId.toString();
        }
        
        // Ensure orderId is a string
        if (orderId) {
          orderId = String(orderId).trim();
        }
        
        // Debug: Log order creation result
        if (process.env.NODE_ENV === 'development') {
          console.log('=== ORDER CREATION RESULT ===');
          console.log('Full result:', JSON.stringify(result, null, 2));
          console.log('Result.data:', result.data);
          console.log('Result.data.order:', result.data?.order);
          console.log('Raw extracted Order ID:', orderId);
          console.log('Order ID type:', typeof orderId);
          console.log('Order ID value:', orderId);
          console.log('Payment method:', paymentMethod);
          console.log('============================');
        }
        
        // Validate orderId before proceeding
        if (!orderId || orderId === 'undefined' || orderId === 'null' || orderId.length === 0) {
          console.error('❌ Order ID not found or invalid in response:', {
            orderId,
            result,
            resultData: result.data,
            resultDataOrder: result.data?.order,
          });
          toast.error("Order created but order ID not found. Please check your orders page.");
          navigate('/customer/orders');
          return;
        }
        
        // Handle payment based on payment method
        if (finalPaymentMethod === 'esewa') {
          // Step 2: Initiate eSewa payment
          try {
            console.log('🔄 Initiating eSewa payment for order:', orderId);
            const paymentResponse = await paymentService.initiateEsewaPayment(orderId, total);
            
            if (paymentResponse?.success && paymentResponse?.data) {
              const { payment_url, formData } = paymentResponse.data;
              
              if (!payment_url || !formData) {
                throw new Error('Invalid payment response: missing payment_url or formData');
              }
              
              // Validate payment URL
              try {
                const url = new URL(payment_url);
                if (!url.protocol.startsWith('http')) {
                  throw new Error('Invalid payment URL protocol');
                }
              } catch (urlError) {
                console.error('❌ Invalid payment URL:', payment_url);
                throw new Error(`Invalid payment URL: ${payment_url}. Please contact support.`);
              }
              
              console.log('✅ eSewa payment initiated successfully');
              console.log('Payment URL:', payment_url);
              console.log('Form Data:', formData);
              
              // Step 3: Submit form to eSewa (as per eSewa documentation)
              // Simple form submission - eSewa will redirect back to our callback URL
              const form = document.createElement('form');
              form.method = 'POST';
              form.action = payment_url;
              
              // Add all form fields from backend
              Object.keys(formData).forEach(key => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = formData[key];
                form.appendChild(input);
              });
              
              document.body.appendChild(form);
              console.log('📤 Submitting form to eSewa...');
              form.submit(); // This redirects to eSewa
              
              // Note: User will be redirected to eSewa, then eSewa will redirect back to
              // /payment/verify?status=success&oid=...&refId=...&amt=...&pid=...
              // We don't navigate here - form.submit() handles the redirect
              
              // Note: User will be redirected to eSewa, then back to /payment/verify
              // Don't navigate here as form.submit() will handle the redirect
            } else {
              throw new Error('Invalid payment response structure');
            }
          } catch (error) {
            console.error('❌ Failed to initiate eSewa payment:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to initiate eSewa payment. Please try again.';
            toast.error(errorMessage, { duration: 5000 });
            
            // Stay on checkout page to allow retry
            // Do NOT navigate to success page
            setIsProcessing(false);
            return;
          }
        } else {
          // For non-eSewa payment methods (cash-on-delivery, etc.), navigate to success page
          navigate('/checkout/success', {
            state: {
              order: result.data?.order || null,
              orderId: orderId,
              isFromOrderPlacement: true,
            }
          });
        }
      }
    } catch (error) {
      console.error("Failed to place order:", error);
      // Error toast is already shown by usePost hook, but log details
      if (error.details && Array.isArray(error.details)) {
        const errorMessages = error.details.map(d => d.msg || d.message || JSON.stringify(d)).join(', ');
        console.error("Validation errors:", errorMessages);
        
        // Log validation errors
        console.error("Validation errors:", errorMessages);
      }
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
              amountNeededForFreeDelivery={amountNeededForFreeDelivery}
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

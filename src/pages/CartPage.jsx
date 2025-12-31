import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { FiShoppingBag, FiArrowLeft } from "react-icons/fi";
import CartItem from "../features/cart/components/CartItem";
import PriceSummary from "../features/cart/components/PriceSummary";
import PromoCodeBox from "../features/cart/components/PromoCodeBox";
import Button from "../ui/buttons/Button";
import { useGet } from "../hooks/useApi";
import { API_ENDPOINTS } from "../api/config";
import apiClient from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { USER_ROLES } from "../common/roleConstants";
import { useDeliveryFee } from "../hooks/useDeliveryFee";

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoDiscount, setPromoDiscount] = useState(0);

  // Check authentication and customer role
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        toast.error("Please login to view your cart");
        navigate("/login");
        return;
      }
      if (user?.role && user.role !== USER_ROLES.CUSTOMER) {
        toast.error("Only customers can access the cart");
        navigate("/");
        return;
      }
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  // Fetch cart from API - only enabled if authenticated and is customer
  const { data: cartData, isLoading, refetch } = useGet(
    'cart',
    API_ENDPOINTS.CART,
    { 
      showErrorToast: true,
      enabled: isAuthenticated && user?.role === USER_ROLES.CUSTOMER && !authLoading
    }
  );

  // Fetch all products to enrich cart items with product data
  const { data: productsData } = useGet(
    'products',
    API_ENDPOINTS.PRODUCTS,
    { 
      showErrorToast: false,
      enabled: isAuthenticated && user?.role === USER_ROLES.CUSTOMER && !authLoading && cartData?.data?.cart?.items?.length > 0
    }
  );

  const products = productsData?.data?.products || productsData?.data || [];

  // Debug: Log cart data structure
  useEffect(() => {
    if (cartData) {
      console.log("Cart data received:", cartData);
      console.log("Cart data.data:", cartData.data);
      console.log("Cart data.data.cart:", cartData.data?.cart);
      console.log("Cart data.data.cart.items:", cartData.data?.cart?.items);
      console.log("Is cart.items array?", Array.isArray(cartData.data?.cart?.items));
      console.log("Is data.items array?", Array.isArray(cartData.data?.items));
    }
  }, [cartData]);

  // Ensure cartItems is always an array
  // Backend returns: { success: true, data: { cart: { items: [], promoCode: null } } }
  const rawCartItems = Array.isArray(cartData?.data?.cart?.items) 
    ? cartData.data.cart.items 
    : Array.isArray(cartData?.data?.items) 
    ? cartData.data.items 
    : Array.isArray(cartData?.data) 
    ? cartData.data 
    : [];

  // Enrich cart items with product data
  // Cart items from backend only have: { productId, variant, quantity }
  // We need to merge product data: { name, price, image, description, etc. }
  const cartItems = useMemo(() => {
    if (!rawCartItems.length || !products.length) return rawCartItems;
    
    return rawCartItems.map(cartItem => {
      // Find the product that matches this cart item's productId
      const product = products.find(p => 
        (p._id === cartItem.productId) || (p.id === cartItem.productId)
      );
      
      if (product) {
        // Merge cart item with product data
        return {
          ...cartItem,
          // Product fields
          name: product.name,
          price: product.price,
          image: product.image || (product.images && product.images[0]) || null,
          description: product.description,
          emoji: product.emoji,
          // Keep cart item fields
          productId: cartItem.productId,
          variant: cartItem.variant,
          quantity: cartItem.quantity || 1,
        };
      }
      
      // If product not found, return cart item as-is (will show with missing data)
      return {
        ...cartItem,
        quantity: cartItem.quantity || 1,
      };
    });
  }, [rawCartItems, products]);
  
  // Debug: Log cart items
  useEffect(() => {
    console.log("Cart items array:", cartItems);
    console.log("Cart items count:", cartItems.length);
  }, [cartItems]);

  // Sync promo code from cart data
  useEffect(() => {
    if (cartData?.data?.cart?.promoCode) {
      setAppliedPromo(cartData.data.cart.promoCode);
      // Note: discount amount should come from the apply-promo response, not from cart
      // The cart only stores the promoCode, not the discount amount
    } else {
      setAppliedPromo(null);
    }
  }, [cartData?.data?.cart?.promoCode]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    try {
      // Use PUT /cart/:itemId where itemId is the index
      const endpoint = `${API_ENDPOINTS.CART}/${itemId}`;
      const response = await apiClient.put(endpoint, { quantity: newQuantity });
      
      if (response.data.success) {
        refetch();
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error(error.response?.data?.message || "Failed to update quantity");
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      // Use DELETE /cart/:itemId where itemId is the index
      const endpoint = `${API_ENDPOINTS.CART}/${itemId}`;
      const response = await apiClient.delete(endpoint);
      
      if (response.data.success) {
        refetch();
        toast.success("Item removed from cart");
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error(error.response?.data?.message || "Failed to remove item");
    }
  };

  const handleApplyPromo = async (code) => {
    if (!code) {
      setAppliedPromo(null);
      setPromoDiscount(0);
      return;
    }

    try {
      // According to backend: POST /cart/apply-promo
      const response = await apiClient.post(
        `${API_ENDPOINTS.CART}/apply-promo`,
        { promoCode: code.toUpperCase() }
      );
      
      if (response.data.success) {
        const discount = response.data.data?.discount || 0;
        setAppliedPromo(code.toUpperCase());
        setPromoDiscount(discount);
        refetch(); // Refresh cart to get updated totals
        toast.success(response.data.message || "Promo code applied successfully");
      }
    } catch (error) {
      console.error("Failed to apply promo code:", error);
      toast.error(error.response?.data?.message || "Invalid promo code");
      setAppliedPromo(null);
      setPromoDiscount(0);
    }
  };

  // Fetch delivery fee settings
  const { calculateDeliveryFee, getAmountNeededForFreeDelivery } = useDeliveryFee();

  // Calculate subtotal and delivery fee (MUST be before any early returns to follow Rules of Hooks)
  const subtotal = useMemo(() => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((sum, item) => {
      const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0);
  }, [cartItems]);

  // Calculate delivery fee using backend settings (uses subtotal - discount)
  const deliveryFee = useMemo(() => {
    return calculateDeliveryFee(subtotal, promoDiscount);
  }, [subtotal, promoDiscount, calculateDeliveryFee]);

  // Get amount needed for free delivery
  const amountNeededForFreeDelivery = useMemo(() => {
    return getAmountNeededForFreeDelivery(subtotal, promoDiscount);
  }, [subtotal, promoDiscount, getAmountNeededForFreeDelivery]);

  // Show loading state while checking auth or loading cart
  if (authLoading || isLoading) {
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
            {cartItems.map((item, index) => (
              <CartItem
                key={item._id || item.id || index}
                item={item}
                itemIndex={index} // Pass index as itemId (backend uses index, not ID)
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
              amountNeededForFreeDelivery={amountNeededForFreeDelivery}
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


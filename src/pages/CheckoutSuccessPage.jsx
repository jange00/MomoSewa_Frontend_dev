import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { FiCheckCircle, FiLoader, FiShoppingBag, FiHome } from "react-icons/fi";
import toast from "react-hot-toast";
import Button from "../ui/buttons/Button";
import Card from "../ui/cards/Card";
import * as paymentService from "../services/paymentService";
import { formatPaymentMethod } from "../utils/paymentStatus";

const CheckoutSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [order, setOrder] = useState(location.state?.order || null);
  
  // Check if we came from order placement (has order in state) or payment verification (has URL params)
  const isFromOrderPlacement = location.state?.order || location.state?.orderId;
  const hasPaymentParams = searchParams.get("oid") || searchParams.get("refId");

  useEffect(() => {
    // If we came from order placement, set order data from state
    if (isFromOrderPlacement) {
      const stateOrderId = location.state?.orderId || location.state?.order?.orderId || location.state?.order?._id;
      if (stateOrderId) {
        setOrderId(stateOrderId);
      }
      if (location.state?.order) {
        setOrder(location.state.order);
      }
      setPaymentStatus("success");
      setIsVerifying(false);
      toast.success("Order placed successfully!");
      return;
    }

    // If we have payment verification params, verify payment
    if (hasPaymentParams) {
      const verifyPayment = async () => {
        setIsVerifying(true);
        // Get parameters from URL (backend redirects with these after eSewa payment)
        // Backend GET /payments/esewa/success redirects with: oid, refId, orderId
        const oid = searchParams.get("oid"); // transactionId from eSewa
        const refId = searchParams.get("refId"); // eSewa reference ID
        const orderIdParam = searchParams.get("orderId"); // Order ID from backend

        if (!oid) {
          toast.error("Invalid payment response");
          setIsVerifying(false);
          setPaymentStatus("error");
          return;
        }

        setTransactionId(oid);
        setOrderId(orderIdParam);

        try {
          // Verify payment status with backend using transaction ID (oid)
          const result = await paymentService.verifyEsewaPayment(oid);

          if (result?.success) {
            const status = result.data?.paymentStatus;
            const verifiedOrderId = result.data?.orderId || orderIdParam;
            const verifiedOrder = result.data?.order || null;
            
            setPaymentStatus(status === "paid" ? "success" : "error");
            setOrderId(verifiedOrderId); // Use verified orderId from backend
            if (verifiedOrder) {
              setOrder(verifiedOrder);
            }

            if (status === "paid") {
              toast.success("Payment successful! Your order has been confirmed.");
            } else {
              toast.error("Payment verification failed. Please contact support.");
            }
          } else {
            setPaymentStatus("error");
            toast.error("Failed to verify payment status");
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          setPaymentStatus("error");
          toast.error("Failed to verify payment. Please check your order status.");
        } finally {
          setIsVerifying(false);
        }
      };

      verifyPayment();
    } else {
      // No payment params and no order state - show success anyway
      setPaymentStatus("success");
      setIsVerifying(false);
    }
  }, [searchParams, navigate, location.state, isFromOrderPlacement, hasPaymentParams]);

  const handleViewOrder = () => {
    if (orderId && orderId !== 'undefined' && orderId !== 'null' && orderId.trim() !== '') {
      navigate(`/customer/orders/${orderId}`);
    } else {
      navigate("/customer/orders");
    }
  };

  const handleContinueShopping = () => {
    navigate("/menu");
  };

  const handleGoToDashboard = () => {
    navigate("/customer/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-grey/3 via-white to-golden-amber/5 py-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-charcoal-grey/10 p-8 text-center">
          {isVerifying ? (
            <>
              <div className="w-20 h-20 rounded-full bg-golden-amber/10 flex items-center justify-center mx-auto mb-6">
                <FiLoader className="w-10 h-10 text-golden-amber animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-charcoal-grey mb-4">
                Verifying Payment...
              </h2>
              <p className="text-charcoal-grey/60">
                Please wait while we verify your payment.
              </p>
            </>
          ) : paymentStatus === "success" || paymentStatus === "paid" ? (
            <>
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <FiCheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-charcoal-grey mb-4">
                Order Placed Successfully!
              </h2>
              <p className="text-charcoal-grey/60 mb-6">
                {isFromOrderPlacement 
                  ? "Your order has been placed and is being processed. You will receive a confirmation shortly."
                  : "Your order has been confirmed and payment has been received."
                }
              </p>
              
              {/* Order Details Card */}
              {(order || orderId) && (
                <Card className="p-6 mb-6 text-left bg-charcoal-grey/5">
                  <h3 className="text-lg font-bold text-charcoal-grey mb-4">Order Details</h3>
                  <div className="space-y-3">
                    {orderId && (
                      <div className="flex justify-between text-sm">
                        <span className="text-charcoal-grey/70">Order ID:</span>
                        <span className="font-semibold text-charcoal-grey">{orderId}</span>
                      </div>
                    )}
                    {order?.total && (
                      <div className="flex justify-between text-sm">
                        <span className="text-charcoal-grey/70">Total Amount:</span>
                        <span className="font-semibold text-charcoal-grey">Rs. {order.total.toFixed(2)}</span>
                      </div>
                    )}
                    {order?.paymentMethod && (
                      <div className="flex justify-between text-sm">
                        <span className="text-charcoal-grey/70">Payment Method:</span>
                        <span className="font-semibold text-charcoal-grey">{formatPaymentMethod(order.paymentMethod)}</span>
                      </div>
                    )}
                    {order?.paymentStatus && (
                      <div className="flex justify-between text-sm">
                        <span className="text-charcoal-grey/70">Payment Status:</span>
                        <span className={`font-semibold ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                          {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                        </span>
                      </div>
                    )}
                    {(order?.esewaTransactionId || transactionId) && (
                      <div className="flex justify-between text-sm">
                        <span className="text-charcoal-grey/70">eSewa Transaction ID:</span>
                        <span className="font-mono text-xs text-charcoal-grey/80 break-all text-right max-w-[60%]">
                          {order?.esewaTransactionId || transactionId}
                        </span>
                      </div>
                    )}
                    {order?.khaltiTransactionId && (
                      <div className="flex justify-between text-sm">
                        <span className="text-charcoal-grey/70">Khalti Transaction ID:</span>
                        <span className="font-mono text-xs text-charcoal-grey/80 break-all text-right max-w-[60%]">
                          {order.khaltiTransactionId}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={handleContinueShopping}
                  className="flex items-center justify-center gap-2"
                >
                  <FiShoppingBag className="w-5 h-5" />
                  Continue Shopping
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleGoToDashboard}
                  className="flex items-center justify-center gap-2"
                >
                  <FiHome className="w-5 h-5" />
                  Dashboard
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                <FiCheckCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-3xl font-bold text-charcoal-grey mb-4">
                Payment Verification Failed
              </h2>
              <p className="text-charcoal-grey/60 mb-6">
                We couldn't verify your payment status. Please check your order
                status or contact support if you have any questions.
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="primary" size="md" onClick={handleViewOrder}>
                  Check Order Status
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => navigate("/")}
                >
                  Go to Home
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;


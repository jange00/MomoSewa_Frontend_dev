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
  
  // Check if we came from order placement (has order in state) or payment verification (has URL params or state)
  const isFromOrderPlacement = location.state?.order || (location.state?.orderId && !location.state?.isFromPaymentGateway);
  const isFromPaymentGateway = location.state?.isFromPaymentGateway || false;
  
  // Get payment parameters from URL or state
  const urlOid = searchParams.get("oid");
  const urlRefId = searchParams.get("refId");
  const urlAmt = searchParams.get("amt");
  const urlPid = searchParams.get("pid");
  const urlStatus = searchParams.get("status");
  
  // Get from state (passed from PaymentVerifyPage)
  const stateOid = location.state?.transactionId || location.state?.paymentParams?.oid;
  const stateRefId = location.state?.refId || location.state?.paymentParams?.refId;
  const stateAmt = location.state?.amount || location.state?.paymentParams?.amt;
  const statePid = location.state?.orderId || location.state?.paymentParams?.pid;
  const stateStatus = location.state?.paymentStatus || location.state?.paymentParams?.status;
  
  // Use URL params first, then state params
  const oid = urlOid || stateOid;
  const refId = urlRefId || stateRefId;
  const amount = urlAmt || stateAmt;
  const orderIdFromPayment = urlPid || statePid; // eSewa sends orderId as 'pid'
  const paymentStatusFromUrl = urlStatus || stateStatus;
  
  const hasPaymentParams = oid || refId || orderIdFromPayment;

  useEffect(() => {
    // If we came from order placement (not payment gateway), set order data from state
    if (isFromOrderPlacement && !isFromPaymentGateway) {
      const stateOrderId = location.state?.orderId || location.state?.order?.orderId || location.state?.order?._id;
      if (stateOrderId) {
        setOrderId(stateOrderId);
      }
      if (location.state?.order) {
        setOrder(location.state.order);
      }
      
      // Check if payment is pending (eSewa redirect failed)
      if (location.state?.paymentPending) {
        setPaymentStatus("pending");
        setIsVerifying(false);
        toast.warning("Order created but payment redirect failed. Please check your order status.", { duration: 5000 });
      } else {
        setPaymentStatus("success");
        setIsVerifying(false);
        toast.success("Order placed successfully!");
      }
      return;
    }

    // If we have payment verification params (from eSewa callback)
    // Note: PaymentVerifyPage now handles verification, so if we're here from PaymentVerifyPage,
    // the payment is already verified and we just need to display the result
    if (hasPaymentParams && isFromPaymentGateway) {
      // Check if payment was already verified by PaymentVerifyPage
      if (location.state?.order || location.state?.paymentStatus) {
        // Payment already verified by PaymentVerifyPage, just display result
        const stateOrderId = location.state?.orderId || orderIdFromPayment;
        if (stateOrderId) {
          setOrderId(stateOrderId);
        }
        if (location.state?.order) {
          setOrder(location.state.order);
        }
        setPaymentStatus(location.state?.paymentStatus || "success");
        setTransactionId(location.state?.transactionId || refId);
        setIsVerifying(false);
        
        if (location.state?.paymentStatus === "success") {
          toast.success("Payment successful! Your order has been confirmed.");
        } else if (location.state?.paymentStatus === "error") {
          toast.error("Payment verification failed. Please contact support.");
        }
      } else {
        // Direct navigation with URL params (bypassing PaymentVerifyPage)
        // This shouldn't normally happen, but handle it as fallback
        const verifyPayment = async () => {
          setIsVerifying(true);
          
          // Extract orderId - eSewa sends it as 'oid' in redirect
          const orderIdToVerify = orderIdFromPayment || oid;
          
          if (!orderIdToVerify) {
            console.error('❌ Order ID not found in payment callback');
            toast.error("Invalid payment response: Order ID not found");
            setIsVerifying(false);
            setPaymentStatus("error");
            return;
          }
          
          if (!refId) {
            console.error('❌ Reference ID not found in payment callback');
            toast.error("Invalid payment response: Reference ID not found");
            setIsVerifying(false);
            setPaymentStatus("error");
            return;
          }
          
          if (!amount) {
            console.error('❌ Amount not found in payment callback');
            toast.error("Invalid payment response: Amount not found");
            setIsVerifying(false);
            setPaymentStatus("error");
            return;
          }

          setTransactionId(oid || refId);
          setOrderId(orderIdToVerify);

          console.log('🔄 Verifying eSewa payment (fallback):', {
            orderId: orderIdToVerify,
            amount: amount,
            refId: refId,
          });

          try {
            // Verify payment with backend using orderId, amount, and refId
            const result = await paymentService.verifyEsewaPayment(
              orderIdToVerify,
              amount,
              refId
            );

            if (result?.success) {
              const verifiedOrderId = result.data?.orderId || result.data?.order?.orderId || orderIdToVerify;
              const verifiedOrder = result.data?.order || null;
              const paymentStatus = result.data?.paymentStatus || result.data?.order?.paymentStatus;
              
              setOrderId(verifiedOrderId);
              if (verifiedOrder) {
                setOrder(verifiedOrder);
              }
              
              if (paymentStatus === "paid" || paymentStatus === "success") {
                setPaymentStatus("success");
                toast.success("Payment successful! Your order has been confirmed.");
              } else {
                setPaymentStatus("error");
                toast.error("Payment verification failed. Please contact support.");
              }
            } else {
              setPaymentStatus("error");
              toast.error(result?.message || "Failed to verify payment status");
            }
          } catch (error) {
            console.error("❌ Payment verification error:", error);
            setPaymentStatus("error");
            toast.error(
              error.response?.data?.message || 
              error.message || 
              "Failed to verify payment. Please check your order status."
            );
          } finally {
            setIsVerifying(false);
          }
        };

        verifyPayment();
      }
    } else if (hasPaymentParams && paymentStatusFromUrl === 'failure') {
      // Payment failed according to URL status
      setPaymentStatus("error");
      setIsVerifying(false);
      toast.error("Payment was cancelled or failed. Please try again.");
    } else {
      // No payment params and no order state - show success anyway
      setPaymentStatus("success");
      setIsVerifying(false);
    }
  }, [searchParams, navigate, location.state, isFromOrderPlacement, isFromPaymentGateway, hasPaymentParams, oid, refId, amount, orderIdFromPayment, paymentStatusFromUrl]);

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
          ) : paymentStatus === "success" || paymentStatus === "paid" || paymentStatus === "pending" ? (
            <>
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <FiCheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-charcoal-grey mb-4">
                {location.state?.paymentPending 
                  ? "Order Created - Payment Pending"
                  : "Order Placed Successfully!"
                }
              </h2>
              <p className="text-charcoal-grey/60 mb-6">
                {location.state?.paymentPending 
                  ? "Your order has been created, but we couldn't connect to eSewa. Please complete the payment manually or contact support."
                  : isFromOrderPlacement 
                    ? "Your order has been placed and is being processed. You will receive a confirmation shortly."
                    : "Your order has been confirmed and payment has been received."
                }
              </p>
              
              {/* Payment Pending Warning */}
              {location.state?.paymentPending && (
                <Card className="p-6 mb-6 text-left bg-yellow-50 border-yellow-200">
                  <h3 className="text-lg font-bold text-yellow-800 mb-3">⚠️ Payment Not Completed</h3>
                  <p className="text-sm text-yellow-700 mb-4">
                    We couldn't redirect you to eSewa payment. Your order is created but payment is pending.
                  </p>
                  {location.state?.errorMessage && (
                    <p className="text-xs text-yellow-600 mb-4 font-mono bg-yellow-100 p-2 rounded">
                      Error: {location.state.errorMessage}
                    </p>
                  )}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-yellow-800">What to do:</p>
                    <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1 mb-3">
                      <li>Try the manual payment button below</li>
                      <li>Check your order status in your dashboard</li>
                      <li>Contact support to complete payment manually</li>
                    </ol>
                    
                    {/* Manual Payment Button */}
                    {location.state?.paymentUrl && location.state?.formData && (
                      <div className="mt-4 pt-4 border-t border-yellow-300">
                        <p className="text-sm font-semibold text-yellow-800 mb-3">Complete Payment Manually:</p>
                        <Button
                          variant="primary"
                          size="md"
                          onClick={() => {
                            // Create and submit form to eSewa
                            const form = document.createElement('form');
                            form.method = 'POST';
                            form.action = location.state.paymentUrl;
                            form.target = '_blank';
                            
                            Object.keys(location.state.formData).forEach(key => {
                              const input = document.createElement('input');
                              input.type = 'hidden';
                              input.name = key;
                              input.value = String(location.state.formData[key]);
                              form.appendChild(input);
                            });
                            
                            document.body.appendChild(form);
                            form.submit();
                            toast.info('Opening eSewa payment page in a new window...', { duration: 3000 });
                          }}
                          className="w-full"
                        >
                          Open eSewa Payment Page
                        </Button>
                        <p className="text-xs text-yellow-600 mt-2">
                          This will open the eSewa payment page in a new window. Complete your payment there.
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-3 pt-3 border-t border-yellow-300">
                      <p className="text-xs text-yellow-600">
                        <strong>Note:</strong> If you see a "DNS_PROBE_FINISHED_NXDOMAIN" error, this means the eSewa payment gateway URL is not reachable. This could be due to:
                      </p>
                      <ul className="text-xs text-yellow-600 list-disc list-inside mt-2 space-y-1">
                        <li>Network connectivity issues</li>
                        <li>eSewa UAT server being down</li>
                        <li>DNS configuration problems</li>
                        <li>Firewall or VPN blocking the connection</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              )}
              
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


import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiCheckCircle, FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";
import Button from "../ui/buttons/Button";
import * as paymentService from "../services/paymentService";

const CheckoutSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [transactionId, setTransactionId] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
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
          setPaymentStatus(status);
          setOrderId(verifiedOrderId); // Use verified orderId from backend

          if (status === "paid") {
            toast.success("Payment successful! Your order has been confirmed.");
            // Redirect to order details after 3 seconds
            setTimeout(() => {
              if (verifiedOrderId && verifiedOrderId !== 'undefined' && verifiedOrderId !== 'null' && verifiedOrderId.trim() !== '') {
                navigate(`/customer/orders/${verifiedOrderId}`);
              } else {
                navigate("/customer/orders");
              }
            }, 3000);
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
  }, [searchParams, navigate]);

  const handleViewOrder = () => {
    if (orderId && orderId !== 'undefined' && orderId !== 'null' && orderId.trim() !== '') {
      navigate(`/customer/orders/${orderId}`);
    } else {
      navigate("/customer/orders");
    }
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
          ) : paymentStatus === "paid" ? (
            <>
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <FiCheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-charcoal-grey mb-4">
                Payment Successful!
              </h2>
              <p className="text-charcoal-grey/60 mb-6">
                Your order has been confirmed and payment has been received.
                {transactionId && (
                  <span className="block mt-2 text-sm text-charcoal-grey/50">
                    Transaction ID: {transactionId}
                  </span>
                )}
                {orderId && (
                  <span className="block mt-1 text-sm text-charcoal-grey/50">
                    Order ID: {orderId}
                  </span>
                )}
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="primary" size="md" onClick={handleViewOrder}>
                  View Order
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => navigate("/menu")}
                >
                  Continue Shopping
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


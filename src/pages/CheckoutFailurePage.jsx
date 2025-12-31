import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiXCircle, FiAlertCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import Button from "../ui/buttons/Button";

const CheckoutFailurePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(null);
  const [transactionId, setTransactionId] = useState(null);

  useEffect(() => {
    // Get parameters from URL (backend redirects with these after eSewa payment failure)
    // Backend GET /payments/esewa/failure redirects with: oid, orderId
    const oid = searchParams.get("oid"); // transactionId
    const orderIdParam = searchParams.get("orderId"); // Order ID from backend

    if (oid) {
      setTransactionId(oid);
    }
    if (orderIdParam) {
      setOrderId(orderIdParam);
    }

    toast.error("Payment was not completed. Please try again.");
  }, [searchParams]);

  const handleRetryPayment = () => {
    if (orderId && orderId !== 'undefined' && orderId !== 'null' && orderId.trim() !== '') {
      // Navigate back to checkout or order page to retry payment
      navigate(`/customer/orders/${orderId}`);
    } else {
      navigate("/checkout");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-grey/3 via-white to-golden-amber/5 py-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-charcoal-grey/10 p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <FiXCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-charcoal-grey mb-4">
            Payment Failed
          </h2>
          <p className="text-charcoal-grey/60 mb-6">
            Your payment could not be processed. This could be due to:
          </p>
          <ul className="text-left text-charcoal-grey/70 mb-6 space-y-2 max-w-md mx-auto">
            <li className="flex items-start gap-2">
              <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>Insufficient balance in your eSewa account</span>
            </li>
            <li className="flex items-start gap-2">
              <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>Payment was cancelled</span>
            </li>
            <li className="flex items-start gap-2">
              <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>Network or technical error</span>
            </li>
          </ul>
          {transactionId && (
            <p className="text-sm text-charcoal-grey/50 mb-6">
              Transaction ID: {transactionId}
            </p>
          )}
          <div className="flex gap-4 justify-center">
            <Button variant="primary" size="md" onClick={handleRetryPayment}>
              Try Again
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate("/cart")}
            >
              Back to Cart
            </Button>
          </div>
          <div className="mt-6 p-4 rounded-xl bg-charcoal-grey/5 border border-charcoal-grey/10">
            <p className="text-sm text-charcoal-grey/70">
              Need help? Contact our support team or check your order status in
              your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFailurePage;


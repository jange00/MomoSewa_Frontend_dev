import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";
import { verifyEsewaPayment } from "../services/paymentService";

const PaymentVerifyPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get parameters from URL
        const status = searchParams.get("status");
        const oid = searchParams.get("oid"); // Order ID
        const amt = searchParams.get("amt"); // Amount
        const refId = searchParams.get("refId"); // eSewa reference ID
        const signature = searchParams.get("signature"); // Optional signature
        const data = searchParams.get("data"); // Failure data if failed

        // Check if payment failed
        if (status === "failure" || data || (!oid || !amt || !refId)) {
          const failureData = data || "Payment failed";
          navigate("/checkout/failure", {
            state: {
              error: failureData,
              orderId: oid,
            },
          });
          return;
        }

        // Verify payment with backend
        const response = await verifyEsewaPayment(oid, parseFloat(amt), refId, signature);

        if (response.success) {
          // Payment successful
          navigate("/checkout/success", {
            state: {
              order: response.data?.order,
              message: "Payment verified successfully",
            },
          });
        } else {
          // Verification failed
          navigate("/checkout/failure", {
            state: {
              error: response.message || "Payment verification failed",
              orderId: oid,
            },
          });
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setError(error.message || "Failed to verify payment");
        // Navigate to failed page
        navigate("/checkout/failure", {
          state: {
            error: error.message || "Failed to verify payment",
          },
        });
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-grey/3 via-white to-golden-amber/5 py-20 flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-charcoal-grey/10 p-8 text-center max-w-md w-full mx-4">
        {verifying ? (
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
        ) : error ? (
          <>
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <FiLoader className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-charcoal-grey mb-4">
              Verification Error
            </h2>
            <p className="text-charcoal-grey/60">{error}</p>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default PaymentVerifyPage;


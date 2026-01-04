import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/**
 * PaymentVerifyPage
 * Redirects to CheckoutSuccessPage with payment verification parameters
 * This page handles payment verification redirects from payment gateways
 */
const PaymentVerifyPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Get all search params and pass them to CheckoutSuccessPage
    const params = Object.fromEntries(searchParams.entries());
    
    // Redirect to checkout success page with the payment parameters
    navigate("/checkout/success", {
      state: {
        paymentParams: params,
      },
      replace: true,
    });
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-grey/3 via-white to-golden-amber/5 py-20 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon"></div>
    </div>
  );
};

export default PaymentVerifyPage;

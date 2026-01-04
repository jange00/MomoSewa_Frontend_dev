import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiLoader } from "react-icons/fi";
import * as paymentService from "../services/paymentService";
import toast from "react-hot-toast";

/**
 * PaymentVerifyPage
 * Handles payment gateway redirects from eSewa
 * Extracts payment parameters and verifies payment, then redirects to success page
 */
const PaymentVerifyPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Extract payment parameters from URL (eSewa redirects with these)
    const status = searchParams.get('status'); // 'success' or 'failure'
    const orderId = searchParams.get('oid'); // eSewa sends orderId as 'oid' in redirect
    const amount = searchParams.get('amt'); // Amount
    const refId = searchParams.get('refId'); // eSewa reference ID
    
    console.log('📥 Payment verification page - Parameters received:', {
      status,
      orderId,
      amount,
      refId,
    });
    
    // Handle payment failure
    if (status === 'failure') {
      console.error('❌ Payment failed according to eSewa');
      toast.error('Payment was cancelled or failed. Please try again.');
      navigate('/checkout/success', {
        state: {
          paymentStatus: 'error',
          paymentError: true,
        },
        replace: true,
      });
      return;
    }
    
    // Verify payment if we have required parameters
    if (status === 'success' && orderId && refId && amount) {
      const verifyPayment = async () => {
        try {
          console.log('🔄 Verifying eSewa payment...', { orderId, amount, refId });
          
          // Call backend to verify payment
          const result = await paymentService.verifyEsewaPayment(
            orderId,
            amount,
            refId
          );
          
          if (result?.success) {
            const verifiedOrder = result.data?.order || null;
            const paymentStatus = result.data?.paymentStatus || result.data?.order?.paymentStatus;
            
            console.log('✅ Payment verified successfully');
            
            // Navigate to success page with verified order data
            navigate('/checkout/success', {
              state: {
                order: verifiedOrder,
                orderId: orderId,
                paymentStatus: paymentStatus === 'paid' || paymentStatus === 'success' ? 'success' : 'error',
                isFromPaymentGateway: true,
                transactionId: refId,
              },
              replace: true,
            });
          } else {
            throw new Error(result?.message || 'Payment verification failed');
          }
        } catch (error) {
          console.error('❌ Payment verification error:', error);
          toast.error(error.response?.data?.message || error.message || 'Failed to verify payment');
          
          // Navigate to success page with error
          navigate('/checkout/success', {
            state: {
              orderId: orderId,
              paymentStatus: 'error',
              paymentError: true,
              isFromPaymentGateway: true,
            },
            replace: true,
          });
        }
      };
      
      verifyPayment();
    } else {
      // Missing required parameters
      console.error('❌ Missing required payment parameters');
      toast.error('Invalid payment response. Missing required parameters.');
      navigate('/checkout/success', {
        state: {
          paymentStatus: 'error',
          paymentError: true,
        },
        replace: true,
      });
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-grey/3 via-white to-golden-amber/5 py-20 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-golden-amber/10 flex items-center justify-center mx-auto mb-6">
          <FiLoader className="w-10 h-10 text-golden-amber animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-charcoal-grey mb-4">
          Processing Payment...
        </h2>
        <p className="text-charcoal-grey/60">
          Please wait while we verify your payment and redirect you.
        </p>
      </div>
    </div>
  );
};

export default PaymentVerifyPage;

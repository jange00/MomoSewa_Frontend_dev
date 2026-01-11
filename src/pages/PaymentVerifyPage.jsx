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
    // Extract payment parameters
    const data = searchParams.get('data'); // V2: Base64 encoded JSON
    
    // Legacy V1 parameters
    const status = searchParams.get('status');
    const orderId = searchParams.get('oid');
    const amount = searchParams.get('amt');
    const refId = searchParams.get('refId');
    
    console.log('📥 Payment verification page loaded');
    
    // --- V2 Handler ---
    if (data) {
      console.log('🔍 Detected V2 Response (Data Param)');
      
      const verifyV2 = async () => {
        try {
          // Decode for logging/local state (Backend will verify signature)
          let decoded = {};
          try {
            decoded = JSON.parse(atob(data));
            console.log('📄 Decoded V2 Data:', decoded);
          } catch (e) {
            console.error('Failed to decode data locally:', e);
          }
          
          const v2Status = decoded.status;
          const v2OrderId = decoded.transaction_uuid; // This maps to esewaTransactionId in DB
          
          if (v2Status !== 'COMPLETE') {
             throw new Error('Payment status is not COMPLETE');
          }

          console.log('🔄 Verifying eSewa V2 payment...');
          // Pass data string to service
          const result = await paymentService.verifyEsewaPayment(null, null, null, null, data);
          
          if (result?.success) {
            console.log('✅ Payment verified successfully');
            navigate('/checkout/success', {
              state: {
                order: result.data?.order,
                orderId: result.data?.order?.orderId || v2OrderId,
                paymentStatus: 'success',
                isFromPaymentGateway: true,
                transactionId: decoded.transaction_code,
              },
              replace: true,
            });
          } else {
            throw new Error(result?.message || 'Verification failed');
          }
        } catch (error) {
          console.error('❌ Payment verification error:', error);
          toast.error(error.response?.data?.message || error.message || 'Failed to verify payment');
          navigate('/checkout/success', {
            state: {
              paymentStatus: 'error',
              paymentError: true,
              isFromPaymentGateway: true,
            },
            replace: true,
          });
        }
      };
      verifyV2();
      return;
    }

    // --- Legacy V1 Handler ---
    console.log('🔍 Checking for Legacy V1 Params:', { status, orderId });
    
    // Handle payment failure (V1)
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
    
    // Verify payment (V1)
    if (status === 'success' && orderId && refId && amount) {
      const verifyPayment = async () => {
        try {
          console.log('🔄 Verifying eSewa V1 payment...', { orderId, amount, refId });
          const result = await paymentService.verifyEsewaPayment(orderId, amount, refId);
          
          if (result?.success) {
            navigate('/checkout/success', {
              state: {
                order: result.data?.order,
                orderId: orderId,
                paymentStatus: 'success',
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
      // Missing parameters
      console.error('❌ Missing required payment parameters (V1 or V2)');
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

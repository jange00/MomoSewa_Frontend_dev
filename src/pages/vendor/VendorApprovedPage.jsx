import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { FiCheckCircle, FiLogIn, FiMail, FiHome, FiArrowRight } from "react-icons/fi";
import Card from "../../ui/cards/Card";
import Button from "../../ui/buttons/Button";
import Logo from "../../common/Logo";
import { useAuth } from "../../hooks/useAuth";
import { USER_ROLES } from "../../common/roleConstants";

const VendorApprovedPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const email = searchParams.get('email') || user?.email;

  // If user is already logged in and is a vendor, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role === USER_ROLES.VENDOR) {
      const vendorStatus = user?.status || user?.vendorStatus || user?.approvalStatus;
      if (vendorStatus === "active" || vendorStatus === "approved") {
        // User is already logged in and approved, redirect to dashboard
        navigate("/vendor/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-charcoal-grey/3 via-white to-golden-amber/5 p-4">
      <Card className="max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="default" />
          </div>
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-black text-charcoal-grey mb-2">
            Account Approved! 🎉
          </h1>
          <p className="text-charcoal-grey/70">
            Your vendor account has been approved by our admin team.
          </p>
        </div>

        <div className="space-y-6">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h2 className="font-bold text-charcoal-grey mb-3 flex items-center gap-2">
              <FiCheckCircle className="w-5 h-5 text-green-600" />
              Congratulations!
            </h2>
            <p className="text-sm text-green-800 mb-3">
              Your vendor application has been reviewed and approved. You can now log in to access your vendor dashboard and start managing your business on MomoSewa.
            </p>
            {email && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-xs text-green-700">
                  <strong>Account Email:</strong> {email}
                </p>
              </div>
            )}
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h2 className="font-bold text-charcoal-grey mb-3 flex items-center gap-2">
              <FiLogIn className="w-5 h-5 text-blue-600" />
              What's Next?
            </h2>
            <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
              <li>Log in to your vendor account using your registered email and password</li>
              <li>Complete your vendor profile setup</li>
              <li>Add your products and start receiving orders</li>
              <li>Manage your orders, inventory, and analytics from your dashboard</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            {!isAuthenticated ? (
              <>
                <Link to={`/login?approved=true${email ? `&email=${encodeURIComponent(email)}` : ''}`}>
                  <Button variant="primary" size="md" className="w-full sm:w-auto">
                    <FiLogIn className="w-4 h-4 mr-2" />
                    Log In to Your Account
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="ghost" size="md" className="w-full sm:w-auto">
                    <FiHome className="w-4 h-4 mr-2" />
                    Return to Home
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/vendor/dashboard">
                <Button variant="primary" size="md" className="w-full sm:w-auto">
                  Go to Dashboard
                  <FiArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>

          {/* Help Text */}
          <div className="text-center pt-4 border-t border-charcoal-grey/10">
            <p className="text-sm text-charcoal-grey/60 mb-2">
              Forgot your password?{" "}
              <Link to="/forgot-password" className="text-deep-maroon hover:underline font-semibold">
                Reset it here
              </Link>
            </p>
            <p className="text-sm text-charcoal-grey/60">
              Need help? Contact our support team at{" "}
              <a href="mailto:support@momosewa.com" className="text-deep-maroon hover:underline">
                support@momosewa.com
              </a>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VendorApprovedPage;

import { Link } from "react-router-dom";
import { FiCheckCircle, FiMail, FiClock, FiLogIn } from "react-icons/fi";
import Card from "../../ui/cards/Card";
import Button from "../../ui/buttons/Button";
import Logo from "../../common/Logo";

const VendorApplicationSubmittedPage = () => {
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
            Application Submitted Successfully!
          </h1>
          <p className="text-charcoal-grey/70">
            Your vendor application has been received and is awaiting admin review.
          </p>
        </div>

        <div className="space-y-6">
          {/* Information Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h2 className="font-bold text-charcoal-grey mb-3 flex items-center gap-2">
              <FiMail className="w-5 h-5 text-blue-600" />
              What happens next?
            </h2>
            <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
              <li>Our admin team will review your application</li>
              <li>You'll receive an email notification once your application is reviewed</li>
              <li>Once approved, you'll be able to log in and access your vendor dashboard</li>
              <li>This process typically takes 24-48 hours</li>
            </ul>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <FiClock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-charcoal-grey mb-2">Important Notice</h3>
                <p className="text-sm text-yellow-800">
                  Your account has been created but is <strong>not yet active</strong>. 
                  You will <strong>not be able to log in</strong> until an admin approves your application. 
                  Please wait for the approval email before attempting to log in.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link to="/login">
              <Button variant="primary" size="md">
                <FiLogIn className="w-4 h-4 mr-2" />
                Go to Login Page
              </Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="md">
                Return to Home
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <div className="text-center pt-4 border-t border-charcoal-grey/10">
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

export default VendorApplicationSubmittedPage;

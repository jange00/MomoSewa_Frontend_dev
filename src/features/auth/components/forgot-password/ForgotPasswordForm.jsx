import { Link } from "react-router-dom";
import { FiMail, FiPhone, FiArrowLeft } from "react-icons/fi";
import { IMAGE_PATHS } from "../../../../common/imageConstant";
import Input from "../../../../ui/inputs/Input";
import Button from "../../../../ui/buttons/Button";

const ForgotPasswordForm = ({ formData, errors, isLoading, isSuccess, handleChange, handleSubmit }) => {
  // Determine if input is email or phone
  const isEmail = formData.emailOrPhone.includes("@");
  const InputIcon = isEmail ? FiMail : FiPhone;

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center p-6 lg:p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Success Message */}
          <div className="bg-white rounded-xl border border-charcoal-grey/10 p-6 lg:p-8 shadow-sm">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-deep-maroon to-[#7a2533] rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl lg:text-3xl font-black text-charcoal-grey mb-3">
                Check Your Inbox
              </h2>
              <p className="text-charcoal-grey/70 text-sm mb-6 leading-relaxed">
                We've sent a password reset link to <span className="font-semibold text-deep-maroon">{formData.emailOrPhone}</span>. 
                Please check your email or phone messages and follow the instructions to reset your password.
              </p>

              <div className="bg-golden-amber/10 border border-golden-amber/20 rounded-xl p-4 mb-6">
                <p className="text-xs text-charcoal-grey/70">
                  <span className="font-semibold text-charcoal-grey">Didn't receive the email?</span> 
                  <br />Check your spam folder or try again in a few minutes.
                </p>
              </div>

              {/* Back to Login Button */}
              <Button
                to="/login"
                variant="primary"
                size="lg"
                className="w-full mb-4"
              >
                <FiArrowLeft className="w-5 h-5" />
                Back to Login
              </Button>

              {/* Resend Link */}
              <button
                onClick={handleSubmit}
                className="text-sm font-semibold text-deep-maroon hover:text-golden-amber transition-colors duration-200"
              >
                Resend Reset Link
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-6 lg:p-8 bg-white">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4 lg:hidden">
            <img 
              src={IMAGE_PATHS.LOGO} 
              alt="MomoSewa Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-charcoal-grey mb-2">
            Forgot Password?
          </h1>
          <p className="text-charcoal-grey/70 text-sm">
            Enter your email or phone number to receive a reset link
          </p>
        </div>

        {/* Forgot Password Form */}
        <div className="bg-white rounded-xl border border-charcoal-grey/10 p-6 lg:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email/Phone Input */}
            <Input
              label="Email or Phone"
              type="text"
              name="emailOrPhone"
              placeholder="Enter your email or phone number"
              value={formData.emailOrPhone}
              onChange={handleChange}
              error={errors.emailOrPhone}
              icon={InputIcon}
              required
            />

            {/* Info Box */}
            <div className="bg-charcoal-grey/5 border border-charcoal-grey/10 rounded-xl p-4">
              <p className="text-xs text-charcoal-grey/70 leading-relaxed">
                <span className="font-semibold text-charcoal-grey">Note:</span> We'll send you a secure link to reset your password. 
                Make sure you have access to this email or phone number.
              </p>
            </div>

            {/* Reset Password Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
            </Button>

            {/* Back to Login Link */}
            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-deep-maroon hover:text-golden-amber transition-colors duration-200"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-charcoal-grey/50 mt-6">
          Need help?{" "}
          <Link to="/support" className="text-deep-maroon hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;


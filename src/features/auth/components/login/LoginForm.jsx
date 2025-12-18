import { Link } from "react-router-dom";
import { FiMail, FiLock, FiPhone } from "react-icons/fi";
import { IMAGE_PATHS } from "../../../../common/imageConstant";
import Input from "../../../../ui/inputs/Input";
import Checkbox from "../../../../ui/inputs/Checkbox";
import Button from "../../../../ui/buttons/Button";

const LoginForm = ({ formData, errors, isLoading, handleChange, handleSubmit, handleGoogleLogin }) => {
  // Determine if input is email or phone
  const isEmail = formData.emailOrPhone.includes("@");
  const InputIcon = isEmail ? FiMail : FiPhone;

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
            Welcome Back
          </h1>
          <p className="text-charcoal-grey/70 text-sm">
            Sign in to your MomoSewa account (Customer, Vendor, or Admin)
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl border border-charcoal-grey/10 p-6 lg:p-8 shadow-sm">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSubmit(e);
            }} 
            className="space-y-5"
            noValidate
          >
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

            {/* Password Input */}
            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={FiLock}
              required
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <Checkbox
                label="Remember Me"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-deep-maroon hover:text-golden-amber transition-colors duration-200"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-charcoal-grey/15"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-charcoal-grey/60 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={() => handleGoogleLogin()}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-charcoal-grey/20 rounded-xl bg-white hover:bg-charcoal-grey/5 hover:border-golden-amber/40 transition-all duration-300 group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm font-semibold text-charcoal-grey group-hover:text-deep-maroon transition-colors">
                Continue with Google
              </span>
            </button>

            {/* Sign Up Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-charcoal-grey/70">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-deep-maroon hover:text-golden-amber transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-charcoal-grey/50 mt-6">
          By signing in, you agree to our{" "}
          <Link to="/terms" className="text-deep-maroon hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-deep-maroon hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;


import { Link } from "react-router-dom";
import { FiMail, FiLock, FiPhone, FiUser } from "react-icons/fi";
import Logo from "../../../../common/Logo";
import Input from "../../../../ui/inputs/Input";
import Button from "../../../../ui/buttons/Button";

const SignupForm = ({ 
  formData, 
  errors, 
  isLoading, 
  handleChange, 
  handleSubmit, 
  handleGoogleSignup
}) => {
  return (
    <div className="flex items-center justify-center p-3 lg:p-4 bg-white">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-3">
          <div className="flex justify-center mb-2 lg:hidden">
            <Logo size="default" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-charcoal-grey mb-1.5">
            Create Account
          </h1>
          <p className="text-charcoal-grey/70 text-sm">
            Sign up to start your momo journey
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-xl border border-charcoal-grey/10 p-3 lg:p-4 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name Input */}
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              icon={FiUser}
              required
              name="name"
            />

            {/* Email Input */}
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={FiMail}
              required
              name="email"
            />

            {/* Phone Input */}
            <Input
              label="Phone Number"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              icon={FiPhone}
              required
              name="phone"
            />

            {/* Password Input */}
            <Input
              label="Password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={FiLock}
              required
              name="password"
            />

            {/* Confirm Password Input */}
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              icon={FiLock}
              required
              name="confirmPassword"
            />

            {/* Signup Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            {/* Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-charcoal-grey/15"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-charcoal-grey/60 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Signup Button */}
            <button
              type="button"
              onClick={() => handleGoogleSignup()}
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

            {/* Sign In Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-charcoal-grey/70">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-deep-maroon hover:text-golden-amber transition-colors duration-200"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-charcoal-grey/50 mt-3">
          By signing up, you agree to our{" "}
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

export default SignupForm;


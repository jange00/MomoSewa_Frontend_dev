import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ForgotPasswordPromo from "../features/auth/components/forgot-password/ForgotPasswordPromo";
import ForgotPasswordForm from "../features/auth/components/forgot-password/ForgotPasswordForm";
import Footer from "../features/landing/components/Footer";
import { useAuth } from "../hooks/useAuth";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const [formData, setFormData] = useState({
    emailOrPhone: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.emailOrPhone.trim()) {
      newErrors.emailOrPhone = "Email or Phone is required";
    } else if (
      !/^[\w\.-]+@[\w\.-]+\.\w+$/.test(formData.emailOrPhone) &&
      !/^\+?[\d\s-()]{10,}$/.test(formData.emailOrPhone)
    ) {
      newErrors.emailOrPhone = "Please enter a valid email or phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Determine if input is email or phone
      const isEmail = /^[\w\.-]+@[\w\.-]+\.\w+$/.test(formData.emailOrPhone);
      const requestData = isEmail
        ? { email: formData.emailOrPhone }
        : { phone: formData.emailOrPhone };

      // Call the real API
      await forgotPassword(requestData);
      setIsSuccess(true);
    } catch (error) {
      // Error is already handled by useAuth hook (toast shown)
      console.error("Forgot password error:", error);
      // Set field-specific errors if available
      if (error.details) {
        setErrors(error.details);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-grey/5 via-white to-golden-amber/5 flex flex-col relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-deep-maroon/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-golden-amber/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Compact Professional Container */}
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-0 bg-white rounded-2xl shadow-xl overflow-hidden border border-charcoal-grey/10">
            {/* Left Section - Promotional */}
            <ForgotPasswordPromo />

            {/* Right Section - Forgot Password Form */}
            <ForgotPasswordForm
              formData={formData}
              errors={errors}
              isLoading={isLoading}
              isSuccess={isSuccess}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>

      {/* Footer Below */}
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;


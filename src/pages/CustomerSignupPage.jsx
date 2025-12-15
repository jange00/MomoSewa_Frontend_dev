import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import CustomerSignupPromo from "../features/auth/components/signup/CustomerSignupPromo";
import CustomerSignupForm from "../features/auth/components/signup/CustomerSignupForm";
import Footer from "../features/landing/components/Footer";
import { USER_ROLES, ROLE_DASHBOARD_ROUTES } from "../common/roleConstants";

const CustomerSignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: USER_ROLES.CUSTOMER,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[\w\.-]+@[\w\.-]+\.\w+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
    
    // Simulate API call
    setTimeout(() => {
      console.log("Customer signup attempt:", formData);
      // Save user data to localStorage (in real app, this would come from API response)
      localStorage.setItem("role", USER_ROLES.CUSTOMER);
      localStorage.setItem("name", formData.name);
      localStorage.setItem("email", formData.email);
      setIsLoading(false);
      // Navigate to landing page (navbar will show user menu)
      navigate("/");
    }, 1000);
  };

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log("Google customer signup success:", tokenResponse);
      // In real app, send token to backend with role and get user data
      localStorage.setItem("role", USER_ROLES.CUSTOMER);
      // In real app, name and email would come from Google API response
      // For now, use a default name if available
      // Navigate to landing page (navbar will show user menu)
      navigate("/");
    },
    onError: () => {
      console.error("Google signup failed");
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-grey/5 via-white to-golden-amber/5 flex flex-col relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-deep-maroon/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-golden-amber/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center py-3 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Compact Professional Container */}
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-0 bg-white rounded-2xl shadow-xl overflow-hidden border border-charcoal-grey/10">
            {/* Left Section - Promotional */}
            <CustomerSignupPromo />

            {/* Right Section - Signup Form */}
            <CustomerSignupForm
              formData={formData}
              errors={errors}
              isLoading={isLoading}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              handleGoogleSignup={handleGoogleSignup}
            />
          </div>
        </div>
      </div>

      {/* Footer Below */}
      <Footer />
    </div>
  );
};

export default CustomerSignupPage;


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import AdminSignupPromo from "../features/auth/components/signup/AdminSignupPromo";
import AdminSignupForm from "../features/auth/components/signup/AdminSignupForm";
import Footer from "../features/landing/components/Footer";
import { USER_ROLES, ROLE_DASHBOARD_ROUTES } from "../common/roleConstants";

const AdminSignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    adminCode: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: USER_ROLES.ADMIN,
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

    // Admin code validation
    if (!formData.adminCode.trim()) {
      newErrors.adminCode = "Admin code is required";
    } else if (formData.adminCode.trim().length < 6) {
      newErrors.adminCode = "Admin code must be at least 6 characters";
    }

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
    } else if (formData.password.length < 8) {
      newErrors.password = "Admin password must be at least 8 characters";
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
    
    // Simulate API call with admin code verification
    // In real app, backend will verify admin code
    setTimeout(() => {
      console.log("Admin signup attempt:", {
        ...formData,
        adminCode: "***HIDDEN***" // Don't log the actual admin code
      });
      
      // In real app, API will verify admin code and return success/error
      // For now, we'll simulate successful signup
      // Save role to localStorage (in real app, this would come from API response)
      localStorage.setItem("role", USER_ROLES.ADMIN);
      setIsLoading(false);
      
      // Navigate to admin dashboard after successful signup
      navigate("/login"); // Or navigate to ROLE_DASHBOARD_ROUTES[USER_ROLES.ADMIN]
    }, 1500);
  };

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log("Google admin signup success:", tokenResponse);
      // In real app, send token to backend with role and admin code
      // Backend will verify admin code before creating admin account
      localStorage.setItem("role", USER_ROLES.ADMIN);
      // Navigate to admin dashboard
      navigate(ROLE_DASHBOARD_ROUTES[USER_ROLES.ADMIN]);
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
            <AdminSignupPromo />

            {/* Right Section - Admin Signup Form */}
            <AdminSignupForm
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

export default AdminSignupPage;


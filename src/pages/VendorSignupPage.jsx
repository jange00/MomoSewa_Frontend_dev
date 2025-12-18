import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import VendorSignupPromo from "../features/auth/components/signup/VendorSignupPromo";
import VendorSignupForm from "../features/auth/components/signup/VendorSignupForm";
import Footer from "../features/landing/components/Footer";
import { USER_ROLES } from "../common/roleConstants";
import { useAuth } from "../hooks/useAuth";

const VendorSignupPage = () => {
  const navigate = useNavigate();
  const { register, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    businessAddress: "",
    businessLicense: "",
    storeName: "",
    password: "",
    confirmPassword: "",
    role: USER_ROLES.VENDOR,
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

    if (!formData.businessName?.trim()) {
      newErrors.businessName = "Business name is required";
    } else if (formData.businessName.trim().length < 2) {
      newErrors.businessName = "Business name must be at least 2 characters";
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

    if (!formData.businessAddress?.trim()) {
      newErrors.businessAddress = "Business address is required";
    }

    // Business license is optional but if provided, should be valid
    if (formData.businessLicense && formData.businessLicense.trim().length < 3) {
      newErrors.businessLicense = "Business license must be at least 3 characters if provided";
    }

    // Store name is required - use businessName as fallback if not provided
    if (!formData.storeName?.trim() && !formData.businessName?.trim()) {
      newErrors.storeName = "Store name is required";
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
    
    try {
      // Prepare registration data (remove confirmPassword, add vendor-specific fields)
      const { confirmPassword, ...registrationData } = formData;
      
      // Ensure storeName is set (use businessName if not provided)
      if (!registrationData.storeName || !registrationData.storeName.trim()) {
        registrationData.storeName = registrationData.businessName;
      }
      
      // Remove businessLicense if it's empty (optional field)
      if (!registrationData.businessLicense || !registrationData.businessLicense.trim()) {
        delete registrationData.businessLicense;
      }
      
      // Ensure role is set to Vendor
      registrationData.role = USER_ROLES.VENDOR;
      
      console.log('Registration data being sent:', registrationData);
      
      // Call the real API
      const result = await register(registrationData);
      
      if (result && result.success) {
        // Check if vendor requires approval (not auto-logged in)
        if (result.requiresApproval) {
          // Vendor application submitted but not approved yet
          // User is NOT logged in - they need to wait for admin approval
          // Redirect to a waiting page (not the pending approval page since they're not logged in)
          setTimeout(() => {
            navigate("/vendor/application-submitted", { replace: true });
          }, 100);
          return;
        }
        
        // If vendor is already approved (unlikely but possible), go to dashboard
        const user = result.data?.user;
        const vendorStatus = user?.status || user?.vendorStatus || user?.approvalStatus || "pending";
        
        if (vendorStatus === "active" || vendorStatus === "approved") {
          toast.success("Registration successful! Welcome to your vendor dashboard.");
          setTimeout(() => {
            navigate("/vendor/dashboard", { replace: true });
          }, 100);
        } else {
          // Fallback: if somehow we got here without requiresApproval, still redirect to application-submitted
          toast.success("Your vendor application has been submitted successfully!");
          toast.info("Please wait for admin approval. You'll be able to log in once your application is approved.");
          setTimeout(() => {
            navigate("/vendor/application-submitted", { replace: true });
          }, 100);
        }
      } else {
        // Registration failed - error is already shown by useAuth hook
        console.error('Registration failed:', result);
      }
    } catch (error) {
      // Error is already handled by useAuth hook (toast shown)
      console.error("Registration error:", error);
      
      // Set field-specific errors if available
      // handleApiError returns an object with details, not throws
      if (error.details && typeof error.details === 'object') {
        // Handle validation errors from API
        const fieldErrors = {};
        Object.keys(error.details).forEach(key => {
          // Convert API field names to form field names if needed
          const formFieldName = key.toLowerCase();
          if (formData.hasOwnProperty(formFieldName)) {
            fieldErrors[formFieldName] = error.details[key];
          } else {
            fieldErrors[key] = error.details[key];
          }
        });
        setErrors(fieldErrors);
      } else if (error.response?.data?.details) {
        // Handle API validation errors from axios response
        const apiErrors = error.response.data.details;
        if (typeof apiErrors === 'object') {
          setErrors(apiErrors);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
      console.log("Google vendor signup success:", tokenResponse);
      
        // In real app, send token to backend to get user details
        // For now, we'll need additional info for vendor signup
        // This is a simplified version - in production, you'd get user info from Google
        toast.info("Please complete your vendor profile information");
        
        // For Google signup, we still need business details
        // In production, you might redirect to a form to collect business info
        // For now, show a message that they need to complete the form
        toast.error("Please use the form to provide your business details for vendor registration");
      } catch (error) {
        console.error("Google signup failed:", error);
        toast.error("Google signup failed. Please try again.");
      }
    },
    onError: () => {
      console.error("Google signup failed");
      toast.error("Google signup failed. Please try again.");
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
            <VendorSignupPromo />

            {/* Right Section - Signup Form */}
            <VendorSignupForm
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

export default VendorSignupPage;


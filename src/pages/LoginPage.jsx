import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useQueryClient } from "@tanstack/react-query";
import LoginPromo from "../features/auth/components/login/LoginPromo";
import LoginForm from "../features/auth/components/login/LoginForm";
import Footer from "../features/landing/components/Footer";
import { ROLE_DASHBOARD_ROUTES, USER_ROLES } from "../common/roleConstants";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { login, loading: authLoading, isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Check if vendor was just approved (from URL parameter)
  useEffect(() => {
    const approved = searchParams.get('approved');
    const email = searchParams.get('email');
    if (approved === 'true' && email) {
      // Pre-fill email if provided
      setFormData(prev => ({ ...prev, emailOrPhone: email }));
      toast.success("Your vendor account has been approved! Please log in to continue.");
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    // Prevent default form submission and page refresh
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Determine if input is email or phone
      const isEmail = /^[\w\.-]+@[\w\.-]+\.\w+$/.test(formData.emailOrPhone);
      const credentials = isEmail
        ? { email: formData.emailOrPhone, password: formData.password }
        : { phone: formData.emailOrPhone, password: formData.password };

      // Call the real API
      const result = await login(credentials);
      
      console.log('Login API result:', result);
      
      if (result && result.success) {
        // Invalidate all React Query cache to ensure fresh data after login
        queryClient.invalidateQueries();
        
        // Get user from API response (most reliable)
        const loggedInUser = result.data?.user;
        
        if (!loggedInUser) {
          console.error('No user data in login response');
          toast.error('Login successful but user data is missing. Please try again.');
          return;
        }
        
        // Normalize role (handle case variations from backend: "admin", "Admin", "ADMIN" all become "Admin")
        const normalizeRole = (role) => {
          if (!role) return null;
          return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
        };
        const userRole = normalizeRole(loggedInUser?.role);
        
        console.log('Login successful - Full user object:', loggedInUser);
        console.log('Login successful - Original role:', loggedInUser?.role);
        console.log('Login successful - Normalized role:', userRole);
        console.log('USER_ROLES.ADMIN:', USER_ROLES.ADMIN);
        console.log('Role match check:', userRole === USER_ROLES.ADMIN);
        
        // Check vendor approval status from API response
        // According to backend: Pending vendors are "Customer" role, approved vendors are "Vendor" role
        if (userRole === USER_ROLES.VENDOR) {
          // User is approved vendor - check if they should see the approval page
          const fromApproval = searchParams.get('approved') === 'true';
          const vendorEmail = loggedInUser?.email || formData.emailOrPhone;
          
          if (fromApproval || searchParams.get('showApproved') === 'true') {
            // Redirect to approved page with email
            navigate(`/vendor/approved?email=${encodeURIComponent(vendorEmail)}`);
            return;
          }
          // Otherwise, proceed to vendor dashboard
        } else if (userRole === USER_ROLES.CUSTOMER) {
          // Check if this customer has applied as vendor (pending approval)
          // We'll check this by trying to fetch vendor approval status
          // For now, let customers proceed normally - they can check vendor status separately
        }
        
        // Small delay to ensure state is updated before navigation
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Redirect based on role (userRole is already normalized above)
        // Check Admin first (most specific)
        if (userRole === USER_ROLES.ADMIN) {
          // Admin login - redirect to admin dashboard
          console.log('✅ Admin detected - Redirecting to admin dashboard');
          toast.success('Welcome, Admin!');
          navigate("/admin/dashboard", { replace: true });
          return;
        }
        
        // Check Customer - redirect to landing page (navbar will show user menu)
        if (userRole === USER_ROLES.CUSTOMER) {
          navigate("/", { replace: true });
          return;
        }
        
        // Check Vendor (should have been handled above, but fallback)
        if (userRole === USER_ROLES.VENDOR) {
          navigate("/vendor/dashboard", { replace: true });
          return;
        }
        
        // Try to use ROLE_DASHBOARD_ROUTES as fallback
        if (userRole && ROLE_DASHBOARD_ROUTES[userRole]) {
          console.log('Using ROLE_DASHBOARD_ROUTES for:', userRole);
          navigate(ROLE_DASHBOARD_ROUTES[userRole], { replace: true });
          return;
        }
        
        // Unknown role or no role - redirect to home
        console.warn('❌ Unknown role after login.');
        console.warn('   Original role from API:', loggedInUser?.role);
        console.warn('   Normalized role:', userRole);
        console.warn('   Available roles:', Object.values(USER_ROLES));
        console.warn('   USER_ROLES object:', USER_ROLES);
        toast.error(`Unknown user role: ${loggedInUser?.role || 'undefined'}. Please contact support.`);
        navigate("/", { replace: true });
      }
    } catch (error) {
      // Error is already handled by useAuth hook (toast shown)
      console.error("❌ Login error in LoginPage:", error);
      console.error("❌ Error message:", error.message);
      console.error("❌ Error details:", error.details);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error response data:", error.response?.data);
      console.error("❌ Error status:", error.status);
      
      // Show more specific error message
      let errorMessage = error.message || 'Login failed';
      
      // Check for specific error cases
      if (error.status === 401) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.status === 400) {
        errorMessage = error.message || 'Invalid request. Please check your input.';
      } else if (error.status === 404) {
        errorMessage = 'Login endpoint not found. Please check your API configuration.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (!error.response) {
        errorMessage = 'Network error. Please check your connection and ensure the backend server is running at http://localhost:5001';
      }
      
      // Show error toast if not already shown by useAuth
      if (errorMessage && errorMessage !== error.message) {
        toast.error(errorMessage);
      }
      
      // Set field-specific errors if available
      if (error.details) {
        setErrors(error.details);
      } else if (error.response?.data?.details) {
        // Handle API validation errors
        const apiErrors = error.response.data.details;
        if (typeof apiErrors === 'object') {
          setErrors(apiErrors);
        }
      }
      
      // Ensure we don't cause page refresh
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("Google login success:", tokenResponse);
      
      // TODO: In production, send token to backend to get user role
      // const response = await api.post('/auth/google', { token: tokenResponse.access_token });
      // const { user, token, role } = response.data;
      // localStorage.setItem('token', token);
      // localStorage.setItem('role', role);
      
      // Google login - TODO: Implement proper Google OAuth with backend
      // For now, show a message that Google login needs backend integration
      toast.info("Google login requires backend integration. Please use email/password login.");
      
      // For customers, stay on landing page (navbar will show user menu)
      // For other roles, redirect to their dashboard
      if (userRole === USER_ROLES.CUSTOMER) {
        navigate("/"); // Stay on landing page
      } else if (userRole && ROLE_DASHBOARD_ROUTES[userRole]) {
        navigate(ROLE_DASHBOARD_ROUTES[userRole]);
      } else {
        // No role found - might need to complete profile or select role
        navigate("/");
      }
    },
    onError: () => {
      console.error("Google login failed");
      // TODO: Show error toast/notification to user
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
      <div className="flex-1 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Compact Professional Container */}
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-0 bg-white rounded-2xl shadow-xl overflow-hidden border border-charcoal-grey/10">
            {/* Left Section - Promotional */}
            <LoginPromo />

            {/* Right Section - Login Form */}
            <LoginForm
              formData={formData}
              errors={errors}
              isLoading={isLoading}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              handleGoogleLogin={handleGoogleLogin}
            />
          </div>
        </div>
      </div>

      {/* Footer Below */}
      <Footer />
    </div>
  );
};

export default LoginPage;


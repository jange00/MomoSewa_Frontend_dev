import { Link } from "react-router-dom";
import { FiUser, FiShoppingBag } from "react-icons/fi";
import { USER_ROLES, ROLE_DESCRIPTIONS } from "../common/roleConstants";
import Logo from "../common/Logo";
import Footer from "../features/landing/components/Footer";

const RoleSelectionPage = () => {
  const roles = [
    {
      role: USER_ROLES.CUSTOMER,
      icon: FiUser,
      title: "Join as Customer",
      description: ROLE_DESCRIPTIONS[USER_ROLES.CUSTOMER],
      route: "/signup/customer",
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
    },
    {
      role: USER_ROLES.VENDOR,
      icon: FiShoppingBag,
      title: "Join as Vendor",
      description: ROLE_DESCRIPTIONS[USER_ROLES.VENDOR],
      route: "/signup/vendor",
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-grey/5 via-white to-golden-amber/5 flex flex-col relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-deep-maroon/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-golden-amber/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo size="large" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-charcoal-grey mb-3">
              Create Your Account
            </h1>
            <p className="text-lg text-charcoal-grey/70 max-w-2xl mx-auto">
              Choose how you'd like to join MomoSewa. Select your role to get started.
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-3xl mx-auto">
            {roles.map((roleOption) => {
              const Icon = roleOption.icon;
              return (
                <Link
                  key={roleOption.role}
                  to={roleOption.route}
                  className={`
                    group relative bg-white rounded-2xl border-2 border-charcoal-grey/10 
                    p-8 shadow-lg hover:shadow-2xl transition-all duration-300
                    hover:scale-[1.02] hover:border-deep-maroon/30
                  `}
                >
                  {/* Icon Circle */}
                  <div className={`
                    w-16 h-16 rounded-full bg-gradient-to-br ${roleOption.gradient}
                    flex items-center justify-center mb-6 mx-auto
                    group-hover:scale-110 transition-transform duration-300
                  `}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-black text-charcoal-grey mb-3 text-center">
                    {roleOption.title}
                  </h3>
                  <p className="text-sm text-charcoal-grey/70 text-center mb-6 leading-relaxed">
                    {roleOption.description}
                  </p>

                  {/* Arrow Indicator */}
                  <div className="flex items-center justify-center text-deep-maroon group-hover:text-golden-amber transition-colors duration-200">
                    <span className="text-sm font-semibold mr-2">Get Started</span>
                    <svg
                      className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-charcoal-grey/70 text-sm mb-2">
              Already have an account?
            </p>
            <Link
              to="/login"
              className="text-deep-maroon hover:text-golden-amber font-semibold transition-colors duration-200 inline-flex items-center gap-2"
            >
              Sign In
              <svg
                className="w-4 h-4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Below */}
      <Footer />
    </div>
  );
};

export default RoleSelectionPage;


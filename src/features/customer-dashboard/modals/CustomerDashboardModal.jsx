import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import CustomerDashboardPage from "../../../pages/customer/CustomerDashboardPage";
import CustomerOrdersPage from "../../../pages/customer/CustomerOrdersPage";
import CustomerAddressesPage from "../../../pages/customer/CustomerAddressesPage";
import CustomerReviewsPage from "../../../pages/customer/CustomerReviewsPage";
import CustomerNotificationsPage from "../../../pages/customer/CustomerNotificationsPage";
import CustomerProfilePage from "../../../pages/customer/CustomerProfilePage";

const PAGE_COMPONENTS = {
  "/customer/dashboard": CustomerDashboardPage,
  "/customer/orders": CustomerOrdersPage,
  "/customer/addresses": CustomerAddressesPage,
  "/customer/reviews": CustomerReviewsPage,
  "/customer/notifications": CustomerNotificationsPage,
  "/customer/profile": CustomerProfilePage,
};

const PAGE_TITLES = {
  "/customer/dashboard": "Dashboard",
  "/customer/orders": "My Orders",
  "/customer/addresses": "Addresses",
  "/customer/reviews": "My Reviews",
  "/customer/notifications": "Notifications",
  "/customer/profile": "Profile & Settings",
};

const CustomerDashboardModal = ({ isOpen, onClose, activePage }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !activePage) return null;

  const PageComponent = PAGE_COMPONENTS[activePage];
  const pageTitle = PAGE_TITLES[activePage];

  if (!PageComponent || !pageTitle) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container - Perfectly Centered */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <div 
          className="w-full max-w-7xl h-[90vh] max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col transform transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex-shrink-0 bg-white border-b border-charcoal-grey/10 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-charcoal-grey">{pageTitle}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-charcoal-grey/5 text-charcoal-grey/60 hover:text-charcoal-grey transition-all duration-200"
              aria-label="Close modal"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Content - Scrollable */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-charcoal-grey/3 via-white to-golden-amber/5">
            <PageComponent />
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerDashboardModal;


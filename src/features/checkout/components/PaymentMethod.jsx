import { useState } from "react";
import { FiCreditCard, FiSmartphone, FiShoppingBag, FiLock } from "react-icons/fi";

// eSewa logo from Wikimedia Commons
const ESEWA_LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/f/ff/Esewa_logo.webp";

// Khalti logo (base64 data URI)
const KHALTI_LOGO_URL = "data:image/png;base64,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";

// COD
const COD_LOGO = "data:image/png;base64,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"

// CREDIT/DEBIT
const CREDIT_DEBIT_CARD_LOGO = "https://e7.pngegg.com/pngimages/668/115/png-clipart-blue-and-yellow-visa-and-mastercard-illustration-credit-card-debit-card-computer-icons-credit-card-s-service-payment.png"

const PaymentMethod = ({ selectedMethod, onSelect }) => {
  const [logoErrors, setLogoErrors] = useState({});
  
  const handleLogoError = (methodId) => {
    setLogoErrors(prev => ({ ...prev, [methodId]: true }));
  };
  
  const paymentMethods = [
    {
      id: "esewa",
      name: "eSewa",
      icon: FiSmartphone,
      logo: ESEWA_LOGO_URL, // Use eSewa logo instead of icon
      description: "Pay with eSewa wallet",
      color: "from-orange-500 to-orange-600",
    },
    {
      id: "khalti",
      name: "Khalti",
      icon: FiSmartphone,
      logo: KHALTI_LOGO_URL, // Use Khalti logo instead of icon
      description: "Pay with Khalti wallet",
      color: "from-purple-500 to-purple-600",
    },
    {
      id: "cash-on-delivery",
      name: "Cash on Delivery",
      icon: FiShoppingBag,
      logo: COD_LOGO,
      description: "Pay when you receive",
      color: "from-green-500 to-green-600",
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: FiCreditCard,
       logo: CREDIT_DEBIT_CARD_LOGO,
      description: "Pay with card",
      color: "from-blue-500 to-blue-600",
    },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-charcoal-grey/10 p-6 space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-golden-amber/10 flex items-center justify-center">
          <FiLock className="w-5 h-5 text-golden-amber" />
        </div>
        <h3 className="text-xl font-bold text-charcoal-grey">Payment Method</h3>
      </div>

      <div className="space-y-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;
          const hasLogo = method.logo; // Check if method has a logo

          return (
            <button
              key={method.id}
              onClick={() => onSelect(method.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                isSelected
                  ? "border-deep-maroon bg-deep-maroon/5 shadow-lg"
                  : "border-charcoal-grey/10 hover:border-charcoal-grey/20 hover:bg-charcoal-grey/2"
              }`}
            >
              <div className="flex items-center gap-4">
                {hasLogo && !logoErrors[method.id] ? (
                  // Use logo image for eSewa and Khalti
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 border border-charcoal-grey/10 overflow-hidden p-1.5">
                    <img
                      src={method.logo}
                      alt={`${method.name} logo`}
                      className="w-full h-full object-contain"
                      onError={() => handleLogoError(method.id)}
                    />
                  </div>
                ) : (
                  // Use icon for other payment methods or fallback
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-charcoal-grey">{method.name}</h4>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-deep-maroon flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-charcoal-grey/60 mt-1">{method.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 p-4 rounded-xl bg-charcoal-grey/5 border border-charcoal-grey/10">
        <div className="flex items-start gap-3">
          <FiLock className="w-5 h-5 text-charcoal-grey/60 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-charcoal-grey mb-1">Secure Payment</p>
            <p className="text-xs text-charcoal-grey/60">
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;


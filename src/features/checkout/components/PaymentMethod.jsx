import { FiCreditCard, FiSmartphone, FiShoppingBag, FiLock } from "react-icons/fi";

const PaymentMethod = ({ selectedMethod, onSelect }) => {
  const paymentMethods = [
    {
      id: "esewa",
      name: "eSewa",
      icon: FiSmartphone,
      description: "Pay with eSewa wallet",
      color: "from-orange-500 to-orange-600",
    },
    {
      id: "khalti",
      name: "Khalti",
      icon: FiSmartphone,
      description: "Pay with Khalti wallet",
      color: "from-purple-500 to-purple-600",
    },
    {
      id: "cash",
      name: "Cash on Delivery",
      icon: FiShoppingBag,
      description: "Pay when you receive",
      color: "from-green-500 to-green-600",
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: FiCreditCard,
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
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
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


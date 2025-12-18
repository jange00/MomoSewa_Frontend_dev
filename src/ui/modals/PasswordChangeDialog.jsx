import { useEffect, useState } from "react";
import { FiLock, FiX, FiEye, FiEyeOff } from "react-icons/fi";
import Card from "../cards/Card";
import Button from "../buttons/Button";

const PasswordChangeDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm
}) => {
  const [formData, setFormData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Reset form when opened
      setFormData({ current: "", new: "", confirm: "" });
      setErrors({});
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.current) {
      newErrors.current = "Current password is required";
    }
    if (!formData.new) {
      newErrors.new = "New password is required";
    } else if (formData.new.length < 6) {
      newErrors.new = "Password must be at least 6 characters";
    }
    if (!formData.confirm) {
      newErrors.confirm = "Please confirm your new password";
    } else if (formData.new !== formData.confirm) {
      newErrors.confirm = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onConfirm(formData);
      setFormData({ current: "", new: "", confirm: "" });
      setErrors({});
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <Card
          className="w-full max-w-md p-6 pointer-events-auto transform transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-charcoal-grey mb-1">
                Change Password
              </h3>
              <p className="text-sm text-charcoal-grey/60">
                Enter your current and new password
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-charcoal-grey/5 text-charcoal-grey/60 hover:text-charcoal-grey transition-all duration-200"
              aria-label="Close"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-semibold text-charcoal-grey mb-2">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <FiLock className="w-5 h-5 text-charcoal-grey/35" />
                </div>
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={formData.current}
                  onChange={(e) => handleChange("current", e.target.value)}
                  placeholder="Enter current password"
                  className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-white text-sm ${
                    errors.current ? "border-red-300" : "border-charcoal-grey/12"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-charcoal-grey/40 hover:text-charcoal-grey"
                >
                  {showPasswords.current ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.current && (
                <p className="text-red-600 text-xs mt-1">{errors.current}</p>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-charcoal-grey mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <FiLock className="w-5 h-5 text-charcoal-grey/35" />
                </div>
                <input
                  type={showPasswords.new ? "text" : "password"}
                  value={formData.new}
                  onChange={(e) => handleChange("new", e.target.value)}
                  placeholder="Enter new password"
                  className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-white text-sm ${
                    errors.new ? "border-red-300" : "border-charcoal-grey/12"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-charcoal-grey/40 hover:text-charcoal-grey"
                >
                  {showPasswords.new ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.new && (
                <p className="text-red-600 text-xs mt-1">{errors.new}</p>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-charcoal-grey mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <FiLock className="w-5 h-5 text-charcoal-grey/35" />
                </div>
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={formData.confirm}
                  onChange={(e) => handleChange("confirm", e.target.value)}
                  placeholder="Confirm new password"
                  className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-white text-sm ${
                    errors.confirm ? "border-red-300" : "border-charcoal-grey/12"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-charcoal-grey/40 hover:text-charcoal-grey"
                >
                  {showPasswords.confirm ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirm && (
                <p className="text-red-600 text-xs mt-1">{errors.confirm}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6">
            <Button
              variant="ghost"
              size="md"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              className="flex-1"
            >
              Change Password
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
};

export default PasswordChangeDialog;




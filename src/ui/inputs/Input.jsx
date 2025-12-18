import { FiEye, FiEyeOff } from "react-icons/fi";
import { useState } from "react";

const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  className = "",
  required = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-charcoal-grey mb-2">
          {label}
          {required && <span className="text-deep-maroon ml-1">*</span>}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Icon className="w-5 h-5 text-charcoal-grey/40 group-focus-within:text-golden-amber transition-colors duration-300" />
          </div>
        )}
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`
            w-full px-4 ${Icon ? 'pl-12' : ''} ${isPassword ? 'pr-12' : ''} py-3.5
            border border-charcoal-grey/15 rounded-xl
            focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/40
            text-charcoal-grey bg-white/80 backdrop-blur-sm
            hover:bg-white hover:border-charcoal-grey/25
            transition-all duration-300
            placeholder:text-charcoal-grey/35
            text-sm font-medium
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/25' : ''}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-charcoal-grey/40 hover:text-golden-amber transition-colors duration-200"
          >
            {showPassword ? (
              <FiEyeOff className="w-5 h-5" />
            ) : (
              <FiEye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
};

export default Input;




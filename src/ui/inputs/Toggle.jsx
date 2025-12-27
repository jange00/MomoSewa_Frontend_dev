const Toggle = ({
  label,
  checked,
  onChange,
  name,
  className = "",
  disabled = false,
  ...props
}) => {
  const handleChange = (e) => {
    if (disabled) return;
    
    const syntheticEvent = {
      target: {
        name: name || "",
        type: "checkbox",
        checked: e.target.checked,
      },
    };
    onChange(syntheticEvent);
  };

  return (
    <label className={`flex items-center gap-3 cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked || false}
          onChange={handleChange}
          name={name}
          className="sr-only"
          disabled={disabled}
          {...props}
        />
        <div
          className={`
            w-11 h-6 rounded-full transition-all duration-300 ease-in-out
            ${checked 
              ? 'bg-gradient-to-r from-deep-maroon to-[#7a2533]' 
              : 'bg-charcoal-grey/25'
            }
            ${disabled ? '' : 'group-hover:shadow-md'}
          `}
        >
          <div
            className={`
              absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
              transition-all duration-300 ease-in-out
              shadow-sm
              ${checked ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </div>
      </div>
      {label && (
        <span className={`text-sm font-medium select-none ${checked ? 'text-charcoal-grey' : 'text-charcoal-grey/70'}`}>
          {label}
        </span>
      )}
    </label>
  );
};

export default Toggle;




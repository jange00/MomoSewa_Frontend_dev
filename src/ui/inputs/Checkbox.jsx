const Checkbox = ({
  label,
  checked,
  onChange,
  name,
  className = "",
  ...props
}) => {
  const handleChange = (e) => {
    // Ensure the event has the correct structure
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
    <label className={`flex items-center gap-3 cursor-pointer group ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked || false}
          onChange={handleChange}
          name={name}
          className="sr-only"
          {...props}
        />
        <div
          className={`
            w-5 h-5 rounded-md border-2 border-charcoal-grey/25
            transition-all duration-200
            flex items-center justify-center pointer-events-none
            ${checked 
              ? 'bg-gradient-to-br from-deep-maroon to-[#7a2533] border-deep-maroon' 
              : 'bg-white group-hover:border-golden-amber/40'
            }
          `}
        >
          {checked && (
            <svg
              className="w-3.5 h-3.5 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      {label && (
        <span className="text-sm font-medium text-charcoal-grey/80 select-none">
          {label}
        </span>
      )}
    </label>
  );
};

export default Checkbox;




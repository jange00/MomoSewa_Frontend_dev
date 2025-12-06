import { FiSearch } from "react-icons/fi";

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <div className="relative flex-1 max-w-2xl w-full">
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
        <FiSearch className="w-5 h-5 text-charcoal-grey/35" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-5 py-3 border border-charcoal-grey/12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-white shadow-sm hover:shadow-md focus:shadow-lg transition-all duration-300 placeholder:text-charcoal-grey/30 text-sm font-medium"
      />
    </div>
  );
};

export default SearchBar;



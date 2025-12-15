import { useState, useEffect } from "react";

const PriceFilter = ({ priceRange, onPriceChange }) => {
  const [localMin, setLocalMin] = useState(priceRange?.min || 0);
  const [localMax, setLocalMax] = useState(priceRange?.max || Infinity);

  useEffect(() => {
    setLocalMin(priceRange?.min || 0);
    setLocalMax(priceRange?.max || Infinity);
  }, [priceRange]);

  const priceRanges = [
    { label: "Under Rs. 200", min: 0, max: 200 },
    { label: "Rs. 200 - Rs. 300", min: 200, max: 300 },
    { label: "Rs. 300 - Rs. 400", min: 300, max: 400 },
    { label: "Rs. 400 - Rs. 500", min: 400, max: 500 },
    { label: "Above Rs. 500", min: 500, max: Infinity },
  ];

  const handleRangeSelect = (range) => {
    setLocalMin(range.min);
    setLocalMax(range.max);
    onPriceChange({ min: range.min, max: range.max });
  };

  const handleCustomRange = () => {
    onPriceChange({ min: localMin, max: localMax });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-charcoal-grey/10 p-5">
      <h3 className="font-bold text-charcoal-grey mb-4">Price Range</h3>
      
      {/* Quick Select Ranges */}
      <div className="space-y-2 mb-4">
        {priceRanges.map((range, index) => {
          const isSelected = priceRange.min === range.min && priceRange.max === range.max;
          return (
            <button
              key={index}
              onClick={() => handleRangeSelect(range)}
              className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                isSelected
                  ? "bg-deep-maroon/10 border-2 border-deep-maroon"
                  : "bg-charcoal-grey/5 border-2 border-transparent hover:bg-charcoal-grey/10"
              }`}
            >
              <span className={`font-medium text-sm ${isSelected ? "text-deep-maroon" : "text-charcoal-grey"}`}>
                {range.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Custom Range Input */}
      <div className="pt-4 border-t border-charcoal-grey/10">
        <p className="text-xs font-semibold text-charcoal-grey mb-3">Custom Range</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-charcoal-grey/60 mb-1 block">Min (Rs.)</label>
            <input
              type="number"
              value={localMin}
              onChange={(e) => setLocalMin(Number(e.target.value))}
              className="w-full px-3 py-2 border border-charcoal-grey/12 rounded-lg focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-sm"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs text-charcoal-grey/60 mb-1 block">Max (Rs.)</label>
            <input
              type="number"
              value={localMax === Infinity ? "" : localMax}
              onChange={(e) => setLocalMax(e.target.value ? Number(e.target.value) : Infinity)}
              className="w-full px-3 py-2 border border-charcoal-grey/12 rounded-lg focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-sm"
              placeholder="Max"
            />
          </div>
        </div>
        <button
          onClick={handleCustomRange}
          className="w-full px-4 py-2 bg-deep-maroon/10 hover:bg-deep-maroon/20 text-deep-maroon rounded-lg font-semibold text-sm transition-colors"
        >
          Apply Custom Range
        </button>
      </div>
    </div>
  );
};

export default PriceFilter;


import { FiCheck } from "react-icons/fi";

const CategoryFilter = ({ categories, selectedCategories, onToggleCategory }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-charcoal-grey/10 p-5">
      <h3 className="font-bold text-charcoal-grey mb-4">Category</h3>
      <div className="space-y-2">
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category);
          return (
            <button
              key={category}
              onClick={() => onToggleCategory(category)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                isSelected
                  ? "bg-deep-maroon/10 border-2 border-deep-maroon"
                  : "bg-charcoal-grey/5 border-2 border-transparent hover:bg-charcoal-grey/10"
              }`}
            >
              <span className={`font-medium text-sm ${isSelected ? "text-deep-maroon" : "text-charcoal-grey"}`}>
                {category}
              </span>
              {isSelected && (
                <FiCheck className="w-4 h-4 text-deep-maroon" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;


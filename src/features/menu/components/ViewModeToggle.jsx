import { FiGrid, FiList } from "react-icons/fi";

const ViewModeToggle = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-xl border border-charcoal-grey/10 p-1">
      <button
        onClick={() => onViewModeChange("grid")}
        className={`p-2 rounded-lg transition-all ${
          viewMode === "grid"
            ? "bg-deep-maroon text-white"
            : "text-charcoal-grey/60 hover:text-charcoal-grey"
        }`}
        aria-label="Grid view"
      >
        <FiGrid className="w-5 h-5" />
      </button>
      <button
        onClick={() => onViewModeChange("list")}
        className={`p-2 rounded-lg transition-all ${
          viewMode === "list"
            ? "bg-deep-maroon text-white"
            : "text-charcoal-grey/60 hover:text-charcoal-grey"
        }`}
        aria-label="List view"
      >
        <FiList className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ViewModeToggle;


import Button from "../buttons/Button";

const EmptyState = ({ onClearFilters }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-charcoal-grey/10 p-12 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-bold text-charcoal-grey mb-2">No products found</h3>
      <p className="text-charcoal-grey/60 mb-6">
        Try adjusting your filters or search query
      </p>
      {onClearFilters && (
        <Button variant="secondary" size="md" onClick={onClearFilters}>
          Clear All Filters
        </Button>
      )}
    </div>
  );
};

export default EmptyState;



import { FiStar } from "react-icons/fi";

const RatingFilter = ({ minRating, onRatingChange }) => {
  const ratings = [4.5, 4.0, 3.5, 3.0, 2.5, 2.0];

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FiStar key={i} className="w-4 h-4 text-golden-amber fill-golden-amber" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <FiStar key="half" className="w-4 h-4 text-golden-amber fill-golden-amber/50" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FiStar key={`empty-${i}`} className="w-4 h-4 text-charcoal-grey/20" />
      );
    }

    return stars;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-charcoal-grey/10 p-5">
      <h3 className="font-bold text-charcoal-grey mb-4">Minimum Rating</h3>
      <div className="space-y-2">
        <button
          onClick={() => onRatingChange(0)}
          className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
            minRating === 0
              ? "bg-deep-maroon/10 border-2 border-deep-maroon"
              : "bg-charcoal-grey/5 border-2 border-transparent hover:bg-charcoal-grey/10"
          }`}
        >
          <span className={`font-medium text-sm ${minRating === 0 ? "text-deep-maroon" : "text-charcoal-grey"}`}>
            All Ratings
          </span>
        </button>
        {ratings.map((rating) => {
          const isSelected = minRating === rating;
          return (
            <button
              key={rating}
              onClick={() => onRatingChange(rating)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                isSelected
                  ? "bg-deep-maroon/10 border-2 border-deep-maroon"
                  : "bg-charcoal-grey/5 border-2 border-transparent hover:bg-charcoal-grey/10"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {renderStars(rating)}
                </div>
                <span className={`font-medium text-sm ${isSelected ? "text-deep-maroon" : "text-charcoal-grey"}`}>
                  {rating}+ Stars
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RatingFilter;


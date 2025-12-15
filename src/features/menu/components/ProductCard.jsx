import { FiStar, FiShoppingCart } from "react-icons/fi";
import Button from "../../../ui/buttons/Button";
import Card from "../../../ui/cards/Card";

const ProductCard = ({ product, onAddToCart }) => {
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
    <Card className="p-0 overflow-hidden group">
      <div className="relative">
        {/* Product Image */}
        <div className="relative h-48 bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <span className="text-7xl">{product.emoji || "🥟"}</span>
          )}
          
          {/* Category Badge */}
          {product.category && (
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 rounded-full bg-deep-maroon/90 backdrop-blur-sm text-white text-xs font-semibold">
                {product.category}
              </span>
            </div>
          )}

          {/* Rating Badge */}
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/95 backdrop-blur-sm">
              <FiStar className="w-3 h-3 text-golden-amber fill-golden-amber" />
              <span className="text-xs font-bold text-charcoal-grey">{product.rating}</span>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-5">
          <h3 className="font-bold text-charcoal-grey text-lg mb-2 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-charcoal-grey/60 mb-3 line-clamp-2 min-h-[2.5rem]">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-0.5">
              {renderStars(product.rating)}
            </div>
            <span className="text-xs text-charcoal-grey/60">
              ({product.reviewCount || 0} reviews)
            </span>
          </div>

          {/* Price and Add to Cart */}
          <div className="flex items-center justify-between pt-3 border-t border-charcoal-grey/10">
            <div>
              <span className="font-bold text-deep-maroon text-xl">
                Rs. {product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-charcoal-grey/50 line-through ml-2">
                  Rs. {product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onAddToCart && onAddToCart(product)}
              className="flex-shrink-0"
            >
              <FiShoppingCart className="w-4 h-4" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;


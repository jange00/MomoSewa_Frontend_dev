import { FiStar, FiShoppingCart } from "react-icons/fi";
import Button from "../../../ui/buttons/Button";
import Card from "../../../ui/cards/Card";

const ProductCard = ({ product, onAddToCart }) => {
  // Get product image - check image, images array, or use emoji
  const getProductImage = () => {
    if (product.image) {
      return product.image;
    }
    // Check images array (backend has images: [String])
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    return null;
  };

  // Get product price - ensure it's a number
  const getProductPrice = () => {
    const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
    return price;
  };

  // Get rating - ensure it's a number, default to 0
  const getProductRating = () => {
    const rating = typeof product.rating === 'number' ? product.rating : parseFloat(product.rating) || 0;
    return Math.max(0, Math.min(5, rating)); // Clamp between 0 and 5
  };

  // Get review count
  const getReviewCount = () => {
    return typeof product.reviewCount === 'number' ? product.reviewCount : parseInt(product.reviewCount) || 0;
  };

  // Check if product is available
  const isProductAvailable = () => {
    // Backend: isAvailable (boolean) and stock (number, -1 means unlimited)
    if (product.isAvailable === false) return false;
    if (product.stock !== undefined && product.stock !== null) {
      return product.stock === -1 || product.stock > 0;
    }
    return true; // Default to available if stock is not specified
  };

  const renderStars = (rating) => {
    const stars = [];
    const numRating = getProductRating();
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 !== 0;

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

    const emptyStars = 5 - Math.ceil(numRating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FiStar key={`empty-${i}`} className="w-4 h-4 text-charcoal-grey/20" />
      );
    }

    return stars;
  };

  const productImage = getProductImage();
  const productPrice = getProductPrice();
  const productRating = getProductRating();
  const reviewCount = getReviewCount();
  const available = isProductAvailable();

  return (
    <Card className="p-0 overflow-hidden group">
      <div className="relative">
        {/* Product Image */}
        <div className="relative h-48 bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center overflow-hidden">
          {productImage ? (
            <img
              src={productImage}
              alt={product.name || 'Product'}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                // Fallback to emoji if image fails to load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
          ) : null}
          <span className={`text-7xl ${productImage ? 'hidden' : ''}`}>
            {product.emoji || "🥟"}
          </span>
          
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
              <span className="text-xs font-bold text-charcoal-grey">{productRating.toFixed(1)}</span>
            </div>
          </div>

          {/* Out of Stock Overlay */}
          {!available && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <span className="px-4 py-2 rounded-full bg-red-500/90 text-white text-sm font-semibold">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-5">
          <h3 className="font-bold text-charcoal-grey text-lg mb-2 line-clamp-1">
            {product.name || 'Unnamed Product'}
          </h3>
          <p className="text-sm text-charcoal-grey/60 mb-3 line-clamp-2 min-h-[2.5rem]">
            {product.description || 'No description available'}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-0.5">
              {renderStars(productRating)}
            </div>
            <span className="text-xs text-charcoal-grey/60">
              ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          {/* Price and Add to Cart */}
          <div className="flex items-center justify-between pt-3 border-t border-charcoal-grey/10">
            <div>
              <span className="font-bold text-deep-maroon text-xl">
                Rs. {productPrice.toFixed(2)}
              </span>
              {product.originalPrice && 
               typeof product.originalPrice === 'number' && 
               product.originalPrice > productPrice && (
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
              disabled={!available}
            >
              <FiShoppingCart className="w-4 h-4" />
              {available ? 'Add' : 'Unavailable'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;


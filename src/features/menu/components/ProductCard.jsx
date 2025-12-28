import { useState, useEffect } from "react";
import { FiStar, FiShoppingCart, FiShoppingBag } from "react-icons/fi";
import Button from "../../../ui/buttons/Button";
import Card from "../../../ui/cards/Card";
import apiClient from "../../../api/client";
import { API_ENDPOINTS } from "../../../api/config";

// Cache for vendor addresses to avoid multiple API calls
const vendorAddressCache = new Map();

const ProductCard = ({ product, onAddToCart }) => {
  const [vendorAddress, setVendorAddress] = useState(null);
  // Get product image - check image, images array, or use emoji
  // Backend schema: image (String, default: null), images (Array of Strings, default: [])
  const getProductImage = () => {
    // First check single image field (primary source)
    if (product.image) {
      if (typeof product.image === 'string' && product.image.trim() && product.image !== 'null') {
        const trimmed = product.image.trim();
        // Validate it's a valid URL or data URL
        if (trimmed.startsWith('http') || trimmed.startsWith('https') || trimmed.startsWith('data:') || trimmed.startsWith('/')) {
          return trimmed;
        }
      }
    }
    
    // Then check images array (backend has images: [String])
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      // Find first valid image URL in the array
      const validImage = product.images.find(img => {
        if (!img || typeof img !== 'string') return false;
        const trimmed = img.trim();
        return trimmed && trimmed !== 'null' && (trimmed.startsWith('http') || trimmed.startsWith('https') || trimmed.startsWith('data:') || trimmed.startsWith('/'));
      });
      if (validImage) {
        return validImage.trim();
      }
    }
    
    // Also check imageUrl (legacy support, though backend uses 'image')
    if (product.imageUrl) {
      if (typeof product.imageUrl === 'string' && product.imageUrl.trim() && product.imageUrl !== 'null') {
        const trimmed = product.imageUrl.trim();
        if (trimmed.startsWith('http') || trimmed.startsWith('https') || trimmed.startsWith('data:') || trimmed.startsWith('/')) {
          return trimmed;
        }
      }
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

  // Get vendor information - check both vendor and vendorId (which might be populated)
  const getVendorInfo = () => {
    const vendor = product.vendor || product.vendorId;
    if (!vendor) return null;
    
    // If vendorId is just an ID string, return null (no details)
    if (typeof vendor === 'string') return null;
    
    // Get main location - prioritize businessAddress (matches vendor profile field)
    // Check all possible location fields, including fetched vendorAddress
    const location = vendor.businessAddress || 
                     vendor.address || 
                     vendor.location ||
                     vendor.businessLocation ||
                     vendor.city ||
                     vendor.area ||
                     vendor.district ||
                     vendorAddress; // Use fetched address if available
    
    return {
      name: vendor.storeName || vendor.businessName || vendor.name || vendor.vendorName,
      location: location, // Will display with 📍 emoji if available
      vendorId: vendor._id || vendor.id,
    };
  };

  const vendorInfo = getVendorInfo();

  // Fetch vendor address if not available in product data
  useEffect(() => {
    if (!vendorInfo || vendorInfo.location || !vendorInfo.vendorId) return;
    
    const vendorId = vendorInfo.vendorId;
    
    // Check cache first
    if (vendorAddressCache.has(vendorId)) {
      setVendorAddress(vendorAddressCache.get(vendorId));
      return;
    }
    
    // Fetch vendor details to get businessAddress
    const fetchVendorAddress = async () => {
      try {
        const response = await apiClient.get(`${API_ENDPOINTS.VENDORS}/${vendorId}`);
        const vendorData = response?.data?.data?.vendor || response?.data?.data || response?.data?.vendor || response?.data;
        const address = vendorData?.businessAddress || vendorData?.address || vendorData?.location;
        
        if (address) {
          // Cache the address
          vendorAddressCache.set(vendorId, address);
          setVendorAddress(address);
        }
      } catch (error) {
        // Silently fail - address just won't show
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to fetch vendor address:', error);
        }
      }
    };
    
    fetchVendorAddress();
  }, [vendorInfo]);

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    if (!productImage && product.name) {
      console.log('Product without image:', {
        name: product.name,
        image: product.image,
        images: product.images,
        imageUrl: product.imageUrl,
        emoji: product.emoji,
        vendor: product.vendor || product.vendorId
      });
    }
  }

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
                console.warn('Image failed to load:', productImage, 'for product:', product.name);
                e.target.style.display = 'none';
                const emojiSpan = e.target.parentElement.querySelector('.product-emoji');
                if (emojiSpan) {
                  emojiSpan.style.display = 'block';
                }
              }}
            />
          ) : null}
          <span className={`text-7xl product-emoji ${productImage ? 'hidden' : 'block'}`}>
            {product.emoji && product.emoji.trim() ? product.emoji : "🥟"}
          </span>
          
          {/* Category and Subcategory Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.category && (
              <span className="px-3 py-1 rounded-full bg-deep-maroon/90 backdrop-blur-sm text-white text-xs font-semibold">
                {product.category}
              </span>
            )}
            {product.subcategory && (
              <span className="px-3 py-1 rounded-full bg-golden-amber/90 backdrop-blur-sm text-white text-xs font-semibold">
                {product.subcategory}
              </span>
            )}
          </div>

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
          
          {/* Vendor/Shop Info */}
          {vendorInfo && (vendorInfo.name || vendorInfo.location) && (
            <div className="mb-2 space-y-1.5 pb-2 border-b border-charcoal-grey/5">
              {vendorInfo.name && (
                <div className="flex items-center gap-1.5 text-xs text-charcoal-grey/70">
                  <FiShoppingBag className="w-3 h-3 text-deep-maroon/70 flex-shrink-0" />
                  <span className="font-medium line-clamp-1">
                    {vendorInfo.name}
                  </span>
                </div>
              )}
              {vendorInfo.location && (
                <button
                  onClick={() => {
                    // Open Google Maps with the vendor address
                    const encodedAddress = encodeURIComponent(vendorInfo.location);
                    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
                    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="flex items-center gap-1.5 text-xs text-charcoal-grey/60 hover:text-deep-maroon transition-colors duration-200 w-full text-left group"
                  title={`View ${vendorInfo.location} on Google Maps`}
                >
                  <span className="text-base flex-shrink-0 group-hover:scale-110 transition-transform duration-200" role="img" aria-label="location">📍</span>
                  <span className="line-clamp-1 flex-1 underline decoration-dotted underline-offset-2 group-hover:decoration-solid">
                    {vendorInfo.location}
                  </span>
                </button>
              )}
            </div>
          )}
          
          {product.description && product.description.trim() && (
            <p className="text-sm text-charcoal-grey/60 mb-3 line-clamp-3">
              {product.description.trim()}
            </p>
          )}

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



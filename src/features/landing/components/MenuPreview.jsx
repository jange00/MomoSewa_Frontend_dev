import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "../../../ui/buttons/Button";
import Section from "../../../ui/sections/Section";
import Card from "../../../ui/cards/Card";
import { ProductCardSkeleton } from "../../../ui/skeletons";
import { getProducts } from "../../../services/productService";

const MenuPreview = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all products
        const result = await getProducts({ 
          limit: 100, // Get more products to sort by review count
          isAvailable: true 
        });
        
        if (result.success && result.data) {
          const products = Array.isArray(result.data) 
            ? result.data 
            : (result.data.products || result.data.items || []);
          
          // Sort by reviewCount (most reviewed first) and take top 4
          const sortedProducts = products
            .filter(product => product.isAvailable !== false && product.stock > 0)
            .sort((a, b) => {
              const reviewCountA = a.reviewCount || 0;
              const reviewCountB = b.reviewCount || 0;
              return reviewCountB - reviewCountA; // Descending order
            })
            .slice(0, 4); // Take top 4 most reviewed products
          
          setPopularProducts(sortedProducts);
        }
      } catch (err) {
        console.error("Error fetching popular products:", err);
        setError(err.message || "Failed to load popular products");
        // Fallback to empty array on error
        setPopularProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularProducts();
  }, []);

  // Helper function to get product image
  const getProductImage = (product) => {
    if (product.image && typeof product.image === 'string' && product.image.trim() && product.image !== 'null') {
      const trimmed = product.image.trim();
      if (trimmed.startsWith('http') || trimmed.startsWith('https') || trimmed.startsWith('data:') || trimmed.startsWith('/')) {
        return trimmed;
      }
    }
    
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const validImage = product.images.find(img => {
        if (!img || typeof img !== 'string') return false;
        const trimmed = img.trim();
        return trimmed && trimmed !== 'null' && (trimmed.startsWith('http') || trimmed.startsWith('https') || trimmed.startsWith('data:') || trimmed.startsWith('/'));
      });
      if (validImage) {
        return validImage.trim();
      }
    }
    
    return null;
  };

  // Format price
  const formatPrice = (price) => {
    if (!price && price !== 0) return "Rs. 0";
    return `Rs. ${price.toLocaleString()}`;
  };

  return (
    <Section className="bg-white">
      <div className="text-center mb-16">
        <h2 className="text-4xl lg:text-5xl font-black text-charcoal-grey mb-4">
          Popular <span className="text-deep-maroon">Momo</span>
        </h2>
        <p className="text-lg text-charcoal-grey/70 max-w-2xl mx-auto">
          Explore our most loved momo varieties, all customizable to your taste.
        </p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <ProductCardSkeleton count={4} />
        </div>
      ) : error ? (
        <div className="text-center py-8 mb-12">
          <p className="text-charcoal-grey/60">{error}</p>
        </div>
      ) : popularProducts.length === 0 ? (
        <div className="text-center py-8 mb-12">
          <p className="text-charcoal-grey/60">No popular products available at the moment.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {popularProducts.map((product, index) => {
            const productImage = getProductImage(product);
            const emoji = product.emoji || "🥟";
            
            return (
              <Card
                key={product._id || product.id || index}
                className="p-6 text-center opacity-0 animate-fade-in-up hover:shadow-xl transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
              >
                {/* Product Image */}
                <div className="mb-4 flex items-center justify-center h-24">
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={product.name}
                      className="w-24 h-24 object-cover rounded-xl"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <div className={`text-6xl ${productImage ? 'hidden' : ''}`}>
                    {emoji}
                  </div>
                </div>
                
                {/* Product Name */}
                <h3 className="font-bold text-charcoal-grey text-lg mb-2 line-clamp-1">
                  {product.name}
                </h3>
                
                {/* Product Description */}
                <p className="text-sm text-charcoal-grey/60 mb-4 line-clamp-2 min-h-[2.5rem]">
                  {product.description || "Delicious momo made with love"}
                </p>
                
                {/* Rating and Reviews */}
                {product.reviewCount > 0 && (
                  <div className="flex items-center justify-center gap-1 mb-3">
                    <span className="text-golden-amber text-sm">★</span>
                    <span className="text-sm text-charcoal-grey/70 font-semibold">
                      {product.rating?.toFixed(1) || "0.0"}
                    </span>
                    <span className="text-xs text-charcoal-grey/50">
                      ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                )}
                
                {/* Price and Order Button */}
                <div className="flex items-center justify-between mt-4">
                  <span className="font-bold text-deep-maroon text-lg">
                    {formatPrice(product.price)}
                  </span>
                  <Button size="sm" variant="primary" to="/menu">
                    Order
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div className="text-center">
        <Button variant="primary" size="lg" to="/menu">
          View Full Menu
        </Button>
      </div>
    </Section>
  );
};

export default MenuPreview;

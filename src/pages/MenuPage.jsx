import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiX, FiSliders } from "react-icons/fi";
import ProductCard from "../features/menu/components/ProductCard";
import CategoryFilter from "../features/menu/components/CategoryFilter";
import PriceFilter from "../features/menu/components/PriceFilter";
import RatingFilter from "../features/menu/components/RatingFilter";
import ViewModeToggle from "../features/menu/components/ViewModeToggle";
import SearchBar from "../ui/search/SearchBar";
import EmptyState from "../ui/empty/EmptyState";
import Button from "../ui/buttons/Button";
import { ProductCardSkeleton } from "../ui/skeletons";
import { useGet, usePost } from "../hooks/useApi";
import { API_ENDPOINTS } from "../api/config";
import { useAuth } from "../hooks/useAuth";

const MenuPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
  const [minRating, setMinRating] = useState(0);

  // Fetch products from API
  const { data: productsData, isLoading } = useGet(
    'products',
    API_ENDPOINTS.PRODUCTS,
    { showErrorToast: true }
  );

  const products = productsData?.data?.products || productsData?.data || [];

  // Debug: Log products data structure (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Products API Response:', productsData);
    console.log('Products loaded:', products.length);
    if (products.length > 0) {
      console.log('Sample product:', products[0]);
      console.log('Product fields:', Object.keys(products[0]));
    } else {
      console.warn('No products found in response');
    }
  }

  // Add to cart mutation
  const addToCartMutation = usePost('cart', API_ENDPOINTS.CART, {
    showSuccessToast: true,
    showErrorToast: true,
  });

  // Extract unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map((p) => p.category || p.categoryName))];
    return uniqueCategories.sort();
  }, [products]);

  // Extract unique subcategories
  const subcategories = useMemo(() => {
    const uniqueSubcategories = [...new Set(products.map((p) => p.subcategory).filter(Boolean))];
    return uniqueSubcategories.sort();
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) {
      return [];
    }

    return products.filter((product) => {
      // Only show available products to customers
      // Backend: isAvailable (boolean) and stock (number, -1 means unlimited)
      // Note: isAvailable defaults to true, so only hide if explicitly false
      if (product.isAvailable === false) {
        return false;
      }
      
      // Check stock - hide if stock is 0 (unless it's -1 which means unlimited)
      // Only check if stock is explicitly set (not undefined/null)
      if (product.stock !== undefined && product.stock !== null) {
        if (product.stock !== -1 && product.stock <= 0) {
          return false;
        }
      }

      // Search filter
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = product.name?.toLowerCase().includes(query);
        const descMatch = product.description?.toLowerCase().includes(query);
        const categoryMatch = (product.category || product.categoryName)?.toLowerCase().includes(query);
        
        if (!nameMatch && !descMatch && !categoryMatch) {
          return false;
        }
      }

      // Category filter
      const productCategory = product.category || product.categoryName;
      if (selectedCategories.length > 0 && productCategory) {
        if (!selectedCategories.includes(productCategory)) {
          return false;
        }
      }

      // Subcategory filter
      if (selectedSubcategories.length > 0 && product.subcategory) {
        if (!selectedSubcategories.includes(product.subcategory)) {
          return false;
        }
      }

      // Price filter
      const productPrice = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
      if (productPrice < priceRange.min || (priceRange.max !== Infinity && productPrice > priceRange.max)) {
        return false;
      }

      // Rating filter
      const productRating = typeof product.rating === 'number' ? product.rating : parseFloat(product.rating) || 0;
      if (productRating < minRating) {
        return false;
      }

      return true;
    });
  }, [products, searchQuery, selectedCategories, selectedSubcategories, priceRange, minRating]);

  const handleToggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleToggleSubcategory = (subcategory) => {
    setSelectedSubcategories((prev) =>
      prev.includes(subcategory)
        ? prev.filter((s) => s !== subcategory)
        : [...prev, subcategory]
    );
  };

  const handleAddToCart = async (product) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    // Check if user is a customer (vendors/admins shouldn't add to cart)
    if (user?.role && user.role !== "customer") {
      toast.error("Only customers can add items to cart");
      return;
    }

    try {
      await addToCartMutation.mutateAsync({
        productId: product._id || product.id,
        quantity: 1,
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);
      // Error toast is already shown by usePost hook
      if (error.status === 403) {
        toast.error("Access denied. Please login as a customer to add items to cart.");
      }
    }
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setPriceRange({ min: 0, max: Infinity });
    setMinRating(0);
    setSearchQuery("");
  };

  const activeFiltersCount =
    selectedCategories.length +
    selectedSubcategories.length +
    (priceRange.min > 0 || priceRange.max !== Infinity ? 1 : 0) +
    (minRating > 0 ? 1 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-grey/3 via-white to-golden-amber/5 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-charcoal-grey mb-2">Our Menu</h1>
          <p className="text-charcoal-grey/60">
            Discover our delicious collection of authentic Nepali momo
          </p>
        </div>

        {/* Search and View Controls */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search for momo..."
          />

          {/* View Mode and Filter Toggle */}
          <div className="flex items-center gap-3">
            <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />

            {/* Filter Toggle Button */}
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <FiSliders className="w-5 h-5" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-deep-maroon text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div
            className={`lg:col-span-1 space-y-4 transition-all duration-300 ${
              showFilters ? "block" : "hidden lg:block"
            }`}
          >
            {/* Close button for mobile */}
            {showFilters && (
              <div className="lg:hidden flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-charcoal-grey">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 rounded-lg hover:bg-charcoal-grey/5 text-charcoal-grey/60"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Filter Components */}
            <CategoryFilter
              categories={categories}
              selectedCategories={selectedCategories}
              onToggleCategory={handleToggleCategory}
            />

            {/* Subcategory Filter */}
            {subcategories.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-charcoal-grey/10 p-5">
                <h3 className="font-bold text-charcoal-grey mb-4">Subcategory</h3>
                <div className="space-y-2">
                  {subcategories.map((subcategory) => {
                    const isSelected = selectedSubcategories.includes(subcategory);
                    return (
                      <button
                        key={subcategory}
                        onClick={() => handleToggleSubcategory(subcategory)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                          isSelected
                            ? "bg-deep-maroon/10 border-2 border-deep-maroon"
                            : "bg-charcoal-grey/5 border-2 border-transparent hover:bg-charcoal-grey/10"
                        }`}
                      >
                        <span className={`font-medium text-sm ${isSelected ? "text-deep-maroon" : "text-charcoal-grey"}`}>
                          {subcategory}
                        </span>
                        {isSelected && (
                          <FiX className="w-4 h-4 text-deep-maroon" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <PriceFilter priceRange={priceRange} onPriceChange={setPriceRange} />

            <RatingFilter minRating={minRating} onRatingChange={setMinRating} />

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <Button
                variant="secondary"
                size="md"
                onClick={clearAllFilters}
                className="w-full"
              >
                <FiX className="w-4 h-4" />
                Clear All Filters
              </Button>
            )}
          </div>

          {/* Products Grid/List */}
          <div className="lg:col-span-3">
            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-charcoal-grey/70">
                Showing <span className="font-bold text-charcoal-grey">{filteredProducts.length}</span>{" "}
                {filteredProducts.length === 1 ? "product" : "products"}
              </p>
            </div>

            {/* Products Display */}
            {isLoading ? (
              <div className={viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                <ProductCardSkeleton count={6} />
              </div>
            ) : filteredProducts.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {filteredProducts.map((product) => {
                  // Ensure product has required fields
                  if (!product || (!product._id && !product.id)) {
                    console.warn('Invalid product:', product);
                    return null;
                  }
                  return (
                    <ProductCard
                      key={product._id || product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  );
                })}
              </div>
            ) : products.length > 0 ? (
              <div className="text-center py-12">
                <p className="text-charcoal-grey/60 mb-4">
                  No products match your current filters
                </p>
                <Button variant="secondary" onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <EmptyState onClearFilters={clearAllFilters} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showFilters && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setShowFilters(false)}
        />
      )}
    </div>
  );
};

export default MenuPage;

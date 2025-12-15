import { useState, useMemo } from "react";
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

// Mock product data - replace with actual API call
const mockProducts = [
  {
    id: 1,
    name: "Steam Momo (10 pcs)",
    description: "Traditional Nepali steamed momos with juicy chicken filling, served with spicy achar",
    price: 250,
    originalPrice: 300,
    category: "Steamed",
    rating: 4.8,
    reviewCount: 124,
    emoji: "🥟",
  },
  {
    id: 2,
    name: "Fried Momo (8 pcs)",
    description: "Crispy fried momos with vegetable filling, golden brown and delicious",
    price: 280,
    category: "Fried",
    rating: 4.6,
    reviewCount: 89,
    emoji: "🥟",
  },
  {
    id: 3,
    name: "Jhol Momo (10 pcs)",
    description: "Steamed momos served with spicy tomato-based sauce and traditional achar",
    price: 300,
    category: "Steamed",
    rating: 4.9,
    reviewCount: 156,
    emoji: "🥟",
  },
  {
    id: 4,
    name: "Kothey Momo (10 pcs)",
    description: "Pan-fried momos with golden crust, crispy on one side and soft on the other",
    price: 270,
    category: "Fried",
    rating: 4.7,
    reviewCount: 98,
    emoji: "🥟",
  },
  {
    id: 5,
    name: "C-Momo (1 plate)",
    description: "Spicy and tangy momos tossed in special sauce with vegetables",
    price: 320,
    category: "Special",
    rating: 4.5,
    reviewCount: 67,
    emoji: "🥟",
  },
  {
    id: 6,
    name: "Buff Momo (10 pcs)",
    description: "Steamed momos with tender buffalo meat filling, authentic Nepali taste",
    price: 290,
    category: "Steamed",
    rating: 4.8,
    reviewCount: 112,
    emoji: "🥟",
  },
  {
    id: 7,
    name: "Veg Momo (10 pcs)",
    description: "Delicious vegetarian momos with mixed vegetables and herbs",
    price: 220,
    category: "Steamed",
    rating: 4.4,
    reviewCount: 145,
    emoji: "🥟",
  },
  {
    id: 8,
    name: "Chilly Momo (1 plate)",
    description: "Spicy momos tossed in hot sauce with bell peppers and onions",
    price: 310,
    category: "Special",
    rating: 4.6,
    reviewCount: 78,
    emoji: "🥟",
  },
  {
    id: 9,
    name: "Tandoori Momo (8 pcs)",
    description: "Grilled momos with tandoori spices, smoky and flavorful",
    price: 350,
    category: "Special",
    rating: 4.7,
    reviewCount: 54,
    emoji: "🥟",
  },
  {
    id: 10,
    name: "Cheese Momo (10 pcs)",
    description: "Steamed momos with melted cheese filling, creamy and delicious",
    price: 330,
    category: "Special",
    rating: 4.3,
    reviewCount: 43,
    emoji: "🥟",
  },
  {
    id: 11,
    name: "Chicken Momo (10 pcs)",
    description: "Classic chicken momos with traditional spices and herbs",
    price: 260,
    category: "Steamed",
    rating: 4.9,
    reviewCount: 201,
    emoji: "🥟",
  },
  {
    id: 12,
    name: "Momo Thukpa Combo",
    description: "Steamed momos with hot thukpa soup, perfect combination",
    price: 380,
    category: "Combo",
    rating: 4.8,
    reviewCount: 92,
    emoji: "🥟",
  },
];

const MenuPage = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
  const [minRating, setMinRating] = useState(0);

  // Extract unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(mockProducts.map((p) => p.category))];
    return uniqueCategories.sort();
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    return mockProducts.filter((product) => {
      // Search filter
      if (
        searchQuery &&
        !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !product.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
        return false;
      }

      // Price filter
      if (product.price < priceRange.min || (priceRange.max !== Infinity && product.price > priceRange.max)) {
        return false;
      }

      // Rating filter
      if (product.rating < minRating) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategories, priceRange, minRating]);

  const handleToggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleAddToCart = (product) => {
    // TODO: Implement add to cart functionality
    console.log("Add to cart:", product);
    toast.success(`${product.name} added to cart!`);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: Infinity });
    setMinRating(0);
    setSearchQuery("");
  };

  const activeFiltersCount =
    selectedCategories.length +
    (priceRange.min > 0 || priceRange.max !== Infinity ? 1 : 0) +
    (minRating > 0 ? 1 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-grey/3 via-white to-golden-amber/5 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-charcoal-grey mb-2">Our Menu</h1>
          <p className="text-charcoal-grey/60">
            Discover our delicious collection of authentic Nepali momos
          </p>
        </div>

        {/* Search and View Controls */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search for momos..."
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
            {filteredProducts.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
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

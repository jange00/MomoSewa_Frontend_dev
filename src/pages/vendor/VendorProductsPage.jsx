import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FiPlus, FiEdit, FiTrash2, FiPackage, FiX, FiSave, FiGrid, FiList, FiEye, FiEyeOff, FiExternalLink, FiSearch, FiImage, FiUpload, FiLink } from "react-icons/fi";
import toast from "react-hot-toast";
import Card from "../../ui/cards/Card";
import Button from "../../ui/buttons/Button";
import Badge from "../../ui/badges/Badge";
import Input from "../../ui/inputs/Input";
import ConfirmDialog from "../../ui/modals/ConfirmDialog";
import { useGet, usePost, useDelete } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";
import apiClient from "../../api/client";

const VendorProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Fetch products from API
  const { data: productsData, isLoading, refetch } = useGet(
    'vendor-products',
    API_ENDPOINTS.PRODUCTS,
    { showErrorToast: true }
  );

  const products = Array.isArray(productsData?.data?.products) ? productsData.data.products :
                   Array.isArray(productsData?.data) ? productsData.data : [];

  // Create product mutation
  const createProductMutation = usePost('vendor-products', API_ENDPOINTS.PRODUCTS, {
    showSuccessToast: true,
    showErrorToast: true,
  });

  // Delete product mutation
  const deleteProductMutation = useDelete('vendor-products', API_ENDPOINTS.PRODUCTS, {
    showSuccessToast: true,
    showErrorToast: true,
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "menu"
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");

  // Sync search and category with URL
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory !== "all") params.category = selectedCategory;
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, setSearchParams]);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    variant: "danger",
  });
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "Momo",
    stock: "",
    image: "🥟",
    imageUrl: "",
  });
  const [newProductImageFile, setNewProductImageFile] = useState(null);
  const [newProductImagePreview, setNewProductImagePreview] = useState(null);
  const [editingProductImageFile, setEditingProductImageFile] = useState(null);
  const [editingProductImagePreview, setEditingProductImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map((p) => p.category || p.categoryName))];
    return uniqueCategories.sort();
  }, [products]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => (p.category || p.categoryName) === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((product) => {
        const matchesName = (product.name || '').toLowerCase().includes(query);
        const matchesDescription = (product.description || '').toLowerCase().includes(query);
        const matchesCategory = ((product.category || product.categoryName) || '').toLowerCase().includes(query);
        return matchesName || matchesDescription || matchesCategory;
      });
    }

    return filtered;
  }, [products, searchQuery, selectedCategory]);

  // Group filtered products by category for menu view
  const productsByCategory = useMemo(() => {
    const grouped = {};
    filteredProducts.forEach((product) => {
      if (!grouped[product.category]) {
        grouped[product.category] = [];
      }
      grouped[product.category].push(product);
    });
    return grouped;
  }, [filteredProducts]);

  // Calculate menu visibility stats
  const menuStats = useMemo(() => {
    const visibleInMenu = products.filter(
      (p) => (p.isAvailable !== false) && (p.stock || p.quantity || 0) > 0
    ).length;
    const hiddenFromMenu = products.filter(
      (p) => p.isAvailable === false || (p.stock || p.quantity || 0) === 0
    ).length;
    return { visibleInMenu, hiddenFromMenu, total: products.length };
  }, [products]);

  // Check if product is visible in menu
  const isVisibleInMenu = (product) => {
    return (product.isAvailable !== false) && (product.stock || product.quantity || 0) > 0;
  };

  const handleToggleAvailability = async (id) => {
    const product = products.find((p) => (p._id || p.id) === id);
    if (!product) return;
    
    const newStatus = !product.isAvailable;
    
    try {
      // Use direct API call with ID in endpoint
      const response = await apiClient.patch(
        `${API_ENDPOINTS.PRODUCTS}/${id}`,
        { isAvailable: newStatus }
      );
      
      if (response.data.success) {
        toast.success(response.data.message || "Product availability updated");
        refetch();
      }
    } catch (error) {
      console.error("Failed to toggle availability:", error);
      toast.error(error.response?.data?.message || "Failed to update product availability");
    }
  };

  const handleDelete = (id) => {
    const product = products.find((p) => (p._id || p.id) === id);
    if (!product) return;
    
    setConfirmDialog({
      isOpen: true,
      title: "Delete Product",
      message: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteProductMutation.mutateAsync(id, {
            onSuccess: () => {
              refetch();
            },
          });
        } catch (error) {
          console.error("Failed to delete product:", error);
        }
      },
      variant: "danger",
    });
  };

  const handleImageChange = (file, isEdit = false) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditingProductImagePreview(reader.result);
          setEditingProductImageFile(file);
        } else {
          setNewProductImagePreview(reader.result);
          setNewProductImageFile(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url, isEdit = false) => {
    if (isEdit) {
      setEditingProduct({ ...editingProduct, imageUrl: url, image: url });
      setEditingProductImagePreview(url);
      setEditingProductImageFile(null);
    } else {
      setNewProduct({ ...newProduct, imageUrl: url, image: url });
      setNewProductImagePreview(url);
      setNewProductImageFile(null);
    }
  };

  const handleRemoveImage = (isEdit = false) => {
    if (isEdit) {
      setEditingProductImagePreview(null);
      setEditingProductImageFile(null);
      setEditingProduct({ ...editingProduct, imageUrl: "", image: "🥟" });
    } else {
      setNewProductImagePreview(null);
      setNewProductImageFile(null);
      setNewProduct({ ...newProduct, imageUrl: "", image: "🥟" });
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      toast.error("Please fill in all required fields");
      return;
    }

    const productData = {
      name: newProduct.name,
      description: newProduct.description || "Delicious momo",
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      stock: parseInt(newProduct.stock),
      isAvailable: true,
    };

    // If image file exists, upload it first
    if (newProductImageFile) {
      // TODO: Upload image and get URL, then add to productData
      // For now, include imageUrl if provided
      if (newProduct.imageUrl) {
        productData.imageUrl = newProduct.imageUrl;
      }
    } else if (newProduct.imageUrl) {
      productData.imageUrl = newProduct.imageUrl;
    }

    try {
      await createProductMutation.mutateAsync(productData, {
        onSuccess: () => {
          refetch();
          setNewProduct({
            name: "",
            description: "",
            price: "",
            category: "Momo",
            stock: "",
            image: "🥟",
            imageUrl: "",
          });
          setNewProductImageFile(null);
          setNewProductImagePreview(null);
          setIsAdding(false);
        },
      });
    } catch (error) {
      console.error("Failed to create product:", error);
    }
  };

  const handleEdit = (id) => {
    const product = products.find((p) => (p._id || p.id) === id);
    if (!product) return;
    
    setEditingId(id);
    setEditingProduct({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      category: product.category || product.categoryName || "Momo",
      stock: (product.stock || product.quantity || 0).toString(),
      image: product.image || "🥟",
      imageUrl: product.imageUrl || product.image || "",
    });
    
    // Set image preview if product has an image URL
    if (product.image && product.image.startsWith("http")) {
      setEditingProductImagePreview(product.image);
    } else if (product.imageUrl) {
      setEditingProductImagePreview(product.imageUrl);
    } else {
      setEditingProductImagePreview(null);
    }
    setEditingProductImageFile(null);
  };

  const handleEditChange = (field, value) => {
    setEditingProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveEdit = async (id) => {
    if (!editingProduct.name || !editingProduct.price || !editingProduct.stock) {
      toast.error("Please fill in all required fields");
      return;
    }

    const productData = {
      name: editingProduct.name,
      description: editingProduct.description || "",
      price: parseFloat(editingProduct.price),
      category: editingProduct.category,
      stock: parseInt(editingProduct.stock),
    };

    // If image file exists, upload it first
    if (editingProductImageFile) {
      // TODO: Upload image and get URL, then add to productData
      if (editingProduct.imageUrl) {
        productData.imageUrl = editingProduct.imageUrl;
      }
    } else if (editingProduct.imageUrl) {
      productData.imageUrl = editingProduct.imageUrl;
    }

    try {
      // Use direct API call with ID in endpoint
      const response = await apiClient.put(
        `${API_ENDPOINTS.PRODUCTS}/${id}`,
        productData
      );
      
      if (response.data.success) {
        toast.success(response.data.message || "Product updated successfully");
        refetch();
        setEditingId(null);
        setEditingProduct(null);
        setEditingProductImageFile(null);
        setEditingProductImagePreview(null);
      }
    } catch (error) {
      console.error("Failed to update product:", error);
      toast.error(error.response?.data?.message || "Failed to update product");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingProduct(null);
    setEditingProductImageFile(null);
    setEditingProductImagePreview(null);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewProduct({
      name: "",
      description: "",
      price: "",
      category: "Momo",
      stock: "",
      image: "🥟",
      imageUrl: "",
    });
    setNewProductImageFile(null);
    setNewProductImagePreview(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 lg:p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-charcoal-grey mb-2">
              Products & Menu
            </h1>
            <p className="text-charcoal-grey/70">
              Manage your menu items and products
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-charcoal-grey/5 border border-charcoal-grey/10">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-deep-maroon text-white shadow-md"
                    : "text-charcoal-grey/60 hover:text-charcoal-grey hover:bg-charcoal-grey/5"
                }`}
                title="Grid View"
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("menu")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === "menu"
                    ? "bg-deep-maroon text-white shadow-md"
                    : "text-charcoal-grey/60 hover:text-charcoal-grey hover:bg-charcoal-grey/5"
                }`}
                title="Menu View"
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsAdding(!isAdding)}
            >
              <FiPlus className="w-5 h-5" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Add Product Form */}
        {isAdding && (
          <Card className="p-6 border-2 border-deep-maroon/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-charcoal-grey">Add New Product</h2>
              <button
                onClick={handleCancel}
                className="p-2 rounded-lg hover:bg-charcoal-grey/5 text-charcoal-grey/60"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Product Name *"
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="e.g., Steam Momo (10 pcs)"
              />
              <Input
                label="Price (Rs.) *"
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                placeholder="250"
              />
              <Input
                label="Description"
                type="text"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                placeholder="Product description"
              />
              <Input
                label="Stock Quantity *"
                type="number"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                placeholder="50"
              />
              <Input
                label="Category"
                type="text"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                placeholder="Momo"
              />
            </div>

            {/* Image Upload Section */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-charcoal-grey mb-3">
                Product Image
              </label>
              <div className="space-y-4">
                {/* Image Preview */}
                {newProductImagePreview && (
                  <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-charcoal-grey/10">
                      <img
                        src={newProductImagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(false)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Upload Options */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* File Upload */}
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e.target.files[0], false)}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <FiUpload className="w-5 h-5" />
                      Upload Image
                    </Button>
                  </div>

                  {/* Or Divider */}
                  <div className="flex items-center justify-center">
                    <span className="text-sm text-charcoal-grey/60 font-medium">OR</span>
                  </div>

                  {/* URL Input */}
                  <div className="flex-1">
                    <Input
                      label="Image URL"
                      type="url"
                      value={newProduct.imageUrl}
                      onChange={(e) => handleImageUrlChange(e.target.value, false)}
                      placeholder="https://example.com/image.jpg"
                      icon={FiLink}
                    />
                  </div>
                </div>

                {/* Info */}
                <p className="text-xs text-charcoal-grey/60">
                  Upload an image file (JPG, PNG, GIF) or enter an image URL. Max file size: 5MB.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="primary" onClick={handleAddProduct}>
                <FiSave className="w-4 h-4" />
                Save Product
              </Button>
              <Button variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center">
                <FiPackage className="w-6 h-6 text-deep-maroon" />
              </div>
              <div>
                <p className="text-charcoal-grey/60 text-sm">Total Products</p>
                <p className="text-2xl font-black text-charcoal-grey">
                  {menuStats.total}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6 border-2 border-green-200/50 bg-green-50/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/10 via-green-400/5 to-green-500/10 flex items-center justify-center">
                <FiEye className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-charcoal-grey/60 text-sm">Visible in Menu</p>
                <p className="text-2xl font-black text-green-600">
                  {menuStats.visibleInMenu}
                </p>
                <p className="text-xs text-charcoal-grey/60 mt-1">
                  Customers can see these
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-blue-500/10 flex items-center justify-center">
                <FiPackage className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-charcoal-grey/60 text-sm">Available</p>
                <p className="text-2xl font-black text-charcoal-grey">
                  {products.filter((p) => p.isAvailable).length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/10 via-red-400/5 to-red-500/10 flex items-center justify-center">
                <FiEyeOff className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-charcoal-grey/60 text-sm">Hidden from Menu</p>
                <p className="text-2xl font-black text-charcoal-grey">
                  {menuStats.hiddenFromMenu}
                </p>
                <p className="text-xs text-charcoal-grey/60 mt-1">
                  Not visible to customers
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filter Bar */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <FiSearch className="w-5 h-5 text-charcoal-grey/35" />
              </div>
              <input
                type="text"
                placeholder="Search products by name, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-charcoal-grey/2 hover:bg-charcoal-grey/4 transition-all duration-300 placeholder:text-charcoal-grey/30 text-sm font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-charcoal-grey/60 hover:text-charcoal-grey transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}
            </div>
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-charcoal-grey/2 hover:bg-charcoal-grey/4 transition-all duration-300 text-sm font-medium min-w-[150px]"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          {(searchQuery || selectedCategory !== "all") && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-charcoal-grey/10">
              <p className="text-sm text-charcoal-grey/60">
                Showing {filteredProducts.length} of {products.length} product{products.length !== 1 ? "s" : ""}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="text-sm text-deep-maroon hover:text-deep-maroon/80 font-semibold"
              >
                Clear Filters
              </button>
            </div>
          )}
        </Card>

        {/* Menu Preview Link */}
        <Card className="p-4 bg-gradient-to-r from-deep-maroon/5 via-golden-amber/5 to-deep-maroon/5 border-2 border-deep-maroon/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center">
                <FiExternalLink className="w-5 h-5 text-deep-maroon" />
              </div>
              <div>
                <p className="font-bold text-charcoal-grey">Preview Your Menu</p>
                <p className="text-sm text-charcoal-grey/60">
                  See how your products appear to customers ({menuStats.visibleInMenu} products visible)
                </p>
              </div>
            </div>
            <Link to="/menu">
              <Button variant="secondary" size="md">
                <FiExternalLink className="w-4 h-4" />
                View Menu
              </Button>
            </Link>
          </div>
        </Card>

        {/* Menu Visibility Info */}
        <Card className="p-6 bg-blue-50/50 border border-blue-200/50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <FiEye className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-charcoal-grey mb-2">Menu Visibility Rules</h3>
              <p className="text-sm text-charcoal-grey/70 mb-3">
                Products are visible to customers in the menu when:
              </p>
              <ul className="space-y-1.5 text-sm text-charcoal-grey/70">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Product is <strong>Available</strong> (enabled)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Product has <strong>Stock &gt; 0</strong>
                </li>
              </ul>
              <p className="text-xs text-charcoal-grey/60 mt-3 pt-3 border-t border-blue-200/50">
                💡 Tip: Disable a product or set stock to 0 to hide it from customers without deleting it.
              </p>
            </div>
          </div>
        </Card>

        {/* Products Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full">
                <Card className="p-12">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-charcoal-grey mb-2">
                      No products found
                    </h3>
                    <p className="text-charcoal-grey/60 mb-6">
                      {searchQuery || selectedCategory !== "all"
                        ? "Try adjusting your search or filters"
                        : "Add your first product to get started"}
                    </p>
                    {(!searchQuery && selectedCategory === "all") && (
                      <Button variant="primary" size="md" onClick={() => setIsAdding(true)}>
                        <FiPlus className="w-5 h-5" />
                        Add Product
                      </Button>
                    )}
                  </div>
                </Card>
              </div>
            ) : (
              filteredProducts.map((product) => (
            <Card key={product._id || product.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex-shrink-0 border border-charcoal-grey/10">
                    {product.imageUrl || (product.image && (product.image.startsWith("http") || product.image.startsWith("data:"))) ? (
                      <img
                        src={product.imageUrl || product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">{product.image || "🥟"}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-charcoal-grey text-lg">
                      {product.name}
                    </h3>
                    <p className="text-sm text-charcoal-grey/60">{product.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isVisibleInMenu(product) ? (
                    <Badge variant="success" className="flex items-center gap-1">
                      <FiEye className="w-3 h-3" />
                      In Menu
                    </Badge>
                  ) : (
                    <Badge variant="error" className="flex items-center gap-1">
                      <FiEyeOff className="w-3 h-3" />
                      Hidden
                    </Badge>
                  )}
                  {!product.isAvailable && (
                    <Badge variant="error">Unavailable</Badge>
                  )}
                </div>
              </div>

              {editingId !== (product._id || product.id) && (
                <p className="text-charcoal-grey/70 text-sm mb-4">
                  {product.description}
                </p>
              )}

              {editingId !== (product._id || product.id) && (
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-charcoal-grey/10">
                <div>
                  <p className="text-sm text-charcoal-grey/60">Price</p>
                  <p className="font-bold text-deep-maroon text-lg">
                    Rs. {product.price}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-charcoal-grey/60">Stock</p>
                  <p className={`font-bold ${product.stock === 0 ? 'text-red-600' : 'text-charcoal-grey'}`}>
                    {product.stock} units
                  </p>
                  {product.stock === 0 && (
                    <p className="text-xs text-red-600 mt-1">⚠️ Hidden from menu</p>
                  )}
                </div>
                </div>
              )}

              {editingId === (product._id || product.id) ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      label="Product Name *"
                      type="text"
                      value={editingProduct?.name || ""}
                      onChange={(e) => handleEditChange("name", e.target.value)}
                      placeholder="Product name"
                    />
                    <Input
                      label="Price (Rs.) *"
                      type="number"
                      value={editingProduct?.price || ""}
                      onChange={(e) => handleEditChange("price", e.target.value)}
                      placeholder="250"
                    />
                    <Input
                      label="Description"
                      type="text"
                      value={editingProduct?.description || ""}
                      onChange={(e) => handleEditChange("description", e.target.value)}
                      placeholder="Description"
                    />
                    <Input
                      label="Stock *"
                      type="number"
                      value={editingProduct?.stock || ""}
                      onChange={(e) => handleEditChange("stock", e.target.value)}
                      placeholder="50"
                    />
                    <Input
                      label="Category"
                      type="text"
                      value={editingProduct?.category || ""}
                      onChange={(e) => handleEditChange("category", e.target.value)}
                      placeholder="Momo"
                    />
                  </div>

                  {/* Image Upload Section for Edit */}
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-charcoal-grey mb-3">
                      Product Image
                    </label>
                    <div className="space-y-4">
                      {/* Image Preview */}
                      {editingProductImagePreview && (
                        <div className="relative inline-block">
                          <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-charcoal-grey/10">
                            <img
                              src={editingProductImagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(true)}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                            title="Remove image"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Upload Options */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        {/* File Upload */}
                        <div className="flex-1">
                          <input
                            ref={editFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e.target.files[0], true)}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            size="md"
                            onClick={() => editFileInputRef.current?.click()}
                            className="w-full"
                          >
                            <FiUpload className="w-5 h-5" />
                            Upload Image
                          </Button>
                        </div>

                        {/* Or Divider */}
                        <div className="flex items-center justify-center">
                          <span className="text-sm text-charcoal-grey/60 font-medium">OR</span>
                        </div>

                        {/* URL Input */}
                        <div className="flex-1">
                          <Input
                            label="Image URL"
                            type="url"
                            value={editingProduct?.imageUrl || ""}
                            onChange={(e) => handleImageUrlChange(e.target.value, true)}
                            placeholder="https://example.com/image.jpg"
                            icon={FiLink}
                          />
                        </div>
                      </div>

                      {/* Info */}
                      <p className="text-xs text-charcoal-grey/60">
                        Upload an image file (JPG, PNG, GIF) or enter an image URL. Max file size: 5MB.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleSaveEdit(product._id || product.id)}
                    >
                      <FiSave className="w-4 h-4" />
                      Save Changes
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      <FiX className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEdit(product._id || product.id)}
                  >
                    <FiEdit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant={product.isAvailable ? "ghost" : "secondary"}
                    size="sm"
                    onClick={() => handleToggleAvailability(product._id || product.id)}
                  >
                    {product.isAvailable ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(product._id || product.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </Card>
              ))
            )}
          </div>
        )}

        {/* Menu View */}
        {viewMode === "menu" && (
          <div className="space-y-8">
            {Object.keys(productsByCategory).length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-charcoal-grey mb-2">
                    No products found
                  </h3>
                  <p className="text-charcoal-grey/60 mb-6">
                    {searchQuery || selectedCategory !== "all"
                      ? "Try adjusting your search or filters"
                      : "Add your first product to get started"}
                  </p>
                  {(!searchQuery && selectedCategory === "all") && (
                    <Button variant="primary" size="md" onClick={() => setIsAdding(true)}>
                      <FiPlus className="w-5 h-5" />
                      Add Product
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              Object.keys(productsByCategory).map((category) => (
              <div key={category}>
                <h2 className="text-2xl font-black text-charcoal-grey mb-6 pb-2 border-b-2 border-deep-maroon/20">
                  {category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {productsByCategory[category].map((product) => (
                    <Card key={product._id || product.id} className="p-6 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex-shrink-0 border border-charcoal-grey/10">
                          {product.imageUrl || (product.image && (product.image.startsWith("http") || product.image.startsWith("data:"))) ? (
                            <img
                              src={product.imageUrl || product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl">{product.image || "🥟"}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-bold text-charcoal-grey text-lg leading-tight">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {isVisibleInMenu(product) ? (
                                <Badge variant="success" className="flex items-center gap-1">
                                  <FiEye className="w-3 h-3" />
                                  In Menu
                                </Badge>
                              ) : (
                                <Badge variant="error" className="flex items-center gap-1">
                                  <FiEyeOff className="w-3 h-3" />
                                  Hidden
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-charcoal-grey/70 mb-3 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-black text-deep-maroon">
                                Rs. {product.price}
                              </p>
                              <p className="text-xs text-charcoal-grey/60">
                                Stock: {product.stock} units
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-4 border-t border-charcoal-grey/10">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEdit(product._id || product.id)}
                        >
                          <FiEdit className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          variant={product.isAvailable ? "ghost" : "secondary"}
                          size="sm"
                          onClick={() => handleToggleAvailability(product._id || product.id)}
                        >
                          {product.isAvailable ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
              ))
            )}
          </div>
        )}

        {products.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-bold text-charcoal-grey mb-2">
                No products yet
              </h3>
              <p className="text-charcoal-grey/60 mb-6">
                Add your first product to start selling
              </p>
              <Button variant="primary" size="md" onClick={() => setIsAdding(true)}>
                <FiPlus className="w-5 h-5" />
                Add Product
              </Button>
            </div>
          </Card>
        )}

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
          onConfirm={confirmDialog.onConfirm || (() => {})}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText="Confirm"
          cancelText="Cancel"
          variant={confirmDialog.variant}
        />
      </div>
    </div>
  );
};

export default VendorProductsPage;


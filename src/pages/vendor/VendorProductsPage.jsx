import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { FiPlus, FiEdit, FiTrash2, FiPackage, FiX, FiSave, FiGrid, FiList, FiEye, FiEyeOff, FiExternalLink, FiSearch, FiImage, FiUpload, FiLink } from "react-icons/fi";
import toast from "react-hot-toast";
import Card from "../../ui/cards/Card";
import Button from "../../ui/buttons/Button";
import Badge from "../../ui/badges/Badge";
import Input from "../../ui/inputs/Input";
import Toggle from "../../ui/inputs/Toggle";
import ConfirmDialog from "../../ui/modals/ConfirmDialog";
import { useGet, usePost, useDelete } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";
import apiClient from "../../api/client";
import { PRODUCT_CATEGORIES, DEFAULT_CATEGORY, isValidCategory } from "../../common/productCategories";
import { uploadProductImage, getSubcategories } from "../../services/productService";

const VendorProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  
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

  // Debug: Log products data to verify it's updating
  useEffect(() => {
    if (productsData) {
      console.log('📦 Products data updated:', {
        hasData: !!productsData,
        hasProducts: !!productsData?.data?.products,
        productsCount: products.length,
        sampleProduct: products[0] ? {
          id: products[0]._id || products[0].id,
          name: products[0].name,
          price: products[0].price
        } : null
      });
    }
  }, [productsData, products]);
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
    originalPrice: "",
    category: DEFAULT_CATEGORY,
    subcategory: "",
    stock: "-1", // -1 means unlimited (backend default)
    emoji: "🥟", // Backend default emoji
    imageUrl: "",
    isAvailable: true, // Backend default is true
  });
  const [newProductImageFile, setNewProductImageFile] = useState(null);
  const [newProductImagePreview, setNewProductImagePreview] = useState(null);
  const [editingProductImageFile, setEditingProductImageFile] = useState(null);
  const [editingProductImagePreview, setEditingProductImagePreview] = useState(null);
  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  const [editingSubcategories, setEditingSubcategories] = useState([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [loadingEditingSubcategories, setLoadingEditingSubcategories] = useState(false);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  // Fetch subcategories when new product category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!newProduct.category || newProduct.category === "all") {
        setAvailableSubcategories([]);
        setNewProduct(prev => ({ ...prev, subcategory: "" }));
        return;
      }

      setLoadingSubcategories(true);
      try {
        const response = await getSubcategories(newProduct.category);
        const subcategories = response?.data?.subcategories || [];
        setAvailableSubcategories(subcategories);
        // Reset subcategory if current one is not in the new list
        if (newProduct.subcategory && !subcategories.includes(newProduct.subcategory)) {
          setNewProduct(prev => ({ ...prev, subcategory: "" }));
        }
      } catch (error) {
        console.error("Failed to fetch subcategories:", error);
        setAvailableSubcategories([]);
        setNewProduct(prev => ({ ...prev, subcategory: "" }));
      } finally {
        setLoadingSubcategories(false);
      }
    };

    fetchSubcategories();
  }, [newProduct.category]);

  // Fetch subcategories when editing product category changes
  useEffect(() => {
    const fetchEditingSubcategories = async () => {
      if (!editingProduct?.category || editingProduct.category === "all") {
        setEditingSubcategories([]);
        return;
      }

      setLoadingEditingSubcategories(true);
      try {
        const response = await getSubcategories(editingProduct.category);
        const subcategories = response?.data?.subcategories || [];
        setEditingSubcategories(subcategories);
        // Reset subcategory if current one is not in the new list
        if (editingProduct.subcategory && !subcategories.includes(editingProduct.subcategory)) {
          setEditingProduct(prev => ({ ...prev, subcategory: "" }));
        }
      } catch (error) {
        console.error("Failed to fetch subcategories:", error);
        setEditingSubcategories([]);
      } finally {
        setLoadingEditingSubcategories(false);
      }
    };

    if (editingProduct) {
      fetchEditingSubcategories();
    }
  }, [editingProduct?.category]);

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
    const trimmedUrl = url ? url.trim() : "";
    if (isEdit) {
      setEditingProduct({ 
        ...editingProduct, 
        imageUrl: trimmedUrl
      });
      if (trimmedUrl) {
        setEditingProductImagePreview(trimmedUrl);
      } else {
        setEditingProductImagePreview(null);
      }
      setEditingProductImageFile(null);
    } else {
      setNewProduct({ 
        ...newProduct, 
        imageUrl: trimmedUrl
      });
      if (trimmedUrl) {
        setNewProductImagePreview(trimmedUrl);
      } else {
        setNewProductImagePreview(null);
      }
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
    if (!newProduct.name || !newProduct.price) {
      toast.error("Please fill in all required fields (Name and Price)");
      return;
    }

    // Validate price
    const price = parseFloat(newProduct.price);
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price greater than 0");
      return;
    }

    // Validate originalPrice if provided
    let originalPrice = null;
    if (newProduct.originalPrice && newProduct.originalPrice.trim()) {
      originalPrice = parseFloat(newProduct.originalPrice);
      if (isNaN(originalPrice) || originalPrice <= 0) {
        toast.error("Original price must be a valid number greater than 0");
        return;
      }
      if (originalPrice <= price) {
        toast.error("Original price must be greater than the current price");
        return;
      }
    }

    // Validate stock - allow -1 for unlimited, or 0+ for limited stock
    let stock = -1; // Default to unlimited
    if (newProduct.stock === "custom" && newProduct.customStock) {
      stock = parseInt(newProduct.customStock);
      if (isNaN(stock) || stock < -1) {
        toast.error("Stock must be -1 (unlimited) or 0 or greater");
        return;
      }
    } else if (newProduct.stock && newProduct.stock !== "-1" && newProduct.stock !== "custom") {
      stock = parseInt(newProduct.stock);
      if (isNaN(stock) || stock < -1) {
        toast.error("Stock must be -1 (unlimited) or 0 or greater");
        return;
      }
    }

    // Validate category
    const category = newProduct.category.trim() || DEFAULT_CATEGORY;
    if (!isValidCategory(category)) {
      toast.error(`Invalid category. Please select a valid category from the list.`);
      return;
    }

    // Build FormData (same pattern as profile picture upload)
    const productFormData = new FormData();
    
    // Add text fields (same field names as backend expects)
    productFormData.append('name', newProduct.name.trim());
    productFormData.append('price', price.toString());
    productFormData.append('category', category);
    productFormData.append('stock', stock.toString());
    productFormData.append('isAvailable', (newProduct.isAvailable !== undefined ? newProduct.isAvailable : true).toString());
    
    // Add optional text fields
    if (newProduct.description && newProduct.description.trim()) {
      productFormData.append('description', newProduct.description.trim());
    }
    if (originalPrice !== null) {
      productFormData.append('originalPrice', originalPrice.toString());
    }
    if (newProduct.emoji && newProduct.emoji.trim()) {
      productFormData.append('emoji', newProduct.emoji.trim());
    }
    if (newProduct.subcategory && newProduct.subcategory.trim()) {
      productFormData.append('subcategory', newProduct.subcategory.trim());
    }
    
    // Add image file (same field name as profile picture: 'image')
    if (newProductImageFile) {
      productFormData.append('image', newProductImageFile);
      console.log('✅ Image file added to FormData:', {
        fileName: newProductImageFile.name,
        fileType: newProductImageFile.type,
        fileSize: newProductImageFile.size,
      });
    } else if (newProduct.imageUrl && newProduct.imageUrl.trim()) {
      // If no file but URL provided, add as image field (backend may accept URL string)
      productFormData.append('image', newProduct.imageUrl.trim());
      console.log('✅ Image URL added to FormData:', newProduct.imageUrl.trim());
    }
    
    // Debug: Verify FormData entries (same as profile picture)
    const formDataEntries = [];
    for (let pair of productFormData.entries()) {
      formDataEntries.push({ 
        key: pair[0], 
        value: pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1] 
      });
    }
    console.log('📦 FormData entries:', formDataEntries);

    try {
      // Use direct API call with FormData (same pattern as profile picture)
      // The request interceptor will handle removing Content-Type for FormData
      // Axios will automatically set Content-Type with boundary for FormData
      const response = await apiClient.post(API_ENDPOINTS.PRODUCTS, productFormData);
      
      if (response.data.success) {
        toast.success(response.data.message || "Product created successfully");
          refetch();
          setNewProduct({
            name: "",
            description: "",
            price: "",
          originalPrice: "",
          category: DEFAULT_CATEGORY,
          stock: "-1",
          emoji: "🥟",
            imageUrl: "",
          isAvailable: true,
          });
          setNewProductImageFile(null);
          setNewProductImagePreview(null);
          setIsAdding(false);
      } else {
        throw new Error(response.data.message || "Failed to create product");
      }
    } catch (error) {
      console.error("Failed to create product:", error);
      
      // Log detailed error information
      if (error.response) {
        console.error("Error Status:", error.response.status);
        console.error("Error Data:", error.response.data);
        
        // Show validation errors if available
        if (error.response.data?.details) {
          console.error("Validation Errors:", error.response.data.details);
          console.error("Validation Errors (full):", JSON.stringify(error.response.data.details, null, 2));
          
          // Handle array of validation errors
          if (Array.isArray(error.response.data.details)) {
            const errorMessages = error.response.data.details.map((err, index) => {
              // Handle different error formats
              if (typeof err === 'string') {
                return err;
              } else if (err.path || err.field) {
                // Format: {path: 'fieldName', message: 'error message'}
                const field = err.path || err.field || 'unknown';
                const message = err.message || JSON.stringify(err);
                return `${field}: ${message}`;
              } else if (err.msg || err.message) {
                // Format: {msg: 'error message'} or {message: 'error message'}
                return err.msg || err.message;
              } else {
                // Fallback: stringify the whole object
                return JSON.stringify(err);
              }
            }).join('; ');
            toast.error(`Validation errors: ${errorMessages}`);
          } else if (typeof error.response.data.details === 'object') {
            // Object with field-specific errors
            const errorMessages = Object.entries(error.response.data.details)
              .map(([field, message]) => `${field}: ${Array.isArray(message) ? message.join(', ') : message}`)
              .join('; ');
            toast.error(`Validation errors: ${errorMessages}`);
          } else {
            toast.error(`Validation error: ${error.response.data.details}`);
          }
        } else if (error.response.data?.errors) {
          console.error("Validation Errors:", error.response.data.errors);
          const errorMessages = Array.isArray(error.response.data.errors)
            ? error.response.data.errors.join(', ')
            : JSON.stringify(error.response.data.errors);
          toast.error(`Validation errors: ${errorMessages}`);
        } else if (error.response.data?.message) {
          toast.error(error.response.data.message);
        }
      } else if (error.message) {
        toast.error(error.message);
      }
    }
  };

  const handleEdit = (id) => {
    const product = products.find((p) => (p._id || p.id) === id);
    if (!product) return;
    
    setEditingId(id);
    
    // Determine stock value for the select dropdown
    let stockValue = "-1";
    if (product.stock !== undefined && product.stock !== null) {
      const stockNum = parseInt(product.stock);
      // Check if it's one of the predefined options
      if (stockNum === -1 || stockNum === 0 || stockNum === 10 || stockNum === 25 || stockNum === 50 || stockNum === 100) {
        stockValue = stockNum.toString();
      } else {
        // Custom stock value
        stockValue = "custom";
      }
    }
    
    setEditingProduct({
      name: product.name || "",
      description: product.description || "",
      price: product.price ? product.price.toString() : "",
      originalPrice: product.originalPrice ? product.originalPrice.toString() : "",
      category: product.category || product.categoryName || DEFAULT_CATEGORY,
      subcategory: product.subcategory || "",
      stock: stockValue,
      customStock: (stockValue === "custom" && product.stock !== undefined && product.stock !== null) ? product.stock.toString() : "",
      emoji: product.emoji || "🥟",
      imageUrl: product.image || product.imageUrl || "",
      isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
    });
    
    // Set image preview if product has an image (handle all formats: URL, base64, relative path)
    const productImage = product.image || product.imageUrl || product.images?.[0];
    if (productImage && typeof productImage === 'string' && productImage.trim()) {
      // Handle http/https URLs, data URLs (base64), or relative paths
      if (productImage.startsWith("http://") || 
          productImage.startsWith("https://") || 
          productImage.startsWith("data:") ||
          productImage.startsWith("/")) {
        setEditingProductImagePreview(productImage);
      } else {
        // For other cases, try to use it anyway
        setEditingProductImagePreview(productImage);
      }
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
    if (!editingProduct.name || !editingProduct.price) {
      toast.error("Please fill in all required fields (Name and Price)");
      return;
    }

    // Validate price
    const price = parseFloat(editingProduct.price);
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price greater than 0");
      return;
    }

    // Validate originalPrice if provided (allow empty to remove it)
    let originalPrice = null;
    if (editingProduct.originalPrice && editingProduct.originalPrice.trim()) {
      originalPrice = parseFloat(editingProduct.originalPrice);
      if (isNaN(originalPrice) || originalPrice <= 0) {
        toast.error("Original price must be a valid number greater than 0");
        return;
      }
      if (originalPrice <= price) {
        toast.error("Original price must be greater than the current price");
        return;
      }
    }
    // If originalPrice is empty string, null will be sent (backend will handle removing it)

    // Validate stock - allow -1 for unlimited, or 0+ for limited stock
    let stock = -1; // Default to unlimited
    if (editingProduct.stock === "custom" && editingProduct.customStock) {
      stock = parseInt(editingProduct.customStock);
      if (isNaN(stock) || stock < -1) {
        toast.error("Stock must be -1 (unlimited) or 0 or greater");
        return;
      }
    } else if (editingProduct.stock && editingProduct.stock !== "-1" && editingProduct.stock !== "custom") {
      stock = parseInt(editingProduct.stock);
      if (isNaN(stock) || stock < -1) {
        toast.error("Stock must be -1 (unlimited) or 0 or greater");
        return;
      }
    }

    // Validate category
    const category = editingProduct.category.trim() || DEFAULT_CATEGORY;
    if (!isValidCategory(category)) {
      toast.error(`Invalid category. Please select a valid category from the list.`);
      return;
    }

    // Build product data object
    const productData = {
      name: editingProduct.name.trim(),
      price: price,
      category: category,
      stock: stock,
      isAvailable: editingProduct.isAvailable !== undefined ? editingProduct.isAvailable : true,
    };
    
    // Add optional fields
    if (editingProduct.description && editingProduct.description.trim()) {
      productData.description = editingProduct.description.trim();
    }
    if (originalPrice !== null && originalPrice !== undefined) {
      productData.originalPrice = originalPrice;
    }
    if (editingProduct.emoji && editingProduct.emoji.trim()) {
      productData.emoji = editingProduct.emoji.trim();
    }
    if (editingProduct.subcategory && editingProduct.subcategory.trim()) {
      productData.subcategory = editingProduct.subcategory.trim();
    }
    
    // Check if we need FormData (only if uploading a new image file)
    const hasNewImageFile = !!editingProductImageFile;
    
    console.log('🔍 Sending update for product ID:', id);
    console.log('🔍 Product data being sent:', productData);
    console.log('🔍 Has new image file:', hasNewImageFile);

    try {
      let response;
      
      if (hasNewImageFile) {
        // Use FormData when uploading a new image file
        const productFormData = new FormData();
        Object.keys(productData).forEach(key => {
          productFormData.append(key, productData[key]);
        });
        productFormData.append('image', editingProductImageFile);
        console.log('📤 Sending FormData (with image file)');
        
        response = await apiClient.put(
          `${API_ENDPOINTS.PRODUCTS}/${id}`,
          productFormData
        );
      } else {
        // Use JSON when no image file is being uploaded
        // Include image URL in JSON if it exists and is valid
        if (editingProduct.imageUrl && editingProduct.imageUrl.trim()) {
          const imageUrlToUse = editingProduct.imageUrl.trim();
          if (imageUrlToUse.startsWith('http://') ||
              imageUrlToUse.startsWith('https://') ||
              imageUrlToUse.startsWith('data:') ||
              imageUrlToUse.startsWith('/')) {
            productData.image = imageUrlToUse;
            console.log('📤 Including image URL in JSON data');
          }
        }
        console.log('📤 Sending JSON data:', productData);
        response = await apiClient.put(
        `${API_ENDPOINTS.PRODUCTS}/${id}`,
        productData
      );
      }
      
      console.log('✅ Product update response:', response.data);
      console.log('✅ Updated product data:', response.data?.data);
      
      if (response.data.success) {
        toast.success(response.data.message || "Product updated successfully");
        
        // Close edit form first
        setEditingId(null);
        setEditingProduct(null);
        setEditingProductImageFile(null);
        setEditingProductImagePreview(null);
        
        // Force React Query to invalidate and refetch the products query
        // This ensures the UI updates with fresh data immediately
        await queryClient.refetchQueries({ queryKey: ['vendor-products'], type: 'active' });
        console.log('✅ Products query refetched');
      } else {
        throw new Error(response.data.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Failed to update product:", error);
      
      // Enhanced error handling (same as add product)
      if (error.response) {
        console.error("Error Status:", error.response.status);
        console.error("Error Data:", error.response.data);
        
        // Show validation errors if available
        if (error.response.data?.details) {
          console.error("Validation Errors:", error.response.data.details);
          console.error("Validation Errors (full):", JSON.stringify(error.response.data.details, null, 2));
          
          // Handle array of validation errors
          if (Array.isArray(error.response.data.details)) {
            const errorMessages = error.response.data.details.map((err) => {
              if (typeof err === 'string') {
                return err;
              } else if (err.path || err.field) {
                const field = err.path || err.field || 'unknown';
                const message = err.message || JSON.stringify(err);
                return `${field}: ${message}`;
              } else if (err.msg || err.message) {
                return err.msg || err.message;
              } else {
                return JSON.stringify(err);
              }
            }).join('; ');
            toast.error(`Validation errors: ${errorMessages}`);
          } else if (typeof error.response.data.details === 'object') {
            const errorMessages = Object.entries(error.response.data.details)
              .map(([field, message]) => `${field}: ${Array.isArray(message) ? message.join(', ') : message}`)
              .join('; ');
            toast.error(`Validation errors: ${errorMessages}`);
          } else {
            toast.error(`Validation error: ${error.response.data.details}`);
          }
        } else if (error.response.data?.errors) {
          console.error("Validation Errors:", error.response.data.errors);
          const errorMessages = Array.isArray(error.response.data.errors)
            ? error.response.data.errors.join(', ')
            : JSON.stringify(error.response.data.errors);
          toast.error(`Validation errors: ${errorMessages}`);
        } else if (error.response.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Failed to update product. Please try again.");
        }
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update product. Please try again.");
      }
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
      originalPrice: "",
      category: DEFAULT_CATEGORY,
      stock: "-1",
      emoji: "🥟",
      imageUrl: "",
      isAvailable: true,
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
                placeholder="e.g., Steamed Momo (10 pcs)"
              />
              <Input
                label="Price (Rs.) *"
                type="number"
                step="0.01"
                min="0"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                placeholder="250.00"
              />
              <Input
                label="Original Price (Rs.)"
                type="number"
                step="0.01"
                min="0"
                value={newProduct.originalPrice}
                onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                placeholder="300.00 (optional, for discounts)"
              />
              <Input
                label="Description"
                type="text"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                placeholder="Product description (optional)"
              />
              <div>
                <label className="block text-sm font-semibold text-charcoal-grey mb-2">
                  Category *
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value, subcategory: "" })}
                  className="w-full px-4 py-3 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-charcoal-grey/2 hover:bg-charcoal-grey/4 transition-all duration-300 text-sm font-medium"
                >
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal-grey mb-2">
                  Subcategory
                </label>
                <select
                  value={newProduct.subcategory}
                  onChange={(e) => setNewProduct({ ...newProduct, subcategory: e.target.value })}
                  disabled={!newProduct.category || newProduct.category === "all" || loadingSubcategories || availableSubcategories.length === 0}
                  className="w-full px-4 py-3 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-charcoal-grey/2 hover:bg-charcoal-grey/4 transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select subcategory (optional)</option>
                  {availableSubcategories.map((subcat) => (
                    <option key={subcat} value={subcat}>
                      {subcat}
                    </option>
                  ))}
                </select>
                {loadingSubcategories && (
                  <p className="text-xs text-charcoal-grey/50 mt-1">Loading subcategories...</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal-grey mb-2">
                  Stock Quantity
                </label>
                <select
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  className="w-full px-4 py-3 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-charcoal-grey/2 hover:bg-charcoal-grey/4 transition-all duration-300 text-sm font-medium"
                >
                  <option value="-1">Unlimited (-1)</option>
                  <option value="0">0 (Out of Stock)</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="custom">Custom Amount</option>
                </select>
                {newProduct.stock === "custom" && (
                  <Input
                    label="Custom Stock Amount"
                    type="number"
                    min="-1"
                    value={newProduct.customStock || ""}
                    onChange={(e) => setNewProduct({ ...newProduct, customStock: e.target.value })}
                    placeholder="Enter stock quantity or -1 for unlimited"
                    className="mt-2"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal-grey mb-2">
                  Emoji Icon
                </label>
              <Input
                type="text"
                  value={newProduct.emoji}
                  onChange={(e) => setNewProduct({ ...newProduct, emoji: e.target.value })}
                  placeholder="🥟 (default)"
                  maxLength={2}
                />
                <p className="text-xs text-charcoal-grey/60 mt-1">
                  Emoji to display when no image is available (default: 🥟)
                </p>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-charcoal-grey/10">
                <div className="flex flex-col">
                  <Toggle
                    label="Product is available for purchase"
                    checked={newProduct.isAvailable}
                    onChange={(e) => setNewProduct({ ...newProduct, isAvailable: e.target.checked })}
                  />
                  <p className="text-xs text-charcoal-grey/60 mt-1 ml-14">
                    {newProduct.isAvailable ? "Visible to customers" : "Hidden from customers"}
                  </p>
                </div>
              </div>
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
                    <p className="text-charcoal-grey/60">
                      {searchQuery || selectedCategory !== "all"
                        ? "Try adjusting your search or filters"
                        : "Use the 'Add Product' button above to get started"}
                    </p>
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
                      step="0.01"
                      min="0"
                      value={editingProduct?.price || ""}
                      onChange={(e) => handleEditChange("price", e.target.value)}
                      placeholder="250.00"
                    />
                    <Input
                      label="Original Price (Rs.)"
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingProduct?.originalPrice || ""}
                      onChange={(e) => handleEditChange("originalPrice", e.target.value)}
                      placeholder="300.00 (optional, for discounts)"
                    />
                    <Input
                      label="Description"
                      type="text"
                      value={editingProduct?.description || ""}
                      onChange={(e) => handleEditChange("description", e.target.value)}
                      placeholder="Description (optional)"
                    />
                    <div>
                      <label className="block text-sm font-semibold text-charcoal-grey mb-2">
                        Category *
                      </label>
                      <select
                        value={editingProduct?.category || DEFAULT_CATEGORY}
                        onChange={(e) => {
                          handleEditChange("category", e.target.value);
                          handleEditChange("subcategory", "");
                        }}
                        className="w-full px-4 py-3 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-charcoal-grey/2 hover:bg-charcoal-grey/4 transition-all duration-300 text-sm font-medium"
                      >
                        {PRODUCT_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-charcoal-grey mb-2">
                        Subcategory
                      </label>
                      <select
                        value={editingProduct?.subcategory || ""}
                        onChange={(e) => handleEditChange("subcategory", e.target.value)}
                        disabled={!editingProduct?.category || editingProduct.category === "all" || loadingEditingSubcategories || editingSubcategories.length === 0}
                        className="w-full px-4 py-3 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-charcoal-grey/2 hover:bg-charcoal-grey/4 transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Select subcategory (optional)</option>
                        {editingSubcategories.map((subcat) => (
                          <option key={subcat} value={subcat}>
                            {subcat}
                          </option>
                        ))}
                      </select>
                      {loadingEditingSubcategories && (
                        <p className="text-xs text-charcoal-grey/50 mt-1">Loading subcategories...</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-charcoal-grey mb-2">
                        Stock Quantity
                      </label>
                      <select
                        value={editingProduct?.stock || "-1"}
                        onChange={(e) => handleEditChange("stock", e.target.value)}
                        className="w-full px-4 py-3 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-charcoal-grey/2 hover:bg-charcoal-grey/4 transition-all duration-300 text-sm font-medium"
                      >
                        <option value="-1">Unlimited (-1)</option>
                        <option value="0">0 (Out of Stock)</option>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="custom">Custom Amount</option>
                      </select>
                      {editingProduct?.stock === "custom" && (
                    <Input
                          label="Custom Stock Amount"
                      type="number"
                          min="-1"
                          value={editingProduct?.customStock || ""}
                          onChange={(e) => handleEditChange("customStock", e.target.value)}
                          placeholder="Enter stock quantity or -1 for unlimited"
                          className="mt-2"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-charcoal-grey mb-2">
                        Emoji Icon
                      </label>
                    <Input
                      type="text"
                        value={editingProduct?.emoji || "🥟"}
                        onChange={(e) => handleEditChange("emoji", e.target.value)}
                        placeholder="🥟 (default)"
                        maxLength={2}
                      />
                      <p className="text-xs text-charcoal-grey/60 mt-1">
                        Emoji to display when no image is available
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-charcoal-grey/10">
                      <div className="flex flex-col">
                        <Toggle
                          label="Product is available for purchase"
                          checked={editingProduct?.isAvailable !== undefined ? editingProduct.isAvailable : true}
                          onChange={(e) => handleEditChange("isAvailable", e.target.checked)}
                        />
                        <p className="text-xs text-charcoal-grey/60 mt-1 ml-14">
                          {editingProduct?.isAvailable !== false ? "Visible to customers" : "Hidden from customers"}
                        </p>
                      </div>
                    </div>
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
                  <p className="text-charcoal-grey/60">
                    {searchQuery || selectedCategory !== "all"
                      ? "Try adjusting your search or filters"
                      : "Use the 'Add Product' button above to get started"}
                  </p>
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
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
              ))
            )}
          </div>
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


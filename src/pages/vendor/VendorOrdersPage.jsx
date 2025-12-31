import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSearch, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import OrdersHeader from "../../features/vendor-dashboard/components/OrdersHeader";
import OrdersTabs from "../../features/vendor-dashboard/components/OrdersTabs";
import OrdersGrid from "../../features/vendor-dashboard/components/OrdersGrid";
import OrdersStats from "../../features/vendor-dashboard/components/OrdersStats";
import Card from "../../ui/cards/Card";
import { OrderCardSkeleton } from "../../ui/skeletons";
import { useGet, usePatch } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";
import apiClient from "../../api/client";

const VendorOrdersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Fetch vendor orders from API
  // Note: Use /orders endpoint (backend filters by vendor based on auth token)
  // /vendors/orders doesn't exist and causes routing errors
  const { data: ordersData, isLoading, refetch } = useGet(
    'vendor-orders',
    API_ENDPOINTS.ORDERS,
    { showErrorToast: false } // Handle errors gracefully
  );

  const orders = Array.isArray(ordersData?.data?.orders) ? ordersData.data.orders :
                 Array.isArray(ordersData?.data) ? ordersData.data : [];

  // Fetch all products to enrich order items with product images
  const { data: productsData } = useGet(
    'products-for-vendor-orders',
    API_ENDPOINTS.PRODUCTS,
    { 
      enabled: orders.length > 0, // Only fetch if we have orders
      showErrorToast: false // Don't show error toast for this background fetch
    }
  );

  const products = productsData?.data?.products || productsData?.data || [];

  // Enrich orders with product images
  const enrichedOrders = useMemo(() => {
    if (!products.length) return orders;
    
    return orders.map(order => {
      if (!order.items || !Array.isArray(order.items)) return order;
      
      const enrichedItems = order.items.map(item => {
        // Get productId - handle both object and string formats
        const productId = item.productId?._id || item.productId?.id || item.productId;
        
        // Find the matching product
        const product = products.find(p => 
          p._id === productId || p.id === productId
        );
        
        if (product) {
          return {
            ...item,
            // Add product data for image lookup
            product: {
              ...product,
              name: item.name || product.name,
              price: item.price !== undefined ? item.price : product.price,
            },
            // Add image directly on item for easier access
            image: product.image || (product.images && product.images[0]) || item.image || null,
            images: product.images || item.images || [],
            emoji: product.emoji || item.emoji || "🥟"
          };
        }
        
        return item;
      });
      
      return {
        ...order,
        items: enrichedItems
      };
    });
  }, [orders, products]);

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  // Sync search query with URL
  useEffect(() => {
    if (searchQuery) {
      setSearchParams({ search: searchQuery }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [searchQuery, setSearchParams]);

  // Handle order status updates
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      // According to backend: PUT /orders/:id/status
      const response = await apiClient.put(
        `${API_ENDPOINTS.ORDERS}/${orderId}/status`,
        { status: newStatus }
      );
      
      if (response.data.success) {
        toast.success(response.data.message || "Order status updated successfully");
        // Refetch orders to get updated data
        refetch();
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error(error.response?.data?.message || "Failed to update order status");
    }
  };

  const filteredOrders = useMemo(() => {
    let filtered = activeTab === "all"
      ? enrichedOrders
      : enrichedOrders.filter((order) => order.status === activeTab);

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((order) => {
        // Search by human-readable orderId, _id, or id
        const orderId = (order.orderId || order._id || order.id || '').toString().toLowerCase();
        const matchesId = orderId.includes(query);
        const matchesCustomerName = order.customer?.name?.toLowerCase().includes(query);
        const matchesPhone = order.customer?.phone?.includes(query);
        const matchesAddress = order.customer?.address?.toLowerCase().includes(query);
        const matchesItems = order.items?.some((item) => 
          (item.name || item.product?.name || '').toLowerCase().includes(query)
        );
        return matchesId || matchesCustomerName || matchesPhone || matchesAddress || matchesItems;
      });
    }

    return filtered;
  }, [activeTab, enrichedOrders, searchQuery]);

  const ordersCount = useMemo(() => {
    const counts = {
      total: enrichedOrders.length,
      pending: 0,
      preparing: 0,
      "on-the-way": 0,
      delivered: 0,
      cancelled: 0,
    };

    enrichedOrders.forEach((order) => {
      if (counts.hasOwnProperty(order.status)) {
        counts[order.status]++;
      }
    });

    return counts;
  }, [enrichedOrders]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <OrdersHeader />
          <div className="grid gap-6">
            <OrderCardSkeleton count={5} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <OrdersHeader />
        
        {/* Search Bar */}
        <Card className="p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <FiSearch className="w-5 h-5 text-charcoal-grey/35" />
            </div>
            <input
              type="text"
              placeholder="Search by order ID, customer name, phone, or items..."
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
          {searchQuery && (
            <p className="text-sm text-charcoal-grey/60 mt-2">
              Found {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""} matching "{searchQuery}"
            </p>
          )}
        </Card>

        <OrdersTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          ordersCount={ordersCount}
        />
        <OrdersGrid orders={filteredOrders} onStatusUpdate={handleStatusUpdate} />
        <OrdersStats orders={enrichedOrders} />
      </div>
    </div>
  );
};

export default VendorOrdersPage;


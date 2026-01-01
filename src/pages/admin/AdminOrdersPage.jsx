import { useState, useMemo } from "react";
import OrdersHeader from "../../features/admin-dashboard/components/OrdersHeader";
import OrdersTabs from "../../features/admin-dashboard/components/OrdersTabs";
import OrdersGrid from "../../features/admin-dashboard/components/OrdersGrid";
import OrdersStats from "../../features/admin-dashboard/components/OrdersStats";
import VendorFilter from "../../features/admin-dashboard/components/VendorFilter";
import Card from "../../ui/cards/Card";
import Button from "../../ui/buttons/Button";
import { FiDownload, FiRefreshCw, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { useGet } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";

const AdminOrdersPage = () => {
  // Fetch all orders from API
  const { data: ordersData, isLoading, error, refetch } = useGet(
    'admin-orders',
    API_ENDPOINTS.ORDERS,
    { showErrorToast: true }
  );

  // Fetch all products to enrich order items with product images
  const { data: productsData } = useGet(
    'products-for-orders-admin-list',
    API_ENDPOINTS.PRODUCTS,
    { 
      showErrorToast: false, // Don't show error toast for this background fetch
      enabled: !!ordersData // Only fetch if we have orders
    }
  );

  const products = productsData?.data?.products || productsData?.data || [];

  // Process and sort orders by date (most recent first), and enrich with product images
  const orders = useMemo(() => {
    const ordersList = ordersData?.data?.orders || ordersData?.data || [];
    
    // Enrich orders with product images
    const enrichedOrders = ordersList.map(order => {
      const orderItems = order.items || order.orderItems || [];
      
      // Enrich each order item with product data
      const enrichedItems = orderItems.map(item => {
        // Get productId - handle both object and string formats
        const productId = item.productId?._id || item.productId?.id || item.productId || item.product?._id || item.product?.id;
        
        // Find the matching product
        const product = products.find(p => 
          p._id === productId || p.id === productId
        );
        
        if (product) {
          // Merge item with product data, prioritizing item data for name/price
          return {
            ...item,
            product: {
              ...product,
              name: item.name || product.name,
              price: item.price !== undefined ? item.price : product.price,
            },
            // Add image directly on item for easier access
            image: product.image || (product.images && product.images[0]) || item.image || null,
            images: product.images || item.images || [],
          };
        }
        
        // If product not found, return item as-is
        return item;
      });
      
      return {
        ...order,
        items: enrichedItems,
        orderItems: enrichedItems,
      };
    });
    
    // Sort by date (most recent first)
    return enrichedOrders.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0);
      const dateB = new Date(b.createdAt || b.date || 0);
      return dateB - dateA;
    });
  }, [ordersData, products]);

  const [selectedTab, setSelectedTab] = useState("all"); // "all" means no status filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("all");
  const [sortBy, setSortBy] = useState("date"); // "date", "amount", "status"

  // Extract unique vendors from orders
  const vendors = useMemo(() => {
    const vendorMap = new Map();
    
    orders.forEach((order) => {
      const vendor = order.vendor || order.vendorId;
      if (vendor) {
        // Handle case where vendor is just an ID string
        if (typeof vendor === 'string') {
          // Skip vendors that are just IDs without details
          return;
        }
        
        // Get vendor ID - prefer _id or id, fallback to businessName/name only if they're unique
        const vendorId = vendor._id || vendor.id;
        
        // Get business name - prioritize businessName, then name, skip if neither exists
        const businessName = vendor.businessName || vendor.storeName || vendor.name;
        
        // Only add vendor if we have both an ID and a name
        if (vendorId && businessName) {
          if (!vendorMap.has(vendorId)) {
            vendorMap.set(vendorId, {
              id: vendorId,
              name: vendor.name || businessName,
              businessName: businessName,
              orderCount: 0,
            });
          }
          vendorMap.get(vendorId).orderCount++;
        }
      }
    });
    
    return Array.from(vendorMap.values()).sort((a, b) => 
      a.businessName.localeCompare(b.businessName)
    );
  }, [orders]);

  // Filter and sort orders based on selected tab, vendor, search query, and sort option
  const filteredOrders = useMemo(() => {
    let filtered = [...orders]; // Create a copy to avoid mutating original

    // Filter by vendor
    if (selectedVendor !== "all") {
      filtered = filtered.filter(
        (order) => {
          const vendor = order.vendor || order.vendorId;
          const vendorId = vendor?._id || vendor?.id || vendor?.businessName || vendor?.name;
          return vendorId === selectedVendor;
        }
      );
    }

    // Filter by status
    if (selectedTab !== "all") {
      filtered = filtered.filter((order) => order.status === selectedTab);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) => {
          const orderId = (order._id || order.id || '').toString().toLowerCase();
          const customer = order.customer || order.customerId;
          const vendor = order.vendor || order.vendorId;
          const items = order.items || order.orderItems || [];
          const customerPhone = customer?.phone || '';
          const customerEmail = customer?.email || '';
          
          return orderId.includes(query) ||
                 customer?.name?.toLowerCase().includes(query) ||
                 customerPhone.includes(query) ||
                 customerEmail.toLowerCase().includes(query) ||
                 vendor?.name?.toLowerCase().includes(query) ||
                 vendor?.businessName?.toLowerCase().includes(query) ||
                 items.some((item) => 
                   (item.name || item.product?.name || '').toLowerCase().includes(query)
                 );
        }
      );
    }

    // Sort orders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "amount":
          const amountA = parseFloat(a.total || a.amount || 0);
          const amountB = parseFloat(b.total || b.amount || 0);
          return amountB - amountA; // Highest first
        case "status":
          const statusOrder = { pending: 1, preparing: 2, "on-the-way": 3, delivered: 4, cancelled: 5 };
          return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
        case "date":
        default:
          const dateA = new Date(a.createdAt || a.date || 0);
          const dateB = new Date(b.createdAt || b.date || 0);
          return dateB - dateA; // Most recent first
      }
    });

    return filtered;
  }, [orders, selectedTab, selectedVendor, searchQuery, sortBy]);

  // Calculate stats based on vendor filter (before status filter)
  const stats = useMemo(() => {
    let ordersToCount = orders;
    
    // Apply vendor filter for stats
    if (selectedVendor !== "all") {
      ordersToCount = ordersToCount.filter(
        (order) => {
          const vendor = order.vendor || order.vendorId;
          const vendorId = vendor?._id || vendor?.id || vendor?.businessName || vendor?.name;
          return vendorId === selectedVendor;
        }
      );
    }
    
    // Calculate total revenue from delivered/completed orders
    const deliveredOrders = ordersToCount.filter(
      (o) => o.status === "delivered" || o.status === "completed"
    );
    const totalRevenue = deliveredOrders.reduce(
      (sum, o) => sum + (parseFloat(o.total) || parseFloat(o.amount) || 0),
      0
    );
    
    return {
      total: ordersToCount.length,
      pending: ordersToCount.filter((o) => o.status === "pending").length,
      preparing: ordersToCount.filter((o) => o.status === "preparing").length,
      onTheWay: ordersToCount.filter((o) => o.status === "on-the-way").length,
      delivered: ordersToCount.filter((o) => o.status === "delivered").length,
      cancelled: ordersToCount.filter((o) => o.status === "cancelled").length,
      totalRevenue: totalRevenue,
    };
  }, [orders, selectedVendor]);

  // Handle export (placeholder for now)
  const handleExport = () => {
    toast.success("Export feature coming soon!");
    // TODO: Implement CSV/Excel export
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedVendor("all");
    setSelectedTab("all");
    setSortBy("date");
  };

  const hasActiveFilters = searchQuery || selectedVendor !== "all" || selectedTab !== "all" || sortBy !== "date";

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon mx-auto mb-4"></div>
          <p className="text-charcoal-grey/70">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="p-8 text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-charcoal-grey mb-2">Error Loading Orders</h2>
            <p className="text-charcoal-grey/70 mb-4">
              {error.message || 'Failed to load orders. Please check your connection and try again.'}
            </p>
            <Button variant="primary" onClick={() => refetch()}>
              <FiRefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <OrdersHeader
            title="All Orders"
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => refetch()}
              className="flex items-center gap-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Active Filters Bar */}
        {hasActiveFilters && (
          <Card className="p-4 bg-gradient-to-r from-deep-maroon/5 to-golden-amber/5 border-deep-maroon/10">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-charcoal-grey">Active Filters:</span>
                {searchQuery && (
                  <span className="px-3 py-1 rounded-full bg-deep-maroon/10 text-deep-maroon text-sm font-medium flex items-center gap-2">
                    Search: "{searchQuery}"
                    <button onClick={() => setSearchQuery("")} className="hover:text-deep-maroon/70">
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedVendor !== "all" && (
                  <span className="px-3 py-1 rounded-full bg-deep-maroon/10 text-deep-maroon text-sm font-medium flex items-center gap-2">
                    Vendor: {vendors.find(v => v.id === selectedVendor)?.businessName || selectedVendor}
                    <button onClick={() => setSelectedVendor("all")} className="hover:text-deep-maroon/70">
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedTab !== "all" && (
                  <span className="px-3 py-1 rounded-full bg-deep-maroon/10 text-deep-maroon text-sm font-medium flex items-center gap-2">
                    Status: {selectedTab}
                    <button onClick={() => setSelectedTab("all")} className="hover:text-deep-maroon/70">
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {sortBy !== "date" && (
                  <span className="px-3 py-1 rounded-full bg-deep-maroon/10 text-deep-maroon text-sm font-medium flex items-center gap-2">
                    Sort: {sortBy}
                    <button onClick={() => setSortBy("date")} className="hover:text-deep-maroon/70">
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-deep-maroon hover:bg-deep-maroon/10"
              >
                Clear All
              </Button>
            </div>
          </Card>
        )}

        {/* Vendor Filter */}
        {vendors.length > 0 && (
          <Card className="p-6">
            <VendorFilter
              vendors={vendors}
              selectedVendor={selectedVendor}
              onVendorChange={setSelectedVendor}
              onClear={() => setSelectedVendor("all")}
            />
          </Card>
        )}

        {/* Stats */}
        <OrdersStats stats={stats} />

        {/* Revenue Summary */}
        {stats.totalRevenue > 0 && (
          <Card className="p-6 bg-gradient-to-r from-golden-amber/10 to-deep-maroon/5 border-golden-amber/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-grey/60 mb-1">Total Revenue (Delivered Orders)</p>
                <p className="text-3xl font-black text-golden-amber">Rs. {stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-charcoal-grey/60 mb-1">Delivered Orders</p>
                <p className="text-2xl font-black text-charcoal-grey">{stats.delivered}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Status Tabs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-charcoal-grey">Filter by Status</h3>
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 border border-charcoal-grey/12 rounded-lg focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-sm text-charcoal-grey bg-white"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="status">Sort by Status</option>
              </select>
              {selectedTab !== "all" && (
                <button
                  onClick={() => setSelectedTab("all")}
                  className="text-sm text-deep-maroon hover:underline"
                >
                  Clear Status Filter
                </button>
              )}
            </div>
          </div>
          <OrdersTabs selectedTab={selectedTab} onTabChange={setSelectedTab} ordersCount={stats} />
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm text-charcoal-grey/70">
          <p>
            Showing <span className="font-bold text-charcoal-grey">{filteredOrders.length}</span> of{" "}
            <span className="font-bold text-charcoal-grey">{orders.length}</span> orders
            {hasActiveFilters && " (filtered)"}
          </p>
        </div>

        {/* Orders Grid */}
        <OrdersGrid 
          orders={filteredOrders} 
          onClearFilters={hasActiveFilters ? clearAllFilters : undefined}
        />
      </div>
    </div>
  );
};

export default AdminOrdersPage;


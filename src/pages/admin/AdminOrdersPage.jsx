import { useState, useMemo } from "react";
import OrdersHeader from "../../features/admin-dashboard/components/OrdersHeader";
import OrdersTabs from "../../features/admin-dashboard/components/OrdersTabs";
import OrdersGrid from "../../features/admin-dashboard/components/OrdersGrid";
import OrdersStats from "../../features/admin-dashboard/components/OrdersStats";
import VendorFilter from "../../features/admin-dashboard/components/VendorFilter";
import Card from "../../ui/cards/Card";
import { OrderCardSkeleton } from "../../ui/skeletons";
import { useGet } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";

const AdminOrdersPage = () => {
  // Fetch all orders from API
  const { data: ordersData, isLoading } = useGet(
    'admin-orders',
    API_ENDPOINTS.ORDERS,
    { showErrorToast: true }
  );

  const orders = ordersData?.data?.orders || ordersData?.data || [];

  const [selectedTab, setSelectedTab] = useState("all"); // "all" means no status filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("all");

  // Extract unique vendors from orders
  const vendors = useMemo(() => {
    const vendorMap = new Map();
    
    orders.forEach((order) => {
      const vendor = order.vendor || order.vendorId;
      if (vendor) {
        const vendorId = vendor.businessName || vendor.name || vendor._id || vendor.id;
        if (!vendorMap.has(vendorId)) {
          vendorMap.set(vendorId, {
            id: vendorId,
            name: vendor.name,
            businessName: vendor.businessName || vendor.name,
            orderCount: 0,
          });
        }
        vendorMap.get(vendorId).orderCount++;
      }
    });
    
    return Array.from(vendorMap.values()).sort((a, b) => 
      a.businessName.localeCompare(b.businessName)
    );
  }, [orders]);

  // Filter orders based on selected tab, vendor, and search query
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filter by vendor
    if (selectedVendor !== "all") {
      filtered = filtered.filter(
        (order) => {
          const vendor = order.vendor || order.vendorId;
          return vendor?.businessName === selectedVendor ||
                 vendor?.name === selectedVendor ||
                 (vendor?._id || vendor?.id) === selectedVendor;
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
          
          return orderId.includes(query) ||
                 customer?.name?.toLowerCase().includes(query) ||
                 vendor?.name?.toLowerCase().includes(query) ||
                 vendor?.businessName?.toLowerCase().includes(query) ||
                 items.some((item) => 
                   (item.name || item.product?.name || '').toLowerCase().includes(query)
                 );
        }
      );
    }

    return filtered;
  }, [orders, selectedTab, selectedVendor, searchQuery]);

  // Calculate stats based on vendor filter (before status filter)
  const stats = useMemo(() => {
    let ordersToCount = orders;
    
    // Apply vendor filter for stats
    if (selectedVendor !== "all") {
      ordersToCount = ordersToCount.filter(
        (order) => {
          const vendor = order.vendor || order.vendorId;
          return vendor?.businessName === selectedVendor ||
                 vendor?.name === selectedVendor ||
                 (vendor?._id || vendor?.id) === selectedVendor;
        }
      );
    }
    
    return {
      total: ordersToCount.length,
      pending: ordersToCount.filter((o) => o.status === "pending").length,
      preparing: ordersToCount.filter((o) => o.status === "preparing").length,
      onTheWay: ordersToCount.filter((o) => o.status === "on-the-way").length,
      delivered: ordersToCount.filter((o) => o.status === "delivered").length,
      cancelled: ordersToCount.filter((o) => o.status === "cancelled").length,
    };
  }, [orders, selectedVendor]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <OrdersHeader
            title="All Orders"
            searchQuery=""
            onSearchChange={() => {}}
          />
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
        <OrdersHeader
          title="All Orders"
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        {/* Vendor Filter */}
        <Card className="p-6">
          <VendorFilter
            vendors={vendors}
            selectedVendor={selectedVendor}
            onVendorChange={setSelectedVendor}
            onClear={() => setSelectedVendor("all")}
          />
        </Card>

        <OrdersStats stats={stats} />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-charcoal-grey">Filter by Status</h3>
            {selectedTab !== "all" && (
              <button
                onClick={() => setSelectedTab("all")}
                className="text-sm text-deep-maroon hover:underline"
              >
                Clear Status Filter
              </button>
            )}
          </div>
          <OrdersTabs selectedTab={selectedTab} onTabChange={setSelectedTab} ordersCount={stats} />
        </div>
        <OrdersGrid orders={filteredOrders} />
      </div>
    </div>
  );
};

export default AdminOrdersPage;


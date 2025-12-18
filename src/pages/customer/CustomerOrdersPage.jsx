import { useState, useMemo } from "react";
import OrdersHeader from "../../features/customer-dashboard/components/OrdersHeader";
import OrdersTabs from "../../features/customer-dashboard/components/OrdersTabs";
import OrdersGrid from "../../features/customer-dashboard/components/OrdersGrid";
import OrdersStats from "../../features/customer-dashboard/components/OrdersStats";
import { useAuth } from "../../hooks/useAuth";
import { useGet } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";

const CustomerOrdersPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const { isAuthenticated } = useAuth();

  // Fetch orders from API
  const { data: ordersData, isLoading } = useGet(
    'customer-orders',
    API_ENDPOINTS.ORDERS,
    { 
      showErrorToast: true,
      enabled: isAuthenticated, // Only fetch when authenticated
      refetchOnMount: true, // Always refetch when component mounts
    }
  );

  const orders = Array.isArray(ordersData?.data?.orders) ? ordersData.data.orders :
                 Array.isArray(ordersData?.data) ? ordersData.data : [];

  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    if (activeTab === "all") return orders;
    return orders.filter((order) => order && order.status === activeTab);
  }, [activeTab, orders]);

  const ordersCount = useMemo(() => {
    const counts = {
      total: orders.length || 0,
      pending: 0,
      preparing: 0,
      "on-the-way": 0,
      delivered: 0,
      cancelled: 0,
    };

    if (Array.isArray(orders)) {
      orders.forEach((order) => {
        if (order && order.status && counts.hasOwnProperty(order.status)) {
          counts[order.status]++;
        }
      });
    }

    return counts;
  }, [orders]);

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
        <OrdersHeader />
        <OrdersTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          ordersCount={ordersCount}
        />
        <OrdersGrid orders={filteredOrders} />
        <OrdersStats orders={orders} />
      </div>
    </div>
  );
};

export default CustomerOrdersPage;

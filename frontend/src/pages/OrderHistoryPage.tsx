import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { useOrders } from "@/hooks/useOrders";
import { Package } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { useNavigate } from "react-router-dom";

export function OrderHistoryPage() {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("date-desc");
  const { orders, loading, error, fetchOrders } = useOrders();
  const { showToast } = useToast();
  
  // Get current user from auth state
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userId = user?.id;

  // Fetch orders on mount and when userId changes
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchOrders(userId);
    } else if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isAuthenticated]);

  // Sort orders based on selected criteria
  const sortedOrders = (orders && Array.isArray(orders) ? [...orders] : []).sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
      case 'date-asc':
        return new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
      case 'amount-desc':
        return b.total - a.total;
      case 'amount-asc':
        return a.total - b.total;
      case 'status':
        return a.status.localeCompare(b.status);
      case 'customer':
        return a.username.localeCompare(b.username);
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'text-green-600';
      case 'shipped': return 'text-blue-600';
      case 'processing': return 'text-yellow-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!isAuthenticated || !userId) {
    return (
      <div className="container py-8 px-4 max-w-6xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Order History</h1>
          <p className="text-text-muted">Please log in to view your orders.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-8 px-4 max-w-6xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Order History</h1>
          <p className="text-text-muted">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8 px-4 max-w-6xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Order History</h1>
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => userId && fetchOrders(userId)}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Order History</h1>
        <p className="text-text-muted">View and track your past orders</p>
      </div>

      {/* Sort Controls */}
      <div className="mb-6 flex justify-end">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Date: Newest First</SelectItem>
              <SelectItem value="date-asc">Date: Oldest First</SelectItem>
              <SelectItem value="amount-desc">Amount: High to Low</SelectItem>
              <SelectItem value="amount-asc">Amount: Low to High</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {sortedOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">{order.id}</CardTitle>
                  <p className="text-sm text-text-muted mt-1">
                    Placed on {new Date(order.orderDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex flex-col sm:items-end gap-2">
                  <span className={`text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-2">Items:</h4>
                  <div className="space-y-2">
                    {(order.items && Array.isArray(order.items) ? order.items : []).map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                        <span className="text-sm">{item.itemName}</span>
                        <span className="text-sm text-text-muted">
                          {item.quantity} × ${item.priceAtPurchase.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Actions */}
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Order details are already shown in the card
                      // Could expand to show more details or open a modal
                      showToast(`Order #${order.id} - Status: ${order.status}, Total: $${order.total.toFixed(2)}, Items: ${order.items.length}`, 'info');
                    }}
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      showToast(`Tracking information for Order #${order.id} will be available once the order ships.`, 'info');
                    }}
                  >
                    Track Package
                  </Button>
                  {order.status === "DELIVERED" && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        showToast('Review functionality coming soon!', 'info');
                      }}
                    >
                      Leave Review
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Add all items from this order back to cart
                      showToast(`Adding ${order.items.length} item(s) from Order #${order.id} to cart...`, 'info');
                      // TODO: Implement reorder functionality
                    }}
                  >
                    Reorder
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {orders.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-text-muted mb-4" />
            <h3 className="text-xl font-semibold mb-2">No orders found</h3>
            <p className="text-text-muted mb-4">You haven't placed any orders yet.</p>
            <Button onClick={() => window.location.href = '/products'}>Browse Products</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

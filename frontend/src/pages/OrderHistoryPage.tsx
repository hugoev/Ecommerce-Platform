import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Calendar, DollarSign, User } from "lucide-react";
import { useState } from "react";

export function OrderHistoryPage() {
  const [sortBy, setSortBy] = useState("date-desc");

  // Sample order data - in real app this would come from API
  const [orders, setOrders] = useState([
    {
      id: "ORD-2024-001",
      date: "2024-01-15",
      status: "Delivered",
      total: 129.99,
      items: [
        { name: "Wireless Headphones", quantity: 1, price: 89.99 },
        { name: "Cotton T-Shirt", quantity: 2, price: 19.99 }
      ]
    },
    {
      id: "ORD-2024-002",
      date: "2024-01-10",
      status: "Shipped",
      total: 234.75,
      items: [
        { name: "Smart Watch", quantity: 1, price: 199.99 },
        { name: "Running Shoes", quantity: 1, price: 129.99 }
      ]
    },
    {
      id: "ORD-2024-003",
      date: "2024-01-05",
      status: "Processing",
      total: 89.50,
      items: [
        { name: "Bluetooth Speaker", quantity: 1, price: 59.99 },
        { name: "Yoga Mat", quantity: 1, price: 39.99 }
      ]
    }
  ]);

  // Sort orders based on selected criteria
  const sortedOrders = [...orders].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'date-asc':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'amount-desc':
        return b.total - a.total;
      case 'amount-asc':
        return a.total - b.total;
      case 'status':
        return a.status.localeCompare(b.status);
      case 'customer':
        // For demo purposes, we'll use the order ID as customer identifier
        // In real app, this would be the actual customer name
        return a.id.localeCompare(b.id);
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
          <Select value={sortBy} onVolumeChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Date: Newest First
                </div>
              </SelectItem>
              <SelectItem value="date-asc">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Date: Oldest First
                </div>
              </SelectItem>
              <SelectItem value="amount-desc">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Amount: High to Low
                </div>
              </SelectItem>
              <SelectItem value="amount-asc">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Amount: Low to High
                </div>
              </SelectItem>
              <SelectItem value="status">
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Status
                </div>
              </SelectItem>
              <SelectItem value="customer">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Customer
                </div>
              </SelectItem>
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
                    Placed on {new Date(order.date).toLocaleDateString('en-US', {
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
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm text-text-muted">
                          {item.quantity} × ${item.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Actions */}
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Track Package
                  </Button>
                  {order.status === "Delivered" && (
                    <Button variant="outline" size="sm">
                      Leave Review
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
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
            <Button>Browse Products</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

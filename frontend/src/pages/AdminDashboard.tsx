import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, Edit, Package, Plus, ShoppingCart, Users } from "lucide-react";

export function AdminDashboard() {
  // Sample data - in real app this would come from API
  const stats = {
    totalUsers: 1247,
    totalProducts: 89,
    totalOrders: 342,
    totalRevenue: 45678.90
  };

  const recentOrders = [
    { id: 1001, customer: "John Doe", amount: 129.99, date: "2024-01-15", status: "Completed" },
    { id: 1002, customer: "Jane Smith", amount: 89.50, date: "2024-01-14", status: "Processing" },
    { id: 1003, customer: "Bob Johnson", amount: 234.75, date: "2024-01-13", status: "Shipped" },
  ];

  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-lg opacity-80 max-w-2xl mx-auto">Manage products, users, orders, and discount codes</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Product Management
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">Product Name</Label>
              <Input id="product-name" placeholder="Enter product name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-price">Price</Label>
              <Input id="product-price" type="number" placeholder="0.00" step="0.01" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-quantity">Quantity Available</Label>
              <Input id="product-quantity" type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-description">Description</Label>
              <Textarea id="product-description" placeholder="Enter product description" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-category">Category</Label>
              <Select id="product-category">
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="home-kitchen">Home & Kitchen</SelectItem>
                <SelectItem value="books">Books</SelectItem>
              </Select>
            </div>
            <Button className="w-full">Create Product</Button>
          </CardContent>
        </Card>

        {/* Discount Code Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Discount Codes
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Code
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="discount-code">Discount Code</Label>
              <Input id="discount-code" placeholder="e.g., SAVE20" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount-type">Discount Type</Label>
              <Select id="discount-type">
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount-value">Discount Value</Label>
              <Input id="discount-value" type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount-expiry">Expiry Date</Label>
              <Input id="discount-expiry" type="date" />
            </div>
            <Button className="w-full">Create Discount Code</Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Order #{order.id}</h4>
                  <p className="text-sm opacity-70">{order.customer} • {order.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${order.amount}</p>
                  <p className="text-sm opacity-70">{order.status}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

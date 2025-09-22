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
                <SelectItem value="sports">Sports</SelectItem>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-image">Image URL</Label>
              <Input id="product-image" placeholder="https://example.com/image.jpg" />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">Create Product</Button>
              <Button variant="outline" className="flex-1">Update Existing</Button>
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search-users">Search Users</Label>
              <Input id="search-users" placeholder="Search by name or email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-action">Action</Label>
              <Select id="user-action">
                <SelectItem value="view">View Profile</SelectItem>
                <SelectItem value="edit">Edit User</SelectItem>
                <SelectItem value="deactivate">Deactivate Account</SelectItem>
                <SelectItem value="delete">Delete Account</SelectItem>
              </Select>
            </div>
            <Button className="w-full">Apply Action</Button>

            <div className="mt-6 p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Recent Users</h4>
              <div className="space-y-1 text-sm">
                <p>• John Doe - john@example.com</p>
                <p>• Jane Smith - jane@example.com</p>
                <p>• Bob Johnson - bob@example.com</p>
              </div>
            </div>
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
            <div className="flex gap-2">
              <Button className="flex-1">Create Code</Button>
              <Button variant="outline" className="flex-1">Manage Existing</Button>
            </div>
          </CardContent>
        </Card>

        {/* Sales Items */}
        <Card>
          <CardHeader>
            <CardTitle>Sales & Promotions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sale-name">Sale Name</Label>
              <Input id="sale-name" placeholder="e.g., Summer Sale" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale-discount">Discount %</Label>
              <Input id="sale-discount" type="number" placeholder="25" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale-products">Select Products</Label>
              <Select id="sale-products">
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="category">By Category</SelectItem>
                <SelectItem value="specific">Specific Products</SelectItem>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale-duration">Duration (Days)</Label>
              <Input id="sale-duration" type="number" placeholder="7" />
            </div>
            <Button className="w-full">Create Sale</Button>
          </CardContent>
        </Card>
      </div>

      {/* Order Management */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Order Management
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort Orders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Date: Newest First</SelectItem>
                <SelectItem value="date-asc">Date: Oldest First</SelectItem>
                <SelectItem value="customer">Customer Name</SelectItem>
                <SelectItem value="amount-desc">Order Amount: High-Low</SelectItem>
                <SelectItem value="amount-asc">Order Amount: Low-High</SelectItem>
                <SelectItem value="status">Order Status</SelectItem>
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Order #{order.id}</h4>
                      <p className="text-sm text-text-muted">{order.customer} • {order.date}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right mx-4">
                  <p className="font-bold text-lg">${order.amount}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    Update Status
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-3">Order Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <p className="font-bold text-lg">342</p>
                <p className="text-text-muted">Total Orders</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-green-600">289</p>
                <p className="text-text-muted">Completed</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-blue-600">45</p>
                <p className="text-text-muted">Processing</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-yellow-600">8</p>
                <p className="text-text-muted">Pending</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

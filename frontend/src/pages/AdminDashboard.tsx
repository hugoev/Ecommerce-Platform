import { itemHelpers, itemsApi } from "@/api/items";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAdminDiscounts } from "@/hooks/useAdminDiscounts";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useItems } from "@/hooks/useItems";
// import { useSales } from "@/hooks/useSales"; // Commented out - backend not implemented
import { DollarSign, Edit, Loader2, Package, Plus, ShoppingCart, Trash2, Upload, Users } from "lucide-react";
import { useState } from "react";

export function AdminDashboard() {
  const { items, loading, error, createItem, updateItem, deleteItem } = useItems();
  const { orders: adminOrders, updateOrderStatus } = useAdminOrders();
  const { users } = useAdminUsers();
  const { discountCodes, createDiscountCode } = useAdminDiscounts();
  // const { salesItems, createSalesItem } = useSales(); // Commented out - backend not implemented

  // Calculate stats from real data
  const stats = {
    totalUsers: users.length,
    totalProducts: items.length,
    totalOrders: adminOrders.length,
    totalRevenue: adminOrders.reduce((sum, order) => sum + order.total, 0)
  };

  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingOrderStatus, setEditingOrderStatus] = useState<{ orderId: number; status: string } | null>(null);

  // Form state for adding/editing products
  const [productForm, setProductForm] = useState({
    title: '',
    price: '',
    quantityAvailable: '',
    category: '',
    description: '',
    imageUrl: ''
  });

  // Form state for user management
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserAction, setSelectedUserAction] = useState('');

  // Form state for discount codes
  const [discountForm, setDiscountForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    expiryDate: ''
  });

  // Form state for sales/promotions
  const [salesForm, setSalesForm] = useState({
    name: '',
    discount: '',
    productSelection: 'all',
    duration: ''
  });

  // Order management state
  const [orderSortBy, setOrderSortBy] = useState('date-desc');
  const [orderFilterStatus, setOrderFilterStatus] = useState('all');

  // Dialog states
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);
  const [showSalesDialog, setShowSalesDialog] = useState(false);

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const imageUrl = await itemsApi.uploadImage(file);
      setProductForm({ ...productForm, imageUrl });
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newProduct = {
        title: productForm.title,
        price: parseFloat(productForm.price),
        quantityAvailable: parseInt(productForm.quantityAvailable),
        category: productForm.category,
        description: productForm.description,
        imageUrl: productForm.imageUrl
      };

      if (editingProduct) {
        await updateItem(editingProduct.id, itemHelpers.toBackend(newProduct));
      } else {
        await createItem(newProduct);
      }

      // Reset form
      setProductForm({
        title: '',
        price: '',
        quantityAvailable: '',
        category: '',
        description: '',
        imageUrl: ''
      });
      setEditingProduct(null);
    } catch (error) {
      console.error('Failed to save product:', error);
      // Error handling is done in the useItems hook
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      price: product.price.toString(),
      quantityAvailable: product.quantityAvailable.toString(),
      category: product.category,
      description: product.description,
      imageUrl: product.imageUrl || ''
    });
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setEditingOrderStatus(null);
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const handleCreateDiscountCode = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const discountPercentage = discountForm.discountType === 'percentage'
        ? parseFloat(discountForm.discountValue)
        : (parseFloat(discountForm.discountValue) / 100); // Convert fixed amount to percentage

      await createDiscountCode({
        code: discountForm.code,
        discountPercentage,
        expiryDate: discountForm.expiryDate || undefined,
        active: true
      });

      setDiscountForm({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        expiryDate: ''
      });
      setShowDiscountDialog(false);
    } catch (error) {
      console.error('Failed to create discount code:', error);
    }
  };

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // For now, we'll create a sale for the first item as an example
      // Sales API not implemented in backend yet
      // In a real implementation, you'd select specific items or categories
      // if (items.length > 0) {
      //   const discountPercentage = parseFloat(salesForm.discount);
      //   const salePrice = items[0].price * (1 - discountPercentage / 100);

      //   await createSalesItem({
      //     itemId: items[0].id,
      //     salePrice,
      //     saleStartDate: new Date().toISOString(),
      //     saleEndDate: new Date(Date.now() + parseInt(salesForm.duration) * 24 * 60 * 60 * 1000).toISOString()
      //   });

      //   setSalesForm({
      //     name: '',
      //     discount: '',
      //     productSelection: 'all',
      //     duration: ''
      //   });
      //   setShowSalesDialog(false);
      // }
      alert('Sales API not yet implemented in backend');
      setShowSalesDialog(false);
    } catch (error) {
      console.error('Failed to create sale:', error);
    }
  };

  const handleUserAction = async () => {
    if (!selectedUserAction || !userSearch) return;

    // For now, we'll just log the action
    // In a real implementation, this would perform the selected action on the searched user
    console.log('User action:', selectedUserAction, 'on user:', userSearch);
    alert(`Action "${selectedUserAction}" would be performed on user "${userSearch}"`);
  };

  // Get filtered and sorted orders
  const getFilteredAndSortedOrders = () => {
    let filteredOrders = adminOrders;

    // Filter by status
    if (orderFilterStatus !== 'all') {
      filteredOrders = adminOrders.filter(order => order.status === orderFilterStatus);
    }

    // Sort orders
    const sortedOrders = [...filteredOrders].sort((a, b) => {
      switch (orderSortBy) {
        case 'date-desc':
          return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
        case 'date-asc':
          return new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
        case 'customer':
          return a.username.localeCompare(b.username);
        case 'amount-desc':
          return b.total - a.total;
        case 'amount-asc':
          return a.total - b.total;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return sortedOrders.slice(0, 10); // Show top 10 orders
  };

  const filteredOrders = getFilteredAndSortedOrders();

  return (
    <div className="container py-12 px-4 max-w-7xl mx-auto">
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
              <Input
                id="search-users"
                placeholder="Search by name or email"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-action">Action</Label>
              <Select value={selectedUserAction} onValueChange={setSelectedUserAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View Profile</SelectItem>
                  <SelectItem value="edit">Edit User</SelectItem>
                  <SelectItem value="deactivate">Deactivate Account</SelectItem>
                  <SelectItem value="delete">Delete Account</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleUserAction}>Apply Action</Button>

            <div className="mt-6">
              <h4 className="font-medium mb-3">Users ({users.length})</h4>
              {users.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No users found.
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-sm text-muted-foreground">{user.username}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">{user.role.replace('ROLE_', '')}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">View</Button>
                          <Button size="sm" variant="outline">Edit</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Discount Code Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Discount Codes
              <DialogTrigger onClick={() => setShowDiscountDialog(true)}>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Code
                </Button>
              </DialogTrigger>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-64 overflow-y-auto space-y-2">
              {discountCodes.map((discount) => (
                <div key={discount.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-mono font-bold">{discount.code}</div>
                    <div className="text-sm text-muted-foreground">Created: {discount.createdAt ? new Date(discount.createdAt || '').toLocaleDateString() : 'Unknown'}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">{discount.discountPercentage}%</span>
                    <span className="text-sm">{discount.usageCount} uses</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      discount.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {discount.active ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">Toggle</Button>
                    </div>
                  </div>
                </div>
              ))}
              {discountCodes.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No discount codes yet. Create your first discount code to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Discount Code Creation Dialog */}
        <Dialog open={showDiscountDialog} onOpenChange={setShowDiscountDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Discount Code</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateDiscountCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="discount-code">Discount Code</Label>
                <Input
                  id="discount-code"
                  placeholder="e.g., SAVE20"
                  value={discountForm.code}
                  onChange={(e) => setDiscountForm({...discountForm, code: e.target.value.toUpperCase()})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount-type">Discount Type</Label>
                <Select value={discountForm.discountType} onValueChange={(value) => setDiscountForm({...discountForm, discountType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount-value">
                  Discount Value {discountForm.discountType === 'percentage' ? '(%)' : '($)'}
                </Label>
                <Input
                  id="discount-value"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={discountForm.discountValue}
                  onChange={(e) => setDiscountForm({...discountForm, discountValue: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount-expiry">Expiry Date (Optional)</Label>
                <Input
                  id="discount-expiry"
                  type="date"
                  value={discountForm.expiryDate}
                  onChange={(e) => setDiscountForm({...discountForm, expiryDate: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Create Code</Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowDiscountDialog(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Sales Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Sales & Promotions
              <DialogTrigger onClick={() => setShowSalesDialog(true)}>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Sale
                </Button>
              </DialogTrigger>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-64 overflow-y-auto space-y-2">
              {/* Sales API not implemented - commented out */}
              {/* {salesItems.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{sale.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(sale.saleStartDate).toLocaleDateString()} - {new Date(sale.saleEndDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm line-through text-muted-foreground">${sale.originalPrice.toFixed(2)}</div>
                      <div className="text-green-600 font-bold">${sale.salePrice.toFixed(2)}</div>
                    </div>
                    <span className="text-sm">{sale.discountPercentage}% off</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      sale.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {sale.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">Toggle</Button>
                    </div>
                  </div>
                </div>
              ))} */}
              <div className="text-center text-muted-foreground py-8">
                Sales API not yet implemented in backend.
                <br />
                Use item's "onSale" and "discountedPrice" fields for now.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Creation Dialog */}
        <Dialog open={showSalesDialog} onOpenChange={setShowSalesDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Sale/Promotion</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSale} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sale-name">Sale Name</Label>
                <Input
                  id="sale-name"
                  placeholder="e.g., Summer Sale"
                  value={salesForm.name}
                  onChange={(e) => setSalesForm({...salesForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale-discount">Discount %</Label>
                <Input
                  id="sale-discount"
                  type="number"
                  placeholder="25"
                  value={salesForm.discount}
                  onChange={(e) => setSalesForm({...salesForm, discount: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale-products">Product Selection</Label>
                <Select value={salesForm.productSelection} onValueChange={(value) => setSalesForm({...salesForm, productSelection: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="category">By Category</SelectItem>
                    <SelectItem value="specific">Specific Products</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale-duration">Duration (Days)</Label>
                <Input
                  id="sale-duration"
                  type="number"
                  placeholder="7"
                  value={salesForm.duration}
                  onChange={(e) => setSalesForm({...salesForm, duration: e.target.value})}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Create Sale</Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowSalesDialog(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Product Listing */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Management
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setEditingProduct(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading products...</span>
            </div>
          )}
          {error && (
            <div className="text-center py-4">
              <p className="text-red-600">Error: {error}</p>
            </div>
          )}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((product) => (
              <Card key={product.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="p-4">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-3">
                    <img
                      src={product.imageUrl || '/placeholder-product.jpg'}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{product.title}</h4>
                    <p className="text-xs text-text-muted mb-2 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary">${product.price}</span>
                      <span className="text-xs text-text-muted">{product.quantityAvailable} in stock</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this product?')) {
                          try {
                            await deleteItem(product.id);
                          } catch (error) {
                            console.error('Failed to delete product:', error);
                          }
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Form */}
      {(editingProduct || productForm.title) && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product-title">Product Title</Label>
                  <Input
                    id="product-title"
                    value={productForm.title}
                    onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                    placeholder="Enter product title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-price">Price</Label>
                  <Input
                    id="product-price"
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-quantity">Quantity Available</Label>
                  <Input
                    id="product-quantity"
                    type="number"
                    value={productForm.quantityAvailable}
                    onChange={(e) => setProductForm({...productForm, quantityAvailable: e.target.value})}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-category">Category</Label>
                  <Select
                    value={productForm.category}
                    onValueChange={(value: string) => setProductForm({...productForm, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="home-kitchen">Home & Kitchen</SelectItem>
                      <SelectItem value="books">Books</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Product Image</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        id="product-image"
                        value={productForm.imageUrl}
                        onChange={(e) => setProductForm({...productForm, imageUrl: e.target.value})}
                        placeholder="https://example.com/image.jpg or upload below"
                      />
                    </div>
                    <div className="flex items-end">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploadingImage}
                          className="flex items-center gap-2"
                        >
                          {uploadingImage ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              Upload
                            </>
                          )}
                        </Button>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload an image file (JPG, PNG, etc.) or enter an image URL
                  </p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="product-description">Description</Label>
                  <Textarea
                    id="product-description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    placeholder="Enter product description"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({
                      title: '',
                      price: '',
                      quantityAvailable: '',
                      category: '',
                      description: '',
                      imageUrl: ''
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Order Management */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Order Management
            <div className="flex gap-2">
              <Select value={orderFilterStatus} onValueChange={setOrderFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={orderSortBy} onValueChange={setOrderSortBy}>
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
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Order #{order.id}</h4>
                      <p className="text-sm text-text-muted">{order.username} • {new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right mx-4">
                  <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingOrderStatus({ orderId: order.id, status: order.status })}
                  >
                    Update Status
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Status Update Modal */}
          {editingOrderStatus && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Update Order Status</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={editingOrderStatus.status} 
                      onValueChange={(value) => setEditingOrderStatus({ ...editingOrderStatus, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="PROCESSING">Processing</SelectItem>
                        <SelectItem value="SHIPPED">Shipped</SelectItem>
                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => setEditingOrderStatus(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => handleUpdateOrderStatus(editingOrderStatus.orderId, editingOrderStatus.status)}
                    >
                      Update Status
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

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

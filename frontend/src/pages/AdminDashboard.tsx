import type { AdminUserResponse } from "@/api/admin";
import { itemHelpers, itemsApi } from "@/api/items";
import type { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { useAdminDiscounts } from "@/hooks/useAdminDiscounts";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useItems } from "@/hooks/useItems";
import { useSales } from "@/hooks/useSales";
import type { Order } from "@/types";
import { DollarSign, Edit, Eye, Loader2, Package, Plus, ShoppingCart, Trash2, Upload, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const token = localStorage.getItem('token');
  const { showToast } = useToast();
  const hasRedirected = useRef(false);

  // Helper function to format sale dates
  const formatSaleDate = (dateString: string | undefined): string => {
    if (!dateString || dateString === '') {
      return 'No date set';
    }
    
    try {
      // Log the raw date string for debugging
      console.log('Formatting date:', dateString, 'Type:', typeof dateString);
      
      // Handle ISO string format from backend
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return 'Invalid date';
      }
      
      // Check if date is suspiciously old (before 2000)
      if (date.getFullYear() < 2000) {
        console.error('Date seems incorrect:', dateString, 'parsed as:', date);
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return 'Invalid date';
    }
  };

  // Check authentication and admin role
  useEffect(() => {
    // Reset redirect flag if user becomes authenticated and is admin
    if (isAuthenticated && token && user?.role === 'ROLE_ADMIN') {
      hasRedirected.current = false;
      return;
    }

    // Prevent multiple redirects/toasts
    if (hasRedirected.current) return;

    if (!isAuthenticated || !token) {
      hasRedirected.current = true;
      showToast('Please log in to access the admin dashboard', 'error');
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'ROLE_ADMIN') {
      hasRedirected.current = true;
      showToast('Admin access required', 'error');
      navigate('/');
      return;
    }
  }, [isAuthenticated, token, user, navigate, showToast]);

  // Early return if not authenticated or not admin
  if (!isAuthenticated || !token || user?.role !== 'ROLE_ADMIN') {
    return (
      <div className="container py-12 px-4 max-w-7xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-4">Please log in as an administrator to access this page.</p>
        <Button onClick={() => navigate('/login')}>Go to Login</Button>
      </div>
    );
  }

  const { items, loading, error, createItem, updateItem, deleteItem } = useItems();
  const { orders: adminOrders, updateOrderStatus, fetchAllOrders } = useAdminOrders();
  const { users, fetchUsers, updateUser, deleteUser } = useAdminUsers();
  const { discountCodes, createDiscountCode, updateDiscountCode, toggleDiscountCode, deleteDiscountCode, fetchDiscountCodes } = useAdminDiscounts();
  const { salesItems, loading: salesLoading, createSalesItem, updateSalesItem, deleteSalesItem, toggleActive: toggleSalesActive, fetchSalesItems } = useSales();

  // Calculate stats from real data
  const stats = {
    totalUsers: users.length,
    totalProducts: items.length,
    totalOrders: adminOrders.length,
    totalRevenue: adminOrders.reduce((sum, order) => sum + order.total, 0)
  };

  // Calculate order statistics from real data
  const orderStats = useMemo(() => {
    return {
      total: adminOrders.length,
      delivered: adminOrders.filter(order => order.status?.toUpperCase() === 'DELIVERED').length,
      processing: adminOrders.filter(order => order.status?.toUpperCase() === 'PROCESSING' || order.status?.toUpperCase() === 'SHIPPED').length,
      pending: adminOrders.filter(order => order.status?.toUpperCase() === 'PENDING').length,
    };
  }, [adminOrders]);

  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingOrderStatus, setEditingOrderStatus] = useState<{ orderId: number; status: string } | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUserResponse | null>(null);
  const [viewingUser, setViewingUser] = useState<AdminUserResponse | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUserResponse | null>(null);
  const [editingDiscountCode, setEditingDiscountCode] = useState<{ id: number; code: string; discountPercentage: number; expiryDate?: string; active: boolean } | null>(null);
  const [editingSalesItem, setEditingSalesItem] = useState<{ id: number; itemId: number; salePrice: number; saleStartDate: string; saleEndDate: string } | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

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
  const [userEditForm, setUserEditForm] = useState({
    firstName: '',
    lastName: '',
    address: '',
    phone: ''
  });

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

  // Memoized callbacks for dialogs to prevent unnecessary re-renders
  const handleViewUserClose = useCallback((open: boolean) => {
    if (!open) {
      setViewingUser(null);
    }
  }, []);

  const handleEditUserClose = useCallback((open: boolean) => {
    if (!open) {
      setEditingUser(null);
    }
  }, []);

  // Memoize dialog children to prevent recreation on every render
  const viewUserDialogContent = useMemo(() => {
    if (!viewingUser) return null;
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Details - {viewingUser.username}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Username</Label>
            <p className="font-medium">{viewingUser.username}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Full Name</Label>
            <p className="font-medium">{viewingUser.fullName || 'N/A'}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Address</Label>
            <p className="font-medium">{viewingUser.address || 'N/A'}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Phone</Label>
            <p className="font-medium">{viewingUser.phone || 'N/A'}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Role</Label>
            <p className="font-medium">{viewingUser.role.replace('ROLE_', '')}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Status</Label>
            <span className={`px-2 py-1 rounded-full text-xs inline-block ${
              viewingUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {viewingUser.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <Button 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                const userToEdit = viewingUser;
                setViewingUser(null);
                setTimeout(() => {
                  setEditingUser(userToEdit);
                  setUserEditForm({
                    firstName: userToEdit.fullName?.split(' ')[0] || '',
                    lastName: userToEdit.fullName?.split(' ').slice(1).join(' ') || '',
                    address: userToEdit.address || '',
                    phone: userToEdit.phone || ''
                  });
                }, 150);
              }}
            >
              Edit User
            </Button>
            <Button 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                setViewingUser(null);
              }}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    );
  }, [viewingUser]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be less than 5MB', 'error');
      return;
    }

    setUploadingImage(true);
    try {
      const imageUrl = await itemsApi.uploadImage(file);
      setProductForm({ ...productForm, imageUrl });
      showToast('Image uploaded successfully', 'success');
      // Reset the file input so the same file can be uploaded again if needed
      e.target.value = '';
    } catch (error) {
      console.error('Failed to upload image:', error);
      showToast(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
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
      setShowProductForm(false);
    } catch (error) {
      console.error('Failed to save product:', error);
      // Error handling is done in the useItems hook
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setShowProductForm(true);
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
      // Reset filter to 'all' so the updated order is visible
      setOrderFilterStatus('all');
      // Refresh orders to get updated data
      await fetchAllOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
      showToast(`Failed to update order status: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleCreateDiscountCode = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const discountPercentage = discountForm.discountType === 'percentage'
        ? parseFloat(discountForm.discountValue)
        : (parseFloat(discountForm.discountValue) / 100); // Convert fixed amount to percentage

      // Convert date string (YYYY-MM-DD) to ISO datetime string (YYYY-MM-DDTHH:mm:ss.sssZ)
      // Set time to end of day (23:59:59) in UTC to avoid timezone issues
      let expiryDate: string | undefined = undefined;
      if (discountForm.expiryDate) {
        // Parse date string and set to end of day in UTC
        const [year, month, day] = discountForm.expiryDate.split('-').map(Number);
        const date = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
        expiryDate = date.toISOString();
      }

      if (editingDiscountCode) {
        // Update existing discount code
        await updateDiscountCode(editingDiscountCode.id, {
          code: discountForm.code,
          discountPercentage,
          expiryDate,
          active: editingDiscountCode.active
        });
        // Success - no alert needed
      } else {
        // Create new discount code
        await createDiscountCode({
          code: discountForm.code,
          discountPercentage,
          expiryDate,
          active: true
        });
        // Success - no alert needed
      }

      setDiscountForm({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        expiryDate: ''
      });
      setEditingDiscountCode(null);
      setShowDiscountDialog(false);
      await fetchDiscountCodes();
    } catch (error) {
      console.error('Failed to create/update discount code:', error);
      showToast(`Failed to ${editingDiscountCode ? 'update' : 'create'} discount code: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (items.length === 0) {
        showToast('No items available to create a sale', 'error');
        return;
      }

      // Find the first item or allow selection
      const selectedItem = items[0]; // In a real implementation, allow item selection
      const discountPercentage = parseFloat(salesForm.discount);
      const salePrice = selectedItem.price * (1 - discountPercentage / 100);
      const durationDays = parseInt(salesForm.duration) || 7;

      if (editingSalesItem) {
        // Update existing sale
        await updateSalesItem(editingSalesItem.id, {
          salePrice: salePrice,
          saleStartDate: new Date().toISOString(),
          saleEndDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
        });
        // Success - no alert needed
        await fetchSalesItems(); // Refresh to get updated dates from server
      } else {
        // Check if item already has an active sale
        const existingSale = salesItems.find(sale => sale.itemId === selectedItem.id && sale.isActive);
        if (existingSale) {
          const shouldEdit = confirm(
            `This item already has an active sale (${existingSale.title}). Would you like to edit it instead?`
          );
          if (shouldEdit) {
            setEditingSalesItem({
              id: existingSale.id,
              itemId: existingSale.itemId,
              salePrice: existingSale.salePrice,
              saleStartDate: existingSale.saleStartDate,
              saleEndDate: existingSale.saleEndDate
            });
            setSalesForm({
              name: existingSale.title,
              discount: existingSale.discountPercentage.toString(),
              productSelection: 'specific',
              duration: Math.ceil((new Date(existingSale.saleEndDate).getTime() - new Date(existingSale.saleStartDate).getTime()) / (1000 * 60 * 60 * 24)).toString()
            });
            // Keep dialog open for editing
            return;
          } else {
            showToast('Please deactivate the existing sale first, or edit it instead.', 'error');
            return;
          }
        }

        // Create new sale
        await createSalesItem({
          itemId: selectedItem.id,
          salePrice: salePrice,
          saleStartDate: new Date().toISOString(),
          saleEndDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
        });
        // Success - no alert needed
        await fetchSalesItems(); // Refresh to get correct dates from server
      }

      setSalesForm({
        name: '',
        discount: '',
        productSelection: 'all',
        duration: ''
      });
      setEditingSalesItem(null);
      setShowSalesDialog(false);
    } catch (error) {
      console.error('Failed to create/update sale:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check if error is about existing active sale
      if (errorMessage.includes('already has an active sale')) {
        const selectedItem = items[0];
        const existingSale = salesItems.find(sale => sale.itemId === selectedItem.id && sale.isActive);
        if (existingSale) {
          const shouldEdit = confirm(
            `This item already has an active sale. Would you like to edit it instead?`
          );
          if (shouldEdit) {
            setEditingSalesItem({
              id: existingSale.id,
              itemId: existingSale.itemId,
              salePrice: existingSale.salePrice,
              saleStartDate: existingSale.saleStartDate,
              saleEndDate: existingSale.saleEndDate
            });
            setSalesForm({
              name: existingSale.title,
              discount: existingSale.discountPercentage.toString(),
              productSelection: 'specific',
              duration: Math.ceil((new Date(existingSale.saleEndDate).getTime() - new Date(existingSale.saleStartDate).getTime()) / (1000 * 60 * 60 * 24)).toString()
            });
            return;
          }
        }
        showToast('This item already has an active sale. Please deactivate it first or edit the existing sale.', 'error');
      } else {
        showToast(`Failed to ${editingSalesItem ? 'update' : 'create'} sale: ${errorMessage}`, 'error');
      }
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await deleteUser(userId); // This already calls fetchUsers() internally
      showToast('User deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete user:', error);
      showToast(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  // Get filtered and sorted orders
  const getFilteredAndSortedOrders = () => {
    let filteredOrders = adminOrders;

    // Filter by status (case-insensitive comparison)
    if (orderFilterStatus !== 'all') {
      filteredOrders = adminOrders.filter(order => 
        order.status?.toUpperCase() === orderFilterStatus.toUpperCase()
      );
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
                placeholder="Search by username or name"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            <div className="mt-4">
              {(() => {
                // Filter users based on search
                const filteredUsers = userSearch
                  ? users.filter(user => 
                      user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                      user.fullName?.toLowerCase().includes(userSearch.toLowerCase())
                    )
                  : users;
                
                return (
                  <>
                    <h4 className="font-medium mb-3">Users ({filteredUsers.length})</h4>
                    {filteredUsers.length === 0 ? (
                      <div className="text-center text-muted-foreground py-4">
                        {userSearch ? 'No users found matching your search.' : 'No users found.'}
                      </div>
                    ) : (
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {filteredUsers.slice(0, 10).map((user) => (
                    <div key={user.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{user.fullName}</div>
                        <div className="text-sm text-muted-foreground truncate">{user.username}</div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap shrink-0">
                        <span className="text-sm whitespace-nowrap">{user.role.replace('ROLE_', '')}</span>
                        <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <div className="flex gap-1.5">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingUser(null); // Close edit modal if open
                              setViewingUser(user);
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingUser(null); // Close view modal if open
                              setEditingUser(user);
                              setUserEditForm({
                                firstName: user.fullName?.split(' ')[0] || '',
                                lastName: user.fullName?.split(' ').slice(1).join(' ') || '',
                                address: user.address || '',
                                phone: user.phone || ''
                              });
                            }}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUserToDelete(user);
                            }}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Discount Codes and Sales */}
        <div className="flex flex-col gap-8">
          {/* Discount Code Management */}
          <Card className="self-start">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Discount Codes
              <Button size="sm" onClick={() => setShowDiscountDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Code
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="max-h-64 overflow-y-auto space-y-2">
              {discountCodes.map((discount) => {
                // Normalize expiry date for display
                const normalizeDate = (date: any): string | null => {
                  if (!date) return null;
                  if (typeof date === 'string') {
                    const parsed = new Date(date);
                    if (!isNaN(parsed.getTime()) && parsed.getFullYear() >= 2000) {
                      return date;
                    }
                  }
                  if (typeof date === 'number') {
                    // Backend sends seconds as decimal, convert to milliseconds
                    const milliseconds = date * 1000;
                    const jsDate = new Date(milliseconds);
                    if (!isNaN(jsDate.getTime()) && jsDate.getFullYear() >= 2000) {
                      return jsDate.toISOString();
                    }
                  }
                  if (Array.isArray(date) && date.length >= 3) {
                    const [year, month, day] = date;
                    if (year >= 2000) {
                      const jsDate = new Date(Date.UTC(year, month - 1, day));
                      return jsDate.toISOString();
                    }
                  }
                  return null;
                };

                const expiryDateStr = normalizeDate(discount.expiryDate);
                const expiryDate = expiryDateStr ? new Date(expiryDateStr) : null;
                const isExpired = expiryDate && expiryDate < new Date();
                
                const createdAtStr = normalizeDate(discount.createdAt);
                const createdAt = createdAtStr ? new Date(createdAtStr) : null;
                
                return (
                  <div key={discount.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono font-bold truncate">{discount.code}</div>
                      <div className="text-sm text-muted-foreground flex flex-wrap gap-x-2 gap-y-1">
                        {createdAt ? (
                          <span>Created: {createdAt.toLocaleDateString()}</span>
                        ) : (
                          <span>Created: Unknown</span>
                        )}
                        {expiryDate && (
                          <span className={isExpired ? 'text-red-600 font-medium' : ''}>
                            Expires: {expiryDate.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <span className="text-sm font-semibold whitespace-nowrap">{discount.discountPercentage}%</span>
                      <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                        discount.active && !isExpired ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {discount.active && !isExpired ? 'Active' : isExpired ? 'Expired' : 'Inactive'}
                      </span>
                      <div className="flex gap-1.5">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8"
                          onClick={() => {
                            setEditingDiscountCode({
                              id: discount.id,
                              code: discount.code,
                              discountPercentage: discount.discountPercentage,
                              expiryDate: expiryDateStr || discount.expiryDate,
                              active: discount.active
                            });
                            setDiscountForm({
                              code: discount.code,
                              discountType: 'percentage',
                              discountValue: discount.discountPercentage.toString(),
                              expiryDate: expiryDateStr ? expiryDateStr.split('T')[0] : ''
                            });
                            setShowDiscountDialog(true);
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8"
                          onClick={async () => {
                            try {
                              await toggleDiscountCode(discount.id);
                              await fetchDiscountCodes();
                            } catch (error) {
                              console.error('Failed to toggle discount code:', error);
                              showToast(`Failed to toggle discount code: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
                            }
                          }}
                        >
                          <span className="hidden sm:inline">Toggle</span>
                          <span className="sm:hidden">On/Off</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8"
                          onClick={async () => {
                              try {
                                await deleteDiscountCode(discount.id);
                                await fetchDiscountCodes();
                              showToast('Discount code deleted successfully', 'success');
                              } catch (error) {
                                console.error('Failed to delete discount code:', error);
                              showToast(`Failed to delete discount code: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
              <DialogTitle>{editingDiscountCode ? 'Edit Discount Code' : 'Create Discount Code'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateDiscountCode} className="space-y-4">
              <div className="mb-4 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (editingDiscountCode) {
                      setEditingDiscountCode(null);
                      setDiscountForm({
                        code: '',
                        discountType: 'percentage',
                        discountValue: '',
                        expiryDate: ''
                      });
                    } else {
                      const demoCodes = [
                        { code: 'DEMO25', discountType: 'percentage', discountValue: '25', expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
                        { code: 'SAVE15', discountType: 'percentage', discountValue: '15', expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() },
                        { code: 'WELCOME10', discountType: 'percentage', discountValue: '10', expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() },
                      ];
                      const randomCode = demoCodes[Math.floor(Math.random() * demoCodes.length)];
                      // Convert ISO string to date input format (YYYY-MM-DD) for display, but store full ISO string
                      const dateForInput = randomCode.expiryDate.split('T')[0];
                      setDiscountForm({
                        code: randomCode.code,
                        discountType: randomCode.discountType as 'percentage' | 'fixed',
                        discountValue: randomCode.discountValue,
                        expiryDate: dateForInput // Store date-only for the input field
                      });
                    }
                  }}
                >
                  🎯 Fill Demo Data
                </Button>
              </div>
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
                <Select id="discount-type" value={discountForm.discountType} onValueChange={(value) => setDiscountForm({...discountForm, discountType: value})}>
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
                <Button type="submit" className="flex-1">{editingDiscountCode ? 'Update Code' : 'Create Code'}</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => {
                    setShowDiscountDialog(false);
                    setEditingDiscountCode(null);
                    setDiscountForm({
                      code: '',
                      discountType: 'percentage',
                      discountValue: '',
                      expiryDate: ''
                    });
                  }}
                >
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
                <Button size="sm" onClick={() => setShowSalesDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Sale
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="max-h-64 overflow-y-auto space-y-2">
              {salesLoading ? (
                <div className="text-center text-muted-foreground py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Loading sales items...
                </div>
              ) : salesItems.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No sales items yet. Create your first sale to get started.
                </div>
              ) : (
                salesItems.map((sale) => (
                  <div key={sale.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{sale.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {sale.saleStartDate && sale.saleEndDate && sale.saleStartDate !== '' && sale.saleEndDate !== '' ? (
                          <>
                            {formatSaleDate(sale.saleStartDate)} - {formatSaleDate(sale.saleEndDate)}
                          </>
                        ) : (
                          <span className="text-yellow-600">Dates not set</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap shrink-0">
                      <div className="text-right">
                        <div className="text-sm line-through text-muted-foreground">${sale.originalPrice.toFixed(2)}</div>
                        <div className="text-green-600 font-bold">${sale.salePrice.toFixed(2)}</div>
                      </div>
                      <span className="text-sm whitespace-nowrap">{sale.discountPercentage.toFixed(0)}% off</span>
                      <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                        sale.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {sale.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <div className="flex gap-1.5">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8"
                          onClick={() => {
                            setEditingSalesItem({
                              id: sale.id,
                              itemId: sale.itemId,
                              salePrice: sale.salePrice,
                              saleStartDate: sale.saleStartDate,
                              saleEndDate: sale.saleEndDate
                            });
                            // Pre-populate form with sale data
                            setSalesForm({
                              name: sale.title,
                              discount: sale.discountPercentage.toString(),
                              productSelection: 'specific',
                              duration: Math.ceil((new Date(sale.saleEndDate).getTime() - new Date(sale.saleStartDate).getTime()) / (1000 * 60 * 60 * 24)).toString()
                            });
                            setShowSalesDialog(true);
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8"
                          onClick={async () => {
                            try {
                              await toggleSalesActive(sale.id);
                            } catch (error) {
                              console.error('Failed to toggle sale:', error);
                              showToast(`Failed to toggle sale: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
                            }
                          }}
                        >
                          <span className="hidden sm:inline">Toggle</span>
                          <span className="sm:hidden">On/Off</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8"
                          onClick={async () => {
                              try {
                                await deleteSalesItem(sale.id);
                              showToast('Sale deleted successfully', 'success');
                              } catch (error) {
                                console.error('Failed to delete sale:', error);
                              showToast(`Failed to delete sale: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
          </Card>
        </div>

        {/* Sales Creation Dialog */}
        <Dialog open={showSalesDialog} onOpenChange={setShowSalesDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSalesItem ? 'Edit Sale/Promotion' : 'Create Sale/Promotion'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSale} className="space-y-4">
              <div className="mb-4 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (items.length === 0) {
                      showToast('Please add products first before creating a sale', 'error');
                      return;
                    }
                    // Note: In a real implementation, you'd select a random item here
                    // For now, it will use the first item when creating the sale
                    const discounts = ['20', '25', '30', '35'];
                    const durations = ['7', '14', '30'];
                    setSalesForm({
                      name: 'Demo Sale',
                      discount: discounts[Math.floor(Math.random() * discounts.length)],
                      productSelection: 'specific',
                      duration: durations[Math.floor(Math.random() * durations.length)]
                    });
                  }}
                >
                  🎯 Fill Demo Data
                </Button>
              </div>
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
                <Select id="sale-products" value={salesForm.productSelection} onValueChange={(value) => setSalesForm({...salesForm, productSelection: value})}>
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
                <Button type="submit" className="flex-1">{editingSalesItem ? 'Update Sale' : 'Create Sale'}</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => {
                    setShowSalesDialog(false);
                    setEditingSalesItem(null);
                    setSalesForm({
                      name: '',
                      discount: '',
                      productSelection: 'all',
                      duration: ''
                    });
                  }}
                >
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
              <Button size="sm" onClick={() => {
                setEditingProduct(null);
                setShowProductForm(true);
                setProductForm({
                  title: '',
                  price: '',
                  quantityAvailable: '',
                  category: '',
                  description: '',
                  imageUrl: ''
                });
              }}>
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
                      src={product.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjgwIiBoZWlnaHQ9IjI4MCIgZmlsbD0iI2U1ZTdlOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        // Prevent infinite loop - if already using data URL, stop
                        const target = e.target as HTMLImageElement;
                        if (target.src.startsWith('data:')) {
                          return;
                        }
                        // Only replace local/relative URLs that fail, not external URLs
                        // External URLs might fail due to CORS or network issues, but we shouldn't replace them
                        // Only replace if it's a local path (starts with /) that doesn't exist
                        if (target.src.startsWith('/') && !target.src.startsWith('//')) {
                          // Local path failed - use data URL placeholder
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjgwIiBoZWlnaHQ9IjI4MCIgZmlsbD0iI2U1ZTdlOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                        }
                        // For external URLs, just let them fail naturally (don't replace)
                      }}
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
                          try {
                            await deleteItem(product.id);
                          showToast('Product deleted successfully', 'success');
                          } catch (error) {
                            console.error('Failed to delete product:', error);
                          if (error instanceof Error && error.message) {
                            showToast(`Failed to delete product: ${error.message}`, 'error');
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
      {(showProductForm || editingProduct !== null) && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const demoProducts = [
                    { title: 'Wireless Bluetooth Headphones', price: '79.99', quantity: '50', category: 'electronics', description: 'Premium noise-cancelling headphones with 30-hour battery life', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' },
                    { title: 'Cotton T-Shirt', price: '24.99', quantity: '100', category: 'clothing', description: 'Comfortable 100% cotton t-shirt available in multiple colors', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500' },
                    { title: 'Smart Watch', price: '199.99', quantity: '30', category: 'electronics', description: 'Fitness tracker with heart rate monitor and GPS', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500' },
                    { title: 'Coffee Maker', price: '89.99', quantity: '25', category: 'home-kitchen', description: 'Programmable coffee maker with thermal carafe', imageUrl: 'https://images.unsplash.com/photo-1517668808823-f8f30bcc58d4?w=500' },
                  ];
                  const randomProduct = demoProducts[Math.floor(Math.random() * demoProducts.length)];
                  setProductForm({
                    title: randomProduct.title,
                    price: randomProduct.price,
                    quantityAvailable: randomProduct.quantity,
                    category: randomProduct.category,
                    description: randomProduct.description,
                    imageUrl: randomProduct.imageUrl
                  });
                }}
              >
                🎯 Fill Demo Data
              </Button>
            </div>
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
                    id="product-category"
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
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploadingImage}
                          className="flex items-center gap-2"
                        onClick={() => {
                          const fileInput = document.getElementById('image-upload');
                          if (fileInput) {
                            fileInput.click();
                          }
                        }}
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
                    </div>
                  </div>
                  {productForm.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={productForm.imageUrl}
                        alt="Product preview"
                        className="max-w-xs max-h-48 object-contain border rounded-lg"
                        onError={(e) => {
                          // Prevent infinite loop - if already using data URL, stop
                          const target = e.target as HTMLImageElement;
                          if (target.src.startsWith('data:')) {
                            return;
                          }
                          // Only replace local/relative URLs that fail, not external URLs
                          // External URLs might fail due to CORS or network issues, but we shouldn't replace them
                          // Only replace if it's a local path (starts with /) that doesn't exist
                          if (target.src.startsWith('/') && !target.src.startsWith('//')) {
                            // Local path failed - use data URL placeholder
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjgwIiBoZWlnaHQ9IjI4MCIgZmlsbD0iI2U1ZTdlOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                          }
                          // For external URLs, just let them fail naturally (don't replace)
                        }}
                      />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Upload an image file (JPG, PNG, etc.) or enter an image URL. Max size: 5MB
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
                    setShowProductForm(false);
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setViewingOrder(order)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingOrderStatus({ orderId: order.id, status: order.status })}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit Status
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
                      id="status"
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

          {/* Order Details Modal */}
          {viewingOrder && (
            <Dialog open={!!viewingOrder} onOpenChange={() => setViewingOrder(null)}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Order Details - #{viewingOrder.id}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Customer</Label>
                      <p className="font-medium">{viewingOrder.username}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Order Date</Label>
                      <p className="font-medium">{new Date(viewingOrder.orderDate).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Status</Label>
                      <p className="font-medium">{viewingOrder.status}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Total</Label>
                      <p className="font-medium">${viewingOrder.total.toFixed(2)}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">Order Items</Label>
                    <div className="space-y-2">
                      {viewingOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between p-2 border rounded">
                          <span>{item.itemName} × {item.quantity}</span>
                          <span>${item.priceAtPurchase.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <Label className="text-sm text-muted-foreground">Subtotal</Label>
                      <p className="font-medium">${viewingOrder.subtotal.toFixed(2)}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Tax</Label>
                      <p className="font-medium">${viewingOrder.tax.toFixed(2)}</p>
                    </div>
                    {viewingOrder.discountAmount > 0 && (
                      <>
                        <div>
                          <Label className="text-sm text-muted-foreground">Discount</Label>
                          <p className="font-medium text-green-600">-${viewingOrder.discountAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Discount Code</Label>
                          <p className="font-medium">{viewingOrder.appliedDiscountCode}</p>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setViewingOrder(null)}>Close</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* User View Modal (Read-only) */}
          <Dialog open={!!viewingUser} onOpenChange={handleViewUserClose}>
            {viewUserDialogContent}
          </Dialog>

          {/* User Edit Modal */}
          <Dialog open={!!editingUser} onOpenChange={handleEditUserClose}>
            {editingUser && (
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit User - {editingUser.username}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-firstName">First Name</Label>
                    <Input
                      id="edit-firstName"
                      value={userEditForm.firstName}
                      onChange={(e) => setUserEditForm({...userEditForm, firstName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-lastName">Last Name</Label>
                    <Input
                      id="edit-lastName"
                      value={userEditForm.lastName}
                      onChange={(e) => setUserEditForm({...userEditForm, lastName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-address">Address</Label>
                    <Textarea
                      id="edit-address"
                      value={userEditForm.address}
                      onChange={(e) => setUserEditForm({...userEditForm, address: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Phone</Label>
                    <Input
                      id="edit-phone"
                      value={userEditForm.phone}
                      onChange={(e) => setUserEditForm({...userEditForm, phone: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-4">
                    <Button 
                      variant="outline" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingUser(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await updateUser(editingUser.id, {
                            fullName: `${userEditForm.firstName} ${userEditForm.lastName}`.trim(),
                            address: userEditForm.address,
                            phone: userEditForm.phone
                          });
                          await fetchUsers();
                          setEditingUser(null);
                          // Success - no alert needed
                        } catch (error) {
                          console.error('Failed to update user:', error);
                          showToast(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
                        }
                      }}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </DialogContent>
            )}
          </Dialog>

          {/* User Delete Confirmation Dialog */}
          <Dialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
            {userToDelete && (
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete user <strong>{userToDelete.username}</strong>? This action cannot be undone.
                  </p>
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => setUserToDelete(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="default"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={async () => {
                        await handleDeleteUser(userToDelete.id);
                        setUserToDelete(null);
                      }}
                    >
                      Delete User
                    </Button>
                  </div>
                </div>
              </DialogContent>
            )}
          </Dialog>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-3">Order Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <p className="font-bold text-lg">{orderStats.total}</p>
                <p className="text-text-muted">Total Orders</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-green-600">{orderStats.delivered}</p>
                <p className="text-text-muted">Delivered</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-blue-600">{orderStats.processing}</p>
                <p className="text-text-muted">Processing</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-yellow-600">{orderStats.pending}</p>
                <p className="text-text-muted">Pending</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

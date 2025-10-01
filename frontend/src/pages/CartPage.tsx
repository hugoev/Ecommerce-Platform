import type { RootState } from "@/app/store";
import { LoginModal } from "@/components/LoginModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/useCart";
import { useItems } from "@/hooks/useItems";
import { guestCartUtils, type GuestCartItem } from "@/utils/guestCart";
import { type CartItemResponse } from "@/api/cart";
import { Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export function CartPage() {
  const navigate = useNavigate();
  const { cart, loading, error, fetchCart, updateQuantity, removeItem, applyDiscount: applyDiscountToCart } = useCart();
  const { items } = useItems();
  const [discountCode, setDiscountCode] = useState("");
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [guestCart, setGuestCart] = useState<any>(null);

  // Union type for cart items (authenticated or guest)
  type CartItem = CartItemResponse | GuestCartItem;

  // Get current user from auth state
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id;

  useEffect(() => {
    if (userId) {
      fetchCart(userId);
    } else {
      // Load guest cart if user is not logged in
      const guestCartData = guestCartUtils.getCartSummary();
      setGuestCart(guestCartData);
    }
  }, [fetchCart, userId]);

  // Listen for cart updates from other components
  useEffect(() => {
    const handleCartUpdate = (event: CustomEvent) => {
      if (userId && event.detail?.userId === userId) {
        fetchCart(userId);
      }
    };

    const handleGuestCartUpdate = () => {
      if (!userId) {
        const guestCartData = guestCartUtils.getCartSummary();
        setGuestCart(guestCartData);
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate as EventListener);
    window.addEventListener('guestCartUpdated', handleGuestCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate as EventListener);
      window.removeEventListener('guestCartUpdated', handleGuestCartUpdate);
    };
  }, [fetchCart, userId]);

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (userId) {
      // User is logged in - use authenticated cart
      if (newQuantity <= 0) {
        await removeItem(userId, itemId);
      } else {
        await updateQuantity(userId, itemId, newQuantity);
      }
    } else {
      // User is not logged in - use guest cart
      if (newQuantity <= 0) {
        const updatedCart = guestCartUtils.removeItem(itemId);
        setGuestCart(updatedCart);
      } else {
        const updatedCart = guestCartUtils.updateQuantity(itemId, newQuantity);
        setGuestCart(updatedCart);
      }
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (userId) {
      // User is logged in - use authenticated cart
      await removeItem(userId, itemId);
    } else {
      // User is not logged in - use guest cart
      const updatedCart = guestCartUtils.removeItem(itemId);
      setGuestCart(updatedCart);
    }
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;

    if (userId) {
      // User is logged in - use authenticated cart
      setIsApplyingDiscount(true);
      try {
        await applyDiscountToCart(userId, discountCode);
      } catch (error) {
        console.error('Failed to apply discount:', error);
      } finally {
        setIsApplyingDiscount(false);
      }
    } else {
      // User is not logged in - use guest cart
      setIsApplyingDiscount(true);
      try {
        // For guest cart, we need to apply discount manually
        // This is a simplified implementation
        setShowLoginModal(true);
      } finally {
        setIsApplyingDiscount(false);
      }
    }
  };

  // Get item details for display
  const getItemDetails = (itemId: number) => {
    return items.find(item => item.id === itemId);
  };

  // Determine which cart to display
  const displayCart = userId ? (cart || {
    items: [],
    subtotal: 0,
    tax: 0,
    discountAmount: 0,
    total: 0,
    lastUpdated: new Date().toISOString()
  }) : (guestCart || {
    items: [],
    subtotal: 0,
    tax: 0,
    discountAmount: 0,
    total: 0,
    lastUpdated: new Date().toISOString()
  });

  const hasItems = displayCart && displayCart.items && displayCart.items.length > 0;

  // Show loading state when cart is loading for authenticated users
  if (loading && userId) {
    return (
      <div className="container py-8 px-4 max-w-7xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading cart...</span>
        </div>
      </div>
    );
  }

  if (!hasItems && !loading) {
    return (
      <div className="container py-8 px-4 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <ShoppingBag className="h-16 w-16 mx-auto text-text-muted mb-4" />
          <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
          <p className="text-text-muted mb-4">Add some products to get started</p>
          <Button onClick={() => navigate('/products')}>Browse Products</Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8 px-4 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => userId ? fetchCart(userId) : window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Shopping Cart</h1>
        <p className="text-text-muted">Review your items and proceed to checkout</p>
      </div>

      {!hasItems ? (
        <div className="text-center py-12">
          <ShoppingBag className="h-16 w-16 mx-auto text-text-muted mb-4" />
          <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
          <p className="text-text-muted mb-4">Add some products to get started</p>
          <Button onClick={() => navigate('/products')}>Browse Products</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {displayCart.items.map((item: CartItem) => {
              const itemDetails = getItemDetails(item.itemId);
              return (
                <Card key={item.itemId}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={itemDetails?.imageUrl || `https://via.placeholder.com/100x100?text=${item.itemName}`}
                        alt={item.itemName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.itemName}</h3>
                        <p className="text-primary font-medium">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.itemId, item.quantity - 1)}
                          className="h-8 w-8"
                          disabled={loading}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.itemId, item.quantity + 1)}
                          className="h-8 w-8"
                          disabled={loading}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.itemId)}
                        className="text-destructive hover:text-destructive"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Discount Code */}
                <div>
                  <Label htmlFor="discount-code">Discount Code</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      id="discount-code"
                      placeholder="Enter code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleApplyDiscount}
                      disabled={isApplyingDiscount || loading}
                    >
                      {isApplyingDiscount ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                  {userId && cart?.appliedDiscountCode && (
                    <p className="text-sm text-green-600 mt-1">
                      Discount code "{cart.appliedDiscountCode}" applied!
                    </p>
                  )}
                </div>

                {/* Order Totals */}
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${displayCart.subtotal.toFixed(2)}</span>
                  </div>
                  {displayCart.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-${displayCart.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax (8.25%):</span>
                    <span>${displayCart.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>${displayCart.total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-4"
                  size="lg"
                  onClick={() => {
                    if (userId) {
                      navigate('/checkout');
                    } else {
                      setShowLoginModal(true);
                    }
                  }}
                >
                  Proceed to Checkout
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/products')}
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Login Modal for guest users */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => {
          // Refresh the page to load authenticated cart
          window.location.reload();
        }}
        message="Please log in to proceed with your purchase and save your cart items."
      />
    </div>
  );
}

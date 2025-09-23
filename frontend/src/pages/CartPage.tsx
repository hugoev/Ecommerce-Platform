import type { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/useCart";
import { useItems } from "@/hooks/useItems";
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

  // Get current user from auth state
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id;

  useEffect(() => {
    if (userId) {
      fetchCart(userId);
    }
  }, [fetchCart, userId]);

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (!userId) return;
    if (newQuantity <= 0) {
      await removeItem(userId, itemId);
    } else {
      await updateQuantity(userId, itemId, newQuantity);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!userId) return;
    await removeItem(userId, itemId);
  };

  const handleApplyDiscount = async () => {
    if (!userId || !discountCode.trim()) return;
    
    setIsApplyingDiscount(true);
    try {
      await applyDiscountToCart(userId, discountCode);
    } catch (error) {
      console.error('Failed to apply discount:', error);
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  // Get item details for display
  const getItemDetails = (itemId: number) => {
    return items.find(item => item.id === itemId);
  };

  if (!userId) {
    return (
      <div className="container py-8 px-4 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">Please log in to view your cart</h3>
          <p className="text-text-muted mb-4">You need to be logged in to access your shopping cart</p>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-8 px-4 max-w-7xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading cart...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8 px-4 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => fetchCart(userId)}>Try Again</Button>
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

      {!cart || cart.items.length === 0 ? (
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
            {cart.items.map((item) => {
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
                  {cart.appliedDiscountCode && (
                    <p className="text-sm text-green-600 mt-1">
                      Discount code "{cart.appliedDiscountCode}" applied!
                    </p>
                  )}
                </div>

                {/* Order Totals */}
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${cart.subtotal.toFixed(2)}</span>
                  </div>
                  {cart.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-${cart.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax (8.25%):</span>
                    <span>${cart.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>${cart.total.toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  className="w-full mt-4" 
                  size="lg"
                  onClick={() => navigate('/checkout')}
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
    </div>
  );
}

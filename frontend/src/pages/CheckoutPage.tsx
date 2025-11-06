import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { useOrders } from "@/hooks/useOrders";
import { CreditCard, MapPin, CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, loading: cartLoading, error: cartError, fetchCart, applyDiscount: applyDiscountToCart } = useCart();
  const { placeOrder } = useOrders();
  const [discountCode, setDiscountCode] = useState("");
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  // Form state for shipping and payment
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: ''
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardName: ''
  });

  // For demo purposes, using userId = 1 (you would get this from auth context)
  const userId = 1;

  useEffect(() => {
    fetchCart(userId);
  }, [fetchCart, userId]);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    
    setIsApplyingDiscount(true);
    try {
      await applyDiscountToCart(userId, discountCode);
    } catch (error) {
      console.error('Failed to apply discount:', error);
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!cart || cart.items.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setIsPlacingOrder(true);
    try {
      await placeOrder(userId);
      alert("Order placed successfully!");
      navigate("/orders");
    } catch (error) {
      console.error('Failed to place order:', error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="container py-8 px-4 max-w-6xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading checkout...</span>
        </div>
      </div>
    );
  }

  if (cartError || !cart) {
    return (
      <div className="container py-8 px-4 max-w-6xl mx-auto">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Error: {cartError || 'Cart not found'}</p>
          <Button onClick={() => navigate('/cart')}>Back to Cart</Button>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="container py-8 px-4 max-w-6xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-text-muted mb-4">Add some items to your cart before checkout.</p>
          <Button onClick={() => navigate('/products')}>Browse Products</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Checkout</h1>
        <p className="text-text-muted">Complete your purchase</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.itemId} className="flex items-center space-x-4 py-4 border-b border-border last:border-b-0">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xs font-medium">Item</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.itemName}</h3>
                      <p className="text-sm text-text-muted">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${item.price.toFixed(2)}</p>
                      <p className="text-sm text-text-muted">Total: ${item.lineTotal.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mb-4 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShippingInfo({
                      firstName: 'John',
                      lastName: 'Doe',
                      address: '123 Main Street',
                      city: 'Anytown',
                      zipCode: '12345'
                    });
                  }}
                >
                  🎯 Fill Demo Data
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    placeholder="John" 
                    value={shippingInfo.firstName}
                    onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Doe" 
                    value={shippingInfo.lastName}
                    onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  placeholder="123 Main Street" 
                  value={shippingInfo.address}
                  onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    placeholder="Anytown" 
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input 
                    id="zipCode" 
                    placeholder="12345" 
                    value={shippingInfo.zipCode}
                    onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mb-4 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPaymentInfo({
                      cardNumber: '4111 1111 1111 1111',
                      expiry: '12/25',
                      cvv: '123',
                      cardName: 'John Doe'
                    });
                  }}
                >
                  🎯 Fill Demo Data
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input 
                  id="cardNumber" 
                  placeholder="1234 5678 9012 3456" 
                  value={paymentInfo.cardNumber}
                  onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input 
                    id="expiry" 
                    placeholder="MM/YY" 
                    value={paymentInfo.expiry}
                    onChange={(e) => setPaymentInfo({...paymentInfo, expiry: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input 
                    id="cvv" 
                    placeholder="123" 
                    value={paymentInfo.cvv}
                    onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardName">Name on Card</Label>
                <Input 
                  id="cardName" 
                  placeholder="John Doe" 
                  value={paymentInfo.cardName}
                  onChange={(e) => setPaymentInfo({...paymentInfo, cardName: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Totals */}
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
                    size="sm"
                    disabled={isApplyingDiscount}
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
                <Separator />
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total:</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
              </div>

              <Button 
                className="w-full mt-6" 
                size="lg" 
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
              >
                {isPlacingOrder ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {isPlacingOrder ? "Placing Order..." : "Place Order"}
              </Button>

              <div className="text-center">
                <Button variant="ghost" size="sm" onClick={() => navigate("/cart")}>
                  ← Back to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

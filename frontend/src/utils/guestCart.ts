
export interface GuestCartItem {
  itemId: number;
  itemName: string;
  quantity: number;
  price: number;
  lineTotal: number;
  addedAt: string;
}

export interface GuestCart {
  items: GuestCartItem[];
  subtotal: number;
  tax: number;
  discountAmount: number;
  appliedDiscountCode?: string;
  total: number;
  lastUpdated: string;
}

const GUEST_CART_KEY = 'guest_cart';

export const guestCartUtils = {
  /**
   * Get guest cart from localStorage
   */
  getGuestCart(): GuestCart | null {
    try {
      const cartData = localStorage.getItem(GUEST_CART_KEY);
      if (!cartData) return null;

      const cart: GuestCart = JSON.parse(cartData);
      return cart;
    } catch (error) {
      console.error('Error loading guest cart:', error);
      return null;
    }
  },

  /**
   * Save guest cart to localStorage
   */
  saveGuestCart(cart: GuestCart): void {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving guest cart:', error);
    }
  },

  /**
   * Add item to guest cart
   */
  addItem(itemId: number, itemName: string, price: number, quantity: number): GuestCart {
    const existingCart = this.getGuestCart() || {
      items: [],
      subtotal: 0,
      tax: 0,
      discountAmount: 0,
      total: 0,
      lastUpdated: new Date().toISOString(),
    };

    // Check if item already exists in cart
    const existingItemIndex = existingCart.items.findIndex(item => item.itemId === itemId);

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      existingCart.items[existingItemIndex].quantity += quantity;
      existingCart.items[existingItemIndex].lineTotal = existingCart.items[existingItemIndex].quantity * existingCart.items[existingItemIndex].price;
    } else {
      // Add new item
      const newItem: GuestCartItem = {
        itemId,
        itemName,
        quantity,
        price,
        lineTotal: price * quantity,
        addedAt: new Date().toISOString(),
      };
      existingCart.items.push(newItem);
    }

    // Recalculate totals
    existingCart.subtotal = existingCart.items.reduce((sum, item) => sum + item.lineTotal, 0);
    existingCart.tax = existingCart.subtotal * 0.0825; // 8.25% tax rate
    existingCart.total = existingCart.subtotal + existingCart.tax - existingCart.discountAmount;
    existingCart.lastUpdated = new Date().toISOString();

    this.saveGuestCart(existingCart);
    return existingCart;
  },

  /**
   * Remove item from guest cart
   */
  removeItem(itemId: number): GuestCart | null {
    const existingCart = this.getGuestCart();
    if (!existingCart) return null;

    existingCart.items = existingCart.items.filter(item => item.itemId !== itemId);

    // Recalculate totals
    existingCart.subtotal = existingCart.items.reduce((sum, item) => sum + item.lineTotal, 0);
    existingCart.tax = existingCart.subtotal * 0.0825;
    existingCart.total = existingCart.subtotal + existingCart.tax - existingCart.discountAmount;
    existingCart.lastUpdated = new Date().toISOString();

    this.saveGuestCart(existingCart);
    return existingCart;
  },

  /**
   * Update item quantity in guest cart
   */
  updateQuantity(itemId: number, quantity: number): GuestCart | null {
    const existingCart = this.getGuestCart();
    if (!existingCart) return null;

    const itemIndex = existingCart.items.findIndex(item => item.itemId === itemId);
    if (itemIndex === -1) return null;

    if (quantity <= 0) {
      return this.removeItem(itemId);
    }

    existingCart.items[itemIndex].quantity = quantity;
    existingCart.items[itemIndex].lineTotal = existingCart.items[itemIndex].price * quantity;

    // Recalculate totals
    existingCart.subtotal = existingCart.items.reduce((sum, item) => sum + item.lineTotal, 0);
    existingCart.tax = existingCart.subtotal * 0.0825;
    existingCart.total = existingCart.subtotal + existingCart.tax - existingCart.discountAmount;
    existingCart.lastUpdated = new Date().toISOString();

    this.saveGuestCart(existingCart);
    return existingCart;
  },

  /**
   * Apply discount code to guest cart
   */
  applyDiscount(discountCode: string, discountPercentage: number): GuestCart | null {
    const existingCart = this.getGuestCart();
    if (!existingCart) return null;

    existingCart.appliedDiscountCode = discountCode;
    existingCart.discountAmount = existingCart.subtotal * (discountPercentage / 100);
    existingCart.total = existingCart.subtotal + existingCart.tax - existingCart.discountAmount;
    existingCart.lastUpdated = new Date().toISOString();

    this.saveGuestCart(existingCart);
    return existingCart;
  },

  /**
   * Clear guest cart
   */
  clearCart(): void {
    localStorage.removeItem(GUEST_CART_KEY);
  },

  /**
   * Get guest cart summary
   */
  getCartSummary(): GuestCart | null {
    return this.getGuestCart();
  },

  /**
   * Check if guest cart exists and has items
   */
  hasItems(): boolean {
    const cart = this.getGuestCart();
    return cart ? cart.items.length > 0 : false;
  },

  /**
   * Get item count in guest cart
   */
  getItemCount(): number {
    const cart = this.getGuestCart();
    return cart ? cart.items.length : 0;
  },
};


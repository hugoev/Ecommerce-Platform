export interface Item {
  id: number;
  title: string;
  description: string;
  price: number;
  quantityAvailable: number;
  imageUrl?: string;
  category?: string;
  sku?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN';
}

export interface RegisterData {
  username: string;
  password: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface Order {
  id: number;
  orderDate: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  discountAmount: number;
  appliedDiscountCode?: string;
  username: string;
  items: OrderItem[];
}

export interface OrderItem {
  itemId: number;
  itemName: string;
  quantity: number;
  priceAtPurchase: number;
}

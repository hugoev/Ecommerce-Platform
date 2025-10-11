# Frontend API Integration Guide

Complete guide for using the backend API endpoints from the React frontend.

## 🌐 Base Configuration

```typescript
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
```

Set in `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## 🔐 Authentication

### JWT Token Management

Tokens are stored in localStorage and automatically included in authenticated requests:

```typescript
// After successful login
localStorage.setItem('token', response.token);
localStorage.setItem('user', JSON.stringify(response.user));

// All authenticated requests include
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

### Login Flow

```typescript
import { authApi } from "@/api/auth";

// Login
const response = await authApi.login({
  username: "admin",
  password: "admin123",
});

console.log(response.token); // JWT token
console.log(response.user); // User object with id, username, role
```

### Registration

```typescript
const newUser = await authApi.register({
  username: "newuser",
  password: "securepassword123",
});
```

## 📦 API Endpoints by Feature

### 🔓 Authentication (No Auth Required)

#### Register User

```typescript
POST /api/auth/register
Body: { username: string, password: string }
Returns: { id, username, role }
```

#### Login

```typescript
POST /api/auth/login
Body: { username: string, password: string }
Returns: { token: string, user: { id, username, role } }
```

### 👤 User Profile (JWT Required)

#### Get Profile

```typescript
GET / api / auth / profile / { userId };
Returns: {
  id, username, fullName, address, phone, role;
}
```

#### Update Profile

```typescript
PUT /api/auth/profile/{userId}
Body: { fullName?, address?, phone? }
Returns: Updated user object
```

#### Change Password

```typescript
POST /api/auth/change-password/{userId}
Body: { currentPassword: string, newPassword: string }
Returns: Success message
```

### 🛍️ Products (Public)

#### Get All Items

```typescript
GET /api/items?search={query}&sortBy={field}&sortDirection={asc|desc}&pageNumber={n}&pageSize={n}

Example:
const items = await itemsApi.getAll({
  search: 'laptop',
  sortBy: 'price',
  sortDirection: 'asc',
  pageNumber: 0,
  pageSize: 20
});
```

#### Get Single Item

```typescript
GET / api / items / { id };
Returns: {
  id, title, description, price, quantityAvailable, imageUrl, category, sku;
}
```

#### Upload Image (Admin)

```typescript
POST /api/items/upload-image
Content-Type: multipart/form-data
Body: file

Example:
const imageUrl = await itemsApi.uploadImage(file);
// Returns: "/images/uuid.jpg"
```

### 🛒 Shopping Cart (JWT Required)

#### Get Cart

```typescript
GET / api / cart / { userId };
Returns: {
  items: [], subtotal, tax, discountAmount, total, appliedDiscountCode;
}
```

#### Get Cart Summary

```typescript
GET /api/cart/{userId}/summary
Returns: Complete cart with calculated totals
```

#### Add to Cart

```typescript
POST / api / cart / { userId } / items / { itemId };
Body: {
  quantity: number;
}

Example: await cartApi.addItem(userId, itemId, 2);
```

#### Update Quantity

```typescript
PUT / api / cart / { userId } / items / { itemId };
Body: {
  quantity: number;
}
```

#### Remove Item

```typescript
DELETE / api / cart / { userId } / items / { itemId };
```

#### Clear Cart

```typescript
DELETE / api / cart / { userId };
```

#### Increase Quantity

```typescript
POST / api / cart / { userId } / items / { itemId } / increase;
```

#### Decrease Quantity

```typescript
POST / api / cart / { userId } / items / { itemId } / decrease;
```

#### Apply Discount Code

```typescript
POST / api / cart / { userId } / discount;
Body: {
  code: string;
}

Example: await cartApi.applyDiscount(userId, "SAVE10");
```

### 📦 Orders (JWT Required)

#### Place Order

```typescript
POST /api/orders/{userId}/place
Returns: Order object with items, totals, status

Example:
const order = await ordersApi.placeOrder(userId);
```

#### Get User Orders

```typescript
GET /api/orders/{userId}
Returns: Array of orders, sorted by date (newest first)

Example:
const orders = await ordersApi.getUserOrders(userId);
```

#### Get Specific Order

```typescript
GET /api/orders/{userId}/{orderId}
Returns: Single order with details
```

### 👑 Admin Endpoints (Admin Role Required)

#### Get All Users

```typescript
GET /api/admin/users?page={n}&size={n}

Example:
const { content, totalElements, totalPages } = await adminApi.getAllUsers(0, 20);
```

#### Get All Orders

```typescript
GET /api/admin/orders?page={n}&size={n}
Returns: Paginated list of all orders
```

#### Get Orders by Status

```typescript
GET / api / orders / admin / status / { status };
Status: PENDING | PROCESSING | SHIPPED | DELIVERED | CANCELLED;

Example: const pendingOrders = await adminApi.getOrdersByStatus("PENDING");
```

#### Update Order Status

```typescript
PUT / api / orders / { orderId } / status;
Body: {
  status: "SHIPPED" | "DELIVERED" | etc;
}

Example: await adminApi.updateOrderStatus(orderId, "SHIPPED");
```

#### Create Item

```typescript
POST /api/admin/items
Body: {
  title: string,
  description: string,
  price: number,
  quantityAvailable: number,
  category: string,
  sku: string,
  imageUrl?: string
}

Example:
const newItem = await adminApi.createItem({
  title: 'New Laptop',
  description: 'High-performance laptop',
  price: 1299.99,
  quantityAvailable: 10,
  category: 'Electronics',
  sku: 'LAPTOP-001',
  imageUrl: '/images/laptop.jpg'
});
```

#### Update Item

```typescript
PUT /api/admin/items/{id}
Body: Same as create (partial updates allowed)
```

#### Delete Item

```typescript
DELETE / api / admin / items / { id };
```

#### Create Discount Code

```typescript
POST /api/admin/discounts
Body: {
  code: string,
  discountPercentage: number,
  expiryDate?: string,
  active: boolean
}

Example:
const discount = await adminApi.createDiscountCode({
  code: 'NEWUSER20',
  discountPercentage: 20,
  expiryDate: '2025-12-31',
  active: true
});
```

## 📋 API Response Format

All successful responses follow this format:

```typescript
{
  success: true,
  message: "Operation successful",
  data: { /* actual response data */ },
  timestamp: [2025, 10, 11, 12, 30, 45, 123456789]
}
```

### Paginated Responses

```typescript
{
  content: [ /* array of items */ ],
  totalElements: 100,
  totalPages: 5,
  pageNumber: 0,
  pageSize: 20,
  last: false,
  first: true
}
```

### Error Responses

```typescript
{
  status: 400,
  error: "Bad Request",
  message: "Validation failed",
  timestamp: [2025, 10, 11, 12, 30, 45, 123456789]
}
```

## 🔧 Error Handling

```typescript
try {
  const result = await someApiCall();
} catch (error) {
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
    localStorage.clear();
    navigate("/login");
  } else if (error.response?.status === 403) {
    // Forbidden - insufficient permissions
    alert("Admin access required");
  } else if (error.response?.status === 404) {
    // Not found
    alert("Resource not found");
  } else {
    // Other errors
    console.error(error);
    alert(error.message || "An error occurred");
  }
}
```

## 💡 Usage Examples

### Complete Shopping Flow

```typescript
// 1. Browse products
const items = await itemsApi.getAll({
  sortBy: "price",
  sortDirection: "asc",
});

// 2. Add to cart
await cartApi.addItem(userId, itemId, quantity);

// 3. Apply discount
await cartApi.applyDiscount(userId, "SAVE10");

// 4. Get cart summary
const cart = await cartApi.getCartSummary(userId);
console.log("Total:", cart.total);
console.log("Tax:", cart.tax);

// 5. Place order
const order = await ordersApi.placeOrder(userId);
console.log("Order ID:", order.id);

// 6. View order history
const orders = await ordersApi.getUserOrders(userId);
```

### Admin Workflow

```typescript
// 1. Upload product image
const file = /* file from input */;
const imageUrl = await itemsApi.uploadImage(file);

// 2. Create product
const newProduct = await adminApi.createItem({
  title: 'Gaming Mouse',
  description: 'RGB gaming mouse',
  price: 79.99,
  quantityAvailable: 50,
  category: 'Electronics',
  sku: 'MOUSE-001',
  imageUrl: imageUrl
});

// 3. Create discount code
await adminApi.createDiscountCode({
  code: 'GAMING20',
  discountPercentage: 20,
  active: true
});

// 4. Monitor orders
const pendingOrders = await adminApi.getOrdersByStatus('PENDING');

// 5. Update order status
for (const order of pendingOrders) {
  await adminApi.updateOrderStatus(order.id, 'PROCESSING');
}
```

## 🔒 Security Notes

- ✅ JWT tokens expire after 24 hours (configurable)
- ✅ All passwords are hashed with BCrypt
- ✅ Admin endpoints require `ROLE_ADMIN`
- ✅ User endpoints require `ROLE_USER` or `ROLE_ADMIN`
- ✅ CORS is configured for localhost:5173
- ✅ SQL injection protection via JPA

## 🌍 Environment Setup

### Development

```env
VITE_API_BASE_URL=http://localhost:8080
```

### Production

```env
VITE_API_BASE_URL=https://your-domain.com
```

## 🐛 Common Issues

**401 Unauthorized:**

- Token expired or invalid
- Not logged in
- Solution: Clear localStorage and re-login

**403 Forbidden:**

- Insufficient permissions (not admin)
- Solution: Use admin account

**404 Not Found:**

- Resource doesn't exist
- Wrong ID in URL
- Solution: Check ID and endpoint

**CORS Error:**

- Backend not allowing frontend origin
- Solution: Update `SecurityConfig.java` with frontend URL

## 📚 API Client Libraries

The frontend uses organized API clients:

```typescript
// src/api/auth.ts
export const authApi = { login, register, getProfile, updateProfile, changePassword };

// src/api/items.ts
export const itemsApi = { getAll, getById, create, update, delete, uploadImage };

// src/api/cart.ts
export const cartApi = { getCart, addItem, updateItem, removeItem, clearCart, applyDiscount };

// src/api/orders.ts
export const ordersApi = { placeOrder, getUserOrders, getOrderById };

// src/api/admin.ts
export const adminApi = { getAllUsers, createItem, updateItem, deleteItem, createDiscountCode, getOrdersByStatus, updateOrderStatus };

// src/api/user.ts
export const userApi = { getProfile, updateProfile, changePassword };
```

---

**Ready to build!** The frontend has complete API integration with the Spring Boot backend.

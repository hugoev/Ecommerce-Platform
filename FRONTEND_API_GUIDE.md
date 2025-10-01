# Frontend API Integration Guide

This guide explains how to use the updated frontend API endpoints to communicate with the Spring Boot backend.

## 🌐 Base Configuration

All API calls use the base URL from environment variables:

```javascript
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
```

## 🔐 Authentication Flow

### Login Process

```javascript
import { authApi } from "@/api/auth";

// Login user
const loginResponse = await authApi.login({
  username: "admin",
  password: "admin123",
});

// Token is automatically stored in localStorage
console.log(loginResponse.token); // JWT token
console.log(loginResponse.user); // User info
```

### Using Authenticated APIs

```javascript
// All authenticated API calls automatically include the JWT token
// from localStorage in the Authorization header
```

## 📦 API Endpoints Overview

### **Public Endpoints** (No authentication required)

- `GET /api/items` - Browse products
- `POST /api/items/upload-image` - Upload product images
- `GET /images/*` - Access uploaded images
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication

### **Authenticated Endpoints** (JWT token required)

- `GET /api/cart/{userId}` - Get user cart
- `POST /api/cart/{userId}/items/{itemId}` - Add to cart
- `GET /api/orders/{userId}` - Get user orders
- `POST /api/orders/{userId}/place` - Place order

### **Admin Endpoints** (Admin role required)

- `GET /api/admin/users` - List all users
- `POST /api/admin/items` - Create items
- `GET /api/orders/admin/all` - View all orders

## 🛒 Complete Usage Examples

### **Item Management**

```javascript
import { itemsApi } from "@/api/items";

// Get all items with search and sorting
const { content: items, totalElements } = await itemsApi.getAll({
  search: "laptop",
  sortBy: "price",
  sortDirection: "asc",
  pageNumber: 0,
  pageSize: 20,
});

// Create new item
const newItem = await itemsApi.create({
  title: "New Product",
  description: "Product description",
  price: 99.99,
  quantityAvailable: 10,
  category: "Electronics",
  sku: "PROD-001",
  imageUrl: "/images/uploaded-image.jpg",
});

// Upload image first
const imageUrl = await itemsApi.uploadImage(file); // Returns "/images/uuid.jpg"
```

### **Shopping Cart**

```javascript
import { cartApi } from "@/api/cart";

// Get cart summary
const cart = await cartApi.getCartSummary(userId);

// Add item to cart
await cartApi.addItem(userId, itemId, 2); // Add 2 items

// Apply discount code
const updatedCart = await cartApi.applyDiscount(userId, "SAVE10");

// Clear cart
await cartApi.clearCart(userId);
```

### **Order Management**

```javascript
import { ordersApi } from "@/api/orders";

// Place order
const order = await ordersApi.placeOrder(userId);

// Get user's orders
const userOrders = await ordersApi.getUserOrders(userId);

// Get specific order
const orderDetails = await ordersApi.getOrderById(userId, orderId);
```

### **User Profile Management**

```javascript
import { userApi } from "@/api/user";

// Get user profile
const profile = await userApi.getProfile(userId);

// Update profile
const updatedProfile = await userApi.updateProfile(userId, {
  fullName: "New Name",
  address: "New Address",
  phone: "123-456-7890",
});

// Change password
await userApi.changePassword(userId, {
  currentPassword: "oldPassword",
  newPassword: "newPassword",
});
```

### **Admin Operations**

```javascript
import { adminApi } from "@/api/admin";

// Get all users (paginated)
const {
  content: users,
  totalElements,
  totalPages,
} = await adminApi.getAllUsers(0, 20);

// Create new item as admin
const newItem = await adminApi.createItem({
  title: "Admin Product",
  description: "Created by admin",
  price: 149.99,
  quantityAvailable: 5,
  category: "Electronics",
  sku: "ADMIN-001",
});

// Create discount code
const discount = await adminApi.createDiscountCode({
  code: "NEWUSER20",
  discountPercentage: 20,
  expiryDate: "2024-12-31",
});

// Get orders by status
const pendingOrders = await adminApi.getOrdersByStatus("PENDING");
```

## 🔧 Error Handling

All API calls include comprehensive error handling:

```javascript
try {
  const result = await someApiCall();
} catch (error) {
  if (error.message.includes("Unauthorized")) {
    // Redirect to login
  } else if (error.message.includes("Forbidden")) {
    // Show admin access required message
  } else {
    // Handle other errors
  }
}
```

## 🔒 Security Features

- **JWT Token Management**: Automatic token inclusion in authenticated requests
- **Role-based Access**: Admin endpoints require admin role
- **Error Handling**: Proper HTTP status code handling (401, 403, etc.)
- **Input Validation**: Client-side validation before API calls

## 🌍 Environment Variables

Configure your environment variables:

```bash
# .env file
VITE_API_BASE_URL=http://localhost:8080
```

## 📡 API Response Format

All backend responses follow this consistent format:

```javascript
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }, // Actual response data
  "timestamp": [2025, 9, 30, 16, 30, 33, 971000000],
  "pagination": { // For paginated responses
    "totalElements": 100,
    "totalPages": 5,
    "pageNumber": 0,
    "pageSize": 20
  }
}
```

## 🚀 Ready for Production

Your frontend APIs are now properly configured to work with the Spring Boot backend and include:

- ✅ **Complete CRUD operations** for all entities
- ✅ **Image upload and serving** functionality
- ✅ **Authentication and authorization** flows
- ✅ **Error handling** and user feedback
- ✅ **Admin panel integration** ready
- ✅ **Scalable API architecture**

The frontend is ready to build customer-facing pages and integrate with the complete backend functionality!


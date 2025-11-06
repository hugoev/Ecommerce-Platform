# E-Commerce Frontend

Modern React TypeScript SPA with Tailwind CSS, Redux state management, and full API integration.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on **http://localhost:5173**

## 🛠️ Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool & dev server
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Prebuilt components
- **Redux Toolkit** - State management
- **React Router v7** - Client-side routing
- **Axios** - HTTP client

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/              # API service layer
│   │   ├── auth.ts       # Authentication API
│   │   ├── cart.ts       # Cart API
│   │   ├── items.ts      # Products API
│   │   ├── orders.ts     # Orders API
│   │   ├── admin.ts      # Admin API
│   │   └── user.ts       # User profile API
│   │
│   ├── app/              # Redux store
│   │   ├── store.ts      # Store configuration
│   │   ├── rootReducer.ts
│   │   └── features/
│   │       └── auth/
│   │           └── authSlice.ts
│   │
│   ├── components/       # Reusable components
│   │   ├── ui/          # shadcn/ui primitives
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Layout.tsx
│   │   └── LoginModal.tsx
│   │
│   ├── hooks/           # Custom React hooks
│   │   ├── useCart.ts
│   │   ├── useItems.ts
│   │   ├── useOrders.ts
│   │   ├── useUser.ts
│   │   ├── useAdminUsers.ts
│   │   ├── useAdminOrders.ts
│   │   └── useAdminDiscounts.ts
│   │
│   ├── pages/           # Route components
│   │   ├── HomePage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── OrderHistoryPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── AdminDashboard.tsx
│   │
│   ├── types/           # TypeScript definitions
│   │   └── index.ts
│   │
│   ├── utils/           # Utility functions
│   │   └── guestCart.ts # Local cart for non-logged-in users
│   │
│   ├── App.tsx          # Main app component with routing
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
│
├── public/              # Static assets
│   └── vite.svg
│
├── dist/                # Production build output
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## 🔑 Key Features

### User Features

- Product browsing with search and filters
- Shopping cart (persisted for logged-in users, localStorage for guests)
- Checkout with tax calculation (8.25%)
- Discount code application
- Order history and tracking
- Profile management
- Responsive design

### Admin Features

- Product management (create, edit, delete)
- Image upload
- User management
- Order tracking and status updates
- Discount code creation
- Sales analytics dashboard

## 🎨 Component Library

Uses **shadcn/ui** for consistent, accessible components:

- `Button` - Primary actions
- `Card` - Content containers
- `Input` - Form inputs
- `Dialog` - Modals
- `Select` - Dropdowns
- `Textarea` - Multi-line input
- `Label` - Form labels
- `Separator` - Visual dividers

All components are customizable with Tailwind classes.

## 🔌 API Integration

### API Service Layer Pattern

```typescript
// Example: src/api/items.ts
export const itemsApi = {
  async getAll(params) {
    const response = await apiClient.get("/api/items", { params });
    return response.data;
  },

  async create(item) {
    const response = await apiClient.post("/api/items", item);
    return response.data;
  },
};
```

### Custom Hooks Pattern

```typescript
// Example: src/hooks/useItems.ts
export function useItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    const data = await itemsApi.getAll();
    setItems(data);
    setLoading(false);
  };

  return { items, loading, fetchItems };
}
```

### Authentication

JWT token stored in `localStorage`:

```typescript
localStorage.setItem("token", response.token);
localStorage.setItem("user", JSON.stringify(response.user));
```

All authenticated requests include:

```typescript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

## 🎯 State Management

### Redux Toolkit

Only used for authentication state:

```typescript
// src/app/features/auth/authSlice.ts
const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null },
  reducers: {
    login: (state, action) => { ... },
    logout: (state) => { ... }
  }
});
```

### Local State

Most features use React hooks and custom hooks instead of Redux for simplicity.

## 🚀 Available Scripts

```bash
# Development server with hot reload
    npm run dev

# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌍 Environment Variables

Create `.env` file in frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8080
```

**Note:** Only variables prefixed with `VITE_` are exposed to the client.

## 🎨 Styling

### Tailwind CSS

Utility-first CSS framework:

```tsx
<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  Click Me
</button>
```

### Custom Theme

Configure in `tailwind.config.ts`:

```typescript
export default {
  theme: {
    extend: {
      colors: {
        primary: { ... },
        secondary: { ... }
      }
    }
  }
}
```

## 🧭 Routing

React Router v7 with route protection:

```tsx
// Protected route example
<Route
  path="/admin"
  element={
    <ProtectedRoute adminOnly>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

### Routes

- `/` - Home page
- `/products` - Product catalog
- `/cart` - Shopping cart
- `/checkout` - Order checkout
- `/orders` - Order history (protected)
- `/profile` - User profile (protected)
- `/admin` - Admin dashboard (admin only)
- `/login` - Login page
- `/register` - Registration page

## 📦 Building for Production

```bash
# Create optimized build
npm run build

# Output in dist/ directory
# - Minified JS/CSS
# - Code splitting
# - Asset optimization
```

### Docker Build

```dockerfile
# Multi-stage build
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

## 🐛 Troubleshooting

**API connection issues:**

- Verify `VITE_API_BASE_URL` in `.env`
- Check backend is running on port 8080
- Review browser console for errors

**Build errors:**

```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Type errors:**

```bash
# Check TypeScript errors
npx tsc --noEmit
```

**Port 5173 in use:**
Vite automatically tries the next available port (5174, 5175, etc.)

## 🔧 Development Tips

### Hot Module Replacement

Vite provides instant HMR - changes reflect immediately without full page reload.

### TypeScript

- All components are typed
- API responses have type definitions
- Use `types/index.ts` for shared types

### Component Development

1. Create in `src/components/`
2. Use TypeScript for props
3. Style with Tailwind
4. Export from component file

### Testing with Backend

1. Start backend: `cd backend && ./mvnw spring-boot:run`
2. Start frontend: `npm run dev`
3. Both services communicate via configured API URL

## 📚 Dependencies

Key packages (see `package.json`):

- `react` (19.1.1) - UI library
- `react-router-dom` (7.9.1) - Routing
- `@reduxjs/toolkit` (2.9.0) - State management
- `axios` (1.12.2) - HTTP client
- `tailwindcss` (4.1.13) - Styling
- `lucide-react` (0.544.0) - Icons
- `vite` (7.1.6) - Build tool

## 🔗 Related Documentation

- Main README: `../README.md`
- API Guide: `../FRONTEND_API_GUIDE.md`
- Backend: `../backend/README.md`

---

**Pro Tips:**

- Use React DevTools browser extension for debugging
- Check Network tab for API call issues
- Use `console.log()` liberally during development
- Tailwind CSS IntelliSense VSCode extension is helpful

import { clearAuth } from "@/app/features/auth/authSlice";
import type { RootState } from "@/app/store";
import { useAppDispatch } from "@/app/store";
import { LoginModal } from "@/components/LoginModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/hooks/useCart";
import { useItems } from "@/hooks/useItems";
import { guestCartUtils } from "@/utils/guestCart";
import { Loader2, Search, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export function ProductsPage() {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("price");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const { items, loading, error, fetchItems } = useItems();
  const { addItem } = useCart();
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  // Get current user from auth state
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userId = user?.id;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch items when search or sort changes
  useEffect(() => {
    fetchItems({
      search: debouncedSearchTerm,
      sortBy: sortBy,
      sortDirection: sortDirection,
      pageNumber: 0,
      pageSize: 50 // Get more items for better demo
    });
  }, [debouncedSearchTerm, sortBy, sortDirection, fetchItems]);

  const handleSortChange = (value: string) => {
    if (value.includes('price')) {
      setSortBy('price');
      setSortDirection(value.includes('asc') ? 'asc' : 'desc');
    } else if (value.includes('quantity')) {
      setSortBy('quantityAvailable');
      setSortDirection(value.includes('asc') ? 'asc' : 'desc');
    } else {
      setSortBy('title');
      setSortDirection('asc');
    }
  };

  const handleAddToCart = async (product: any) => {
    setAddingToCart(product.id);
    try {
      if (isAuthenticated && userId) {
        // Check if token exists before making authenticated request
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('ProductsPage - No token found, user needs to login');
          setShowLoginModal(true);
          return;
        }

        // User is logged in - use authenticated cart
        console.log('ProductsPage - Adding item to authenticated cart');
        await addItem(userId, product.id, 1);
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { userId } }));
        // Show success message
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } else {
        // User is not logged in - use guest cart
        console.log('ProductsPage - Adding item to guest cart');
        guestCartUtils.addItem(product.id, product.title, product.price, 1);
        // Dispatch custom event for guest cart updates
        window.dispatchEvent(new CustomEvent('guestCartUpdated'));
        // Show login modal to encourage login
        setShowLoginModal(true);
      }
    } catch (error) {
      console.error('ProductsPage - Error adding to cart:', error);
      if (error instanceof Error && error.message === 'LOGIN_REQUIRED') {
        console.error('ProductsPage - Authentication failed, clearing auth state');
        dispatch(clearAuth());
        setShowLoginModal(true);
      } else {
        console.error('Failed to add item to cart:', error);
        // You could show an error message here
      }
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div className="container py-8 px-4 max-w-7xl mx-auto">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Item added to cart successfully!
          </div>
          <button
            onClick={() => setShowSuccessMessage(false)}
            className="text-green-700 hover:text-green-900"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Search and Sort */}
      <div className="mb-10">
        <div className="relative max-w-lg mx-auto mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted h-5 w-5" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 text-lg"
          />
        </div>
        <div className="flex justify-center">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Sort by:</span>
            <Select value={`${sortBy}-${sortDirection}`} onValueChange={handleSortChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title-asc">Name (A-Z)</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="quantityAvailable-desc">Most Available</SelectItem>
                <SelectItem value="quantityAvailable-asc">Least Available</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading products...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => fetchItems()}>Try Again</Button>
        </div>
      )}

      {/* Product Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8 justify-items-center">
          {items.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="p-0">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <img
                    src={product.imageUrl || `https://via.placeholder.com/280x280?text=${product.title.replace(/\s+/g, '+')}`}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      // Prevent infinite loop - if already using data URL or placeholder, stop
                      const target = e.target as HTMLImageElement;
                      if (target.src.startsWith('data:') || target.src.includes('via.placeholder.com')) {
                        return;
                      }
                      // Use data URL placeholder as fallback
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjgwIiBoZWlnaHQ9IjI4MCIgZmlsbD0iI2U1ZTdlOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                <p className="text-sm text-text-muted mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-2xl font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </div>
                  <div className="text-sm text-text-muted">
                    {product.quantityAvailable > 10 ? `${product.quantityAvailable} in stock` : `Only ${product.quantityAvailable} left`}
                  </div>
                </div>
                <Button
                  className="w-full"
                  disabled={product.quantityAvailable === 0 || addingToCart === product.id}
                  size="lg"
                  onClick={() => handleAddToCart(product)}
                >
                  {addingToCart === product.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-4 w-4 mr-2" />
                  )}
                  {product.quantityAvailable === 0 ? 'Out of Stock' : 
                   addingToCart === product.id ? 'Adding...' : 'Add to Cart'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && items.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 mx-auto text-text-muted mb-4" />
          <h3 className="text-xl font-semibold mb-2">No products found</h3>
          <p className="text-text-muted">Try adjusting your search terms or filters.</p>
        </div>
      )}

      {/* Login Modal for guest users */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => {
          setShowLoginModal(false);
          // Refresh the page to update user state
          window.location.reload();
        }}
        message="Please log in to add items to your cart and save your selections."
      />
    </div>
  );
}
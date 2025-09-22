import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useItems } from "@/hooks/useItems";
import { Loader2, Search, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

export function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("price");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const { items, loading, error, fetchItems } = useItems();

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

  return (
    <div className="container py-8 px-4 max-w-7xl mx-auto">
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
            <Select value={`${sortBy}-${sortDirection}`} onVolumeChange={handleSortChange}>
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
                    src={`https://via.placeholder.com/280x280?text=${product.name.replace(/\s+/g, '+')}`}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-sm text-text-muted mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-2xl font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </div>
                  <div className="text-sm text-text-muted">
                    {product.quantity > 10 ? `${product.quantity} in stock` : `Only ${product.quantity} left`}
                  </div>
                </div>
                <Button
                  className="w-full"
                  disabled={product.quantity === 0}
                  size="lg"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
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

    </div>
  );
}
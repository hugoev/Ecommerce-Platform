import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ShoppingCart } from "lucide-react";
import { useState } from "react";

export function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");

  // Sample product data for demonstration
  const allProducts = [
    { id: 1, name: "Wireless Headphones", description: "High-quality wireless headphones with noise cancellation", price: 89.99, quantity: 25, category: "Electronics" },
    { id: 2, name: "Smart Watch", description: "Fitness tracking smart watch with heart rate monitor", price: 199.99, quantity: 15, category: "Electronics" },
    { id: 3, name: "Cotton T-Shirt", description: "Comfortable cotton t-shirt in multiple colors", price: 19.99, quantity: 50, category: "Clothing" },
    { id: 4, name: "Running Shoes", description: "Lightweight running shoes with advanced cushioning", price: 129.99, quantity: 30, category: "Clothing" },
    { id: 5, name: "Coffee Maker", description: "Programmable coffee maker with thermal carafe", price: 79.99, quantity: 12, category: "Home & Kitchen" },
    { id: 6, name: "Cookbook", description: "Collection of 100+ easy recipes for home cooking", price: 24.99, quantity: 8, category: "Books" },
    { id: 7, name: "Yoga Mat", description: "Non-slip yoga mat perfect for all types of exercise", price: 39.99, quantity: 20, category: "Sports" },
    { id: 8, name: "Bluetooth Speaker", description: "Portable bluetooth speaker with 360-degree sound", price: 59.99, quantity: 18, category: "Electronics" }
  ];

  // Filter and sort products
  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'availability':
        return b.quantity - a.quantity;
      default:
        return 0;
    }
  });

  return (
    <div className="container py-8 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Products</h1>
        <p className="text-text-muted">Discover our collection of quality products</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted h-4 w-4" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex justify-center">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name: A-Z</SelectItem>
              <SelectItem value="name-desc">Name: Z-A</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="availability">Availability</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8 justify-items-center">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="p-0">
              <div className="aspect-square bg-muted rounded-t-lg overflow-hidden">
                <img
                  src={`https://via.placeholder.com/300x300?text=${product.name.replace(/\s+/g, '+')}`}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              <p className="text-sm text-text-muted mb-3 line-clamp-2">
                {product.description}
              </p>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xl font-bold text-primary">${product.price}</span>
                <span className="text-sm text-text-muted">
                  {product.quantity > 10 ? `${product.quantity} available` : `Only ${product.quantity} left`}
                </span>
              </div>
              <Button
                className="w-full"
                disabled={product.quantity === 0}
                size="sm"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        {filteredProducts.length < allProducts.length && (
          <Button variant="outline">Load More Products</Button>
        )}
        {filteredProducts.length > 0 && (
          <p className="text-sm text-muted-foreground mt-4">
            Showing {filteredProducts.length} of {allProducts.length} products
          </p>
        )}
      </div>
    </div>
  );
}
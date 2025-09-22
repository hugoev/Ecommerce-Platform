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
    <div className="container py-6 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Products</h1>
        <p className="text-sm text-text-muted">Discover our collection</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-3 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted h-4 w-4" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
        <div className="flex justify-center">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="price-asc">Price Low-High</SelectItem>
              <SelectItem value="price-desc">Price High-Low</SelectItem>
              <SelectItem value="availability">Availability</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6 justify-items-center">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="group hover:shadow-md transition-shadow duration-200">
            <CardHeader className="p-0">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                <img
                  src={`https://via.placeholder.com/250x250?text=${product.name.replace(/\s+/g, '+')}`}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <h3 className="font-medium text-base mb-1">{product.name}</h3>
              <p className="text-xs text-text-muted mb-2 line-clamp-2">
                {product.description}
              </p>
              <div className="mb-2">
                <span className="text-lg font-bold text-primary">${product.price}</span>
              </div>
              <Button
                className="w-full"
                disabled={product.quantity === 0}
                size="sm"
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                {product.quantity === 0 ? 'Out' : 'Add'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        {filteredProducts.length < allProducts.length && (
          <Button variant="outline" size="sm">More</Button>
        )}
      </div>
    </div>
  );
}
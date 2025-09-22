import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart } from "lucide-react";
import { useState } from "react";

export function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");

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

  // Filter products
  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-8 px-4 max-w-7xl mx-auto">
      {/* Search */}
      <div className="mb-10">
        <div className="relative max-w-lg mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted h-5 w-5" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 text-lg"
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8 justify-items-center">
        {filteredProducts.map((product) => (
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
              <div className="text-2xl font-bold text-primary mb-4">
                ${product.price}
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

    </div>
  );
}
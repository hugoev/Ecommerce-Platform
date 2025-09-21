import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ProductsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">All Products</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar for Filtering/Sorting */}
        <aside className="w-full md:w-1/4 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Category</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Electronics</a></li>
                <li><a href="#" className="hover:text-primary">Clothing</a></li>
                <li><a href="#" className="hover:text-primary">Home & Kitchen</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Price Range</h3>
              <p className="text-sm text-muted-foreground">Placeholder for price range slider</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Sort By</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Price: Low to High</a></li>
                <li><a href="#" className="hover:text-primary">Price: High to Low</a></li>
                <li><a href="#" className="hover:text-primary">Newest Arrivals</a></li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Product Listing */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <Card key={item}>
              <CardHeader>
                <img src="https://via.placeholder.com/300" alt="Product" className="w-full h-48 object-cover rounded-t-lg" />
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg">Product Name {item}</CardTitle>
                <p className="text-muted-foreground text-sm mt-1">$99.99</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Add to Cart</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
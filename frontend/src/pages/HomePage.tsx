import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 text-foreground">
          E-Commerce Store
        </h1>
        <p className="text-xl md:text-2xl mb-12 text-text-muted max-w-2xl mx-auto leading-relaxed">
          Discover quality products with seamless shopping, tax calculation, and exclusive discount codes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/products">
            <Button size="lg" className="w-full sm:w-auto px-8 py-4 text-lg font-medium">
              Browse Products
            </Button>
          </Link>
          <Link to="/register">
            <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-4 text-lg font-medium">
              Create Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

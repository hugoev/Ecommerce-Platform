import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function HomePage() {
  return (
    <div className="flex flex-col gap-12">
      {/* Hero Section */}
      <section className="relative h-[500px] w-full bg-cover bg-center" style={{ backgroundImage: "url('https://via.placeholder.com/1500x500')" }}>
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white space-y-4">
            <h1 className="text-5xl font-bold">Discover Your Next Favorite Item</h1>
            <p className="text-xl">Shop the latest trends and exclusive collections.</p>
            <Button size="lg" className="mt-4">Shop Now</Button>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="container py-8">
        <h2 className="text-3xl font-bold text-center mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
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
      </section>
    </div>
  );
}
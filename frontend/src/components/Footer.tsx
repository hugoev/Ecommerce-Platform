export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold text-foreground">
              E-Commerce Store
            </h3>
            <p className="text-sm text-text-muted mt-1">
              Quality products, seamless shopping.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-text-muted">
            <span>&copy; {new Date().getFullYear()} E-Commerce Store</span>
            <div className="flex space-x-4">
              <a href="/products" className="hover:text-foreground">Products</a>
              <a href="/cart" className="hover:text-foreground">Cart</a>
              <a href="/login" className="hover:text-foreground">Login</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
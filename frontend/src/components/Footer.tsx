export function Footer() {
  return (
    <footer className="bg-background py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="mb-2 md:mb-0">
            <p className="text-sm text-text-muted">
              &copy; {new Date().getFullYear()} E-Commerce Store
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-text-muted">
            <a href="/products" className="hover:text-foreground">Products</a>
            <a href="/cart" className="hover:text-foreground">Cart</a>
            <a href="/login" className="hover:text-foreground">Login</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
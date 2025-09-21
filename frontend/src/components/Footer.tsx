import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-8 md:py-12">
      <div className="container grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">E-commerce</h3>
          <p className="text-sm text-muted-foreground">
            Your one-stop shop for all your needs.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-muted-foreground hover:text-primary">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary">
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Categories</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                Electronics
              </a>
            </li>
            <li>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                Clothing
              </a>
            </li>
            <li>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                Home & Kitchen
              </a>
            </li>
            <li>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                Books
              </a>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <a href="/about" className="text-sm text-muted-foreground hover:text-primary">
                About Us
              </a>
            </li>
            <li>
              <a href="/contact" className="text-sm text-muted-foreground hover:text-primary">
                Contact Us
              </a>
            </li>
            <li>
              <a href="/terms" className="text-sm text-muted-foreground hover:text-primary">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contact Us</h3>
          <p className="text-sm text-muted-foreground">
            123 Main Street, Anytown USA
          </p>
          <p className="text-sm text-muted-foreground">
            Email: info@ecommerce.com
          </p>
          <p className="text-sm text-muted-foreground">
            Phone: +1 (123) 456-7890
          </p>
        </div>
      </div>
      <div className="container mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} E-commerce Platform. All rights reserved.
      </div>
    </footer>
  );
}
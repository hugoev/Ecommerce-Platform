import type { RootState } from '@/app/store';
import { ChevronDown, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { guestCartUtils } from '@/utils/guestCart';
import { useCart } from '@/hooks/useCart';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { cart } = useCart();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [guestCartItemCount, setGuestCartItemCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get cart item count for both authenticated and guest users
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // For authenticated users, use the cart from useCart hook
      setGuestCartItemCount(cart?.items?.length || 0);
    } else {
      // For guest users, use guest cart utils
      const guestCart = guestCartUtils.getCartSummary();
      setGuestCartItemCount(guestCart?.items?.length || 0);
    }
  }, [isAuthenticated, user, cart]);

  // Listen for cart updates from other components and storage changes
  useEffect(() => {
    const handleCartUpdate = (event: CustomEvent) => {
      if (isAuthenticated && user?.id && event.detail?.userId === user.id) {
        // For authenticated users, the cart hook should automatically update
        // But we can trigger a re-render by updating the state
        setGuestCartItemCount(prev => prev); // Trigger re-render
      }
    };

    const handleGuestCartUpdate = () => {
      if (!isAuthenticated || !user?.id) {
        const guestCart = guestCartUtils.getCartSummary();
        setGuestCartItemCount(guestCart?.items?.length || 0);
      }
    };

    const handleStorageChange = () => {
      if (!isAuthenticated || !user?.id) {
        const guestCart = guestCartUtils.getCartSummary();
        setGuestCartItemCount(guestCart?.items?.length || 0);
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate as EventListener);
    window.addEventListener('guestCartUpdated', handleGuestCartUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate as EventListener);
      window.removeEventListener('guestCartUpdated', handleGuestCartUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated, user]);

  const cartItemCount = guestCartItemCount;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-foreground hover:text-foreground/80">
            E-Commerce
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/products" className="text-sm font-medium text-text-muted hover:text-foreground">
              Products
            </Link>
            <Link to="/cart" className="relative text-sm font-medium text-text-muted hover:text-foreground">
              Cart
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <User className="h-4 w-4" />
                  <span className="ml-2">{user?.username || 'User'}</span>
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
                {isDropdownOpen && (
                  <div className="absolute top-full right-0 z-50 w-48 bg-background border border-border rounded-md shadow-lg">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm hover:bg-hover text-foreground"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm hover:bg-hover text-foreground"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Order History
                      </Link>
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm hover:bg-hover text-foreground"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                      <div className="px-4 py-2 text-sm hover:bg-hover text-foreground cursor-pointer">
                        Settings
                      </div>
                      <div className="px-4 py-2 text-sm hover:bg-hover text-foreground cursor-pointer">
                        Logout
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
                {/* Development mode: Allow admin access without authentication */}
                <Link to="/admin">
                  <Button variant="outline" size="sm">Admin (Dev)</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
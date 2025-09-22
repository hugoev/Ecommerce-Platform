import type { RootState } from '@/app/store';
import { ChevronDown, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
            <Link to="/cart" className="text-sm font-medium text-text-muted hover:text-foreground">
              Cart
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
                  <span className="ml-2">{user?.name || 'User'}</span>
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
                {isDropdownOpen && (
                  <div className="absolute top-full right-0 z-50 w-48 bg-background border border-border rounded-md shadow-lg">
                    <div className="py-1">
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm hover:bg-hover text-foreground"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                      <div className="px-4 py-2 text-sm hover:bg-hover text-foreground cursor-pointer">
                        Profile
                      </div>
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
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
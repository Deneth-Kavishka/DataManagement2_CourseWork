import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useDeliveryLocation } from "../context/DeliveryLocationContext";
import Logo from "./Logo";
import DistrictSelector from "./DistrictSelector";
import { 
  Search, 
  User, 
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Header = ({ onCartClick, onLoginClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { cartItems } = useCart();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const { selectedLocation, setSelectedLocation } = useDeliveryLocation();
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast({
        title: "Empty search",
        description: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }
    
    navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
  };

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <Link href="/">
            <Logo />
          </Link>
          
          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Search for fresh produce, baked goods, and more..."
                className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <button 
                type="submit"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-primary">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.6667 16.6667L12.5 12.5M14.1667 8.33333C14.1667 11.555 11.555 14.1667 8.33333 14.1667C5.11167 14.1667 2.5 11.555 2.5 8.33333C2.5 5.11167 5.11167 2.5 8.33333 2.5C11.555 2.5 14.1667 5.11167 14.1667 8.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>
          </div>
          
          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-5">
            <Link href={isAuthenticated ? "/profile" : "#"} onClick={!isAuthenticated ? onLoginClick : undefined} className="flex items-center text-gray-700 hover:text-primary">
              <User size={20} className="mr-1" />
              <span>Account</span>
            </Link>
            
            <button onClick={onCartClick} className="flex items-center text-gray-700 hover:text-primary relative">
              <ShoppingCart size={20} className="mr-1" />
              <span>Cart</span>
              {cartItems?.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-xs text-white rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Navigation Links */}
      <div className="border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="hidden md:flex">
            <ul className="flex space-x-8">
              <li>
                <Link href="/" className={`block py-3 font-medium hover:text-primary ${location === '/' ? 'text-primary' : 'text-gray-700'}`}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className={`block py-3 font-medium hover:text-primary ${location === '/products' ? 'text-primary' : 'text-gray-700'}`}>
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className={`block py-3 font-medium hover:text-primary ${location === '/categories' ? 'text-primary' : 'text-gray-700'}`}>
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/vendors" className={`block py-3 font-medium hover:text-primary ${location === '/vendors' ? 'text-primary' : 'text-gray-700'}`}>
                  Vendors
                </Link>
              </li>
              <li>
                <Link href="/about" className={`block py-3 font-medium hover:text-primary ${location === '/about' ? 'text-primary' : 'text-gray-700'}`}>
                  About Us
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Delivery Location */}
      <div className="hidden md:block border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-end">
          <div className="flex items-center text-sm text-gray-600">
            <span className="flex items-center mr-2">
              <MapPin size={16} className="mr-1 text-primary" />
              Deliver to:
            </span>
            <DistrictSelector 
              selectedDistrict={selectedLocation} 
              onChange={setSelectedLocation}
              className="w-48"
            />
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden py-3 bg-white border-b border-gray-200">
          <div className="flex flex-col space-y-3 px-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative w-full mb-3">
              <input
                type="text"
                placeholder="Search..."
                className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <button 
                type="submit" 
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-primary">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.6667 16.6667L12.5 12.5M14.1667 8.33333C14.1667 11.555 11.555 14.1667 8.33333 14.1667C5.11167 14.1667 2.5 11.555 2.5 8.33333C2.5 5.11167 5.11167 2.5 8.33333 2.5C11.555 2.5 14.1667 5.11167 14.1667 8.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>

            <Link href="/" className="text-gray-800 hover:text-primary font-medium py-1">
              Home
            </Link>
            <Link href="/products" className="text-gray-800 hover:text-primary font-medium py-1">
              All Products
            </Link>
            <Link href="/categories" className="text-gray-800 hover:text-primary font-medium py-1">
              Categories
            </Link>
            <Link href="/vendors" className="text-gray-800 hover:text-primary font-medium py-1">
              Vendors
            </Link>
            <Link href="/about" className="text-gray-800 hover:text-primary font-medium py-1">
              About Us
            </Link>
            
            {/* Delivery Location Mobile */}
            <div className="flex flex-col py-1 text-sm">
              <span className="text-gray-600 flex items-center mb-1">
                <MapPin size={16} className="mr-1 text-primary" />
                Deliver to:
              </span>
              <DistrictSelector 
                selectedDistrict={selectedLocation} 
                onChange={setSelectedLocation}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

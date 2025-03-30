import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Navbar from './Navbar';
import SearchBar from './SearchBar';
import LocationSelector from './LocationSelector';
import Cart from '../cart/Cart';

const Header: React.FC = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const [location] = useLocation();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-gray-200 py-3">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <i className="fas fa-leaf text-primary text-2xl mr-2"></i>
              <span className="font-poppins font-bold text-2xl text-primary">UrbanFood</span>
            </Link>
          </div>
          
          <div className="w-full max-w-xl px-4">
            <SearchBar />
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                className="flex items-center text-gray-600 hover:text-primary transition-colors"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <i className="fas fa-user-circle text-xl"></i>
                <span className="ml-1 text-sm font-medium hidden sm:inline">Account</span>
              </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
                  {user ? (
                    <>
                      <Link href="/profile">
                        <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                      </Link>
                      <Link href="/profile/orders">
                        <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Orders</a>
                      </Link>
                      <button 
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login">
                        <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Login</a>
                      </Link>
                      <Link href="/register">
                        <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Register</a>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <button 
                className="flex items-center text-gray-600 hover:text-primary transition-colors"
                onClick={() => setCartOpen(true)}
              >
                <i className="fas fa-shopping-basket text-xl"></i>
                <span className="ml-1 text-sm font-medium hidden sm:inline">Cart</span>
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex items-center justify-between py-3">
          <Navbar currentPath={location} />
          <LocationSelector />
        </div>
      </div>
      
      {/* Cart Sidebar */}
      <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
};

export default Header;

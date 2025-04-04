import { useEffect } from "react";
import { Link } from "wouter";
import { useCart } from "../hooks/useCart";
import { Trash2, X, Plus, Minus } from "lucide-react";

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, updateItemQuantity, removeFromCart, cartTotal } = useCart();

  useEffect(() => {
    // Prevent scrolling when the cart drawer is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      updateItemQuantity(id, quantity);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div 
        className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-bold heading">Your Cart ({cartItems.length})</h3>
            <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <ShoppingBag className="h-16 w-16 text-neutral-300 mb-4" />
                <h3 className="text-lg font-semibold text-neutral-700">Your cart is empty</h3>
                <p className="text-neutral-500 mt-2 mb-4">Browse our products and add something to your cart</p>
                <Link href="/products">
                  <button onClick={onClose} className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg">
                    Shop Now
                  </button>
                </Link>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="flex border-b border-neutral-200 pb-4 mb-4">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="text-sm font-medium">{item.name}</h4>
                        <p className="text-xs text-neutral-500">{item.vendor}</p>
                      </div>
                      <p className="text-sm font-medium text-primary">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-neutral-600 hover:text-primary"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 py-1 text-sm">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-neutral-600 hover:text-primary"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-neutral-400 hover:text-error"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t p-4">
              <div className="flex justify-between mb-2">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-medium">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-neutral-600">Shipping</span>
                <span className="font-medium">$3.99</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-neutral-600">Tax</span>
                <span className="font-medium">${(cartTotal * 0.08).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4 pt-2 border-t font-bold">
                <span>Total</span>
                <span>${(cartTotal + 3.99 + cartTotal * 0.08).toFixed(2)}</span>
              </div>
              <Link href="/checkout">
                <button onClick={onClose} className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition mb-2">
                  Proceed to Checkout
                </button>
              </Link>
              <button onClick={onClose} className="w-full bg-white border border-primary text-primary hover:bg-primary-light/10 font-medium py-3 rounded-lg transition">
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;

// Fallback icon for empty cart
const ShoppingBag = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
    />
  </svg>
);
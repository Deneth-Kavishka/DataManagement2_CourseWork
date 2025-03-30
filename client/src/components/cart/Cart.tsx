import { useEffect } from 'react';
import { Link } from 'wouter';
import { useCart } from '@/context/CartContext';
import CartItem from './CartItem';
import { formatPrice } from '@/lib/utils';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { cartItems, cartTotal, cartSubtotal } = useCart();
  
  // Close cart when pressing escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);
  
  // Prevent scrolling when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const deliveryFee = cartSubtotal > 35 ? 0 : 3.99;
  const taxRate = 0.1; // 10% tax
  const taxAmount = cartSubtotal * taxRate;
  const total = cartSubtotal + deliveryFee + taxAmount;
  
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40">
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-poppins font-bold text-xl">Your Cart ({cartItems.length})</h2>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div className="p-4 max-h-[calc(100vh-250px)] overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-shopping-basket text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">Your cart is empty</p>
              <button 
                className="mt-4 px-4 py-2 bg-primary text-white rounded-full"
                onClick={onClose}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <CartItem 
                key={item.id}
                id={item.id}
                name={item.name}
                price={item.price}
                imageUrl={item.imageUrl}
                quantity={item.quantity}
                farmName={item.farmName}
              />
            ))
          )}
        </div>
        
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-bold">{formatPrice(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-bold">
                {deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-gray-600">Tax</span>
              <span className="font-bold">{formatPrice(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold mb-6">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Link href="/checkout">
              <a className="block w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-full transition-colors text-center">
                Proceed to Checkout
              </a>
            </Link>
            <button 
              className="w-full py-3 text-primary font-medium mt-2"
              onClick={onClose}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

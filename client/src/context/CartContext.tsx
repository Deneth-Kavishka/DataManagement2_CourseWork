import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: number;
  name: string;
  price: string | number;
  imageUrl: string;
  quantity: number;
  farmName: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: number) => void;
  increaseQuantity: (id: number) => void;
  decreaseQuantity: (id: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartSubtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Initialize from localStorage if available
    const savedCart = localStorage.getItem('urbanfood-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const { toast } = useToast();
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('urbanfood-cart', JSON.stringify(cartItems));
  }, [cartItems]);
  
  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        // Increase quantity if item already exists
        return prevItems.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + (item.quantity || 1) } 
            : cartItem
        );
      } else {
        // Add new item
        return [...prevItems, { ...item, quantity: item.quantity || 1 }];
      }
    });
  };
  
  const removeFromCart = (id: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    
    toast({
      title: 'Item Removed',
      description: 'The item has been removed from your cart',
    });
  };
  
  const increaseQuantity = (id: number) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      )
    );
  };
  
  const decreaseQuantity = (id: number) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      ).filter(item => item.quantity > 0)
    );
  };
  
  const clearCart = () => {
    setCartItems([]);
    toast({
      title: 'Cart Cleared',
      description: 'All items have been removed from your cart',
    });
  };
  
  // Calculate cart subtotal
  const cartSubtotal = cartItems.reduce((total, item) => {
    const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    return total + (itemPrice * item.quantity);
  }, 0);
  
  // Calculate cart total (with tax and delivery)
  const deliveryFee = cartSubtotal > 35 ? 0 : 3.99;
  const taxRate = 0.1; // 10% tax
  const taxAmount = cartSubtotal * taxRate;
  const cartTotal = cartSubtotal + deliveryFee + taxAmount;
  
  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      increaseQuantity, 
      decreaseQuantity, 
      clearCart, 
      cartTotal,
      cartSubtotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

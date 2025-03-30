import { Link } from 'wouter';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import CartItem from '@/components/cart/CartItem';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

const CartPage: React.FC = () => {
  const { cartItems, clearCart, cartSubtotal } = useCart();
  
  const deliveryFee = cartSubtotal > 35 ? 0 : 3.99;
  const taxRate = 0.1; // 10% tax
  const taxAmount = cartSubtotal * taxRate;
  const total = cartSubtotal + deliveryFee + taxAmount;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-poppins font-bold text-2xl mb-6">Your Shopping Cart</h1>
          
          {cartItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shopping-basket text-2xl text-gray-400"></i>
              </div>
              <h2 className="text-xl font-medium mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Looks like you haven't added any products to your cart yet.</p>
              <Link href="/products">
                <a className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-full transition-colors">
                  Start Shopping
                </a>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="md:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b">
                    <h2 className="font-medium text-lg">Cart Items ({cartItems.length})</h2>
                    <button 
                      className="text-red-500 flex items-center"
                      onClick={clearCart}
                    >
                      <i className="fas fa-trash-alt mr-1"></i>
                      Clear Cart
                    </button>
                  </div>
                  
                  <div>
                    {cartItems.map((item) => (
                      <CartItem 
                        key={item.id}
                        id={item.id}
                        name={item.name}
                        price={item.price}
                        imageUrl={item.imageUrl}
                        quantity={item.quantity}
                        farmName={item.farmName}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                  <h2 className="font-medium text-lg mb-4 pb-4 border-b">Order Summary</h2>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>{formatPrice(cartSubtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span>
                        {deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (10%)</span>
                      <span>{formatPrice(taxAmount)}</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                  
                  <Link href="/checkout">
                    <a className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-full transition-colors text-center block">
                      Proceed to Checkout
                    </a>
                  </Link>
                  
                  <Link href="/products">
                    <a className="w-full py-3 text-primary font-medium mt-3 text-center block">
                      Continue Shopping
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CartPage;

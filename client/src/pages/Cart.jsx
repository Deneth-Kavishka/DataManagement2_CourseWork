import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { useDeliveryLocation } from "../context/DeliveryLocationContext";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { formatLKR } from "../../../shared/currencyUtils.js";
import { districtShippingRates } from "../../../shared/districts.js";

const Cart = () => {
  const { cartItems, updateItemQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { selectedLocation } = useDeliveryLocation();
  const [, navigate] = useLocation();
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const handleUpdateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      updateItemQuantity(id, quantity);
    }
  };

  const handleApplyCoupon = () => {
    if (couponCode.toLowerCase() === "welcome10") {
      setCouponDiscount(cartTotal * 0.1);
      setCouponApplied(true);
    } else {
      setCouponDiscount(0);
      setCouponApplied(false);
    }
  };

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate("/checkout");
    } else {
      navigate("/login");
    }
  };

  // Get shipping rate based on district
  const getShippingRate = () => {
    if (!selectedLocation || !districtShippingRates[selectedLocation]) {
      return 250; // Default shipping rate in LKR
    }
    return districtShippingRates[selectedLocation];
  };

  // Calculate cart totals
  const shipping = cartTotal >= 5000 ? 0 : getShippingRate();
  const tax = cartTotal * 0.05; // 5% tax in Sri Lanka
  const orderTotal = cartTotal + shipping + tax - couponDiscount;

  if (cartItems.length === 0) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold heading mb-8">Your Cart</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <ShoppingBag className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-neutral-600 mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link href="/products">
            <button className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-lg">
              Start Shopping
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold heading mb-8">Your Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</h2>
                <button 
                  onClick={() => clearCart()}
                  className="text-neutral-500 hover:text-red-500 text-sm font-medium"
                >
                  Clear Cart
                </button>
              </div>
            </div>
            
            <div className="divide-y divide-neutral-200">
              {cartItems.map(item => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row">
                  <div className="sm:w-1/4 mb-4 sm:mb-0">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-full sm:w-24 h-24 object-cover rounded-md"
                    />
                  </div>
                  
                  <div className="sm:w-2/4 sm:pl-4">
                    <h3 className="text-lg font-medium mb-1">{item.name}</h3>
                    <p className="text-neutral-500 text-sm mb-2">Sold by: {item.vendor}</p>
                    <div className="flex items-center text-sm text-neutral-500 mb-4">
                      {item.isOrganic && <span className="mr-2 bg-accent/10 text-accent px-2 py-0.5 rounded-full text-xs">Organic</span>}
                      {item.isFreshPicked && <span className="mr-2 bg-success/10 text-success px-2 py-0.5 rounded-full text-xs">Fresh Picked</span>}
                      {item.isLocal && <span className="mr-2 bg-secondary/10 text-secondary px-2 py-0.5 rounded-full text-xs">Local</span>}
                    </div>
                    
                    <div className="flex items-center">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-neutral-400 hover:text-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="sm:w-1/4 flex flex-row sm:flex-col sm:items-end justify-between mt-4 sm:mt-0">
                    <div className="text-lg font-bold text-primary">{formatLKR(item.price * item.quantity)}</div>
                    
                    <div className="flex items-center border rounded-md mt-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 text-neutral-600 hover:text-primary"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-3 py-1 border-x">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 text-neutral-600 hover:text-primary"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6">
            <Link href="/products">
              <button className="flex items-center text-primary hover:text-primary-dark font-medium">
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span>{formatLKR(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Shipping</span>
                <span>{shipping === 0 ? "Free" : formatLKR(shipping)}</span>
              </div>
              {selectedLocation && (
                <div className="text-sm text-neutral-500 italic">
                  Delivery to {selectedLocation} district
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-600">Tax</span>
                <span>{formatLKR(tax)}</span>
              </div>
              
              {couponApplied && (
                <div className="flex justify-between text-green-600">
                  <span>Discount (WELCOME10)</span>
                  <span>-{formatLKR(couponDiscount)}</span>
                </div>
              )}
              
              <div className="border-t border-neutral-200 pt-3 mt-3">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatLKR(orderTotal)}</span>
                </div>
              </div>
            </div>
            
            {/* Coupon Code */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Coupon Code</label>
              <div className="flex">
                <input 
                  type="text" 
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-l-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                  placeholder="Enter code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button 
                  onClick={handleApplyCoupon}
                  className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-medium px-4 py-2 rounded-r-lg"
                >
                  Apply
                </button>
              </div>
              {couponApplied && (
                <p className="text-sm text-green-600 mt-1">Coupon applied successfully!</p>
              )}
              {couponCode && !couponApplied && (
                <p className="text-sm text-red-500 mt-1">Invalid coupon code</p>
              )}
            </div>
            
            <button 
              onClick={handleCheckout}
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition mb-4"
            >
              {isAuthenticated ? "Proceed to Checkout" : "Sign in to Checkout"}
            </button>
            
            <div className="text-sm text-neutral-500 text-center">
              <p>We accept payment via credit card and local payment options</p>
              <p className="mt-1">Free shipping on orders over {formatLKR(5000)}!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

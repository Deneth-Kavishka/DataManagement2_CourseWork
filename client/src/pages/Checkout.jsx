import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { useDeliveryLocation } from "../context/DeliveryLocationContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, ChevronDown, ChevronUp, CreditCard, Truck, MapPin } from "lucide-react";
import DistrictSelector from "../components/DistrictSelector";
import { sriLankanDistricts, districtShippingRates } from "../../../shared/districts.js";
import { formatLKR } from "../../../shared/currencyUtils.js";

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { selectedLocation } = useDeliveryLocation();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState('shipping');
  const [showOrderSummary, setShowOrderSummary] = useState(false); // For mobile view
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [formData, setFormData] = useState({
    shippingAddress: user?.address || "",
    shippingCity: user?.city || "",
    shippingState: user?.state || "",
    shippingZipCode: user?.zipCode || "",
    paymentMethod: "credit-card",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  // Initialize form state with delivery location if available
  useEffect(() => {
    if (selectedLocation) {
      setFormData(prev => ({
        ...prev,
        shippingState: selectedLocation
      }));
    }
  }, [selectedLocation]);

  // Calculate order totals based on Sri Lankan district shipping rates
  const getShippingRate = () => {
    const district = formData.shippingState;
    if (!district || !districtShippingRates[district]) {
      return 250; // Default shipping rate in LKR
    }
    return districtShippingRates[district];
  };

  const shipping = getShippingRate();
  const tax = cartTotal * 0.05; // 5% tax in Sri Lanka
  const orderTotal = cartTotal + shipping + tax;

  // Check if user is authenticated, redirect to login if not
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please sign in to proceed with checkout",
        variant: "destructive",
      });
      navigate("/login");
    }

    // Redirect to home if cart is empty
    if (cartItems.length === 0 && !orderPlaced) {
      navigate("/");
    }
  }, [isAuthenticated, cartItems.length, navigate, toast, orderPlaced]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitShipping = (e) => {
    e.preventDefault();
    
    // Validate shipping info
    if (!formData.shippingAddress || !formData.shippingCity || !formData.shippingState || !formData.shippingZipCode) {
      toast({
        title: "Error",
        description: "Please fill out all shipping information fields",
        variant: "destructive",
      });
      return;
    }
    
    setActiveStep('payment');
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    
    // Validate payment info
    if (!formData.cardNumber || !formData.cardName || !formData.expiryDate || !formData.cvv) {
      toast({
        title: "Error",
        description: "Please fill out all payment information fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create order data
      const orderData = {
        userId: user.id,
        total: orderTotal,
        status: "pending",
        shippingAddress: formData.shippingAddress,
        shippingCity: formData.shippingCity,
        shippingState: formData.shippingState,
        shippingZipCode: formData.shippingZipCode,
        paymentMethod: formData.paymentMethod,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };
      
      // Submit order to API
      const response = await apiRequest("POST", "/api/orders", orderData);
      const data = await response.json();
      
      // Order placed successfully
      setOrderPlaced(true);
      setOrderId(data.id);
      clearCart();
      
      toast({
        title: "Order Placed Successfully",
        description: `Your order #${data.id} has been placed successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to place your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If order is placed, show order confirmation
  if (orderPlaced) {
    return (
      <div className="py-12 max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-success mb-6">
            <CheckCircle className="h-16 w-16 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold heading mb-4">Thank You for Your Order!</h1>
          <p className="text-neutral-600 mb-6">
            Your order #{orderId} has been placed successfully. We've sent a confirmation email with all the details.
          </p>
          <div className="bg-neutral-50 p-6 rounded-lg mb-6 text-left">
            <h3 className="font-semibold mb-2">Order Details:</h3>
            <p><span className="font-medium">Order Number:</span> #{orderId}</p>
            <p><span className="font-medium">Total Amount:</span> {formatLKR(orderTotal)}</p>
            <p><span className="font-medium">Shipping Address:</span> {formData.shippingAddress}, {formData.shippingCity}, {formData.shippingState} {formData.shippingZipCode}</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-lg"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold heading mb-8">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Checkout Form */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md">
            {/* Shipping Information */}
            <div className={`p-6 border-b ${activeStep === 'shipping' ? 'border-primary' : 'border-neutral-200'}`}>
              <h2 className="text-xl font-semibold flex items-center mb-4">
                <Truck className="h-5 w-5 mr-2" />
                Shipping Information
              </h2>
              
              {activeStep === 'shipping' && (
                <form onSubmit={handleSubmitShipping}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <label className="block text-neutral-700 text-sm font-medium mb-2">
                        Street Address
                      </label>
                      <input 
                        type="text"
                        name="shippingAddress"
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                        value={formData.shippingAddress}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-neutral-700 text-sm font-medium mb-2">
                        City
                      </label>
                      <input 
                        type="text"
                        name="shippingCity"
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                        value={formData.shippingCity}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-neutral-700 text-sm font-medium mb-2">
                        District
                      </label>
                      <DistrictSelector
                        selectedDistrict={formData.shippingState}
                        onChange={(district) => {
                          setFormData(prev => ({
                            ...prev,
                            shippingState: district
                          }));
                        }}
                        className="w-full"
                      />
                      {formData.shippingState && (
                        <p className="mt-1 text-xs text-neutral-500">
                          Shipping rate to {formData.shippingState}: {formatLKR(getShippingRate())}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-neutral-700 text-sm font-medium mb-2">
                        ZIP Code
                      </label>
                      <input 
                        type="text"
                        name="shippingZipCode"
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                        value={formData.shippingZipCode}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-neutral-700 text-sm font-medium mb-2">
                        Phone Number
                      </label>
                      <input 
                        type="tel"
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                        value={user?.phoneNumber || ""}
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 rounded-lg transition"
                  >
                    Continue to Payment
                  </button>
                </form>
              )}
              
              {activeStep === 'payment' && (
                <div className="flex items-center justify-between text-neutral-600">
                  <div>
                    <p>{formData.shippingAddress}</p>
                    <p>{formData.shippingCity}, {formData.shippingState} {formData.shippingZipCode}</p>
                  </div>
                  <button 
                    onClick={() => setActiveStep('shipping')}
                    className="text-primary hover:text-primary-dark font-medium"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
            
            {/* Payment Information */}
            <div className={`p-6 ${activeStep === 'payment' ? 'border-primary' : 'border-neutral-200'}`}>
              <h2 className="text-xl font-semibold flex items-center mb-4">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Information
              </h2>
              
              {activeStep === 'payment' && (
                <form onSubmit={handleSubmitPayment}>
                  <div className="mb-4">
                    <label className="block text-neutral-700 text-sm font-medium mb-2">
                      Payment Method
                    </label>
                    <div className="flex flex-wrap gap-4">
                      <label className="relative flex items-center border border-primary rounded-lg p-3 cursor-pointer bg-primary/5">
                        <input 
                          type="radio"
                          name="paymentMethod"
                          value="credit-card"
                          checked={formData.paymentMethod === "credit-card"}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="w-4 h-4 rounded-full border-2 border-primary mr-2 flex-shrink-0 flex items-center justify-center">
                          {formData.paymentMethod === "credit-card" && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                        <span>Credit Card</span>
                      </label>
                      
                      <label className="relative flex items-center border border-neutral-300 rounded-lg p-3 cursor-pointer">
                        <input 
                          type="radio"
                          name="paymentMethod"
                          value="frimi"
                          checked={formData.paymentMethod === "frimi"}
                          onChange={handleChange}
                          className="sr-only"
                          disabled
                        />
                        <div className="w-4 h-4 rounded-full border-2 border-neutral-300 mr-2 flex-shrink-0 flex items-center justify-center">
                          {formData.paymentMethod === "frimi" && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                        <span className="text-neutral-400">Frimi (Coming Soon)</span>
                      </label>
                      
                      <label className="relative flex items-center border border-neutral-300 rounded-lg p-3 cursor-pointer">
                        <input 
                          type="radio"
                          name="paymentMethod"
                          value="lankaqr"
                          checked={formData.paymentMethod === "lankaqr"}
                          onChange={handleChange}
                          className="sr-only"
                          disabled
                        />
                        <div className="w-4 h-4 rounded-full border-2 border-neutral-300 mr-2 flex-shrink-0 flex items-center justify-center">
                          {formData.paymentMethod === "lankaqr" && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                        <span className="text-neutral-400">LankaQR (Coming Soon)</span>
                      </label>
                    </div>
                  </div>
                  
                  {formData.paymentMethod === "credit-card" && (
                    <>
                      <div className="mb-4">
                        <label className="block text-neutral-700 text-sm font-medium mb-2">
                          Card Number
                        </label>
                        <input 
                          type="text"
                          name="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                          value={formData.cardNumber}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-neutral-700 text-sm font-medium mb-2">
                          Name on Card
                        </label>
                        <input 
                          type="text"
                          name="cardName"
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                          value={formData.cardName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-neutral-700 text-sm font-medium mb-2">
                            Expiry Date
                          </label>
                          <input 
                            type="text"
                            name="expiryDate"
                            placeholder="MM/YY"
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                            value={formData.expiryDate}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-neutral-700 text-sm font-medium mb-2">
                            CVV
                          </label>
                          <input 
                            type="text"
                            name="cvv"
                            placeholder="123"
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                            value={formData.cvv}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}
                  
                  <button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 rounded-lg transition"
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Place Order"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Order Summary</h2>
              
              <button 
                className="lg:hidden text-neutral-500"
                onClick={() => setShowOrderSummary(!showOrderSummary)}
              >
                {showOrderSummary ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>
            
            <div className={`lg:block ${showOrderSummary ? 'block' : 'hidden'}`}>
              <div className="p-6 border-b border-neutral-200">
                <div className="divide-y divide-neutral-200">
                  {cartItems.map(item => (
                    <div key={item.id} className="py-3 flex justify-between">
                      <div className="flex">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-12 h-12 rounded-md object-cover mr-3"
                        />
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="font-medium">{formatLKR(item.price * item.quantity)}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Subtotal</span>
                    <span>{formatLKR(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Shipping</span>
                    <span>{shipping === 0 ? "Free" : formatLKR(shipping)}</span>
                  </div>
                  {formData.shippingState && (
                    <div className="text-sm text-neutral-500 italic">
                      Delivery to {formData.shippingState} district
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Tax</span>
                    <span>{formatLKR(tax)}</span>
                  </div>
                  
                  <div className="border-t border-neutral-200 pt-3 mt-3">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>{formatLKR(orderTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

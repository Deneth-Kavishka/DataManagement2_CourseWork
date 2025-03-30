import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { formatPrice } from '@/lib/utils';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import CartItem from '@/components/cart/CartItem';

const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const { cartItems, cartSubtotal, cartTotal, clearCart } = useCart();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || '');
  const [zipCode, setZipCode] = useState(user?.zipCode || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  
  // Calculate order summary values
  const deliveryFee = cartSubtotal > 35 ? 0 : 3.99;
  const taxRate = 0.1; // 10% tax
  const taxAmount = cartSubtotal * taxRate;
  const total = cartSubtotal + deliveryFee + taxAmount;
  
  const orderMutation = useMutation({
    mutationFn: (orderData: any) => 
      apiRequest('POST', '/api/orders', orderData),
    onSuccess: async (res) => {
      const orderData = await res.json();
      
      // Create order items
      const orderItemPromises = cartItems.map((item) => 
        apiRequest('POST', '/api/orderItems', {
          orderId: orderData.id,
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })
      );
      
      await Promise.all(orderItemPromises);
      
      // Clear cart and redirect to success page
      clearCart();
      queryClient.invalidateQueries({ queryKey: [`/api/orders/user/${user?.id}`] });
      
      toast({
        title: 'Order Placed Successfully',
        description: `Your order #${orderData.id} has been placed successfully.`,
      });
      
      navigate('/profile');
    },
    onError: (error) => {
      toast({
        title: 'Failed to Place Order',
        description: error instanceof Error ? error.message : 'There was an error processing your order.',
        variant: 'destructive',
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'You need to be logged in to place an order.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }
    
    if (cartItems.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Your cart is empty. Add some items before checking out.',
        variant: 'destructive',
      });
      navigate('/products');
      return;
    }
    
    // Create the order
    const orderData = {
      userId: user.id,
      totalAmount: total.toString(),
      status: 'processing',
      shippingAddress: `${shippingAddress}, ${city}, ${zipCode}`,
      contactPhone,
      paymentMethod
    };
    
    orderMutation.mutate(orderData);
  };
  
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shopping-basket text-2xl text-gray-400"></i>
              </div>
              <h2 className="text-xl font-medium mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">You need to add items to your cart before proceeding to checkout.</p>
              <Button 
                onClick={() => navigate('/products')}
                className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-full transition-colors"
              >
                Browse Products
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-poppins font-bold text-2xl mb-6">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div>
                      <Label htmlFor="shipping-address">Address</Label>
                      <Input 
                        id="shipping-address" 
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Street address"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input 
                          id="city" 
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="City"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="zip-code">ZIP Code</Label>
                        <Input 
                          id="zip-code" 
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          placeholder="ZIP Code"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="contact-phone">Phone Number</Label>
                      <Input 
                        id="contact-phone" 
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="For delivery updates"
                        required
                      />
                    </div>
                  </form>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 mb-3">
                      <RadioGroupItem value="credit_card" id="credit_card" />
                      <Label htmlFor="credit_card" className="flex items-center">
                        <i className="fas fa-credit-card text-gray-600 mr-2"></i>
                        Credit Card
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal" className="flex items-center">
                        <i className="fab fa-paypal text-gray-600 mr-2"></i>
                        PayPal
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex items-center">
                        <i className="fas fa-money-bill-wave text-gray-600 mr-2"></i>
                        Cash on Delivery
                      </Label>
                    </div>
                  </RadioGroup>
                  
                  {paymentMethod === 'credit_card' && (
                    <div className="mt-4 p-4 border rounded-md">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="card-name">Cardholder Name</Label>
                          <Input id="card-name" placeholder="Name on card" />
                        </div>
                        <div>
                          <Label htmlFor="card-number">Card Number</Label>
                          <Input id="card-number" placeholder="1234 5678 9012 3456" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiry-date">Expiry Date</Label>
                            <Input id="expiry-date" placeholder="MM/YY" />
                          </div>
                          <div>
                            <Label htmlFor="cvv">CVV</Label>
                            <Input id="cvv" placeholder="123" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup defaultValue="standard">
                    <div className="flex items-center justify-between mb-3 p-3 border rounded-md">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="standard" id="standard" />
                        <Label htmlFor="standard">
                          <div>
                            <p className="font-medium">Standard Delivery</p>
                            <p className="text-sm text-gray-500">Delivery within 2-3 days</p>
                          </div>
                        </Label>
                      </div>
                      <span>{cartSubtotal > 35 ? 'Free' : formatPrice(3.99)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="express" id="express" />
                        <Label htmlFor="express">
                          <div>
                            <p className="font-medium">Express Delivery</p>
                            <p className="text-sm text-gray-500">Same day delivery</p>
                          </div>
                        </Label>
                      </div>
                      <span>{formatPrice(9.99)}</span>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>
                    {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="max-h-80 overflow-y-auto space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center py-2 border-b">
                        <img 
                          src={item.imageUrl}
                          alt={item.name} 
                          className="w-16 h-16 object-cover rounded-md mr-3"
                        />
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                            <span className="font-medium">{formatPrice(item.price)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t">
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
                  
                  <div className="flex justify-between pt-4 border-t font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  
                  <Button 
                    onClick={handleSubmit}
                    disabled={orderMutation.isPending}
                    className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-full transition-colors"
                  >
                    {orderMutation.isPending ? (
                      <div className="flex items-center justify-center">
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Processing...
                      </div>
                    ) : 'Place Order'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CheckoutPage;

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Fetch user orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: [`/api/orders/user/${user?.id}`],
    enabled: !!user,
  });
  
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <i className="fas fa-user-circle text-5xl text-gray-300 mb-4"></i>
                  <h2 className="text-xl font-medium mb-4">You need to be logged in to view your profile</h2>
                  <a href="/login" className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-full transition-colors">
                    Login Now
                  </a>
                </div>
              </CardContent>
            </Card>
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
          <div className="mb-6">
            <h1 className="font-poppins font-bold text-2xl">My Account</h1>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-white border border-gray-200 shadow-sm rounded-lg p-1">
              <TabsTrigger value="profile" className="rounded-md px-4 py-2">
                <i className="fas fa-user mr-2"></i>Profile
              </TabsTrigger>
              <TabsTrigger value="orders" className="rounded-md px-4 py-2">
                <i className="fas fa-shopping-bag mr-2"></i>Orders
              </TabsTrigger>
              {user.isFarmer && (
                <TabsTrigger value="farm" className="rounded-md px-4 py-2">
                  <i className="fas fa-leaf mr-2"></i>Farm Profile
                </TabsTrigger>
              )}
              <TabsTrigger value="settings" className="rounded-md px-4 py-2">
                <i className="fas fa-cog mr-2"></i>Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Full Name</h3>
                      <p className="text-lg">{user.fullName}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Email Address</h3>
                      <p className="text-lg">{user.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Username</h3>
                      <p className="text-lg">{user.username}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Phone</h3>
                      <p className="text-lg">{user.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-3">Shipping Address</h3>
                    {user.address ? (
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p>{user.address}</p>
                        <p>{user.city || ''} {user.zipCode || ''}</p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-md text-gray-500">
                        No shipping address provided
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                      Edit Profile
                    </button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="orders" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="border rounded-md p-4">
                          <div className="flex justify-between mb-4">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-6 w-24" />
                          </div>
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      ))}
                    </div>
                  ) : orders && orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order: any) => (
                        <div key={order.id} className="border rounded-md p-4 hover:shadow-md transition-shadow">
                          <div className="flex flex-wrap justify-between mb-2">
                            <span className="font-medium">Order #{order.id}</span>
                            <span className="text-gray-600">{new Date(order.orderDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex flex-wrap justify-between mb-2">
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            <span className="font-medium">{formatPrice(order.totalAmount)}</span>
                          </div>
                          <div className="mt-2">
                            <button className="text-primary text-sm hover:underline">
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <i className="fas fa-shopping-bag text-4xl text-gray-300 mb-3"></i>
                      <h3 className="text-xl font-medium mb-2">No orders yet</h3>
                      <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
                      <a href="/products" className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors">
                        Start Shopping
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {user.isFarmer && (
              <TabsContent value="farm" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Farm Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Farm Name</h3>
                        <p className="text-lg">{user.farmName}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                        <p className="text-md">{user.farmDescription}</p>
                      </div>
                      
                      <div className="mt-4">
                        <h3 className="text-lg font-medium mb-3">Your Products</h3>
                        <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                          Manage Products
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            
            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Password</h3>
                      <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                        Change Password
                      </button>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h3 className="font-medium mb-2">Email Preferences</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input type="checkbox" id="marketing-emails" className="mr-2" defaultChecked />
                          <label htmlFor="marketing-emails">Receive marketing emails</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="order-updates" className="mr-2" defaultChecked />
                          <label htmlFor="order-updates">Order status updates</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="new-products" className="mr-2" defaultChecked />
                          <label htmlFor="new-products">New product notifications</label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h3 className="font-medium mb-2 text-red-600">Danger Zone</h3>
                      <button className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

// Helper function to get color class based on order status
function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'shipped':
      return 'bg-purple-100 text-purple-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default ProfilePage;

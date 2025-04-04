import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  Settings, 
  LogOut,
  AlertCircle,
  Edit,
  Save,
  Store
} from "lucide-react";

const UserProfile = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: user ? [`/api/orders?userId=${user.id}`] : null,
    enabled: !!user
  });

  // Check if user is authenticated, redirect to login if not
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please sign in to view your profile",
        variant: "destructive",
      });
      navigate("/login");
    } else if (user) {
      setUserData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zipCode || "",
      });
    }
  }, [isAuthenticated, user, navigate, toast]);
  
  if (!isAuthenticated || !user) {
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    
    try {
      await apiRequest("PATCH", `/api/users/${user.id}`, userData);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "processing":
        return "bg-blue-500";
      case "shipped":
        return "bg-purple-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="md:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg">{user.firstName} {user.lastName}</h2>
                <p className="text-neutral-500">{user.email}</p>
              </div>
            </div>
            
            <nav>
              <ul className="space-y-1">
                <li>
                  <button 
                    onClick={() => setActiveTab("profile")}
                    className={`flex items-center w-full px-4 py-2 rounded-lg ${activeTab === "profile" ? "bg-primary text-white" : "hover:bg-neutral-100"}`}
                  >
                    <User className="h-5 w-5 mr-2" />
                    Profile
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab("orders")}
                    className={`flex items-center w-full px-4 py-2 rounded-lg ${activeTab === "orders" ? "bg-primary text-white" : "hover:bg-neutral-100"}`}
                  >
                    <Package className="h-5 w-5 mr-2" />
                    Orders
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab("favorites")}
                    className={`flex items-center w-full px-4 py-2 rounded-lg ${activeTab === "favorites" ? "bg-primary text-white" : "hover:bg-neutral-100"}`}
                  >
                    <Heart className="h-5 w-5 mr-2" />
                    Favorites
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab("addresses")}
                    className={`flex items-center w-full px-4 py-2 rounded-lg ${activeTab === "addresses" ? "bg-primary text-white" : "hover:bg-neutral-100"}`}
                  >
                    <MapPin className="h-5 w-5 mr-2" />
                    Addresses
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab("settings")}
                    className={`flex items-center w-full px-4 py-2 rounded-lg ${activeTab === "settings" ? "bg-primary text-white" : "hover:bg-neutral-100"}`}
                  >
                    <Settings className="h-5 w-5 mr-2" />
                    Settings
                  </button>
                </li>
                {user.isVendor && (
                  <li>
                    <button 
                      onClick={() => navigate("/vendor/dashboard")}
                      className="flex items-center w-full px-4 py-2 rounded-lg text-primary hover:bg-neutral-100"
                    >
                      <Store className="h-5 w-5 mr-2" />
                      Vendor Dashboard
                    </button>
                  </li>
                )}
                <li className="pt-2 border-t border-neutral-200 mt-2">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 rounded-lg text-red-500 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="md:w-3/4">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Profile Information</h2>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-primary hover:text-primary-dark"
                >
                  {isEditing ? (
                    <Save className="h-5 w-5" />
                  ) : (
                    <Edit className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              <div className="p-6">
                {userData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-500 mb-1">First Name</label>
                      {isEditing ? (
                        <input 
                          type="text"
                          name="firstName"
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                          value={userData.firstName}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <p className="text-neutral-900">{userData.firstName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-500 mb-1">Last Name</label>
                      {isEditing ? (
                        <input 
                          type="text"
                          name="lastName"
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                          value={userData.lastName}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <p className="text-neutral-900">{userData.lastName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-500 mb-1">Email Address</label>
                      <p className="text-neutral-900">{userData.email}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-500 mb-1">Phone Number</label>
                      {isEditing ? (
                        <input 
                          type="text"
                          name="phoneNumber"
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                          value={userData.phoneNumber}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <p className="text-neutral-900">{userData.phoneNumber || "Not provided"}</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-500 mb-1">Address</label>
                      {isEditing ? (
                        <input 
                          type="text"
                          name="address"
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                          value={userData.address}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <p className="text-neutral-900">{userData.address || "Not provided"}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-500 mb-1">City</label>
                      {isEditing ? (
                        <input 
                          type="text"
                          name="city"
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                          value={userData.city}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <p className="text-neutral-900">{userData.city || "Not provided"}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-500 mb-1">State</label>
                      {isEditing ? (
                        <input 
                          type="text"
                          name="state"
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                          value={userData.state}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <p className="text-neutral-900">{userData.state || "Not provided"}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-500 mb-1">ZIP Code</label>
                      {isEditing ? (
                        <input 
                          type="text"
                          name="zipCode"
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                          value={userData.zipCode}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <p className="text-neutral-900">{userData.zipCode || "Not provided"}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {isEditing && (
                  <div className="mt-6">
                    <button 
                      onClick={handleSaveProfile}
                      className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-2 rounded-lg transition"
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="ml-4 text-neutral-500 hover:text-neutral-700 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-xl font-semibold">Order History</h2>
              </div>
              
              <div className="p-6">
                {ordersLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : orders && orders.length > 0 ? (
                  <div className="divide-y divide-neutral-200">
                    {orders.map(order => (
                      <div key={order.id} className="py-4">
                        <div className="flex flex-wrap justify-between items-center mb-2">
                          <div>
                            <span className="font-medium">Order #{order.id}</span>
                            <span className="text-neutral-500 text-sm ml-2">Placed on {formatDate(order.createdAt)}</span>
                          </div>
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(order.status)} mr-2`}></div>
                            <span className="capitalize">{order.status}</span>
                          </div>
                        </div>
                        
                        <div className="bg-neutral-50 p-3 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <span className="text-neutral-600">Total</span>
                            <span className="font-medium">${order.total.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-600">Shipping</span>
                            <span>{order.shippingAddress}, {order.shippingCity}, {order.shippingState} {order.shippingZipCode}</span>
                          </div>
                        </div>
                        
                        <div className="mt-2 flex justify-end">
                          <button className="text-primary hover:text-primary-dark text-sm font-medium">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-10 w-10 text-neutral-400 mx-auto mb-2" />
                    <h3 className="font-medium mb-1">No Orders Yet</h3>
                    <p className="text-neutral-500 mb-4">You haven't placed any orders yet.</p>
                    <button 
                      onClick={() => navigate("/products")}
                      className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg"
                    >
                      Start Shopping
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Favorites Tab */}
          {activeTab === "favorites" && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-xl font-semibold">Favorite Products</h2>
              </div>
              
              <div className="p-6">
                <div className="text-center py-8">
                  <Heart className="h-10 w-10 text-neutral-400 mx-auto mb-2" />
                  <h3 className="font-medium mb-1">No Favorites Yet</h3>
                  <p className="text-neutral-500 mb-4">You haven't added any products to your favorites yet.</p>
                  <button 
                    onClick={() => navigate("/products")}
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg"
                  >
                    Explore Products
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Addresses Tab */}
          {activeTab === "addresses" && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-xl font-semibold">Saved Addresses</h2>
              </div>
              
              <div className="p-6">
                {userData && userData.address ? (
                  <div className="border border-neutral-200 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">Primary Address</h3>
                      <div className="flex space-x-2">
                        <button className="text-primary hover:text-primary-dark">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-500 hover:text-red-600">
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p>{userData.address}</p>
                    <p>{userData.city}, {userData.state} {userData.zipCode}</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="h-10 w-10 text-neutral-400 mx-auto mb-2" />
                    <h3 className="font-medium mb-1">No Addresses Saved</h3>
                    <p className="text-neutral-500 mb-4">You haven't saved any addresses yet.</p>
                    <button 
                      onClick={() => {
                        setActiveTab("profile");
                        setIsEditing(true);
                      }}
                      className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg"
                    >
                      Add Address
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-xl font-semibold">Account Settings</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Password</h3>
                    <button className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-4 py-2 rounded-lg">
                      Change Password
                    </button>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Email Notifications</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded text-primary focus:ring-primary mr-2" checked />
                        <span>Order updates</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded text-primary focus:ring-primary mr-2" checked />
                        <span>New products from favorite vendors</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded text-primary focus:ring-primary mr-2" />
                        <span>Promotional emails</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Delete Account</h3>
                    <p className="text-neutral-500 text-sm mb-2">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button className="text-red-500 hover:text-red-600 font-medium">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Temporary component for trash icon
const Trash = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export default UserProfile;

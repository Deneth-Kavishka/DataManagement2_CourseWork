import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Store, 
  Package, 
  BarChart, 
  Settings,
  FilePlus,
  ListFilter,
  Edit,
  Trash2,
  LogOut,
  Save,
  Info,
  AlertTriangle,
  X
} from "lucide-react";

const VendorDashboard = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [vendorData, setVendorData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Fetch vendor information
  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: user && user.isVendor ? [`/api/vendors/user/${user.id}`] : null,
    enabled: !!user && user.isVendor
  });

  // Fetch vendor products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: vendor ? [`/api/products?vendorId=${vendor.id}`] : null,
    enabled: !!vendor
  });

  // Mutation for updating vendor information
  const updateVendor = useMutation({
    mutationFn: async (updatedData) => {
      return await apiRequest("PATCH", `/api/vendors/${vendor.id}`, updatedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/vendors/user/${user.id}`] });
      toast({
        title: "Vendor Profile Updated",
        description: "Your vendor profile has been updated successfully",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update vendor profile. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for deleting a product
  const deleteProduct = useMutation({
    mutationFn: async (productId) => {
      return await apiRequest("DELETE", `/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products?vendorId=${vendor.id}`] });
      toast({
        title: "Product Deleted",
        description: "Your product has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, productId: null });
  
  // Function to handle delete button click
  const handleDeleteClick = (productId) => {
    setDeleteConfirmation({ show: true, productId });
  };
  
  // Function to confirm and execute product deletion
  const confirmDelete = () => {
    if (deleteConfirmation.productId) {
      deleteProduct.mutate(deleteConfirmation.productId);
      setDeleteConfirmation({ show: false, productId: null });
    }
  };
  
  // Function to cancel deletion
  const cancelDelete = () => {
    setDeleteConfirmation({ show: false, productId: null });
  };

  // Check if user is authenticated and is a vendor
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please sign in to access your vendor dashboard",
        variant: "destructive",
      });
      navigate("/login");
    } else if (user && !user.isVendor) {
      toast({
        title: "Not a Vendor",
        description: "You need to register as a vendor to access this page",
        variant: "destructive",
      });
      navigate("/register?vendor=true");
    } else if (vendor) {
      setVendorData({
        businessName: vendor.businessName || "",
        description: vendor.description || "",
        location: vendor.location || "",
        logoUrl: vendor.logoUrl || "",
        bannerUrl: vendor.bannerUrl || "",
        tags: vendor.tags || []
      });
    }
  }, [isAuthenticated, user, vendor, navigate, toast]);

  if (!isAuthenticated || !user || !user.isVendor || vendorLoading) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-neutral-600">Loading vendor dashboard...</p>
      </div>
    );
  }

  if (!vendor && !vendorLoading) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 text-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
          <Info className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Complete Your Vendor Registration</h1>
          <p className="text-neutral-600 mb-6">
            Your account is marked as a vendor, but you need to complete your vendor profile.
          </p>
          <button 
            onClick={() => navigate("/vendor/setup")}
            className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-lg transition"
          >
            Set Up Vendor Profile
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVendorData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagChange = (e) => {
    const tags = e.target.value.split(",").map(tag => tag.trim());
    setVendorData(prev => ({
      ...prev,
      tags
    }));
  };

  const handleSaveProfile = () => {
    updateVendor.mutate(vendorData);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4">
      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-lg font-bold">Confirm Delete</h3>
            </div>
            <p className="mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button 
                onClick={cancelDelete}
                className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="md:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <Store className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg">{vendor.businessName}</h2>
                <p className="text-neutral-500">{vendor.location}</p>
              </div>
            </div>
            
            <nav>
              <ul className="space-y-1">
                <li>
                  <button 
                    onClick={() => setActiveTab("overview")}
                    className={`flex items-center w-full px-4 py-2 rounded-lg ${activeTab === "overview" ? "bg-primary text-white" : "hover:bg-neutral-100"}`}
                  >
                    <BarChart className="h-5 w-5 mr-2" />
                    Overview
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab("products")}
                    className={`flex items-center w-full px-4 py-2 rounded-lg ${activeTab === "products" ? "bg-primary text-white" : "hover:bg-neutral-100"}`}
                  >
                    <Package className="h-5 w-5 mr-2" />
                    Products
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab("orders")}
                    className={`flex items-center w-full px-4 py-2 rounded-lg ${activeTab === "orders" ? "bg-primary text-white" : "hover:bg-neutral-100"}`}
                  >
                    <ListFilter className="h-5 w-5 mr-2" />
                    Orders
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
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Vendor Banner */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-neutral-200 relative">
                  {vendor.bannerUrl && (
                    <img 
                      src={vendor.bannerUrl} 
                      alt={`${vendor.businessName} banner`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-white rounded-lg overflow-hidden mr-4 border-2 border-white shadow-md">
                        {vendor.logoUrl ? (
                          <img 
                            src={vendor.logoUrl} 
                            alt={vendor.businessName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                            <Store className="h-8 w-8 text-primary" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-white">{vendor.businessName}</h1>
                        <p className="text-white/80">{vendor.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">About Us</h2>
                  <p className="text-neutral-600">{vendor.description}</p>
                  
                  {vendor.tags && vendor.tags.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-neutral-500 mb-2">Specialties</h3>
                      <div className="flex flex-wrap gap-2">
                        {vendor.tags.map((tag, index) => (
                          <span key={index} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-2">Products</h3>
                  <div className="flex items-end justify-between">
                    <div className="text-3xl font-bold text-primary">
                      {products ? products.length : 0}
                    </div>
                    <Package className="h-8 w-8 text-neutral-300" />
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-2">Orders</h3>
                  <div className="flex items-end justify-between">
                    <div className="text-3xl font-bold text-primary">
                      0
                    </div>
                    <ListFilter className="h-8 w-8 text-neutral-300" />
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-2">Revenue</h3>
                  <div className="flex items-end justify-between">
                    <div className="text-3xl font-bold text-primary">
                      LKR 0.00
                    </div>
                    <BarChart className="h-8 w-8 text-neutral-300" />
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => navigate("/vendor/add-product")}
                    className="flex items-center justify-center bg-primary hover:bg-primary-dark text-white font-medium px-4 py-3 rounded-lg transition"
                  >
                    <FilePlus className="h-5 w-5 mr-2" />
                    Add New Product
                  </button>
                  <button 
                    onClick={() => setActiveTab("settings")}
                    className="flex items-center justify-center border border-primary text-primary hover:bg-primary hover:text-white font-medium px-4 py-3 rounded-lg transition"
                  >
                    <Edit className="h-5 w-5 mr-2" />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Products</h2>
                <button 
                  onClick={() => navigate("/vendor/add-product")}
                  className="bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2 rounded-lg transition flex items-center"
                >
                  <FilePlus className="h-4 w-4 mr-2" />
                  Add Product
                </button>
              </div>
              
              <div className="p-6">
                {productsLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : products && products.length > 0 ? (
                  <div className="divide-y divide-neutral-200">
                    {products.map(product => (
                      <div key={product.id} className="py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden mr-4">
                            {product.imageUrl ? (
                              <img 
                                src={product.imageUrl} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                No Image
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{product.name}</h3>
                            <p className="text-sm text-neutral-500">
                              LKR {(product.price * 320).toFixed(2)} • Stock: {product.stock}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => navigate(`/vendor/edit-product/${product.id}`)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Edit Product"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(product.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete Product"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Products Yet</h3>
                    <p className="text-neutral-500 mb-4">You haven't added any products to your store yet.</p>
                    <button 
                      onClick={() => navigate("/vendor/add-product")}
                      className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-2 rounded-lg transition"
                    >
                      Add Your First Product
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
                <h2 className="text-xl font-semibold">Orders</h2>
              </div>
              
              <div className="p-6 text-center">
                <ListFilter className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Orders Yet</h3>
                <p className="text-neutral-500">
                  When customers place orders for your products, they will appear here.
                </p>
              </div>
            </div>
          )}
          
          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Vendor Settings</h2>
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
                {vendorData && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-500 mb-1">Business Name</label>
                      {isEditing ? (
                        <input 
                          type="text"
                          name="businessName"
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                          value={vendorData.businessName}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <p className="text-neutral-900">{vendorData.businessName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-500 mb-1">Description</label>
                      {isEditing ? (
                        <textarea 
                          name="description"
                          rows="4"
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                          value={vendorData.description}
                          onChange={handleInputChange}
                        ></textarea>
                      ) : (
                        <p className="text-neutral-900">{vendorData.description || "No description provided"}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-500 mb-1">Location</label>
                      {isEditing ? (
                        <input 
                          type="text"
                          name="location"
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                          value={vendorData.location}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <p className="text-neutral-900">{vendorData.location}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-500 mb-1">Tags (comma separated)</label>
                      {isEditing ? (
                        <input 
                          type="text"
                          name="tags"
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                          value={vendorData.tags ? vendorData.tags.join(", ") : ""}
                          onChange={handleTagChange}
                        />
                      ) : (
                        <p className="text-neutral-900">
                          {vendorData.tags && vendorData.tags.length > 0 
                            ? vendorData.tags.join(", ") 
                            : "No tags provided"}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-500 mb-1">Logo URL</label>
                      {isEditing ? (
                        <input 
                          type="text"
                          name="logoUrl"
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                          value={vendorData.logoUrl}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <p className="text-neutral-900 truncate">{vendorData.logoUrl || "No logo URL provided"}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-500 mb-1">Banner URL</label>
                      {isEditing ? (
                        <input 
                          type="text"
                          name="bannerUrl"
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                          value={vendorData.bannerUrl}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <p className="text-neutral-900 truncate">{vendorData.bannerUrl || "No banner URL provided"}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {isEditing && (
                  <div className="mt-6">
                    <button 
                      onClick={handleSaveProfile}
                      className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-2 rounded-lg transition"
                      disabled={updateVendor.isPending}
                    >
                      {updateVendor.isPending ? "Saving..." : "Save Changes"}
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
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
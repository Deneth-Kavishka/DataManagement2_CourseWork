import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft,
  Plus
} from "lucide-react";

const AddProduct = () => {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "0",
    imageUrl: "",
    categoryId: "",
    location: "",
    isOrganic: false,
    isFreshPicked: false,
    isLocal: true
  });
  
  // Fetch vendor information
  const { data: vendor } = useQuery({
    queryKey: user && user.isVendor ? [`/api/vendors/user/${user.id}`] : null,
    enabled: !!user && user.isVendor
  });

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  // Redirect if not logged in or not a vendor
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please sign in to add products",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    if (user && !user.isVendor) {
      toast({
        title: "Vendor Access Only",
        description: "Only vendors can add products",
        variant: "destructive",
      });
      navigate("/");
    }
    
    if (!vendor && !categoriesLoading) {
      toast({
        title: "Vendor Profile Required",
        description: "Please complete your vendor profile setup first",
        variant: "destructive",
      });
      navigate("/vendor/setup");
    }
  }, [isAuthenticated, user, vendor, categoriesLoading, navigate, toast]);
  
  const createProduct = useMutation({
    mutationFn: async (productData) => {
      return await apiRequest("POST", "/api/products", productData);
    },
    onSuccess: () => {
      toast({
        title: "Product Added",
        description: "Your product has been added successfully",
      });
      navigate("/vendor/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add product. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast({
        title: "Error",
        description: "Name, price, and category are required",
        variant: "destructive",
      });
      return;
    }
    
    if (!vendor) {
      toast({
        title: "Error",
        description: "Vendor profile not found",
        variant: "destructive",
      });
      return;
    }
    
    createProduct.mutate({
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      imageUrl: formData.imageUrl,
      categoryId: parseInt(formData.categoryId),
      vendorId: vendor.id,
      location: formData.location || vendor.location,
      isOrganic: formData.isOrganic,
      isFreshPicked: formData.isFreshPicked,
      isLocal: formData.isLocal
    });
  };
  
  if (!isAuthenticated || !user || !user.isVendor) {
    return null;
  }
  
  if (categoriesLoading) {
    return (
      <div className="py-12 max-w-3xl mx-auto px-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-neutral-600">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="py-12 max-w-3xl mx-auto px-4">
      <button 
        onClick={() => navigate("/vendor/dashboard")}
        className="flex items-center text-neutral-600 hover:text-neutral-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </button>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold heading mb-2">Add New Product</h1>
        <p className="text-neutral-600">List a new product for customers to purchase</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="block text-neutral-700 text-sm font-medium mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                name="name"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                placeholder="What are you selling?"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-neutral-700 text-sm font-medium mb-2">
                Description
              </label>
              <textarea 
                name="description"
                rows="4"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                placeholder="Describe your product - include details about freshness, origin, growing practices, etc."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-neutral-700 text-sm font-medium mb-2">
                  Price ($) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                  placeholder="9.99"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-neutral-700 text-sm font-medium mb-2">
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number"
                  name="stock"
                  min="0"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                  placeholder="How many units do you have?"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-neutral-700 text-sm font-medium mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select 
                name="categoryId"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                value={formData.categoryId}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                {categories && categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-neutral-700 text-sm font-medium mb-2">
                Image URL
              </label>
              <input 
                type="text"
                name="imageUrl"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-neutral-700 text-sm font-medium mb-2">
                Specific Location (optional)
              </label>
              <input 
                type="text"
                name="location"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                placeholder="Leave blank to use your vendor location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-3">
              <label className="block text-neutral-700 text-sm font-medium mb-2">
                Product Attributes
              </label>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="isOrganic"
                  name="isOrganic"
                  checked={formData.isOrganic}
                  onChange={handleChange}
                  className="rounded text-primary focus:ring-primary mr-2"
                />
                <label htmlFor="isOrganic" className="text-neutral-700">
                  Certified Organic
                </label>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="isFreshPicked"
                  name="isFreshPicked"
                  checked={formData.isFreshPicked}
                  onChange={handleChange}
                  className="rounded text-primary focus:ring-primary mr-2"
                />
                <label htmlFor="isFreshPicked" className="text-neutral-700">
                  Fresh Picked / Harvested
                </label>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="isLocal"
                  name="isLocal"
                  checked={formData.isLocal}
                  onChange={handleChange}
                  className="rounded text-primary focus:ring-primary mr-2"
                />
                <label htmlFor="isLocal" className="text-neutral-700">
                  Locally Grown
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <button 
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition flex items-center justify-center"
              disabled={createProduct.isPending}
            >
              {createProduct.isPending ? (
                "Adding Product..."
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
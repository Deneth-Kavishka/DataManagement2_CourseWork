import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Store, 
  ArrowRight
} from "lucide-react";

const VendorSetup = () => {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    location: "",
    tags: "",
    logoUrl: "",
    bannerUrl: ""
  });
  
  // Redirect if not logged in or not marked as vendor
  useState(() => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please sign in to set up your vendor profile",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    if (user && !user.isVendor) {
      toast({
        title: "Not a Vendor",
        description: "You need to register as a vendor to access this page",
        variant: "destructive",
      });
      navigate("/register?vendor=true");
    }
  }, [isAuthenticated, user, navigate, toast]);
  
  const createVendor = useMutation({
    mutationFn: async (vendorData) => {
      return await apiRequest("POST", "/api/vendors", vendorData);
    },
    onSuccess: () => {
      toast({
        title: "Vendor Profile Created",
        description: "Your vendor profile has been set up successfully",
      });
      navigate("/vendor/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create vendor profile. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.businessName || !formData.location) {
      toast({
        title: "Error",
        description: "Business name and location are required",
        variant: "destructive",
      });
      return;
    }
    
    // Process tags from comma-separated string to array
    const tagsArray = formData.tags ? formData.tags.split(",").map(tag => tag.trim()) : [];
    
    createVendor.mutate({
      userId: user.id,
      businessName: formData.businessName,
      description: formData.description,
      location: formData.location,
      tags: tagsArray,
      logoUrl: formData.logoUrl,
      bannerUrl: formData.bannerUrl
    });
  };
  
  if (!isAuthenticated || !user || !user.isVendor) {
    return null;
  }
  
  return (
    <div className="py-12 max-w-3xl mx-auto px-4">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Store className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold heading mb-2">Set Up Your Vendor Profile</h1>
        <p className="text-neutral-600">Complete your vendor profile to start selling on UrbanFood</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="block text-neutral-700 text-sm font-medium mb-2">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                name="businessName"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                placeholder="Your business or farm name"
                value={formData.businessName}
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
                placeholder="Tell customers about your business, products, and farming practices"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>
            
            <div>
              <label className="block text-neutral-700 text-sm font-medium mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                name="location"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                placeholder="City, State (e.g. Brooklyn, NY)"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-neutral-700 text-sm font-medium mb-2">
                Tags (comma separated)
              </label>
              <input 
                type="text"
                name="tags"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                placeholder="e.g. Organic, Vegetables, Sustainable, Artisan"
                value={formData.tags}
                onChange={handleChange}
              />
              <p className="text-xs text-neutral-500 mt-1">
                Add keywords that describe your business and products
              </p>
            </div>
            
            <div>
              <label className="block text-neutral-700 text-sm font-medium mb-2">
                Logo URL
              </label>
              <input 
                type="text"
                name="logoUrl"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                placeholder="https://example.com/your-logo.jpg"
                value={formData.logoUrl}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-neutral-700 text-sm font-medium mb-2">
                Banner URL
              </label>
              <input 
                type="text"
                name="bannerUrl"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                placeholder="https://example.com/your-banner.jpg"
                value={formData.bannerUrl}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="mt-8">
            <button 
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition flex items-center justify-center"
              disabled={createVendor.isPending}
            >
              {createVendor.isPending ? (
                "Setting Up..."
              ) : (
                <>
                  Create Vendor Profile
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorSetup;
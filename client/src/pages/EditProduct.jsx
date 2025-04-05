import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Store, 
  Package, 
  ChevronLeft,
  AlertTriangle
} from "lucide-react";

const EditProduct = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    imageUrl: "",
    tags: ""
  });

  // Fetch vendor information
  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: user && user.isVendor ? [`/api/vendors/user/${user.id}`] : null,
    enabled: !!user && user.isVendor
  });

  // Fetch available categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
    enabled: !!isAuthenticated
  });

  // Fetch product details
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: [`/api/products/${id}`],
    enabled: !!id
  });

  // Mutation for updating the product
  const updateProduct = useMutation({
    mutationFn: async (productData) => {
      return await apiRequest("PATCH", `/api/products/${id}`, productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/products?vendorId=${vendor.id}`] });
      toast({
        title: "Product Updated",
        description: "Your product has been updated successfully",
      });
      navigate("/vendor/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Check if user is authenticated and is a vendor
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please sign in to edit products",
        variant: "destructive",
      });
      navigate("/login");
    } else if (user && !user.isVendor) {
      toast({
        title: "Not a Vendor",
        description: "You need to be registered as a vendor to edit products",
        variant: "destructive",
      });
      navigate("/register?vendor=true");
    }
  }, [isAuthenticated, user, navigate, toast]);

  // Load product data when product is fetched
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price ? String(product.price) : "",
        stock: product.stock ? String(product.stock) : "",
        categoryId: product.categoryId ? String(product.categoryId) : "",
        imageUrl: product.imageUrl || "",
        tags: product.tags ? product.tags.join(", ") : ""
      });
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Format the data for submission
    const formattedData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      categoryId: parseInt(formData.categoryId, 10),
      tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean)
    };

    updateProduct.mutate(formattedData);
  };

  if (!isAuthenticated || !user || !user.isVendor || vendorLoading || productLoading) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-neutral-600">Loading product details...</p>
      </div>
    );
  }

  if (!vendor && !vendorLoading) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 text-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Complete Your Vendor Registration</h1>
          <p className="text-neutral-600 mb-6">
            You need to complete your vendor profile before you can edit products.
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

  if (!product && !productLoading) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 text-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
          <p className="text-neutral-600 mb-6">
            We couldn't find the product you're looking to edit.
          </p>
          <button 
            onClick={() => navigate("/vendor/dashboard")}
            className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-lg transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-7xl mx-auto px-4">
      <div className="mb-8">
        <button 
          onClick={() => navigate("/vendor/dashboard")}
          className="flex items-center text-neutral-600 hover:text-primary transition"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-neutral-200">
          <h1 className="text-2xl font-semibold">Edit Product</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-500 mb-1">Product Name</label>
              <input 
                type="text"
                name="name"
                required
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-500 mb-1">Category</label>
              <select 
                name="categoryId"
                required
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                value={formData.categoryId}
                onChange={handleInputChange}
              >
                <option value="">Select a category</option>
                {categories && categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-500 mb-1">Price (in USD)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">$</span>
                <input 
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  required
                  className="w-full pl-8 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                  value={formData.price}
                  onChange={handleInputChange}
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Equivalent to approximately LKR {(parseFloat(formData.price || 0) * 320).toFixed(2)}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-500 mb-1">Stock Quantity</label>
              <input 
                type="number"
                name="stock"
                min="0"
                required
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                value={formData.stock}
                onChange={handleInputChange}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-500 mb-1">Product Image URL</label>
              <input 
                type="url"
                name="imageUrl"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                value={formData.imageUrl}
                onChange={handleInputChange}
              />
              <p className="mt-1 text-xs text-neutral-500">Enter a valid URL for your product image</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-500 mb-1">Product Description</label>
              <textarea 
                name="description"
                rows="5"
                required
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                value={formData.description}
                onChange={handleInputChange}
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-500 mb-1">Tags (comma separated)</label>
              <input 
                type="text"
                name="tags"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="organic, fresh, vegetables, etc."
              />
              <p className="mt-1 text-xs text-neutral-500">Add relevant tags to help customers find your product</p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={() => navigate("/vendor/dashboard")}
              className="px-6 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProduct.isPending}
              className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition"
            >
              {updateProduct.isPending ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
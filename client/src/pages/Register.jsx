import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Eye, EyeOff } from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    isVendor: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();

  // Check URL parameters for vendor flag
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isVendor = params.get('vendor') === 'true';
    if (isVendor) {
      setFormData(prev => ({ ...prev, isVendor: true }));
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      toast({
        title: "Error",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Remove confirmPassword as it's not in the API schema
      const { confirmPassword, ...registrationData } = formData;
      
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to register");
      }
      
      const userData = await response.json();
      
      toast({
        title: "Success",
        description: "Your account has been created successfully",
      });
      
      // Auto login after successful registration
      login(userData);
      
      // Close modal and navigate to home page
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Registration failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="py-12 max-w-2xl mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold heading mb-2">
          {formData.isVendor ? "Register as a Vendor" : "Create an Account"}
        </h1>
        <p className="text-neutral-600">
          {formData.isVendor 
            ? "Join UrbanFood to sell your products to local customers" 
            : "Join UrbanFood to access fresh, local products"}
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-neutral-700 text-sm font-medium mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                name="firstName"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-neutral-700 text-sm font-medium mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                name="lastName"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-neutral-700 text-sm font-medium mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input 
              type="email"
              name="email"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-neutral-700 text-sm font-medium mb-2">
              Username <span className="text-red-500">*</span>
            </label>
            <input 
              type="text"
              name="username"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-neutral-700 text-sm font-medium mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button 
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute right-3 top-2.5 text-neutral-500"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-neutral-700 text-sm font-medium mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input 
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-neutral-700 text-sm font-medium mb-2">
              Phone Number
            </label>
            <input 
              type="tel"
              name="phoneNumber"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-neutral-700 text-sm font-medium mb-2">
              Address
            </label>
            <input 
              type="text"
              name="address"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-neutral-700 text-sm font-medium mb-2">
                City
              </label>
              <input 
                type="text"
                name="city"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-neutral-700 text-sm font-medium mb-2">
                State
              </label>
              <input 
                type="text"
                name="state"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                value={formData.state}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-neutral-700 text-sm font-medium mb-2">
                ZIP Code
              </label>
              <input 
                type="text"
                name="zipCode"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                value={formData.zipCode}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="flex items-center">
              <input 
                type="checkbox"
                name="isVendor"
                checked={formData.isVendor}
                onChange={handleChange}
                className="rounded text-primary focus:ring-primary mr-2"
              />
              <span className="text-neutral-700">Register as a vendor</span>
            </label>
            <p className="text-xs text-neutral-500 mt-1 ml-6">
              Check this box if you want to sell products on UrbanFood
            </p>
          </div>
          
          <div className="mb-6">
            <label className="flex items-start">
              <input 
                type="checkbox"
                className="rounded text-primary focus:ring-primary mr-2 mt-1"
                required
              />
              <span className="text-sm text-neutral-700">
                I agree to the <a href="#" className="text-primary hover:text-primary-dark">Terms of Service</a> and <a href="#" className="text-primary hover:text-primary-dark">Privacy Policy</a>
              </span>
            </label>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 rounded-lg transition mb-4"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
        
        <p className="text-center text-sm text-neutral-600 mt-4">
          Already have an account? <Link href="/login" className="text-primary hover:text-primary-dark font-medium">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

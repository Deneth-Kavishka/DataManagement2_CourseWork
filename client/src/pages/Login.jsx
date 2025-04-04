import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/auth/login", { username, password });
      const userData = await response.json();
      
      login(userData);
      toast({
        title: "Success",
        description: "You have successfully logged in",
      });
      
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid username or password",
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
    <div className="py-12 max-w-md mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold heading mb-2">Sign In</h1>
        <p className="text-neutral-600">Welcome back! Sign in to your account</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-neutral-700 text-sm font-medium mb-2">Username</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
              placeholder="Your username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-neutral-700 text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                placeholder="Your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center">
              <input type="checkbox" className="rounded text-primary focus:ring-primary mr-2" />
              <span className="text-sm text-neutral-600">Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-sm text-primary hover:text-primary-dark">Forgot Password?</Link>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 rounded-lg transition mb-4"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
          
          <div className="relative flex items-center my-4">
            <div className="flex-grow border-t border-neutral-300"></div>
            <span className="flex-shrink mx-4 text-neutral-500 text-sm">or continue with</span>
            <div className="flex-grow border-t border-neutral-300"></div>
          </div>
          
          <div className="flex space-x-4 mb-6">
            <button type="button" className="flex-1 border border-neutral-300 py-2 rounded-lg flex items-center justify-center hover:bg-neutral-50 transition">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#4285F4">
                <path d="M12 24C5.4 24 0 18.6 0 12S5.4 0 12 0s12 5.4 12 12-5.4 12-12 12zm8.1-14.3H12v3.9h4.5c-.2 1.9-1.8 3.3-4.5 3.3-2.8 0-5-2.1-5-5s2.2-5 5-5c1.7 0 2.9.7 3.6 1.5l2.9-2.9C17.1 2.7 14.7 1.6 12 1.6c-5.8 0-10.4 4.7-10.4 10.4S6.2 22.4 12 22.4c6 0 10-4.2 10-10.2 0-.8-.1-1.7-.3-2.5z"/>
              </svg>
            </button>
            <button type="button" className="flex-1 border border-neutral-300 py-2 rounded-lg flex items-center justify-center hover:bg-neutral-50 transition">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-5.8-4.701-10.5-10.5-10.5s-10.5 4.7-10.5 10.5c0 5.237 3.823 9.588 8.837 10.355v-7.324H8.316v-3.032h3.521V9.74c0-3.476 2.071-5.396 5.237-5.396 1.518 0 3.104.2714 3.104.2714v3.412h-1.748c-1.723 0-2.271 1.067-2.271 2.161v2.596h3.82l-.612 3.032h-3.208v7.324C20.176 21.661 24 17.31 24 12.073z"/>
              </svg>
            </button>
            <button type="button" className="flex-1 border border-neutral-300 py-2 rounded-lg flex items-center justify-center hover:bg-neutral-50 transition">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
          </div>
        </form>
        
        <p className="text-center text-sm text-neutral-600">
          Don't have an account? <Link href="/register" className="text-primary hover:text-primary-dark font-medium">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

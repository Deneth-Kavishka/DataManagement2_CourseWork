import { createContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is already logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const savedUser = localStorage.getItem('urbanfood_user');
        
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login user
  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    
    // Save to localStorage
    try {
      localStorage.setItem('urbanfood_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving auth state:', error);
      toast({
        title: "Error",
        description: "Could not save login state.",
        variant: "destructive",
      });
    }
  };

  // Register user
  const register = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    
    // Save to localStorage
    try {
      localStorage.setItem('urbanfood_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving auth state:', error);
      toast({
        title: "Error",
        description: "Could not save registration state.",
        variant: "destructive",
      });
    }
  };

  // Logout user
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    
    // Remove from localStorage
    try {
      localStorage.removeItem('urbanfood_user');
    } catch (error) {
      console.error('Error removing auth state:', error);
    }
  };

  // Update user profile
  const updateProfile = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    
    // Save updated user to localStorage
    try {
      localStorage.setItem('urbanfood_user', JSON.stringify(updatedUser));
      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving updated profile:', error);
      toast({
        title: "Error",
        description: "Could not save profile updates.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading, 
      login, 
      register, 
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  isFarmer: boolean;
  [key: string]: any; // For other user properties
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
  fullName: string;
  isFarmer?: boolean;
  farmName?: string;
  farmDescription?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Check for existing user on load
  const { data, isLoading } = useQuery({
    queryKey: ['/api/users/me'],
    enabled: false, // Disable auto-fetching since we don't have a real endpoint
  });
  
  // Set user state if we have data from the query
  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data]);
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => 
      apiRequest('POST', '/api/users/login', credentials),
    onSuccess: async (res) => {
      const userData = await res.json();
      setUser(userData);
      queryClient.invalidateQueries({queryKey: ['/api/users/me']});
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${userData.fullName}!`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive',
      });
    }
  });
  
  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => 
      apiRequest('POST', '/api/users/register', data),
    onSuccess: async (res) => {
      const userData = await res.json();
      setUser(userData);
      queryClient.invalidateQueries({queryKey: ['/api/users/me']});
      toast({
        title: 'Registration Successful',
        description: `Welcome to UrbanFood, ${userData.fullName}!`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'Could not create account',
        variant: 'destructive',
      });
    }
  });
  
  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };
  
  const register = async (data: RegisterData) => {
    await registerMutation.mutateAsync(data);
  };
  
  const logout = () => {
    setUser(null);
    // In a real app, we would call an API to logout
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out',
    });
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading: isLoading || loginMutation.isPending || registerMutation.isPending, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

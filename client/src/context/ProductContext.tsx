import { createContext, useContext, useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: string | number;
  imageUrl: string;
  categoryId: number;
  farmerId: number;
  unit: string;
  organic: boolean;
  stock: number;
  featured: boolean;
}

interface ProductContextType {
  categories: Category[];
  featuredProducts: Product[];
  isLoading: boolean;
  error: Error | null;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch categories
  const { 
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError
  } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  // Fetch featured products
  const { 
    data: featuredProducts = [], 
    isLoading: productsLoading,
    error: productsError
  } = useQuery({
    queryKey: ['/api/products?featured=true'],
  });
  
  // Set error if any of the queries fail
  if (categoriesError && !error) {
    setError(categoriesError instanceof Error ? categoriesError : new Error('Failed to fetch categories'));
  }
  
  if (productsError && !error) {
    setError(productsError instanceof Error ? productsError : new Error('Failed to fetch products'));
  }
  
  return (
    <ProductContext.Provider value={{ 
      categories, 
      featuredProducts, 
      isLoading: categoriesLoading || productsLoading,
      error
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

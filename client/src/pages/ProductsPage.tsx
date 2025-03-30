import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import ProductList from '@/components/products/ProductList';
import { Skeleton } from '@/components/ui/skeleton';

const ProductsPage: React.FC = () => {
  const [location] = useLocation();
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [searchQuery, setSearchQuery] = useState<string | undefined>();
  
  // Parse query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const categoryParam = params.get('categoryId');
    const searchParam = params.get('search');
    
    if (categoryParam) {
      setCategoryId(parseInt(categoryParam));
    } else {
      setCategoryId(undefined);
    }
    
    if (searchParam) {
      setSearchQuery(searchParam);
    } else {
      setSearchQuery(undefined);
    }
  }, [location]);
  
  // Fetch categories for sidebar
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  const categoryName = categoryId && categories
    ? categories.find((cat: any) => cat.id === categoryId)?.name
    : 'All Products';
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Categories Sidebar */}
            <div className="w-full md:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="font-poppins font-bold text-lg mb-4">Categories</h2>
                
                {categoriesLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Skeleton key={index} className="h-8 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <button 
                      className={`block w-full text-left px-3 py-2 rounded-md ${!categoryId ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                      onClick={() => setCategoryId(undefined)}
                    >
                      All Products
                    </button>
                    
                    {categories?.map((category: any) => (
                      <button
                        key={category.id}
                        className={`block w-full text-left px-3 py-2 rounded-md ${categoryId === category.id ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                        onClick={() => setCategoryId(category.id)}
                      >
                        <i className={`fas ${category.icon || 'fa-circle'} mr-2`}></i>
                        {category.name}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Price Range Filter (could be implemented in a real app) */}
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Price Range</h3>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <input type="checkbox" id="price-1" className="mr-2" />
                      <label htmlFor="price-1">Under $5</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="price-2" className="mr-2" />
                      <label htmlFor="price-2">$5 to $10</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="price-3" className="mr-2" />
                      <label htmlFor="price-3">$10 to $20</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="price-4" className="mr-2" />
                      <label htmlFor="price-4">Over $20</label>
                    </div>
                  </div>
                </div>
                
                {/* More Filters */}
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Preferences</h3>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <input type="checkbox" id="organic" className="mr-2" />
                      <label htmlFor="organic">Organic Only</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="local" className="mr-2" />
                      <label htmlFor="local">Local (within 5 miles)</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="same-day" className="mr-2" />
                      <label htmlFor="same-day">Same Day Delivery</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Product List */}
            <div className="flex-grow">
              <h1 className="font-poppins font-bold text-2xl mb-6">
                {searchQuery 
                  ? `Search Results for "${searchQuery}"` 
                  : categoryName}
              </h1>
              
              <ProductList 
                categoryId={categoryId} 
                searchQuery={searchQuery}
              />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductsPage;

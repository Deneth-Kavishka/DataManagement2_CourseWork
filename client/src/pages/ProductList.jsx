import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import ProductCard from "../components/ProductCard";
import FiltersPanel from "../components/FiltersPanel";
import Pagination from "../components/Pagination";
import { useToast } from "@/hooks/use-toast";

const ProductList = () => {
  const params = useParams();
  const [location] = useLocation();
  const { toast } = useToast();
  
  // Parse search query from URL
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const searchQuery = searchParams.get('search');
  const [filters, setFilters] = useState({
    categoryIds: params.categoryId ? [parseInt(params.categoryId)] : [],
    priceRange: [500, 5000], // min, max in LKR
    locations: [],
    organicOnly: false,
    localOnly: false,
    freshPickedOnly: false,
    rating: 0,
    sortBy: "featured"
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Fetch category data if we're filtering by category
  const { data: categoryData } = useQuery({
    queryKey: params.categoryId ? [`/api/categories/${params.categoryId}`] : null,
    enabled: !!params.categoryId
  });

  // Fetch products with our filter settings
  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/products', filters.categoryIds[0] || 'all', searchQuery],
    queryFn: async () => {
      try {
        // Build endpoint with appropriate query parameters
        let endpoint = '/api/products';
        const queryParams = new URLSearchParams();
        
        if (filters.categoryIds.length > 0) {
          queryParams.append('categoryId', filters.categoryIds[0]);
        }
        
        if (searchQuery) {
          queryParams.append('search', searchQuery);
        }
        
        if (queryParams.toString()) {
          endpoint += `?${queryParams.toString()}`;
        }
        
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const data = await response.json();
        return data;
      } catch (err) {
        throw new Error(err.message);
      }
    }
  });

  // Update filters when category param changes
  useEffect(() => {
    if (params.categoryId) {
      setFilters(prev => ({
        ...prev,
        categoryIds: [parseInt(params.categoryId)]
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        categoryIds: []
      }));
    }
  }, [params.categoryId]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Manually filter products based on our client-side filters
  const filterProducts = (productList) => {
    if (!productList) return [];
    
    return productList.filter(product => {
      // Price filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }
      
      // Location filter
      if (filters.locations.length > 0 && !filters.locations.includes(product.location)) {
        return false;
      }
      
      // Organic filter
      if (filters.organicOnly && !product.isOrganic) {
        return false;
      }
      
      // Local filter
      if (filters.localOnly && !product.isLocal) {
        return false;
      }
      
      // Fresh picked filter
      if (filters.freshPickedOnly && !product.isFreshPicked) {
        return false;
      }
      
      return true;
    });
  };

  // Sort products based on sort selection
  const sortProducts = (productList) => {
    if (!productList) return [];
    
    const sortedProducts = [...productList];
    
    switch (filters.sortBy) {
      case "price-low":
        return sortedProducts.sort((a, b) => a.price - b.price);
      case "price-high":
        return sortedProducts.sort((a, b) => b.price - a.price);
      case "newest":
        return sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default: // featured or any unknown value
        return sortedProducts;
    }
  };

  // Filter and sort products
  const filteredProducts = filterProducts(products);
  const sortedProducts = sortProducts(filteredProducts);
  
  // Paginate products
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const displayedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      categoryIds: params.categoryId ? [parseInt(params.categoryId)] : [],
      priceRange: [500, 5000],
      locations: [],
      organicOnly: false,
      localOnly: false,
      freshPickedOnly: false,
      rating: 0,
      sortBy: "featured"
    });
    
    toast({
      title: "Filters cleared",
      description: "All filters have been reset to default values."
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="py-10 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-full md:w-64 lg:w-72 bg-white rounded-lg shadow-sm p-4 animate-pulse">
              <div className="h-8 bg-neutral-200 mb-4 rounded"></div>
              <div className="h-40 bg-neutral-200 mb-4 rounded"></div>
              <div className="h-40 bg-neutral-200 mb-4 rounded"></div>
              <div className="h-40 bg-neutral-200 rounded"></div>
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <div className="h-8 w-40 bg-neutral-200 animate-pulse rounded"></div>
                <div className="h-8 w-32 bg-neutral-200 animate-pulse rounded"></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {Array(6).fill(0).map((_, index) => (
                  <div key={index} className="bg-neutral-200 animate-pulse rounded-lg h-80"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-10 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 text-center py-12">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Products</h2>
          <p className="mb-6 text-neutral-600">{error.message || "An unexpected error occurred. Please try again later."}</p>
          <button 
            onClick={() => refetch()}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Filters Sidebar */}
          <FiltersPanel 
            filters={filters} 
            onFilterChange={handleFilterChange} 
            onClearFilters={handleClearFilters}
            locations={Array.from(new Set(products?.map(p => p.location) || []))}
          />
          
          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold heading">
                {searchQuery 
                  ? `Search Results for "${searchQuery}"` 
                  : categoryData?.name || "All Products"}
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-neutral-500">Sort by:</span>
                <select 
                  className="border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>
            
            {displayedProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-neutral-500 mb-6">
                  We couldn't find any products matching your filters.
                </p>
                <button 
                  onClick={handleClearFilters}
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {displayedProducts.map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={{
                        ...product,
                        vendor: "Local Farm", // Temporary since API doesn't include vendor name
                        rating: 4.5, // Placeholder rating
                        reviews: 10 // Placeholder review count
                      }}
                    />
                  ))}
                </div>
                
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination 
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductList;

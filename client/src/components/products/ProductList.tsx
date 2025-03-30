import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ProductCard from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductListProps {
  categoryId?: number;
  farmerId?: number;
  searchQuery?: string;
  featured?: boolean;
}

const ProductList: React.FC<ProductListProps> = ({ 
  categoryId, 
  farmerId, 
  searchQuery,
  featured = false
}) => {
  const [sortBy, setSortBy] = useState('newest');

  const queryParams = new URLSearchParams();
  if (categoryId) queryParams.append('categoryId', categoryId.toString());
  if (farmerId) queryParams.append('farmerId', farmerId.toString());
  if (featured) queryParams.append('featured', 'true');
  
  const { data: products, isLoading } = useQuery({
    queryKey: [`/api/products?${queryParams.toString()}`],
  });
  
  // Filter by search query if provided
  const filteredProducts = searchQuery && products
    ? products.filter((product: any) => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;
  
  // Sort products
  const sortedProducts = filteredProducts ? [...filteredProducts] : [];
  
  if (sortBy === 'price-asc') {
    sortedProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  } else if (sortBy === 'price-desc') {
    sortedProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  } else if (sortBy === 'rating') {
    sortedProducts.sort((a, b) => b.rating - a.rating);
  }
  // 'newest' is default, no sorting needed as the API returns newest first
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            <Skeleton className="w-full h-48" />
            <div className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-8 w-1/3 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (!sortedProducts.length) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
        <h3 className="text-xl font-medium mb-2">No products found</h3>
        <p className="text-gray-500">
          {searchQuery 
            ? `No products matching "${searchQuery}" were found.` 
            : 'No products available in this category.'}
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-end mb-6">
        <select
          className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sortedProducts.map((product: any) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            description={product.description}
            price={product.price}
            imageUrl={product.imageUrl}
            farmName={product.farmName || "Local Farm"} // Assuming we have the farm name
            rating={product.rating || 4.7} // Mock rating if not provided
            reviews={product.reviews || 42} // Mock reviews if not provided
            unit={product.unit}
            organic={product.organic}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductList;

import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import ProductCard from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

const FeaturedProducts: React.FC = () => {
  const scrollContainer = useRef<HTMLDivElement>(null);
  
  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products?featured=true'],
  });
  
  const scrollLeft = () => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  if (isLoading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-8 w-48" />
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
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
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-poppins font-bold text-gray-800">Featured Products</h2>
          <div className="flex space-x-2">
            <button 
              className="p-2 rounded-full border border-gray-300 text-gray-600 hover:bg-primary hover:text-white transition-colors"
              onClick={scrollLeft}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button 
              className="p-2 rounded-full border border-gray-300 text-gray-600 hover:bg-primary hover:text-white transition-colors"
              onClick={scrollRight}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
        
        <div 
          ref={scrollContainer}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products?.map((product: any) => (
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
        
        <div className="mt-8 text-center">
          <Link href="/products">
            <a className="inline-block px-6 py-3 bg-white border border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-colors">
              View All Products
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;

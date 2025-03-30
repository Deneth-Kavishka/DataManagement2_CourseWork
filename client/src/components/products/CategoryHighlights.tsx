import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';

const CategoryHighlights: React.FC = () => {
  const [, navigate] = useLocation();
  
  const { data: categories, isLoading } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  const handleCategoryClick = (categoryId: number) => {
    navigate(`/products?categoryId=${categoryId}`);
  };
  
  if (isLoading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-64 mx-auto mb-8" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="group">
                <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center">
                  <Skeleton className="w-16 h-16 rounded-full mb-3" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-poppins font-bold text-gray-800 text-center mb-8">Shop by Category</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories?.map((category: any) => (
            <div key={category.id} className="group cursor-pointer" onClick={() => handleCategoryClick(category.id)}>
              <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center transition-transform transform group-hover:scale-105">
                <div className={`w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mb-3`}>
                  <i className={`fas ${category.icon || 'fa-seedling'} text-white text-xl`}></i>
                </div>
                <h3 className="font-medium text-center">{category.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryHighlights;

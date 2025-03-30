import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { generateStarRating } from '@/lib/utils';

interface FarmerCard {
  id: number;
  fullName: string;
  farmName: string;
  farmDescription: string;
  rating: number;
  distance: string;
  deliveryDays: string;
  imageUrl: string;
}

const FeaturedFarmers: React.FC = () => {
  // In a real app, we would have a dedicated farmers API endpoint
  // For now, we'll use the users API and filter for farmers
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/users'],
  });
  
  const farmers = users?.filter((user: any) => user.isFarmer) || [];
  
  // Mock data to supplement what's missing from the API
  const farmerSupplementalData: Record<number, Partial<FarmerCard>> = {
    1: { 
      rating: 4.5, 
      distance: '2.4 miles away', 
      deliveryDays: 'Delivers Mon, Wed, Fri',
      imageUrl: 'https://images.unsplash.com/photo-1507103011901-e954d6ec0988'
    },
    2: { 
      rating: 5.0, 
      distance: '1.8 miles away', 
      deliveryDays: 'Delivers Tue, Thu, Sat',
      imageUrl: 'https://images.unsplash.com/photo-1553787499-6f9133242821'
    },
    3: { 
      rating: 4.0, 
      distance: '3.1 miles away', 
      deliveryDays: 'Delivers Daily',
      imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136'
    }
  };
  
  if (isLoading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-64 mb-8" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <Skeleton className="w-16 h-16 rounded-full mr-4" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-10 w-full rounded-full" />
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
        <h2 className="text-2xl font-poppins font-bold text-gray-800 mb-8">Meet Our Local Farmers</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {farmers.map((farmer: any) => (
            <div key={farmer.id} className="bg-gray-50 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <img 
                  src={farmerSupplementalData[farmer.id]?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(farmer.fullName)}&background=random`}
                  alt={farmer.fullName} 
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="font-poppins font-medium text-lg">{farmer.fullName}</h3>
                  <p className="text-sm text-gray-600">{farmer.farmName}</p>
                  <div className="flex items-center mt-1 text-secondary text-sm">
                    {generateStarRating(farmerSupplementalData[farmer.id]?.rating || 4.0).map(star => (
                      <i key={star.key} className={star.className}></i>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                "{farmer.farmDescription || "Growing fresh, local produce with sustainable farming practices."}"
              </p>
              <div className="flex items-center text-xs text-gray-500 mb-4">
                <div className="flex items-center mr-4">
                  <i className="fas fa-map-marker-alt mr-1 text-accent"></i>
                  <span>{farmerSupplementalData[farmer.id]?.distance || '2.5 miles away'}</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-truck mr-1 text-primary"></i>
                  <span>{farmerSupplementalData[farmer.id]?.deliveryDays || 'Delivers Weekly'}</span>
                </div>
              </div>
              <button className="w-full py-2 bg-white border border-primary text-primary font-medium rounded-full hover:bg-primary hover:text-white transition-colors">
                View Products
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <button className="px-6 py-3 bg-white border border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-colors">
            Meet All Farmers
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedFarmers;

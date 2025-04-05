import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import VendorCard from "./VendorCard";

const FeaturedVendors = () => {
  const { data: vendors, isLoading, error } = useQuery({
    queryKey: ['/api/vendors'],
  });

  if (isLoading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold heading mb-2">Meet Our Local Vendors</h2>
            <p className="text-neutral-500 max-w-2xl mx-auto">Discover the passionate urban farmers and artisans who bring fresh, sustainable products to your neighborhood.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-neutral-200 animate-pulse rounded-lg h-80"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold heading mb-2">Meet Our Local Vendors</h2>
            <p className="text-neutral-500 max-w-2xl mx-auto">Discover the passionate urban farmers and artisans who bring fresh, sustainable products to your neighborhood.</p>
          </div>
          
          <div className="text-center py-10 text-neutral-500">
            Failed to load vendors. Please try again later.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold heading mb-2">Meet Our Local Vendors</h2>
          <p className="text-neutral-500 max-w-2xl mx-auto">Discover the passionate urban farmers and artisans who bring fresh, sustainable products to your neighborhood.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {vendors.map(vendor => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Link href="/vendors" className="inline-block border-2 border-primary text-primary hover:bg-primary hover:text-white font-medium px-6 py-3 rounded-lg transition">
            View All Vendors
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedVendors;

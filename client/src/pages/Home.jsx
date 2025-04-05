import { Link } from "wouter";
import HeroSection from "../components/HeroSection";
import FeaturedCategories from "../components/FeaturedCategories";
import FeaturedVendors from "../components/FeaturedVendors";
import TestimonialsSection from "../components/TestimonialsSection";
import HowItWorks from "../components/HowItWorks";
import CTASection from "../components/CTASection";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "../components/ProductCard";

const Home = () => {
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: popularProducts, isLoading: popularLoading } = useQuery({
    queryKey: ['/api/reports/popular-products'],
  });

  return (
    <>
      <HeroSection />
      <FeaturedCategories />
      
      {/* Popular Products Section */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold heading">Popular Products</h2>
            <Link href="/products" className="text-primary hover:text-primary-dark font-medium">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularLoading
              ? Array(4).fill(0).map((_, i) => (
                  <div key={i} className="bg-neutral-200 animate-pulse rounded-lg h-80"></div>
                ))
              : (popularProducts || []).slice(0, 4).map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={{
                      ...product,
                      vendor: product.vendor || 'Unknown Vendor',
                      rating: 4.5,
                      reviews: 10 // Placeholder since we don't have review count in this API
                    }}
                  />
                ))
            }
          </div>
        </div>
      </section>
      
      <FeaturedVendors />
      <TestimonialsSection />
      <HowItWorks />
      <CTASection />
    </>
  );
};

export default Home;

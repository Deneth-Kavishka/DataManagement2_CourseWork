import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import HeroSection from '@/components/ui/HeroSection';
import CategoryHighlights from '@/components/products/CategoryHighlights';
import FeaturedProducts from '@/components/products/FeaturedProducts';
import FeaturedFarmers from '@/components/farmers/FeaturedFarmers';
import TestimonialsSection from '@/components/testimonials/TestimonialsSection';
import HowItWorks from '@/components/ui/HowItWorks';
import NewsletterSection from '@/components/ui/NewsletterSection';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <HeroSection />
        <CategoryHighlights />
        <FeaturedProducts />
        <FeaturedFarmers />
        <TestimonialsSection />
        <HowItWorks />
        <NewsletterSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;

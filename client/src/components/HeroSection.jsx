import { Link } from "wouter";
import { Clock, Shield, Scale } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative bg-primary text-white py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="lg:w-3/5">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Fresh Local Products Delivered to Your Door
          </h1>
          <p className="text-lg mb-8 text-white/90">
            Support urban farmers and enjoy fresh, sustainable food from your community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link href="/products">
              <button className="bg-white text-primary font-medium py-3 px-6 rounded-md hover:bg-neutral-100 transition shadow-md">
                Shop Now
              </button>
            </Link>
            <Link href="#">
              <button className="bg-transparent border-2 border-white text-white font-medium py-3 px-6 rounded-md hover:bg-white/10 transition">
                Become a Vendor
              </button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Fast Delivery
            </div>
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Quality Guaranteed
            </div>
            <div className="flex items-center">
              <Scale className="h-5 w-5 mr-2" />
              Fair Trade
            </div>
          </div>
        </div>
      </div>
      <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:block" aria-hidden="true">
        <img 
          src="https://images.unsplash.com/photo-1557844352-761f2096614b?q=80&w=640&auto=format&fit=crop" 
          alt="Fresh local vegetables" 
          className="absolute right-0 top-0 h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent"></div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-white/10 to-transparent"></div>
    </section>
  );
};

export default HeroSection;

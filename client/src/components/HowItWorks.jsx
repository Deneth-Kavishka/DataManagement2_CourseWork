import { Search, ShoppingBag, Sparkles } from "lucide-react";
import { Link } from "wouter";

const HowItWorks = () => {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold heading mb-2">How UrbanFood Works</h2>
          <p className="text-neutral-500 max-w-2xl mx-auto">Connect with local food producers in just a few simple steps.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="rounded-full bg-primary/10 h-20 w-20 flex items-center justify-center text-primary mx-auto mb-4">
              <Search className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold heading mb-2">Browse Local Products</h3>
            <p className="text-neutral-600">Discover fresh, seasonal products from urban farmers and artisans in your neighborhood.</p>
          </div>
          
          <div className="text-center">
            <div className="rounded-full bg-primary/10 h-20 w-20 flex items-center justify-center text-primary mx-auto mb-4">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold heading mb-2">Place Your Order</h3>
            <p className="text-neutral-600">Select your items, customize your order, and choose your preferred delivery or pickup option.</p>
          </div>
          
          <div className="text-center">
            <div className="rounded-full bg-primary/10 h-20 w-20 flex items-center justify-center text-primary mx-auto mb-4">
              <Sparkles className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold heading mb-2">Enjoy Fresh Food</h3>
            <p className="text-neutral-600">Receive your order and enjoy the taste of fresh, locally produced food while supporting your community.</p>
          </div>
        </div>
        
        <div className="mt-10 text-center">
           <Link href="/products">
           <button className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-lg transition shadow-sm">
            Get Started Today
          </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

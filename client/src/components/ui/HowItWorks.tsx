const HowItWorks: React.FC = () => {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-poppins font-bold text-gray-800 text-center mb-2">How UrbanFood Works</h2>
        <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
          Connecting urban farmers with local consumers in a few simple steps
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="rounded-full bg-primary-light w-16 h-16 flex items-center justify-center mx-auto mb-4 text-white text-2xl">
              <i className="fas fa-map-marker-alt"></i>
            </div>
            <h3 className="font-poppins font-medium text-lg mb-2">Find Local Producers</h3>
            <p className="text-gray-600">
              Discover urban farmers, artisanal bakers, and local food producers within your area.
            </p>
          </div>
          
          <div className="text-center">
            <div className="rounded-full bg-secondary w-16 h-16 flex items-center justify-center mx-auto mb-4 text-white text-2xl">
              <i className="fas fa-shopping-basket"></i>
            </div>
            <h3 className="font-poppins font-medium text-lg mb-2">Shop Fresh Products</h3>
            <p className="text-gray-600">
              Browse and select from a wide range of fresh, seasonal, and locally produced food items.
            </p>
          </div>
          
          <div className="text-center">
            <div className="rounded-full bg-accent w-16 h-16 flex items-center justify-center mx-auto mb-4 text-white text-2xl">
              <i className="fas fa-truck"></i>
            </div>
            <h3 className="font-poppins font-medium text-lg mb-2">Fast Local Delivery</h3>
            <p className="text-gray-600">
              Enjoy same-day or next-day delivery of your items, often from farms less than 10 miles away.
            </p>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <button className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-full transition-colors shadow-lg">
            Get Started Today
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

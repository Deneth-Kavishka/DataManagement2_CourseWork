import { Link } from 'wouter';

const HeroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-primary-light to-primary-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="font-poppins font-bold text-3xl md:text-4xl lg:text-5xl leading-tight">
              Fresh From Local <br /><span className="text-secondary-light">Urban Farmers</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl">
              Support local growers and enjoy the freshest produce delivered to your doorstep
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/products">
                <a className="px-6 py-3 bg-secondary hover:bg-secondary-dark text-white font-bold rounded-full transition-colors shadow-lg text-center">
                  Shop Now
                </a>
              </Link>
              <button className="px-6 py-3 bg-white hover:bg-gray-100 text-primary font-bold rounded-full transition-colors shadow-lg">
                Meet Our Farmers
              </button>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
              alt="Fresh vegetables from local urban farms" 
              className="rounded-lg shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg hidden md:block">
              <div className="flex items-center">
                <div className="bg-success rounded-full p-2 text-white">
                  <i className="fas fa-truck"></i>
                </div>
                <div className="ml-3">
                  <p className="text-gray-800 font-bold text-sm">Free Delivery</p>
                  <p className="text-gray-600 text-xs">On orders over $35</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

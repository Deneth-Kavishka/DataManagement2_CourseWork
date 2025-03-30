import { Link } from 'wouter';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <i className="fas fa-leaf text-primary-light text-2xl mr-2"></i>
              <span className="font-poppins font-bold text-2xl text-white">UrbanFood</span>
            </div>
            <p className="text-sm mb-4">
              Connecting urban farmers with local consumers for fresher, more sustainable food systems in our communities.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <i className="fab fa-pinterest"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-poppins font-medium text-white text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/"><a className="text-gray-300 hover:text-white transition-colors">Home</a></Link></li>
              <li><Link href="/products"><a className="text-gray-300 hover:text-white transition-colors">Shop</a></Link></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Categories</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Farmers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">About Us</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-poppins font-medium text-white text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Returns & Refunds</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-poppins font-medium text-white text-lg mb-4">Contact Us</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-2 text-primary-light"></i>
                <span>123 Market Street, San Francisco, CA 94103</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-phone-alt mr-2 text-primary-light"></i>
                <span>(415) 555-0123</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-envelope mr-2 text-primary-light"></i>
                <span>hello@urbanfood.com</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-clock mr-2 text-primary-light"></i>
                <span>Mon-Fri: 9am-6pm</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">© {new Date().getFullYear()} UrbanFood. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <div className="flex space-x-2">
              <div className="h-8 w-12 bg-gray-700 rounded"></div>
              <div className="h-8 w-12 bg-gray-700 rounded"></div>
              <div className="h-8 w-12 bg-gray-700 rounded"></div>
              <div className="h-8 w-12 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

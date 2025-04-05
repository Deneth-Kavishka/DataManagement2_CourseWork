import { Link } from "wouter";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  MapPin,
  Mail,
  Phone 
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          <div className="lg:col-span-2">
            <div className="text-2xl font-bold heading mb-4">
              <span className="text-primary">Urban</span><span className="text-secondary">Food</span>
            </div>
            <p className="text-neutral-400 mb-6 max-w-xs">Connecting urban farmers and local producers with consumers seeking fresh, sustainable food.</p>
            <div className="flex space-x-4">
              <a href="#" className="bg-neutral-800 hover:bg-primary text-white h-10 w-10 rounded-full flex items-center justify-center transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="bg-neutral-800 hover:bg-primary text-white h-10 w-10 rounded-full flex items-center justify-center transition">
                <Twitter size={20} />
              </a>
              <a href="#" className="bg-neutral-800 hover:bg-primary text-white h-10 w-10 rounded-full flex items-center justify-center transition">
                <Instagram size={20} />
              </a>
              <a href="#" className="bg-neutral-800 hover:bg-primary text-white h-10 w-10 rounded-full flex items-center justify-center transition">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-neutral-400 hover:text-primary transition">Home</Link></li>
              <li><Link href="/products" className="text-neutral-400 hover:text-primary transition">Shop</Link></li>
              <li><Link href="/products" className="text-neutral-400 hover:text-primary transition">Categories</Link></li>
              <li><Link href="#" className="text-neutral-400 hover:text-primary transition">Vendors</Link></li>
              <li><Link href="#" className="text-neutral-400 hover:text-primary transition">Seasonal Items</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><Link href="/profile" className="text-neutral-400 hover:text-primary transition">My Account</Link></li>
              <li><Link href="#" className="text-neutral-400 hover:text-primary transition">Track Order</Link></li>
              <li><Link href="#" className="text-neutral-400 hover:text-primary transition">FAQ</Link></li>
              <li><Link href="#" className="text-neutral-400 hover:text-primary transition">Shipping Policy</Link></li>
              <li><Link href="#" className="text-neutral-400 hover:text-primary transition">Returns & Refunds</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-neutral-400" />
                <span className="text-neutral-400">123 Urban Ave, Kurunegala, Sri Lanka</span>
              </li>
              <li className="flex items-start">
                <Mail className="h-5 w-5 mr-2 text-neutral-400" />
                <span className="text-neutral-400">info@urbanfood.com</span>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 mr-2 text-neutral-400" />
                <span className="text-neutral-400">(+94) 76 914 6080</span>
              </li>
            </ul>
            
            <h3 className="text-lg font-semibold mt-6 mb-3">Newsletter</h3>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-neutral-800 border-none text-white px-4 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm w-full" 
              />
              <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-r-lg transition text-sm">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-neutral-800 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-500 text-sm mb-4 md:mb-0">© 2025 UrbanFood. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="text-neutral-500 hover:text-primary text-sm transition">Privacy Policy</a>
            <a href="#" className="text-neutral-500 hover:text-primary text-sm transition">Terms of Service</a>
            <a href="#" className="text-neutral-500 hover:text-primary text-sm transition">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

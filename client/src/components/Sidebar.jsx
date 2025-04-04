import { Link, useLocation } from "wouter";
import { 
  List, 
  Carrot, 
  Apple, 
  Milk, 
  Croissant, 
  Palette, 
  Sparkles, 
  Tag, 
  Home, 
  ShoppingCart, 
  User,
  Heart,
  Clock
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const Sidebar = () => {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  const categories = [
    { id: 0, name: "All Products", icon: <List className="w-5 h-5" />, href: "/products" },
    { id: 1, name: "Vegetables", icon: <Carrot className="w-5 h-5" />, href: "/products/category/1" },
    { id: 2, name: "Fruits", icon: <Apple className="w-5 h-5" />, href: "/products/category/2" },
    { id: 3, name: "Dairy", icon: <Milk className="w-5 h-5" />, href: "/products/category/3" },
    { id: 4, name: "Baked Goods", icon: <Croissant className="w-5 h-5" />, href: "/products/category/4" },
    { id: 5, name: "Crafts", icon: <Palette className="w-5 h-5" />, href: "/products/category/5" },
    { id: 6, name: "Seasonal", icon: <Sparkles className="w-5 h-5" />, href: "/products/category/6" },
    { id: 7, name: "Sale", icon: <Tag className="w-5 h-5" />, href: "/sale" },
  ];

  const accountLinks = [
    { name: "My Account", icon: <User className="w-5 h-5" />, href: "/profile" },
    { name: "My Orders", icon: <ShoppingCart className="w-5 h-5" />, href: "/orders" },
    { name: "Favorites", icon: <Heart className="w-5 h-5" />, href: "/favorites" },
    { name: "Recently Viewed", icon: <Clock className="w-5 h-5" />, href: "/recently-viewed" },
  ];

  return (
    <aside className="w-64 hidden lg:block border-r border-gray-200 min-h-screen bg-white">
      <div className="p-4">
        <div className="mb-6">
          <Link href="/" className="flex items-center space-x-2 mb-4">
            <Home className="w-5 h-5 text-primary" />
            <span className="font-medium">Home</span>
          </Link>

          <h3 className="text-gray-500 uppercase text-xs font-semibold tracking-wider mb-3">
            Categories
          </h3>
          <nav>
            <ul className="space-y-1">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link 
                    href={category.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                      location === category.href 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category.icon}
                    <span>{category.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {isAuthenticated && (
          <div>
            <h3 className="text-gray-500 uppercase text-xs font-semibold tracking-wider mb-3">
              My Account
            </h3>
            <nav>
              <ul className="space-y-1">
                {accountLinks.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                        location === link.href 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {link.icon}
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
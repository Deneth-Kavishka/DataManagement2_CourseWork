import { Link } from 'wouter';

interface NavbarProps {
  currentPath: string;
}

const Navbar: React.FC<NavbarProps> = ({ currentPath }) => {
  const isActive = (path: string) => currentPath === path;
  
  return (
    <nav>
      <div className="flex items-center space-x-8">
        <Link href="/">
          <a className={`${isActive('/') ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-primary'} font-medium`}>
            Home
          </a>
        </Link>
        <Link href="/products">
          <a className={`${isActive('/products') ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-primary'} font-medium`}>
            All Products
          </a>
        </Link>
        <a href="#" className="text-gray-600 hover:text-primary font-medium">Categories</a>
        <a href="#" className="text-gray-600 hover:text-primary font-medium">Farmers</a>
        <a href="#" className="text-gray-600 hover:text-primary font-medium">About Us</a>
      </div>
    </nav>
  );
};

export default Navbar;

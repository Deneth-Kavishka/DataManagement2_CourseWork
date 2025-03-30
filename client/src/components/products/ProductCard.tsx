import { useState } from 'react';
import { Link } from 'wouter';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  id: number;
  name: string;
  description: string;
  price: string | number;
  imageUrl: string;
  farmName: string;
  rating: number;
  reviews: number;
  unit: string;
  organic: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  description,
  price,
  imageUrl,
  farmName,
  rating,
  reviews,
  unit,
  organic
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const handleAddToCart = () => {
    addToCart({
      id,
      name,
      price,
      imageUrl,
      farmName,
      quantity: 1
    });
    
    toast({
      title: 'Added to Cart',
      description: `${name} has been added to your cart`,
    });
  };
  
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    
    toast({
      title: isFavorite ? 'Removed from Favorites' : 'Added to Favorites',
      description: `${name} has been ${isFavorite ? 'removed from' : 'added to'} your favorites`,
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/products/${id}`}>
        <a className="block">
          <div className="relative">
            <img 
              src={imageUrl}
              alt={name} 
              className="w-full h-48 object-cover"
            />
            {organic && (
              <div className="absolute top-2 left-2">
                <span className="bg-primary-light text-white text-xs px-2 py-1 rounded-full">Organic</span>
              </div>
            )}
            <button 
              className={`absolute top-2 right-2 bg-white rounded-full p-2 ${isFavorite ? 'text-red-500' : 'text-gray-600 hover:text-primary'} transition-colors shadow-md`}
              onClick={toggleFavorite}
            >
              <i className={isFavorite ? 'fas fa-heart' : 'far fa-heart'}></i>
            </button>
          </div>
          
          <div className="p-4">
            <div className="flex items-center mb-2">
              <span className="text-xs text-gray-500">{farmName}</span>
              <span className="ml-auto flex items-center text-xs text-gray-500">
                <i className="fas fa-star text-secondary"></i>
                <span className="ml-1">{rating} ({reviews})</span>
              </span>
            </div>
            
            <h3 className="font-poppins font-medium text-lg mb-1">{name}</h3>
            <p className="text-sm text-gray-600 mb-3">{description}</p>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-lg">{formatPrice(price)}</span>
                <span className="text-sm text-gray-500">/{unit}</span>
              </div>
              <button 
                className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-full transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddToCart();
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </a>
      </Link>
    </div>
  );
};

export default ProductCard;

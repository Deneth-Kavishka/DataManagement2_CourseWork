import { useState } from "react";
import { Link } from "wouter";
import { useCart } from "../hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { Heart, ShoppingBag, MapPin, Check } from "lucide-react";
import { formatLKR } from "@shared/currencyUtils.js";

const ProductCard = ({ product }) => {
  const { id, name, price, imageUrl, vendor, location, isOrganic, isFreshPicked, isLocal, rating, reviews } = product;
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAdding(true);
    
    // Simulate API call delay
    setTimeout(() => {
      addToCart({ ...product, quantity: 1 });
      
      toast({
        title: "Added to cart",
        description: `${name} has been added to your cart.`,
      });
      
      setIsAdding(false);
    }, 500);
  };

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: `${name} has been ${isFavorite ? "removed from" : "added to"} your favorites.`,
    });
  };

  // Calculate the star rating display
  const fullStars = Math.floor(rating || 0);
  const hasHalfStar = (rating || 0) - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <Link href={`/products/${id}`}>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer">
        <div className="relative">
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 left-2">
            {isOrganic && (
              <span className="bg-accent text-white text-xs px-2 py-1 rounded-full">Organic</span>
            )}
            {isFreshPicked && (
              <span className="bg-success text-white text-xs px-2 py-1 rounded-full ml-1">Fresh Picked</span>
            )}
            {isLocal && (
              <span className="bg-secondary text-white text-xs px-2 py-1 rounded-full ml-1">Local</span>
            )}
          </div>
          <button 
            onClick={toggleFavorite}
            className={`absolute top-2 right-2 ${isFavorite ? 'text-red-500 bg-white' : 'text-neutral-500 hover:text-primary bg-white'} rounded-full p-1.5 shadow-sm`} 
            aria-label="Add to favorites"
          >
            <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg mb-1 heading">{name}</h3>
              <p className="text-sm text-neutral-500 mb-1">{vendor}</p>
              <div className="flex items-center mb-2">
                <div className="flex text-accent text-sm mr-1">
                  {[...Array(fullStars)].map((_, i) => (
                    <span key={`full-${i}`}>★</span>
                  ))}
                  {hasHalfStar && <span>★</span>}
                  {[...Array(emptyStars)].map((_, i) => (
                    <span key={`empty-${i}`} className="text-neutral-300">★</span>
                  ))}
                </div>
                <span className="text-xs text-neutral-500">({reviews || 0})</span>
              </div>
            </div>
            <div className="text-lg font-bold text-primary">{formatLKR(price)}</div>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-neutral-500">
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {location}
              </span>
            </div>
            <button 
              onClick={handleAddToCart}
              className={`${isAdding ? 'bg-success' : 'bg-primary hover:bg-primary-dark'} text-white text-sm px-3 py-1.5 rounded-lg flex items-center`}
            >
              {isAdding ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Added
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4 mr-1" />
                  Add
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

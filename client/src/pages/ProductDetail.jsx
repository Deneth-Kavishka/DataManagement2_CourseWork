import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "../hooks/useCart";
import { useDeliveryLocation } from "../context/DeliveryLocationContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Minus, 
  Plus, 
  Heart, 
  Truck, 
  ShoppingBag, 
  AlertCircle,
  CheckCircle,
  Star,
  MapPin,
  Clock
} from "lucide-react";
import { formatLKR } from "@shared/currencyUtils.js";
import { districtShippingRates } from "@shared/districts.js";

const ProductDetail = () => {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { selectedLocation } = useDeliveryLocation();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const { data: product, isLoading, error } = useQuery({
    queryKey: [`/api/products/${id}`],
  });

  if (isLoading) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2 bg-neutral-200 animate-pulse rounded-lg h-96"></div>
          <div className="md:w-1/2">
            <div className="h-10 bg-neutral-200 animate-pulse rounded mb-4 w-3/4"></div>
            <div className="h-6 bg-neutral-200 animate-pulse rounded mb-4 w-1/2"></div>
            <div className="h-8 bg-neutral-200 animate-pulse rounded mb-6 w-1/4"></div>
            <div className="h-24 bg-neutral-200 animate-pulse rounded mb-6"></div>
            <div className="h-10 bg-neutral-200 animate-pulse rounded mb-4 w-full"></div>
            <div className="h-10 bg-neutral-200 animate-pulse rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-neutral-600 mb-6">We couldn't find the product you're looking for.</p>
        <button 
          onClick={() => navigate('/products')}
          className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg"
        >
          Browse Products
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity,
      vendor: product.vendor?.businessName || "Unknown Vendor"
    });
    
    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} added to your cart`,
    });
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: `${product.name} has been ${isFavorite ? "removed from" : "added to"} your favorites.`,
    });
  };

  // Calculate average rating
  const avgRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : 0;

  return (
    <div className="py-12 max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Image */}
        <div className="md:w-1/2">
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
        
        {/* Product Details */}
        <div className="md:w-1/2">
          <div className="flex items-center gap-2 mb-2">
            {product.isOrganic && (
              <span className="bg-accent text-white text-xs px-2 py-1 rounded-full">Organic</span>
            )}
            {product.isFreshPicked && (
              <span className="bg-success text-white text-xs px-2 py-1 rounded-full">Fresh Picked</span>
            )}
            {product.isLocal && (
              <span className="bg-secondary text-white text-xs px-2 py-1 rounded-full">Local</span>
            )}
          </div>
          
          <h1 className="text-3xl font-bold heading mb-2">{product.name}</h1>
          
          {product.vendor && (
            <p className="text-neutral-600 mb-4">
              by <span className="text-primary font-medium">{product.vendor.businessName}</span>
            </p>
          )}
          
          <div className="flex items-center mb-4">
            <div className="flex text-accent mr-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-5 w-5"
                  fill={star <= Math.round(avgRating) ? "currentColor" : "none"}
                />
              ))}
            </div>
            <span className="text-neutral-600">
              {product.reviews?.length || 0} reviews
            </span>
          </div>
          
          <div className="text-2xl font-bold text-primary mb-4">
            {formatLKR(product.price)}
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-neutral-600">{product.description || "No description available."}</p>
          </div>
          
          <div className="flex items-center mb-6">
            <MapPin className="h-5 w-5 text-neutral-500 mr-2" />
            <span>From {product.location}</span>
          </div>
          
          <div className="flex items-center border border-neutral-200 rounded-md inline-block mb-6">
            <button 
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="px-4 py-2 text-neutral-600 hover:text-primary disabled:opacity-50"
            >
              <Minus className="h-4 w-4" />
            </button>
            
            <span className="px-4 py-2 border-x border-neutral-200">{quantity}</span>
            
            <button 
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= product.stock}
              className="px-4 py-2 text-neutral-600 hover:text-primary disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex items-center text-neutral-600 mb-6">
            <Clock className="h-5 w-5 mr-2" />
            <span>
              {product.stock > 10 
                ? "In stock, ready to ship" 
                : product.stock > 0 
                  ? `Only ${product.stock} left in stock - order soon` 
                  : "Out of stock"}
            </span>
          </div>
          
          <div className="flex gap-4 mb-6">
            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg flex-1 flex items-center justify-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Add to Cart
            </button>
            
            <button 
              onClick={toggleFavorite}
              className={`border ${isFavorite ? 'border-red-500 text-red-500' : 'border-neutral-300 text-neutral-600'} hover:border-red-500 hover:text-red-500 rounded-lg p-3`}
            >
              <Heart className="h-6 w-6" fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>
          
          <div className="border-t border-neutral-200 pt-6">
            <div className="flex items-center mb-2">
              <Truck className="h-5 w-5 text-primary mr-2" />
              <span className="font-medium">Free delivery on orders over {formatLKR(5000)}</span>
            </div>
            {selectedLocation && (
              <div className="flex items-center mb-2">
                <MapPin className="h-5 w-5 text-primary mr-2" />
                <span className="font-medium">Delivery to {selectedLocation}: {formatLKR(districtShippingRates[selectedLocation] || 250)}</span>
              </div>
            )}
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-primary mr-2" />
              <span className="font-medium">Quality guarantee: 100% satisfaction or your money back</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reviews Section */}
      <div className="mt-12 border-t border-neutral-200 pt-8">
        <h2 className="text-2xl font-bold heading mb-6">Customer Reviews</h2>
        
        {product.reviews && product.reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {product.reviews.map((review, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex text-accent mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-4 w-4"
                      fill={star <= review.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <p className="text-neutral-700 mb-4">{review.comment}</p>
                <div className="text-sm text-neutral-500">
                  Posted on {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-neutral-50 rounded-lg">
            <p className="text-neutral-600">No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>
      
      {/* Related Products Section */}
      <div className="mt-12 border-t border-neutral-200 pt-8">
        <h2 className="text-2xl font-bold heading mb-6">You May Also Like</h2>
        
        {/* This would fetch related products in a real application */}
        <div className="text-center py-8">
          <p className="text-neutral-600">Related products would be displayed here.</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

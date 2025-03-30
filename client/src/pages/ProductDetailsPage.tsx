import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice, generateStarRating } from '@/lib/utils';

// Component for the product review form
const ReviewForm: React.FC<{ productId: number, userName: string }> = ({ productId, userName }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  
  const reviewMutation = useMutation({
    mutationFn: (reviewData: any) => 
      apiRequest('POST', '/api/reviews', reviewData),
    onSuccess: () => {
      toast({
        title: 'Review Submitted',
        description: 'Thank you for your feedback!',
      });
      setComment('');
    },
    onError: (error) => {
      toast({
        title: 'Failed to Submit Review',
        description: error instanceof Error ? error.message : 'There was an error submitting your review.',
        variant: 'destructive',
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'You need to be logged in to submit a review.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!comment.trim()) {
      toast({
        title: 'Review Required',
        description: 'Please write a comment for your review.',
        variant: 'destructive',
      });
      return;
    }
    
    const reviewData = {
      userId: user.id,
      productId,
      rating,
      comment,
      date: new Date(),
      userName,
    };
    
    reviewMutation.mutate(reviewData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="mt-6 border-t pt-6">
      <h3 className="font-medium text-lg mb-4">Write a Review</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Rating</label>
        <div className="flex space-x-1 text-xl">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`${rating >= star ? 'text-secondary' : 'text-gray-300'}`}
            >
              <i className="fas fa-star"></i>
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="comment" className="block text-sm font-medium mb-2">Your Review</label>
        <textarea
          id="comment"
          rows={4}
          className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Share your experience with this product..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        ></textarea>
      </div>
      
      <button 
        type="submit"
        disabled={reviewMutation.isPending}
        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
      >
        {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

const ProductDetailsPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const productId = parseInt(params.id);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [quantity, setQuantity] = useState(1);
  
  // Fetch product details
  const { data: product, isLoading } = useQuery({
    queryKey: [`/api/products/${productId}`],
  });
  
  // Fetch product reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: [`/api/reviews/product/${productId}`],
  });
  
  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        farmName: product.farmName || 'Local Farm',
        quantity
      });
      
      toast({
        title: 'Added to Cart',
        description: `${product.name} (${quantity}) has been added to your cart`,
      });
    }
  };
  
  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decreaseQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Skeleton className="w-full h-96 rounded-lg" />
              
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="mt-6 pt-6 border-t">
                  <Skeleton className="h-12 w-full rounded-full mb-4" />
                  <Skeleton className="h-12 w-full rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <i className="fas fa-exclamation-circle text-5xl text-gray-300 mb-4"></i>
              <h2 className="text-xl font-medium mb-4">Product Not Found</h2>
              <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
              <Link href="/products">
                <a className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-full transition-colors">
                  Browse Products
                </a>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Calculate average rating
  const averageRating = reviews.length 
    ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length 
    : 0;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="mb-6 text-sm">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/">
                  <a className="text-gray-500 hover:text-primary">Home</a>
                </Link>
              </li>
              <li className="text-gray-500">/</li>
              <li>
                <Link href="/products">
                  <a className="text-gray-500 hover:text-primary">Products</a>
                </Link>
              </li>
              <li className="text-gray-500">/</li>
              <li className="text-primary font-medium truncate max-w-xs">{product.name}</li>
            </ol>
          </nav>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Product Image */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src={product.imageUrl}
                alt={product.name} 
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Product Details */}
            <div>
              <div className="mb-2">
                {product.organic && (
                  <span className="bg-primary-light text-white text-xs px-2 py-1 rounded-full">Organic</span>
                )}
              </div>
              
              <h1 className="font-poppins font-bold text-3xl mb-2">{product.name}</h1>
              
              <div className="flex items-center mb-4">
                <span className="flex text-secondary">
                  {generateStarRating(averageRating).map(star => (
                    <i key={star.key} className={star.className}></i>
                  ))}
                </span>
                <span className="ml-2 text-gray-600 text-sm">
                  {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
              
              <div className="flex items-end mb-4">
                <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
                <span className="ml-2 text-gray-600">/ {product.unit}</span>
              </div>
              
              <p className="text-gray-700 mb-6">
                {product.description}
              </p>
              
              <div className="mb-6">
                <div className="flex items-center">
                  <span className="text-gray-600 mr-3">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-full">
                    <button 
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-primary transition-colors"
                      onClick={decreaseQuantity}
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    <span className="w-10 text-center">{quantity}</span>
                    <button 
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-primary transition-colors"
                      onClick={increaseQuantity}
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-full transition-colors flex-grow"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </button>
                <button className="px-6 py-3 bg-white border border-primary text-primary font-bold rounded-full hover:bg-gray-50 transition-colors">
                  <i className="far fa-heart mr-2"></i> Save
                </button>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center mb-4">
                  <i className="fas fa-truck text-primary mr-3"></i>
                  <div>
                    <h3 className="font-medium">Fast Delivery</h3>
                    <p className="text-sm text-gray-600">2-3 day delivery</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <i className="fas fa-leaf text-primary mr-3"></i>
                  <div>
                    <h3 className="font-medium">Grown Locally</h3>
                    <p className="text-sm text-gray-600">By {product.farmName || 'local urban farmers'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs for Description and Reviews */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <Tabs defaultValue="description">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="description">
                <div className="space-y-4">
                  <h2 className="text-xl font-medium">Product Description</h2>
                  <p className="text-gray-700">
                    {product.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Product Details</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span>Vegetables</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Unit:</span>
                          <span>{product.unit}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Organic:</span>
                          <span>{product.organic ? 'Yes' : 'No'}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">In Stock:</span>
                          <span>{product.stock} available</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Farmer Information</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                          <span className="text-gray-600">Farm:</span>
                          <span>{product.farmName || 'Local Farm'}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span>San Francisco, CA</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span className="text-gray-600">Rating:</span>
                          <span className="flex items-center">
                            <i className="fas fa-star text-secondary text-sm"></i>
                            <i className="fas fa-star text-secondary text-sm"></i>
                            <i className="fas fa-star text-secondary text-sm"></i>
                            <i className="fas fa-star text-secondary text-sm"></i>
                            <i className="fas fa-star-half-alt text-secondary text-sm"></i>
                          </span>
                        </li>
                        <li>
                          <Link href={`/farmers/${product.farmerId}`}>
                            <a className="text-primary hover:underline">View Farmer Profile</a>
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="reviews">
                <div>
                  <h2 className="text-xl font-medium mb-4">Customer Reviews</h2>
                  
                  <div className="flex items-center mb-6">
                    <div className="flex text-secondary text-xl mr-3">
                      {generateStarRating(averageRating).map(star => (
                        <i key={star.key} className={star.className}></i>
                      ))}
                    </div>
                    <div>
                      <span className="font-medium text-lg">{averageRating.toFixed(1)} out of 5</span>
                      <p className="text-sm text-gray-600">{reviews.length} customer reviews</p>
                    </div>
                  </div>
                  
                  {reviewsLoading ? (
                    <div className="space-y-6">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="border-b pb-6">
                          <div className="flex items-start">
                            <Skeleton className="w-10 h-10 rounded-full mr-3" />
                            <div className="space-y-2 flex-grow">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                              <Skeleton className="h-4 w-full mt-2" />
                              <Skeleton className="h-4 w-full" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review: any) => (
                        <div key={review.id} className="border-b pb-6">
                          <div className="flex items-start">
                            <div className="bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                              <i className="fas fa-user text-gray-600"></i>
                            </div>
                            <div>
                              <h3 className="font-medium">{review.userName}</h3>
                              <div className="flex items-center">
                                <div className="flex text-secondary text-sm">
                                  {generateStarRating(review.rating).map(star => (
                                    <i key={star.key} className={star.className}></i>
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500 ml-2">
                                  {new Date(review.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="mt-2 text-gray-700">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-b">
                      <i className="far fa-comment-dots text-4xl text-gray-300 mb-3"></i>
                      <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                      <p className="text-gray-600">Be the first to review this product!</p>
                    </div>
                  )}
                  
                  {user ? (
                    <ReviewForm productId={productId} userName={user.fullName} />
                  ) : (
                    <div className="mt-6 border-t pt-6 text-center">
                      <p className="mb-4">You need to be logged in to leave a review.</p>
                      <Link href="/login">
                        <a className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                          Login to Write a Review
                        </a>
                      </Link>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetailsPage;

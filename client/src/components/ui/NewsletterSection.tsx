import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // In a real app, this would call an API to subscribe the user
    toast({
      title: 'Thank you for subscribing!',
      description: 'You will now receive our newsletter with seasonal recipes, farmer stories, and exclusive offers.',
    });
    
    setEmail('');
  };
  
  return (
    <section className="py-12 bg-gradient-to-r from-primary to-primary-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-poppins font-bold mb-2">Join Our Community</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Subscribe to our newsletter for seasonal recipes, farmer stories, and exclusive offers.
        </p>
        
        <form 
          className="max-w-md mx-auto flex flex-col sm:flex-row gap-2"
          onSubmit={handleSubmit}
        >
          <input 
            type="email" 
            placeholder="Your email address" 
            className="flex-grow px-4 py-3 rounded-l-full sm:rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button 
            type="submit"
            className="bg-secondary hover:bg-secondary-dark text-white font-bold px-6 py-3 rounded-full transition-colors sm:-ml-12"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterSection;

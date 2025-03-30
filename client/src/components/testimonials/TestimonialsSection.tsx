const testimonials = [
  {
    text: "UrbanFood has completely changed how I shop for produce. The quality is exceptional, and I love knowing exactly where my food comes from and supporting local farmers directly.",
    name: "Jennifer Walsh",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
  },
  {
    text: "The fresh bread from City Bakery Co-op is incredible! It's like having a European bakery at my doorstep. The delivery is always prompt and everything arrives in perfect condition.",
    name: "David Kim",
    rating: 4.5,
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
  },
  {
    text: "As a busy parent, UrbanFood helps me ensure my family eats fresh, locally-sourced food without the hassle of multiple grocery stops. The seasonal bundles are a great value!",
    name: "Marcus Johnson",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb"
  }
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-poppins font-bold text-gray-800 text-center mb-8">What Our Customers Say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <i className="fas fa-quote-left text-2xl text-primary-light opacity-30"></i>
              </div>
              <p className="text-gray-600 mb-4">
                "{testimonial.text}"
              </p>
              <div className="flex items-center">
                <img 
                  src={testimonial.imageUrl}
                  alt={`${testimonial.name} Avatar`} 
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
                <div>
                  <h4 className="font-medium">{testimonial.name}</h4>
                  <div className="flex items-center text-secondary text-xs">
                    {Array.from({ length: Math.floor(testimonial.rating) }).map((_, i) => (
                      <i key={i} className="fas fa-star"></i>
                    ))}
                    {testimonial.rating % 1 >= 0.5 && (
                      <i className="fas fa-star-half-alt"></i>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

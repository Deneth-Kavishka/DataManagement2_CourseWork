const TestimonialsSection = () => {
  // In a application, this data want come from an API
  const testimonials = [
    {
      id: 1,
      text: "I've been shopping at UrbanFood for 6 months now and I'm impressed by the quality and freshness of everything I've purchased. The vegetables taste like they were picked that morning!",
      name: "Sarah Michel",
      location: "Colombo, Sri Lanka",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop"
    },
    {
      id: 2,
      text: "The platform makes it easy to support local farmers while getting better quality produce than the grocery store. I love the direct relationship with the people who grow my food.",
      name: "Michael T.",
      location: "Mathara, Sri Lanka",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop"
    },
    {
      id: 3,
      text: "As someone who values sustainability, UrbanFood has been a game-changer. I can now easily buy local, reduce packaging waste, and support small producers all in one place.",
      name: "Jennifer Winslet",
      location: "Kandy, Sri Lanka",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&auto=format&fit=crop"
    }
  ];

  return (
    <section className="py-12 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold heading mb-2">What Our Customers Say</h2>
          <p className="text-neutral-500 max-w-2xl mx-auto">Real experiences from our community of urban food enthusiasts.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(testimonial => (
            <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="flex text-accent mb-3">★★★★★</div>
              <p className="text-neutral-700 mb-4">"{testimonial.text}"</p>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-neutral-200 overflow-hidden mr-3">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium">{testimonial.name}</div>
                  <div className="text-xs text-neutral-500">{testimonial.location}</div>
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

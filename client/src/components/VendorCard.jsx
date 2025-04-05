import { Link } from "wouter";

const VendorCard = ({ vendor }) => {
  const { id, businessName, location, description, tags, logoUrl, rating } = vendor;

  return (
    <div className="bg-neutral-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
      <div className="h-40 bg-neutral-200 relative">
        <img 
          src={logoUrl} 
          alt={businessName} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <div>
            <h3 className="text-white font-bold text-lg">{businessName}</h3>
            <p className="text-white/80 text-sm">{location}</p>
          </div>
          <div className="flex items-center bg-white/90 px-2 py-1 rounded-full text-xs">
            <span className="text-accent">★★★★★</span>
            <span className="ml-1 font-medium">{rating ? rating.toFixed(1) : '0.0'}</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-neutral-600 mb-3">{description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags && tags.map((tag, index) => (
            <span key={index} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">{tag}</span>
          ))}
        </div>
        <Link href={`/vendors/${id}`}>
          <button className="w-full border border-primary text-primary hover:bg-primary hover:text-white font-medium py-2 rounded-lg transition">
            View Products
          </button>
        </Link>
      </div>
    </div>
  );
};

export default VendorCard;

import { Link } from "wouter";

const CategoryCard = ({ category }) => {
  const { id, name, imageUrl } = category;

  return (
    <Link href={`/products/category/${id}`} className="group">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition h-40 relative">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white font-medium">{name}</div>
      </div>
    </Link>
  );
};

export default CategoryCard;

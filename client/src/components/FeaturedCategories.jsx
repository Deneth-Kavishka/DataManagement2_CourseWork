import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import CategoryCard from "./CategoryCard";

const FeaturedCategories = () => {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['/api/categories'],
  });

  if (isLoading) {
    return (
      <section className="py-10 max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold heading mb-6">Featured Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-neutral-200 animate-pulse rounded-xl h-40"></div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-10 max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold heading mb-6">Featured Categories</h2>
        <div className="text-center py-10 text-neutral-500">
          Failed to load categories. Please try again later.
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 max-w-7xl mx-auto px-4">
      <h2 className="text-2xl font-bold heading mb-6">Featured Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.map(category => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedCategories;

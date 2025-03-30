import { useState } from 'react';
import { useLocation } from 'wouter';

const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [, navigate] = useLocation();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  return (
    <form onSubmit={handleSearch}>
      <div className="relative">
        <input 
          type="text" 
          placeholder="Search for fresh produce, baked goods, and more..." 
          className="w-full py-2 pl-10 pr-4 text-sm bg-gray-100 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i className="fas fa-search text-gray-400"></i>
        </div>
        <button 
          type="submit"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary"
        >
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;

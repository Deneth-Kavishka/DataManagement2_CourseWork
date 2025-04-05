import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { formatLKR } from "@shared/currencyUtils.js";

const FiltersPanel = ({ filters, onFilterChange, onClearFilters, locations = [] }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Update local filters when parent filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (type, value) => {
    let newFilters = { ...localFilters };
    
    switch (type) {
      case "category":
        // Toggle category selection
        const categoryId = parseInt(value);
        if (newFilters.categoryIds.includes(categoryId)) {
          newFilters.categoryIds = newFilters.categoryIds.filter(id => id !== categoryId);
        } else {
          newFilters.categoryIds = [...newFilters.categoryIds, categoryId];
        }
        break;
        
      case "priceMin":
        newFilters.priceRange = [parseFloat(value), newFilters.priceRange[1]];
        break;
        
      case "priceMax":
        newFilters.priceRange = [newFilters.priceRange[0], parseFloat(value)];
        break;
        
      case "location":
        // Toggle location selection
        if (newFilters.locations.includes(value)) {
          newFilters.locations = newFilters.locations.filter(loc => loc !== value);
        } else {
          newFilters.locations = [...newFilters.locations, value];
        }
        break;
        
      case "organic":
        newFilters.organicOnly = value;
        break;
        
      case "local":
        newFilters.localOnly = value;
        break;
        
      case "freshPicked":
        newFilters.freshPickedOnly = value;
        break;
        
      case "rating":
        newFilters.rating = parseInt(value);
        break;
        
      default:
        break;
    }
    
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleFilterPanel = () => {
    setIsVisible(!isVisible);
  };

  // Count active filters
  const countActiveFilters = () => {
    let count = 0;
    
    if (localFilters.categoryIds.length > 0) count++;
    if (localFilters.locations.length > 0) count++;
    if (localFilters.organicOnly) count++;
    if (localFilters.localOnly) count++;
    if (localFilters.freshPickedOnly) count++;
    if (localFilters.rating > 0) count++;
    if (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 5000) count++;
    
    return count;
  };

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="md:hidden w-full mb-6">
        <button
          onClick={toggleFilterPanel}
          className="bg-white border border-neutral-300 rounded-lg w-full py-2 px-4 flex justify-between items-center"
        >
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Filters
            {countActiveFilters() > 0 && (
              <span className="ml-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                {countActiveFilters()}
              </span>
            )}
          </span>
          {isVisible ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>
      
      {/* Filter Panel */}
      <aside className={`w-full md:w-64 lg:w-72 bg-white rounded-lg shadow-sm p-4 mb-6 md:mb-0 sticky top-24 ${isVisible ? 'block' : 'hidden md:block'}`}>
        <div className="border-b pb-4 mb-4 flex justify-between items-center">
          <h3 className="font-bold text-lg heading">Filters</h3>
          <button 
            onClick={onClearFilters}
            className="text-sm text-primary hover:text-primary-dark"
          >
            Clear all
          </button>
        </div>
        
        {/* Categories */}
        <div className="border-b pb-4 mb-4">
          <h4 className="font-medium mb-2">Categories</h4>
          <div className="space-y-2">
            {categories?.map(category => (
              <label key={category.id} className="flex items-center">
                <input 
                  type="checkbox" 
                  className="rounded text-primary focus:ring-primary" 
                  checked={localFilters.categoryIds.includes(category.id)}
                  onChange={() => handleFilterChange("category", category.id)}
                />
                <span className="ml-2">{category.name}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Price Range */}
        <div className="border-b pb-4 mb-4">
          <h4 className="font-medium mb-2">Price Range</h4>
          <div className="space-y-4">
            <div className="px-2">
              <div className="h-2 bg-neutral-200 rounded-full mb-4 relative">
                <div 
                  className="absolute h-full bg-primary rounded-full" 
                  style={{
                    width: `${((localFilters.priceRange[1] - localFilters.priceRange[0]) / 4500) * 100}%`,
                    left: `${((localFilters.priceRange[0] - 500) / 4500) * 100}%`
                  }}
                />
              </div>
              <div className="flex justify-between">
                <div className="text-sm">{formatLKR(localFilters.priceRange[0])}</div>
                <div className="text-sm">{formatLKR(localFilters.priceRange[1])}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-neutral-500 mb-1">Min Price</label>
                <input 
                  type="number" 
                  className="w-full p-2 border border-neutral-300 rounded-md" 
                  min="0" 
                  max={localFilters.priceRange[1]} 
                  value={localFilters.priceRange[0]}
                  onChange={(e) => handleFilterChange("priceMin", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-500 mb-1">Max Price</label>
                <input 
                  type="number" 
                  className="w-full p-2 border border-neutral-300 rounded-md" 
                  min={localFilters.priceRange[0]} 
                  max="5000" 
                  value={localFilters.priceRange[1]}
                  onChange={(e) => handleFilterChange("priceMax", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Vendor Location */}
        <div className="border-b pb-4 mb-4">
          <h4 className="font-medium mb-2">Vendor Location</h4>
          <div className="space-y-2">
            {locations.length > 0 ? (
              locations.map((location, index) => (
                <label key={index} className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="rounded text-primary focus:ring-primary" 
                    checked={localFilters.locations.includes(location)}
                    onChange={() => handleFilterChange("location", location)}
                  />
                  <span className="ml-2">{location}</span>
                </label>
              ))
            ) : (
              <p className="text-sm text-neutral-500">No locations available</p>
            )}
          </div>
        </div>
        
        {/* Product Features */}
        <div className="border-b pb-4 mb-4">
          <h4 className="font-medium mb-2">Product Features</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="rounded text-primary focus:ring-primary" 
                checked={localFilters.organicOnly}
                onChange={(e) => handleFilterChange("organic", e.target.checked)}
              />
              <span className="ml-2">Organic Only</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="rounded text-primary focus:ring-primary" 
                checked={localFilters.localOnly}
                onChange={(e) => handleFilterChange("local", e.target.checked)}
              />
              <span className="ml-2">Local Only</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="rounded text-primary focus:ring-primary" 
                checked={localFilters.freshPickedOnly}
                onChange={(e) => handleFilterChange("freshPicked", e.target.checked)}
              />
              <span className="ml-2">Fresh Picked Only</span>
            </label>
          </div>
        </div>
        
        {/* Customer Rating */}
        <div className="pb-4 mb-4">
          <h4 className="font-medium mb-2">Customer Rating</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input 
                type="radio" 
                name="rating" 
                className="text-primary focus:ring-primary" 
                checked={localFilters.rating === 5}
                onChange={() => handleFilterChange("rating", "5")}
              />
              <span className="ml-2 flex items-center">
                <span className="flex text-accent">★★★★★</span>
                <span className="ml-1">& Up</span>
              </span>
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                name="rating" 
                className="text-primary focus:ring-primary" 
                checked={localFilters.rating === 4}
                onChange={() => handleFilterChange("rating", "4")}
              />
              <span className="ml-2 flex items-center">
                <span className="flex text-accent">★★★★</span><span className="text-neutral-300">★</span>
                <span className="ml-1">& Up</span>
              </span>
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                name="rating" 
                className="text-primary focus:ring-primary" 
                checked={localFilters.rating === 3}
                onChange={() => handleFilterChange("rating", "3")}
              />
              <span className="ml-2 flex items-center">
                <span className="flex text-accent">★★★</span><span className="text-neutral-300">★★</span>
                <span className="ml-1">& Up</span>
              </span>
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                name="rating" 
                className="text-primary focus:ring-primary" 
                checked={localFilters.rating === 0}
                onChange={() => handleFilterChange("rating", "0")}
              />
              <span className="ml-2">Any Rating</span>
            </label>
          </div>
        </div>
        
        {/* Mobile Apply Button */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsVisible(false)}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 rounded-lg transition"
          >
            Apply Filters
          </button>
        </div>
        
        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsVisible(false)}
          className="md:hidden absolute top-4 right-4 text-neutral-500"
        >
          <X className="h-5 w-5" />
        </button>
      </aside>
    </>
  );
};

export default FiltersPanel;

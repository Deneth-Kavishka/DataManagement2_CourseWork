import { useState, useEffect, useRef } from "react";
import { sriLankanDistricts } from "../../../shared/districts.js";
import { ChevronDown, Search, X } from "lucide-react";

const DistrictSelector = ({ selectedDistrict, onChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDistricts, setFilteredDistricts] = useState(sriLankanDistricts);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter districts based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredDistricts(sriLankanDistricts);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const filtered = sriLankanDistricts.filter(district => 
        district.toLowerCase().includes(query)
      );
      setFilteredDistricts(filtered);
    }
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleDistrictSelect = (district) => {
    onChange(district);
    setIsOpen(false);
    setSearchQuery("");
  };

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setSearchQuery("");
    }
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div 
        className={`flex items-center justify-between px-4 py-2 border rounded-lg cursor-pointer ${isOpen ? 'border-primary ring-2 ring-primary/20' : 'border-neutral-300'}`}
        onClick={toggleDropdown}
      >
        <div className="flex-1 truncate">
          {selectedDistrict ? (
            <div className="flex items-center justify-between w-full">
              <span>{selectedDistrict}</span>
              {selectedDistrict && (
                <button 
                  onClick={clearSelection}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <span className="text-neutral-500">Select district</span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 ml-2 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-neutral-200 rounded-lg shadow-lg">
          <div className="p-2 border-b border-neutral-200">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search districts..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-neutral-200 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto py-1">
            {filteredDistricts.length > 0 ? (
              filteredDistricts.map((district) => (
                <div
                  key={district}
                  className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-neutral-100 ${selectedDistrict === district ? 'bg-primary/10 text-primary font-medium' : ''}`}
                  onClick={() => handleDistrictSelect(district)}
                >
                  {district}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-neutral-500 text-center">
                No districts found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DistrictSelector;
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const LocationSelector: React.FC = () => {
  const [location, setLocation] = useState('San Francisco');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  
  const locations = [
    'San Francisco', 
    'Oakland', 
    'Berkeley', 
    'San Jose', 
    'Palo Alto'
  ];
  
  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
    setIsModalOpen(false);
    toast({
      title: 'Location Updated',
      description: `Your delivery location is now set to ${newLocation}`,
    });
  };
  
  return (
    <div className="flex items-center text-sm">
      <i className="fas fa-map-marker-alt text-accent mr-1"></i>
      <span className="mr-1">Deliver to:</span>
      <button 
        className="font-medium text-primary flex items-center"
        onClick={() => setIsModalOpen(true)}
      >
        <span>{location}</span>
        <i className="fas fa-chevron-down ml-1 text-xs"></i>
      </button>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Select Delivery Location</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="space-y-2 mb-4">
              {locations.map((loc) => (
                <button
                  key={loc}
                  className={`block w-full text-left px-4 py-2 rounded-md ${location === loc ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                  onClick={() => handleLocationChange(loc)}
                >
                  {loc}
                </button>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;

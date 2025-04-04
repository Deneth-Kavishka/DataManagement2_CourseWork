import { createContext, useState, useContext, useEffect } from "react";

const DeliveryLocationContext = createContext();

export const useDeliveryLocation = () => useContext(DeliveryLocationContext);

export const DeliveryLocationProvider = ({ children }) => {
  // Get saved location from localStorage or default to "Colombo"
  const [selectedLocation, setSelectedLocation] = useState(() => {
    const savedLocation = localStorage.getItem("deliveryLocation");
    return savedLocation || "Colombo";
  });

  // Save location to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("deliveryLocation", selectedLocation);
  }, [selectedLocation]);

  const value = {
    selectedLocation,
    setSelectedLocation,
  };

  return (
    <DeliveryLocationContext.Provider value={value}>
      {children}
    </DeliveryLocationContext.Provider>
  );
};

export default DeliveryLocationContext;
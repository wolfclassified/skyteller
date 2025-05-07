import React, { createContext, useContext, useState, useEffect } from "react";


const ActiveLocationContext = createContext({
  activeLocation: null,
  setActiveLocation: () => {},
  error: null,
});


const defaultLocation = {
  city: "London",
  latitude: 51.5072,
  longitude: -0.1276,
  temp: null,
  feelsLike: null,
  iconCode: 0,
  isDefault: true,
};


export const ActiveLocationProvider = ({ children }) => {
  const [activeLocation, setActiveLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const setGeoLocation = async (lat, lon) => {
      try {
        const res = await fetch(
          `https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}&api_key=68133867d5ecf031181022rwn7935ff`
        );
        const data = await res.json();
        const city = data.address?.city || data.address?.town || "Your Location";
  
        setActiveLocation({
          city,
          latitude: lat,
          longitude: lon,
          temp: null,
          feelsLike: null,
          iconCode: 0,
          isDefault: false,
        });
      } catch (e) {
        console.error("Reverse geocoding failed", e);
        setActiveLocation({ ...defaultLocation });
      }
    };
  
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setGeoLocation(latitude, longitude);
        },
        (err) => {
          console.warn("Geolocation error:", err);
          setError("Failed to get geolocation");
          setActiveLocation({ ...defaultLocation });
        }
      );
    } else {
      setError("Geolocation not supported");
      setActiveLocation({ ...defaultLocation });
    }
  }, []);

  return (
    <ActiveLocationContext.Provider value={{ activeLocation, setActiveLocation, error }}>
      {children}
    </ActiveLocationContext.Provider>
  );
};


export const useActiveLocation = () => {
  const context = useContext(ActiveLocationContext);
  if (!context) {
    throw new Error("useActiveLocation must be used within an ActiveLocationProvider");
  }
  return context;
};

import React, { useEffect, useRef, useState } from "react";
import { useActiveLocation } from "../context/ActiveLocationContext";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const TemperatureMap = () => {
  const { activeLocation } = useActiveLocation();
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeLocation && activeLocation.latitude && activeLocation.longitude) {
      const { latitude, longitude } = activeLocation;

      setLoading(true);

      if (mapRef.current && !mapInstance) {
        const map = L.map(mapRef.current, {
          center: [latitude, longitude],
          zoom: 10,
          zoomControl: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        map.whenReady(() => setLoading(false));
        setMapInstance(map);
      } else if (mapInstance) {
        mapInstance.setView([latitude, longitude]);
        setLoading(false);
      }
    }
  }, [activeLocation]);

  const zoomIn = () => mapInstance?.zoomIn();
  const zoomOut = () => mapInstance?.zoomOut();

  return (
    <>
      <div
        className={`relative w-full h-80 rounded-[30px] overflow-hidden shadow-md transition-opacity duration-300 border-2 border-white/10 ${
          showPopup ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {loading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse z-30 rounded-[30px]" />
        )}

        <div ref={mapRef} className="w-full h-full z-0" />

        {!loading && (
          <>
            
            <div className="absolute inset-0 bg-white bg-opacity-5 z-10 pointer-events-none rounded-[30px]" />

            
            <button
              className="absolute bottom-20 right-4 z-20 bg-white text-[#1E78C7] font-extrabold text-xl w-10 h-10 rounded-full shadow flex items-center justify-center"
              onClick={zoomIn}
            >
              +
            </button>
            <button
              className="absolute bottom-8 right-4 z-20 bg-white text-[#1E78C7] font-extrabold text-xl w-10 h-10 rounded-full shadow flex items-center justify-center"
              onClick={zoomOut}
            >
              -
            </button>

            
            <button
              className="absolute top-4 left-4 z-20 bg-white text-[#1E78C7] font-medium px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition"
              onClick={() => setShowPopup(true)}
            >
              <span>Play Weather Forecast</span>
              <img src="/assets/mappop.svg" alt="Open Map" className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {showPopup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="w-11/12 h-[80vh] bg-white rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              title="Expanded Map"
              src={`https://embed.windy.com/embed2.html?lat=${activeLocation.latitude}&lon=${activeLocation.longitude}&detailLat=${activeLocation.latitude}&detailLon=${activeLocation.longitude}&width=650&height=450&zoom=6&level=surface&overlay=temp&menu=&message=true&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`}
              width="100%"
              height="100%"
              style={{ border: "none" }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default TemperatureMap;

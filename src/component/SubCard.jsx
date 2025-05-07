import React from "react";
import { MapPin } from "lucide-react";
import { useActiveLocation } from "../context/ActiveLocationContext";


const getCustomIcon = (code, timezone) => {
  try {
    const now = new Date().toLocaleString("en-US", { timeZone: timezone });
    const hour = new Date(now).getHours();
    const isNight = hour < 6 || hour >= 18;
    return `${import.meta.env.BASE_URL}assets/${code}${isNight ? "n" : ""}.svg`;
  } catch (error) {
    console.error("Error determining local time for icon:", error);
    return `${import.meta.env.BASE_URL}assets/${code}.svg`;
  }
};

const SubCard = ({ city, temp, feelsLike, iconCode, latitude, longitude, timezone }) => {
  const { activeLocation, setActiveLocation } = useActiveLocation();

  const isActive = activeLocation?.city === city && !activeLocation?.isDefault;

  const handleClick = () => {
    if (city && temp != null && latitude && longitude) {
      setActiveLocation({
        city,
        latitude,
        longitude,
        temp,
        feelsLike,
        iconCode,
        isDefault: false,
        timezone,
      });
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer flex justify-between items-center w-full rounded-2xl p-4 transition-all ${
        isActive
          ? "bg-white border-[2px] border-solid border-white/30 backdrop-blur-lg text-[#1E78C7] transform hover:scale-105 hover:shadow-lg"
          : "bg-white/10 border-[1px] border-solid border-white/20 backdrop-blur-lg text-white transform hover:scale-105 hover:shadow-lg"
      }`}
    >
      <div>
        <div className="flex items-center gap-1 text-sm mb-4">
          <MapPin size={16} />
          <span>{city}</span>
        </div>
        <p className="text-4xl font-bold mb-1 ml-2">{temp}°</p>
        <p className="text-sm ml-2 italic">Feels like {feelsLike}°</p>
      </div>
      <img
        className="w-20 h-auto"
        src={getCustomIcon(iconCode, timezone)}
        alt="Weather"
      />
    </div>
  );
};

export default SubCard;

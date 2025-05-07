import React, { useState, useEffect } from "react";
import MainCard from "../component/MainCard";
import SubCard from "../component/SubCard";
import { useActiveLocation } from "../context/ActiveLocationContext";
import tzLookup from "tz-lookup";

const LeftSec = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const { activeLocation, setActiveLocation } = useActiveLocation();
  const [time, setTime] = useState("");
  const [today, setToday] = useState("");

  const formatTimeAndDate = (timezone) => {
    const now = timezone
      ? new Date().toLocaleString("en-US", { timeZone: timezone })
      : new Date();

    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    setTime(new Date(now).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }));
    setToday(new Date(now).toLocaleDateString(undefined, options));
  };

  useEffect(() => {
    if (activeLocation?.timezone) {
      formatTimeAndDate(activeLocation.timezone);
    } else {
      formatTimeAndDate();
    }

    const intervalId = setInterval(() => {
      if (activeLocation?.timezone) {
        formatTimeAndDate(activeLocation.timezone);
      } else {
        formatTimeAndDate();
      }
    }, 10000); // Updates every 10 seconds

    return () => clearInterval(intervalId);
  }, [activeLocation]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${searchQuery}&count=5&language=en&format=json`
        );
        const data = await res.json();
        setSuggestions(data.results || []);
      } catch (err) {
        console.error("Error fetching location suggestions from Open-Meteo:", err);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelectCity = async (location) => {
    try {
      const lat = location.latitude;
      const lon = location.longitude;
      const timezone = tzLookup(lat, lon);

      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code&timezone=${timezone}`
      );
      const data = await res.json();

      const newCard = {
        city: `${location.name}, ${location.state || location.country}`,
        temp: Math.round(data.current.temperature_2m),
        feelsLike: Math.round(data.current.apparent_temperature || data.current.temperature_2m),
        iconCode: data.current.weather_code,
        latitude: lat,
        longitude: lon,
        timezone,
      };

      setActiveLocation({ ...newCard, isDefault: false });

      setSelectedCities((prev) => {
        const updated = [newCard, ...prev.filter(c => c.city !== newCard.city)];
        return updated.slice(0, 3);
      });

      setSearchQuery("");
      setSuggestions([]);
    } catch (err) {
      console.error("Error fetching weather from Open-Meteo:", err);
    }
  };

  return (
    <div className="w-full md:max-w-[400px] p-4 md:p-6 md:m-6 m-0 rounded-2xl border-2 border-white/10 bg-white/15 backdrop-blur-[3px] text-white shadow-lg font-poppins">
      {/* Time and Date */}
      <div className="text-center mb-6">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mt-2">{time}</h1>
        <p className="text-xl sm:text-lg mt-2">{today}</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search cities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-white/5 bg-white/20 backdrop-blur-lg placeholder-white placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition"
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-10 mt-2 w-full bg-white text-[#1E78C7] rounded-xl border-[1px] border-solid border-white/20 shadow-lg backdrop-blur-xl max-h-60 overflow-y-auto">
            {suggestions.map((item, index) => (
              <li
                key={index}
                onClick={() => handleSelectCity(item)}
                className="px-4 py-2 hover:bg-white/10 cursor-pointer"
              >
                {item.name}, {item.state || ""}, {item.country}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Main Weather Card */}
      <MainCard />

      {/* Additional SubCards */}
      <div className="space-y-4 mt-6">
        {selectedCities.length === 0 ? (
          <div className="text-white/60 text-center italic py-28 rounded-xl">
            Your recent searches will show here
          </div>
        ) : (
          selectedCities.map((city, index) => (
            <SubCard
              key={index}
              city={city.city}
              latitude={city.latitude}
              longitude={city.longitude}
              temp={city.temp}
              feelsLike={city.feelsLike}
              iconCode={city.iconCode}
              timezone={city.timezone}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default LeftSec;

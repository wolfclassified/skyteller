import React, { useEffect, useState } from "react";
import { useActiveLocation } from "../context/ActiveLocationContext";

const weatherCodeMap = {
  0: "0.svg", 1: "1.svg", 2: "2.svg", 3: "3.svg",
  45: "45.svg", 48: "48.svg", 51: "51.svg", 53: "53.svg", 55: "55.svg",
  56: "56.svg", 57: "57.svg", 61: "61.svg", 63: "63.svg", 65: "65.svg",
  66: "66.svg", 67: "67.svg", 71: "71.svg", 73: "73.svg", 75: "75.svg",
  77: "77.svg", 80: "80.svg", 81: "81.svg", 82: "82.svg", 85: "85.svg",
  86: "86.svg", 95: "95.svg", 96: "96.svg", 99: "99.svg",
};

const SkeletonCard = () => (
  <div className="flex flex-col items-center justify-center rounded-[30px] py-6 border-2 border-white/10 backdrop-blur-[3px] bg-white/20 animate-pulse">
    <div className="w-10 h-10 bg-white/40 rounded-full mb-2" />
    <div className="h-4 w-16 bg-white/30 rounded mb-1" />
    <div className="h-5 w-10 bg-white/30 rounded" />
  </div>
);

const Daily = () => {
  const { activeLocation } = useActiveLocation();
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { latitude, longitude } = activeLocation || {};
    if (!latitude || !longitude) return;

    const fetchForecast = async () => {
      setLoading(true);

      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 1);
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 5);

      const formatDate = (date) => date.toISOString().split("T")[0];

      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max&timezone=auto&start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}`
        );
        const data = await res.json();

        const formatted = data.daily.time.map((date, i) => {
          const day = new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
          });
          return {
            day,
            temp: Math.round(data.daily.temperature_2m_max[i]),
            icon: weatherCodeMap[data.daily.weather_code[i]] || "unknown.svg",
            date,
          };
        });

        setForecast(formatted);
      } catch (err) {
        console.error("Failed to fetch forecast:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [activeLocation]);

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 px-4 md:px-6 mr-5">
      {loading
        ? Array(7)
            .fill(0)
            .map((_, idx) => <SkeletonCard key={idx} />)
        : forecast.map((day, index) => {
            const isToday = day.date === todayStr;

            return (
              <div
                key={index}
                className={`flex flex-col font-poppins items-center justify-center rounded-[30px] text-center py-6 backdrop-blur-[3px] border-2 transition-all ${
                  isToday
                    ? "bg-white text-[#1E78C7] border-white/30"
                    : "bg-white/20 text-white border-white/10"
                }`}
              >
                <img
                  className="w-10 h-auto pb-2"
                  src={`/assets/${day.icon}`}
                  alt={day.day}
                />
                <div className="text-sm font-medium">{day.day}</div>
                <div className="text-base font-bold">{day.temp}°</div>
              </div>
            );
          })}
    </div>
  );
};

export default Daily;

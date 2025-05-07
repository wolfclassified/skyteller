import React, { useEffect, useState } from "react";
import { useActiveLocation } from "../context/ActiveLocationContext";

const SkeletonHourlyCard = () => (
  <div className="flex flex-col items-center justify-center px-1 py-4 rounded-[30px] text-center w-full animate-pulse">
    <div className="h-4 w-10 bg-white/30 rounded mb-2" />
    <div className="h-6 w-6 bg-white/40 rounded mb-2" />
    <div className="w-8 h-8 bg-white/20 rounded-full" />
  </div>
);

const Hourly = () => {
  const { activeLocation } = useActiveLocation();
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasCustomLocation, setHasCustomLocation] = useState(false);

  useEffect(() => {
    const fetchHourlyWeather = async (latitude, longitude, useGeoTimezone = false) => {
      setLoading(true);

      try {
        let timezone = "UTC";
        if (useGeoTimezone) {
          const geoRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code&timezone=auto`
          );
          const geoData = await geoRes.json();
          if (geoData?.timezone) timezone = geoData.timezone;
        }

        const nowUTC = new Date();
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: timezone,
          hour12: false,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        const parts = formatter.formatToParts(nowUTC);
        const getPart = (type) => parts.find((p) => p.type === type)?.value;
        const localTimeStr = `${getPart("year")}-${getPart("month")}-${getPart("day")}T${getPart("hour")}:${getPart("minute")}:00`;
        const localNow = new Date(localTimeStr);

        const start = new Date(localNow.getTime() - 1 * 60 * 60 * 1000);
        const end = new Date(localNow.getTime() + 10 * 60 * 60 * 1000);

        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code&timezone=${timezone}`
        );
        const data = await res.json();

        const { time, temperature_2m, weather_code } = data.hourly;
        const result = [];

        for (let i = 0; i < time.length; i++) {
          const t = new Date(time[i]);

          if (t >= start && t <= end) {
            const hour = t.getHours();
            const isNight = hour < 6 || hour >= 18;
            const formattedHour =
              t.getTime() === localNow.getTime()
                ? "Now"
                : t.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });

            result.push({
              time: formattedHour,
              temp: Math.round(temperature_2m[i]),
              icon: `${import.meta.env.BASE_URL}/assets/${weather_code[i]}${isNight ? "n" : ""}.svg`,
            });
          }

          if (result.length === 11) break;
        }

        setHourlyData(result);
      } catch (err) {
        console.error("Failed to fetch hourly data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!hasCustomLocation && activeLocation === null) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchHourlyWeather(latitude, longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLoading(false);
        }
      );
    }

    if (activeLocation?.latitude && activeLocation?.longitude) {
      setHasCustomLocation(true);
      fetchHourlyWeather(activeLocation.latitude, activeLocation.longitude, true);
    }
  }, [activeLocation]);

  return (
    <div className="px-4 mt-6">
      <div className="w-full rounded-[30px] bg-white/20 backdrop-blur-[3px] border-2 border-white/10 p-4 py-4">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-2">
          {loading
            ? Array(11)
                .fill(0)
                .map((_, idx) => <SkeletonHourlyCard key={idx} />)
            : hourlyData.map((hour, index) => (
                <div
                  key={index}
                  className={`flex flex-col font-poppins items-center justify-center px-1 py-4 rounded-[30px] text-center transition-all w-full ${
                    index === 0 ? "bg-white text-[#1E78C7]" : "text-white"
                  }`}
                >
                  <div className="text-xs font-medium pb-2">{hour.time}</div>
                  <div className="text-xl font-bold">{hour.temp}°</div>
                  <img
                    className="w-8 h-auto pt-2"
                    src={`${import.meta.env.BASE_URL}assets/${weather_code[i]}${isNight ? "n" : ""}.svg`}
                    alt="Weather icon"
                    onError={(e) => (e.currentTarget.src = `${import.meta.env.BASE_URL}assets/unknown.svg`)}
                  />
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};

export default Hourly;

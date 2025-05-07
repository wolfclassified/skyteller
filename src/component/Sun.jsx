import React, { useEffect, useState } from "react";
import { useActiveLocation } from "../context/ActiveLocationContext";
import tzlookup from "tz-lookup";

const Sun = () => {
  const { activeLocation } = useActiveLocation();
  const [sunData, setSunData] = useState({ sunrise: null, sunset: null });
  const [bgImage, setBgImage] = useState("sunbg.svg");
  const [localTimezone, setLocalTimezone] = useState(null);

  const formatLocalTime = (dateStr, timezone) => {
    const utcDate = new Date(dateStr);
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: timezone,
    }).format(utcDate);
  };

  useEffect(() => {
    const fetchSunData = async () => {
      if (!activeLocation) return;

      const { latitude, longitude } = activeLocation;

      
      try {
        const timezone = tzlookup(latitude, longitude);
        setLocalTimezone(timezone);
      } catch (err) {
        console.error("Failed to determine timezone:", err);
      }

      try {
        const res = await fetch(
          `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`
        );
        const data = await res.json();
        const { sunrise, sunset } = data.results;

        setSunData({
          sunrise: new Date(sunrise),
          sunset: new Date(sunset),
        });
      } catch (error) {
        console.error("Failed to fetch sunrise/sunset:", error);
      }
    };

    fetchSunData();
  }, [activeLocation]);

  useEffect(() => {
    if (!sunData.sunrise || !sunData.sunset) return;

    const now = new Date();
    const sunrise = new Date(sunData.sunrise);
    const sunset = new Date(sunData.sunset);

    if (now < sunrise || now > sunset) {
      setBgImage("sunbg.svg");
      return;
    }

    const diffMins = (sunset - sunrise) / 1000 / 60;
    const sectionLength = diffMins / 8;
    const elapsedMins = (now - sunrise) / 1000 / 60;
    const section = Math.min(8, Math.ceil(elapsedMins / sectionLength));

    setBgImage(`sunbg${section}.svg`);
  }, [sunData]);

  
  const formattedSunrise =
    sunData.sunrise && localTimezone
      ? formatLocalTime(sunData.sunrise, localTimezone)
      : "--:--";
  const formattedSunset =
    sunData.sunset && localTimezone
      ? formatLocalTime(sunData.sunset, localTimezone)
      : "--:--";

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-[30px] p-4 bg-white/15 backdrop-blur-[3px] border-2 border-white/10 text-white flex flex-col items-center gap-2">
      <img
        src={`${import.meta.env.BASE_URL}assets/${bgImage}`}
        alt="Sun background"
        className="w-full rounded-2xl object-cover"
      />

      <div className="flex justify-between w-full px-4">
        <div className="text-center ml-12">
          <img
            src={`${import.meta.env.BASE_URL}assets/sunrise.svg`}
            alt="Sunrise icon"
            className="w-8 h-8 mx-auto"
          />
          <div className="text-sm">Sunrise</div>
          <div className="text-lg font-semibold">{formattedSunrise}</div>
        </div>
        <div className="text-center mr-12">
          <img
            src={`${import.meta.env.BASE_URL}assets/sunset.svg`}
            alt="Sunset icon"
            className="w-8 h-8 mx-auto"
          />
          <div className="text-sm">Sunset</div>
          <div className="text-lg font-semibold">{formattedSunset}</div>
        </div>
      </div>
    </div>
  );
};

export default Sun;

import React, { useEffect, useState } from 'react';
import LeftSec from '../sides/LeftSec';
import RightSec from '../sides/RightSec';
import { useActiveLocation } from '../context/ActiveLocationContext';

const OnePage = () => {
  const { activeLocation } = useActiveLocation();
  const [backgroundImage, setBackgroundImage] = useState(`${import.meta.env.BASE_URL}assets/background2.svg`);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeatherAndSetBackground = async () => {
      if (!activeLocation) return;

      setLoading(true);

      const { latitude, longitude } = activeLocation;

      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=weather_code&timezone=auto`
        );
        const data = await res.json();

        const weatherCode = data.current?.weather_code;
        const timeStr = data.current?.time;

        if (weatherCode != null && timeStr) {
          const hour = new Date(timeStr).getHours();
          const isNight = hour < 6 || hour >= 18;

          const suffix = isNight ? 'n' : '';
          const imagePath = `${import.meta.env.BASE_URL}assets/bg${weatherCode}${suffix}.svg`;
          setBackgroundImage(imagePath);
        } else {
          setBackgroundImage(`${import.meta.env.BASE_URL}assets/default.svg`);
        }
      } catch (err) {
        console.error("Failed to fetch weather or background:", err);
        setBackgroundImage('/assets/default.svg');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherAndSetBackground();
  }, [activeLocation]);

  return (
    <div
      className="flex flex-wrap md:flex-nowrap min-h-screen overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: loading ? '#172837' : undefined,
        backgroundImage: loading ? 'none' : `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <LeftSec />
      <RightSec />
    </div>
  );
};

export default OnePage;

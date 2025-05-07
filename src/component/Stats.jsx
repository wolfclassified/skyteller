import React, { useEffect, useState } from "react";
import { useActiveLocation } from "../context/ActiveLocationContext";

import wind from `${import.meta.env.BASE_URL}assets/wind.svg`;
import visibility from `${import.meta.env.BASE_URL}assets/visibility.svg`;
import uvindex from `${import.meta.env.BASE_URL}assets/uvindex.svg`;
import pressure from `${import.meta.env.BASE_URL}assets/pressure.svg`;
import humidity from `${import.meta.env.BASE_URL}assets/humidity.svg`;
import dewpoint from `${import.meta.env.BASE_URL}assets/dewpoint.svg`;
import precipitation from `${import.meta.env.BASE_URL}assets/precipitation.svg`;
import air from `${import.meta.env.BASE_URL}assets/air.svg`;
import information from `${import.meta.env.BASE_URL}assets/information.svg`;
import uv from `${import.meta.env.BASE_URL}assets/uv.png`;
import humiditys from `${import.meta.env.BASE_URL}assets/humidity.png`;
import winds from `${import.meta.env.BASE_URL}assets/wind.png`;
import dew from `${import.meta.env.BASE_URL}assets/dew.png`;
import pressures from `${import.meta.env.BASE_URL}assets/pressure.png`;
import visibilitys from `${import.meta.env.BASE_URL}assets/visibility.png`;
import precipitations from `${import.meta.env.BASE_URL}assets/precipitation.png`;
import airs from `${import.meta.env.BASE_URL}assets/airs.png`;


const Stats = () => {
  const { activeLocation } = useActiveLocation();
  const [statsData, setStatsData] = useState(null);
  const [hasCustomLocation, setHasCustomLocation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedStat, setSelectedStat] = useState(null);

  const findClosestHourIndex = (targetTimeISO, timeArray) => {
    const target = new Date(targetTimeISO).getTime();
    let closestIndex = 0;
    let minDiff = Infinity;

    timeArray.forEach((timeStr, idx) => {
      const time = new Date(timeStr).getTime();
      const diff = Math.abs(time - target);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });

    return closestIndex;
  };

  const fetchWeatherStats = async (latitude, longitude) => {
    setLoading(true);
    try {
      const [weatherRes, airRes] = await Promise.all([
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,pressure_msl,visibility,wind_speed_10m,dew_point_2m&hourly=uv_index&timezone=auto`
        ),
        fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=pm10&timezone=auto`
        ),
      ]);

      const weatherData = await weatherRes.json();
      const airData = await airRes.json();

      if (!weatherData.current || !weatherData.hourly || !airData.hourly) {
        throw new Error("Missing required data");
      }

      const current = weatherData.current;
      const currentTimeISO = current.time;

      const uvIndexIdx = findClosestHourIndex(currentTimeISO, weatherData.hourly.time);
      const aqiIndex = findClosestHourIndex(currentTimeISO, airData.hourly.time);

      const uvIndex = weatherData.hourly.uv_index?.[uvIndexIdx] ?? "N/A";
      const aqi = airData.hourly.pm10?.[aqiIndex] ?? "N/A";

      setStatsData([
        { label: "UV Index", value: uvIndex, icon: uvindex },
        { label: "Air Quality Index", value: aqi, icon: air },
        { label: "Humidity", value: `${current.relative_humidity_2m}%`, icon: humidity },
        { label: "Wind", value: `${current.wind_speed_10m} km/h`, icon: wind },
        { label: "Dew Point", value: `${current.dew_point_2m}°`, icon: dewpoint },
        { label: "Pressure", value: `${current.pressure_msl} mb`, icon: pressure },
        { label: "Visibility", value: `${(current.visibility / 1000).toFixed(1)} km`, icon: visibility },
        { label: "Precipitation", value: `${current.precipitation} mm`, icon: precipitation },
      ]);
    } catch (error) {
      console.error("Failed to fetch stats data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasCustomLocation && !activeLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherStats(latitude, longitude);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setLoading(false);
        }
      );
    }

    if (activeLocation?.latitude && activeLocation?.longitude) {
      setHasCustomLocation(true);
      fetchWeatherStats(activeLocation.latitude, activeLocation.longitude);
    }
  }, [activeLocation]);

  const renderModal = () => {
    if (!selectedStat) return null;

    const bodyContent = {
      "UV Index": (
        <>
          <p className="mb-4">
            <strong className="text-[#3ea72d]">0–2 (Low) :</strong> A UV index reading of 0 to 2 means low danger from the Sun's UV rays for the average person.<br />Wear sunglasses on bright days. If you burn easily, cover up and use broad spectrum SPF 15+ sunscreen. Bright surfaces, sand, water, and snow, will increase UV exposure. 
          </p>
          <p className="mb-4">
            <strong className="text-[#FFCD17]">3–5 (Moderate) :</strong> A UV index reading of 3 to 5 means moderate risk of harm from unprotected sun exposure.<br />
            Stay in shade near midday when the sun is strongest. If outdoors, wear sun-protective clothing, a wide-brimmed hat, and UV-blocking sunglasses. Generously apply broad spectrum SPF 50+ sunscreen every 1.5 hours, even on cloudy days, and after swimming or sweating. Bright surfaces, such as sand, water, and snow, will increase UV exposure.
          </p>
          <p className="mb-4">
            <strong className="text-[#f18b00]">6–7 (High) :</strong> A UV index reading of 6 to 7 means high risk of harm from unprotected sun exposure. Protection against skin and eye damage is needed.<br />
            Reduce time in the sun between 10 a.m. and 4 p.m. If outdoors, seek shade and wear sun-protective clothing, a wide-brimmed hat, and UV-blocking sunglasses. Generously apply broad spectrum SPF 50+ sunscreen every 1.5 hours, even on cloudy days, and after swimming or sweating. Bright surfaces, such as sand, water, and snow, will increase UV exposure.
          </p>
          <p className="mb-4">
          <strong className="text-[#e53210]">8–10 (Very high) :</strong> A UV index reading of 8 to 10 means very high risk of harm from unprotected sun exposure.<br />Take extra precautions because unprotected skin and eyes will be damaged and can burn quickly. Minimize sun exposure between 10 a.m. and 4 p.m. If outdoors, seek shade and wear sun-protective clothing, a wide-brimmed hat, and UV-blocking sunglasses. Generously apply broad spectrum SPF 50+ sunscreen every 1.5 hours, even on cloudy days, and after swimming or sweating. Bright surfaces, such as sand, water, and snow, will increase UV exposure.
          </p>
          <p className="mb-4">
            <strong className="text-[#b567a4]">11+ (Extreme) :</strong> A UV index reading of 11 or more means extreme risk of harm from unprotected sun exposure.<br />Take all precautions because unprotected skin and eyes can burn in minutes. Try to avoid sun exposure between 10 a.m. and 4 p.m. If outdoors, seek shade and wear sun-protective clothing, a wide-brimmed hat, and UV-blocking sunglasses. Generously apply broad spectrum SPF 50+ sunscreen every 1.5 hours, even on cloudy days, and after swimming or sweating. Bright surfaces, such as sand, water, and snow, will increase UV exposure.    
          </p>
        </>
      ),

      "Humidity": (
        <>
          <p className="mb-3">
          Relative humidity is the ratio of how much water vapour is in the air to how much water vapour the air could potentially contain at a given temperature. It varies with the temperature of the air: colder air can contain less vapour, and water will tend to condense out of the air more at lower temperatures. So changing the temperature of air can change the relative humidity, even when the specific humidity remains constant.
          </p>
          <p className="mb-3">
          Chilling air increases the relative humidity. If the relative humidity rises over 100% (the dew point) and there is an available surface or particle, the water vapour will condense into liquid or deposit into ice. Likewise, warming air decreases the relative humidity. Warming some air containing a fog may cause that fog to evaporate, as the droplets are prone to total evaporation due to the lowering partial pressure of water vapour in that air, as the temperature rises.
          </p>
          <p className="mb-3">
          Relative humidity only considers the invisible water vapour. Mists, clouds, fogs and aerosols of water do not count towards the measure of relative humidity of the air, although their presence is an indication that a body of air may be close to the dew point.
          </p>
        </>
      ),

      "Wind": (
        <>
          <p className="mb-3">
          Generally, wind speeds between 1 m/s and 5 m/s are considered most comfortable for humans. However, safety standards and recommendations for different activities vary. For example, a wind speed of 20 mph is considered a "Fresh Breeze" and can cause small tree branches to sway, but it's generally not considered dangerous.
          </p>
          <p className="mb-3">
          OSHA defines high wind as exceeding 40 mph for general work, but 30 mph for material handling. The Lawson LDDC criteria, a subset of the Lawson wind comfort criteria, uses a probability of 5% as a fulfillment value for wind comfort, with speeds of 4 m/s for occasional sitting and 2.5 m/s for frequent sitting being considered safe. 
          </p>
          <p className="mb-3">
          Comfort and General Safety: <br />
          • 1 m/s - 5 m/s: This range is generally considered the most comfortable for outdoor activities. <br />
          • 20 mph (10.3 m/s or Beaufort scale 5): Some recommend ceasing activities involving material handling when winds reach this speed, as it's likely to affect a worker's balance. <br />
          • 40 mph (18 m/s): OSHA considers this a "high wind" for general work activities. <br />
          </p>
        </>
      ),
      
      "Dew Point": (
        <>
          <p className="mb-3">
          The dew point is the temperature the air needs to be cooled to (at constant pressure) in order to produce a relative humidity of 100%. This temperature depends on the pressure and water content of the air. When the air is cooled below the dew point, its moisture capacity is reduced and airborne water vapor will condense to form liquid water known as dew. When this occurs through the air's contact with a colder surface, dew will form on that surface.
          </p>
          <p className="mb-3">
          As the air surrounding one's body is warmed by body heat, it will rise and be replaced with other air. If air is moved away from one's body with a natural breeze or a fan, sweat will evaporate faster, making perspiration more effective at cooling the body, thereby increasing comfort. By contrast, comfort decreases as unevaporated perspiration increases.
          </p>
          <p className="mb-3">
          A wet bulb thermometer also uses evaporative cooling, so it provides a good measure for use in evaluating comfort level. Discomfort also exists when the dew point is very low (below around −5 °C or 23 °F).[citation needed] The drier air can cause skin to crack and become irritated more easily. It will also dry out the airways. The US Occupational Safety and Health Administration recommends indoor air be maintained at 20–24.5 °C (68–76 °F) with a 20–60% relative humidity, equivalent to a dew point of approximately 4.0 to 16.5 °C (39 to 62 °F) (by Simple Rule calculation below).
          </p>
          <p className="mb-3">
          Lower dew points, less than 10 °C (50 °F), correlate with lower ambient temperatures and cause the body to require less cooling. A lower dew point can go along with a high temperature only at extremely low relative humidity, allowing for relatively effective cooling.
          </p>
        </>
      ),

      "Pressure": (
        <>
          <p className="mb-3">
          Atmospheric pressure, also known as air pressure or barometric pressure (after the barometer), is the pressure within the atmosphere of Earth. The standard atmosphere (symbol: atm) is a unit of pressure defined as 101,325 Pa (1,013.25 hPa), which is equivalent to 1,013.25 millibars, 760 mm Hg, 29.9212 inches Hg, or 14.696 psi. The atm unit is roughly equivalent to the mean sea-level atmospheric pressure on Earth; that is, the Earth's atmospheric pressure at sea level is approximately 1 atm.
          </p>
          <p className="mb-3">
          In most circumstances, atmospheric pressure is closely approximated by the hydrostatic pressure caused by the weight of air above the measurement point. As elevation increases, there is less overlying atmospheric mass, so atmospheric pressure decreases with increasing elevation. Because the atmosphere is thin relative to the Earth's radius—especially the dense atmospheric layer at low altitudes—the Earth's gravitational acceleration as a function of altitude can be approximated as constant and contributes little to this fall-off. Pressure measures force per unit area, with SI units of pascals (1 pascal = 1 newton per square metre, 1 N/m2).
          </p>
          <p className="mb-3">
          On average, a column of air with a cross-sectional area of 1 square centimetre (cm2), measured from the mean (average) sea level to the top of Earth's atmosphere, has a mass of about 1.03 kilogram and exerts a force or "weight" of about 10.1 newtons, resulting in a pressure of 10.1 N/cm2 or 101 kN/m2 (101 kilopascals, kPa). A column of air with a cross-sectional area of 1 in2 would have a weight of about 14.7 lbf, resulting in a pressure of 14.7 lbf/in2.
          </p>
        </>
      ),

      "Visibility": (
        <>
          <p className="mb-3">
          Visibility is the measure of the distance at which an object or light can be clearly discerned. It depends on the transparency of the surrounding air and as such, it is unchanging no matter the ambient light level or time of day. It is reported within surface weather observations and METAR code either in meters or statute miles, depending upon the country. Visibility affects all forms of traffic: roads, railways, sailing and aviation.
          </p>
          <p className="mb-3">
          The international definition of <strong>fog</strong> is a visibility of less than 1 km (3,300 ft); <strong>mist</strong> is a visibility of between 1 km (0.62 mi) and 2 km (1.2 mi) and haze from 2 km (1.2 mi) to 5 km (3.1 mi). Fog and mist are generally assumed to be composed principally of water droplets, haze and smoke can be of smaller particle size. This has implications for sensors such as thermal imagers (TI/FLIR) operating in the far-IR at wavelengths of about 10 μm, which are better able to penetrate haze and some smokes because their particle size is smaller than the wavelength; the IR radiation is therefore not significantly deflected or absorbed by the particles.
          </p>
          <p className="mb-3">
          <strong>Very low visibility</strong> occurs with fog, occasional freezing drizzle and snow can occur. This usually occurs when temperatures are below 0 °C (32 °F). These conditions are hazardous due to ice formation, which can be deadly, particularly so because of the low visibility, which usually accompanies these conditions at under 1,000 yards. The combination of low visibility and ice formation can lead to accidents on roadways. These cold weather events are caused largely by low-lying stratus clouds.
          </p>
          <p className="mb-3">
          <strong>Visibility of less than 100 metres</strong> (330 ft) is usually reported as zero. In these conditions, roads may be closed, or automatic warning lights and signs may be activated to warn drivers. These have been put in place in certain areas that are subject to repeatedly low visibility, particularly after traffic collisions or pile-ups involving multiple vehicles.
          </p>
        </>
      ),

      "Precipitation": (
        <>
          <p className="mb-3">
          In meteorology, precipitation is any product of the condensation of atmospheric water vapor that falls from clouds due to gravitational pull. The main forms of precipitation include drizzle, rain, Rain and snow mixed ("sleet" in Commonwealth usage), snow, ice pellets, graupel and hail. Precipitation occurs when a portion of the atmosphere becomes saturated with water vapor (reaching 100% relative humidity), so that the water condenses and "precipitates" or falls. Thus, fog and mist are not precipitation; their water vapor does not condense sufficiently to precipitate, so fog and mist do not fall. (Such a non-precipitating combination is a colloid.) Two processes, possibly acting together, can lead to air becoming saturated with water vapor: cooling the air or adding water vapor to the air. Precipitation forms as smaller droplets coalesce via collision with other rain drops or ice crystals within a cloud. Short, intense periods of rain in scattered locations are called showers.
          </p>
          <p className="mb-3">
          <strong>Liquid precipitation :</strong> Rainfall (including drizzle and rain) is usually measured using a rain gauge and expressed in units of millimeters (mm) of height or depth. Equivalently, it can be expressed as a physical quantity with dimension of volume of water per collection area, in units of liters per square meter (L/m2); as 1L = 1dm3 = 1mm·m2, the units of area (m2) cancel out, resulting in simply "mm". This also corresponds to an area density expressed in kg/m2, if assuming that 1 liter of water has a mass of 1 kg (water density), which is acceptable for most practical purposes. The corresponding English unit used is usually inches. In Australia before metrication, rainfall was also measured in "points", each of which was defined as one-hundredth of an inch.
          </p>
          <p className="mb-3">
          <strong>Solid precipitation :</strong> A snow gauge is usually used to measure the amount of solid precipitation. Snowfall is usually measured in centimeters by letting snow fall into a container and then measure the height. The snow can then optionally be melted to obtain a water equivalent measurement in millimeters like for liquid precipitation. The relationship between snow height and water equivalent depends on the water content of the snow; the water equivalent can thus only provide a rough estimate of snow depth. Other forms of solid precipitation, such as snow pellets and hail or even rain and snow mixed ("sleet" in Commonwealth usage), can also be melted and measured as their respective water equivalents, usually expressed in millimeters as for liquid precipitation.
          </p>
        </>
      ),

      "Air Quality Index": (
        <>
          <p className="mb-4">
          An air quality index (AQI) is an indicator developed by government agencies. to communicate to the public how polluted the air currently is or how polluted it is forecast to become. As air pollution levels rise, so does the AQI, along with the associated public health risk. Children, the elderly and individuals with respiratory or cardiovascular problems are typically the first groups affected by poor air quality. When the AQI is high, governmental bodies generally encourage people to reduce physical activity outdoors, or even avoid going out altogether. When wildfires result in a high AQI, the use of a mask (such as an N95 respirator) outdoors and an air purifier (incorporating both HEPA and activated carbon filters) indoors are also encouraged.
          </p>
          <p className="mb-4">
            <strong className="text-[#338CE7]">0-33 (Very Good) :</strong> Enjoy activities.<br />
          </p>
          <p className="mb-4">
            <strong className="text-[#37B13C]">34-66 (Good) :</strong> Enjoy activities.
          </p>
          <p className="mb-4">
          <strong className="text-[#FFC518]">67-99 (Fair) :</strong> People unusually sensitive to air pollution: Plan strenuous outdoor activities when air quality is better.
          </p>
          <p className="mb-4">
            <strong className="text-[#F06520]">100-149 (Poor) :</strong> Sensitive groups should cut back or reschedule strenuous outdoor activities.
          </p>
          <p className="mb-4">
            <strong className="text-[#8E1B66]">150-200 (Very Poor) :</strong> Sensitive groups should avoid strenuous outdoor activities. Everyone else should cut back or reschedule strenuous outdoor activities.
          </p>
          <p className="mb-4">
            <strong className="text-[#C51515]">200+ (Hazardous) :</strong> Sensitive groups should avoid all outdoor physical activities. Everyone else should significantly cut back on outdoor physical activities.
          </p>
        </>
      ),
    };

    const backgroundImages = {
      "UV Index": uv,
      "Humidity": humiditys,
      "Wind": winds,
      "Dew Point":dew,
      "Pressure": pressures,
      "Visibility": visibilitys,
      "Precipitation": precipitations,
      "Air Quality Index": airs
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-white rounded-[30px] w-[90%] max-w-[1000px] overflow-hidden text-black">
          <div className="relative h-52 w-full">
            <img
              src={backgroundImages[selectedStat.label]}
              alt="Background"
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-white text-5xl font-bold text-center drop-shadow-md">
                {selectedStat.label}
              </h2>
            </div>
          </div>
          <div className="p-8 text-sm leading-relaxed">
            {bodyContent[selectedStat.label] || <p>Information not available.</p>}
            <div className="flex justify-center items-center">
            <button
              onClick={() => setSelectedStat(null)}
              className="mt-2 w-48 py-2 bg-[#104574] text-white font-bold rounded-xl transition-transform duration-300 transform hover:scale-105"
            >
              Close
            </button>
            </div>
            
          </div>
        </div>
      </div>
    );
  };

  if (loading || !statsData) {
    return (
      <div className="w-full rounded-[30px] bg-white/15 backdrop-blur-[3px] border-2 border-white/10 p-6 grid grid-cols-2 gap-6 font-poppins">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[20px] bg-white/10 border-[1px] border-white/20 backdrop-blur-[8px] p-4 animate-pulse"
          >
            
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white/30 rounded-full" />
                <div className="h-4 w-20 bg-white/30 rounded-md" />
              </div>
              <div className="w-4 h-4 bg-white/30 rounded-full" />
            </div>
  
            
            <div className="text-4xl font-semibold mb-5 pt-2 pl-5">
              <div className="h-10 w-28 bg-white/30 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="w-full rounded-[30px] bg-white/15 backdrop-blur-[3px] border-2 border-white/10 p-6 grid grid-cols-2 gap-6 font-poppins">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className="cursor-pointer rounded-[20px] bg-white/10 border-[1px] border-solid border-white/20 backdrop-blur-[8px] text-white p-4 transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
            onClick={() => setSelectedStat(stat)}
          >
            <div className="relative flex items-center gap-1.5 text-sm font-normal mb-5">
              <img src={stat.icon} alt={stat.label} className="w-6 h-6" />
              {stat.label}
              <img
                src={information}
                alt="info"
                className="w-4 h-4 absolute top-0 right-0"
              />
            </div>
            <div className="text-4xl font-semibold mb-5 pt-2 pl-5">{stat.value}</div>
          </div>
        ))}
      </div>
      {renderModal()}
    </>
  );
};

export default Stats;
import { AQIDataPoint, ForecastResponse } from "../types";

const AQICN_TOKEN = "9ab45a89e2e121e522cabfc2fdd968361f9fa9fc";

function getAQIStatus(aqi: number): string {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

async function fetchFromAQICN(
  cityQuery: string,
): Promise<ForecastResponse & { isOfficialData: boolean }> {
  const searchUrl = `https://api.waqi.info/search/?token=${AQICN_TOKEN}&keyword=${encodeURIComponent(cityQuery)}`;
  const searchRes = await fetch(searchUrl);

  if (!searchRes.ok) {
    throw new Error(`AQICN search returned HTTP ${searchRes.status}.`);
  }

  const searchData = await searchRes.json();

  if (searchData.status !== "ok" || !searchData.data || searchData.data.length === 0) {
    throw new Error(
      `Could not find air quality data for "${cityQuery}". Try checking the spelling or adding a country (e.g. "Shenzhen, China").`,
    );
  }

  const station = searchData.data[0];
  const stationUid = station.uid;

  const feedUrl = `https://api.waqi.info/feed/@${stationUid}/?token=${AQICN_TOKEN}`;
  const feedRes = await fetch(feedUrl);

  if (!feedRes.ok) {
    throw new Error(`AQICN feed returned HTTP ${feedRes.status}.`);
  }

  const feedData = await feedRes.json();

  if (feedData.status !== "ok" || !feedData.data) {
    throw new Error("Unable to retrieve detailed forecast from the air quality station.");
  }

  const { data } = feedData;
  const dailyForecasts: Record<string, AQIDataPoint> = {};

  if (data.forecast && data.forecast.daily) {
    const forecastData = data.forecast.daily;

    Object.keys(forecastData).forEach((pollutantKey) => {
      const pollutantDays = forecastData[pollutantKey];

      pollutantDays.forEach((dayInfo: any) => {
        const date = dayInfo.day;

        if (!dailyForecasts[date]) {
          dailyForecasts[date] = {
            date,
            aqi: dayInfo.avg,
            status: getAQIStatus(dayInfo.avg),
            description: `Daily air quality forecast for ${date}. Based on ${station.station.name} station data.`,
            pollutants: {
              pm2_5: pollutantKey === "pm25" ? dayInfo.avg : 0,
              pm10: pollutantKey === "pm10" ? dayInfo.avg : 0,
              o3: pollutantKey === "o3" ? dayInfo.avg : 0,
            },
          };
        } else {
          const pollutants = dailyForecasts[date].pollutants!;
          if (pollutantKey === "pm25") pollutants.pm2_5 = dayInfo.avg;
          if (pollutantKey === "pm10") pollutants.pm10 = dayInfo.avg;
          if (pollutantKey === "o3") pollutants.o3 = dayInfo.avg;

          if (dayInfo.avg > dailyForecasts[date].aqi) {
            dailyForecasts[date].aqi = dayInfo.avg;
            dailyForecasts[date].status = getAQIStatus(dayInfo.avg);
          }
        }
      });
    });
  }

  const today = new Date().toISOString().split("T")[0];
  if (data.aqi !== undefined) {
    dailyForecasts[today] = {
      date: today,
      aqi: data.aqi,
      status: getAQIStatus(data.aqi),
      description: `Current air quality recorded at ${station.station.name}.`,
      pollutants: {
        pm2_5: data.iaqi?.pm25?.v ?? dailyForecasts[today]?.pollutants?.pm2_5 ?? 0,
        pm10: data.iaqi?.pm10?.v ?? dailyForecasts[today]?.pollutants?.pm10 ?? 0,
        o3: data.iaqi?.o3?.v ?? dailyForecasts[today]?.pollutants?.o3 ?? 0,
        co: data.iaqi?.co?.v ?? dailyForecasts[today]?.pollutants?.co ?? 0,
        no2: data.iaqi?.no2?.v ?? dailyForecasts[today]?.pollutants?.no2 ?? 0,
      },
    };
  }

  const sortedForecast = Object.values(dailyForecasts).sort((a, b) => a.date.localeCompare(b.date));

  return {
    city: station.station.name,
    country: "",
    forecast: sortedForecast,
    sources: [{ title: "World Air Quality Index Project (AQICN)", uri: "https://aqicn.org/" }],
    isOfficialData: true,
  };
}

async function fetchFromOpenMeteo(
  cityQuery: string,
): Promise<ForecastResponse & { isOfficialData: boolean }> {
  const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    cityQuery,
  )}&count=1&language=en&format=json`;
  const geocodeRes = await fetch(geocodeUrl);

  if (!geocodeRes.ok) {
    throw new Error(`Open-Meteo geocoding returned HTTP ${geocodeRes.status}.`);
  }

  const geocodeData = await geocodeRes.json();
  const location = geocodeData.results?.[0];

  if (!location) {
    throw new Error(`Could not find air quality data for "${cityQuery}".`);
  }

  const airQualityUrl =
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.latitude}` +
    `&longitude=${location.longitude}` +
    `&hourly=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone` +
    `&timezone=auto&forecast_days=7`;

  const airRes = await fetch(airQualityUrl);

  if (!airRes.ok) {
    throw new Error(`Open-Meteo air-quality returned HTTP ${airRes.status}.`);
  }

  const airData = await airRes.json();
  const hourly = airData.hourly;

  if (!hourly?.time?.length || !hourly?.us_aqi?.length) {
    throw new Error("Open-Meteo did not return usable air quality forecast data.");
  }

  const dailyForecasts: Record<string, AQIDataPoint> = {};

  hourly.time.forEach((timestamp: string, index: number) => {
    const date = timestamp.slice(0, 10);
    const aqi = Math.round(hourly.us_aqi[index] ?? 0);
    const pm25 = hourly.pm2_5?.[index];
    const pm10 = hourly.pm10?.[index];
    const co = hourly.carbon_monoxide?.[index];
    const no2 = hourly.nitrogen_dioxide?.[index];
    const o3 = hourly.ozone?.[index];

    if (!dailyForecasts[date]) {
      dailyForecasts[date] = {
        date,
        aqi,
        status: getAQIStatus(aqi),
        description: `Model forecast for ${location.name} from Open-Meteo air quality data.`,
        pollutants: {
          pm2_5: pm25,
          pm10,
          co,
          no2,
          o3,
        },
      };
      return;
    }

    const entry = dailyForecasts[date];
    if (aqi > entry.aqi) {
      entry.aqi = aqi;
      entry.status = getAQIStatus(aqi);
    }

    entry.pollutants = {
      pm2_5: Math.max(entry.pollutants?.pm2_5 ?? 0, pm25 ?? 0),
      pm10: Math.max(entry.pollutants?.pm10 ?? 0, pm10 ?? 0),
      co: Math.max(entry.pollutants?.co ?? 0, co ?? 0),
      no2: Math.max(entry.pollutants?.no2 ?? 0, no2 ?? 0),
      o3: Math.max(entry.pollutants?.o3 ?? 0, o3 ?? 0),
    };
  });

  const sortedForecast = Object.values(dailyForecasts).sort((a, b) => a.date.localeCompare(b.date));

  return {
    city: location.name || cityQuery,
    country: location.country || "",
    forecast: sortedForecast,
    sources: [{ title: "Open-Meteo Air Quality API", uri: "https://open-meteo.com/en/docs/air-quality-api" }],
    isOfficialData: false,
  };
}

export const fetchAQIForecastData = async (
  cityQuery: string,
): Promise<ForecastResponse & { isOfficialData: boolean }> => {
  try {
    return await fetchFromAQICN(cityQuery);
  } catch (aqicnError: any) {
    console.warn("AQICN unavailable, falling back to Open-Meteo:", aqicnError?.message || aqicnError);

    try {
      return await fetchFromOpenMeteo(cityQuery);
    } catch (fallbackError: any) {
      console.error("Air quality fallback error:", fallbackError);
      throw new Error(
        fallbackError.message ||
          aqicnError?.message ||
          "The air quality service is currently unreachable.",
      );
    }
  }
};

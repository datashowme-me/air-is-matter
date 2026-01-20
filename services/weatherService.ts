import { ForecastResponse, AQIDataPoint } from "../types";

const AQICN_TOKEN = "9ab45a89e2e121e522cabfc2fdd968361f9fa9fc";

// Map AQI values to health status strings (US EPA Standard)
function getAQIStatus(aqi: number): string {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

export const fetchAQIForecast = async (cityQuery: string): Promise<ForecastResponse & { isOfficialData: boolean }> => {
  try {
    // 1. Search for the city/station using AQICN search endpoint
    const searchUrl = `https://api.waqi.info/search/?token=${AQICN_TOKEN}&keyword=${encodeURIComponent(cityQuery)}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (searchData.status !== "ok" || !searchData.data || searchData.data.length === 0) {
      throw new Error(`Could not find air quality data for "${cityQuery}". Try checking the spelling or adding a country (e.g. "Shenzhen, China").`);
    }

    // Pick the most relevant station (first result)
    const station = searchData.data[0];
    const stationUid = station.uid;

    // 2. Get detailed feed including forecast
    const feedUrl = `https://api.waqi.info/feed/@${stationUid}/?token=${AQICN_TOKEN}`;
    const feedRes = await fetch(feedUrl);
    const feedData = await feedRes.json();

    if (feedData.status !== "ok" || !feedData.data) {
      throw new Error("Unable to retrieve detailed forecast from the air quality station.");
    }

    const { data } = feedData;
    const dailyForecasts: Record<string, AQIDataPoint> = {};

    // AQICN returns forecast as separated pollutant arrays (pm25, pm10, o3, etc.)
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
                pm2_5: pollutantKey === 'pm25' ? dayInfo.avg : 0,
                pm10: pollutantKey === 'pm10' ? dayInfo.avg : 0,
                o3: pollutantKey === 'o3' ? dayInfo.avg : 0,
              }
            };
          } else {
            const p = dailyForecasts[date].pollutants!;
            if (pollutantKey === 'pm25') p.pm2_5 = dayInfo.avg;
            if (pollutantKey === 'pm10') p.pm10 = dayInfo.avg;
            if (pollutantKey === 'o3') p.o3 = dayInfo.avg;

            if (dayInfo.avg > dailyForecasts[date].aqi) {
              dailyForecasts[date].aqi = dayInfo.avg;
              dailyForecasts[date].status = getAQIStatus(dayInfo.avg);
            }
          }
        });
      });
    }

    // CRITICAL: Overwrite today's data with actual real-time IAQI if available
    const today = new Date().toISOString().split('T')[0];
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
            no2: data.iaqi?.no2?.v ?? dailyForecasts[today]?.pollutants?.no2 ?? 0
        }
      };
    }

    const sortedForecast = Object.values(dailyForecasts).sort((a, b) => a.date.localeCompare(b.date));

    return {
      city: station.station.name,
      country: "",
      forecast: sortedForecast,
      sources: [
        { title: "World Air Quality Index Project (AQICN)", uri: "https://aqicn.org/" }
      ],
      isOfficialData: true
    };
  } catch (err: any) {
    console.error("AQICN Service Error:", err);
    throw new Error(err.message || "The air quality service is currently unreachable.");
  }
};
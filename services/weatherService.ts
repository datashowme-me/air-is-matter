import { ForecastResponse } from "../types";

export const fetchAQIForecast = async (
  cityQuery: string,
): Promise<ForecastResponse & { isOfficialData: boolean }> => {
  try {
    const response = await fetch(`/api/forecast?city=${encodeURIComponent(cityQuery)}`);
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.error || "The air quality service is currently unreachable.");
    }

    return payload;
  } catch (err: any) {
    console.error("Forecast API Error:", err);
    throw new Error(err.message || "The air quality service is currently unreachable.");
  }
};

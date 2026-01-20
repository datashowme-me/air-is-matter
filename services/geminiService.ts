import { GoogleGenAI, Type } from "@google/genai";
import { ForecastResponse, AQIDataPoint } from "../types";

const processEnvApiKey = process.env.API_KEY;

// Schema for the structured output we want from Gemini
const forecastSchema = {
  type: Type.OBJECT,
  properties: {
    city: { type: Type.STRING, description: "The resolved name of the city" },
    country: { type: Type.STRING, description: "The country of the city" },
    forecast: {
      type: Type.ARRAY,
      description: "Array of 14 daily AQI forecasts",
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
          aqi: { type: Type.NUMBER, description: "Predicted AQI value (US EPA Standard)" },
          status: { type: Type.STRING, description: "Health status (e.g. Good, Moderate)" },
          description: { type: Type.STRING, description: "Short weather/air description" },
          pollutants: {
            type: Type.OBJECT,
            description: "Daily average or maximum concentrations for key pollutants",
            properties: {
              pm2_5: { type: Type.NUMBER, description: "Particulate Matter < 2.5µm (μg/m³)" },
              pm10: { type: Type.NUMBER, description: "Particulate Matter < 10µm (μg/m³)" },
              co: { type: Type.NUMBER, description: "Carbon Monoxide (μg/m³)" },
              no2: { type: Type.NUMBER, description: "Nitrogen Dioxide (μg/m³)" },
              o3: { type: Type.NUMBER, description: "Ozone (μg/m³)" }
            }
          }
        },
        required: ["date", "aqi", "status", "description"]
      }
    },
    isOfficialData: { type: Type.BOOLEAN, description: "Whether official/real sensor data was used for the start of this forecast" }
  },
  required: ["city", "country", "forecast"]
};

// Helper to get coordinates for the city using Gemini
async function getCoordinates(city: string, ai: GoogleGenAI): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Return the latitude and longitude for ${city} in JSON format: { "lat": number, "lng": number }. Only return JSON.`,
      config: { responseMimeType: "application/json" }
    });
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to resolve coordinates", e);
    return null;
  }
}

// Helper to fetch official AQI data from Open-Meteo
// Docs: https://open-meteo.com/en/docs/air-quality-api
async function fetchOpenMeteoAQI(lat: number, lng: number): Promise<any> {
  // We request 'us_aqi' to match the US EPA standard used in the rest of the app.
  // We request 7 days of forecast data.
  // Added pollutants: pm10, pm2_5, carbon_monoxide (CO), nitrogen_dioxide (NO2), ozone (O3)
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&hourly=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone&timezone=auto&forecast_days=7`;
  
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`Open-Meteo API failed: ${response.status}`);
      return null;
    }
    
    return await response.json();
  } catch (e) {
    console.error("Error fetching Open-Meteo API", e);
    return null;
  }
}

export const fetchAQIForecast = async (cityQuery: string): Promise<ForecastResponse & { isOfficialData?: boolean }> => {
  if (!processEnvApiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: processEnvApiKey });
  let realData = null;
  let coords = null;

  // 1. Try to get coordinates and real data
  try {
    coords = await getCoordinates(cityQuery, ai);
    if (coords) {
      realData = await fetchOpenMeteoAQI(coords.lat, coords.lng);
    }
  } catch (e) {
    console.warn("Skipping real data fetch due to error", e);
  }

  // 2. Construct Prompt
  let prompt = "";
  
  if (realData) {
    prompt = `
      I have fetched real Open-Meteo Air Quality API forecast data for ${cityQuery} (7 days hourly data).
      
      Real Data Context (Open-Meteo): ${JSON.stringify(realData).substring(0, 25000)}... (truncated if too long)
      
      Task:
      1. Analyze the 'hourly' data from the context including us_aqi, pm10, pm2_5, carbon_monoxide, nitrogen_dioxide, and ozone.
      2. For the first 7 days, aggregate the hourly data into a single Daily object. 
         - For AQI: Use the MAXIMUM value of the day.
         - For Pollutants (PM2.5, PM10, etc.): Use the daily AVERAGE or MAXIMUM (whichever is more standard for health reporting) in μg/m³.
      3. For the remaining 7 days (to make a total of 14 days), generate a forecast based on the trend from the first week and historical patterns for ${cityQuery}.
      4. Return a standard 14-day AQI forecast JSON matching the schema.
      5. Set "isOfficialData" to true.
    `;
  } else {
    prompt = `
      I need the Air Quality Index (AQI) forecast for ${cityQuery} for the next 14 days starting from today.
      
      Please perform a Google Search to find the most accurate weather and air quality forecast. 
      Estimate the AQI and key pollutants (PM2.5, PM10, CO, NO2, O3) based on weather conditions if direct 14-day AQI data is not explicitly available. Prioritize real sources where possible.
      
      Return the data strictly in JSON format matching the provided schema. Set "isOfficialData" to false.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        // Use Google Search only if we didn't get real data.
        tools: realData ? [] : [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: forecastSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const parsedData = JSON.parse(text);
    
    // Extract sources for grounding transparency (if search was used)
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web?.uri && chunk.web?.title)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

    // If we used real data, add it as a source
    if (realData) {
      sources.unshift({ title: "Open-Meteo Air Quality API", uri: "https://open-meteo.com/en/docs/air-quality-api" });
    }

    const uniqueSources = sources.filter((v: any, i: any, a: any) => a.findIndex((t: any) => (t.uri === v.uri)) === i);

    return {
      ...parsedData,
      sources: uniqueSources,
      isOfficialData: parsedData.isOfficialData || !!realData
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to fetch forecast data. Please try again.");
  }
};
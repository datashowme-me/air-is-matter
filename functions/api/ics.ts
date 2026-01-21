import { fetchAQIForecast } from "../../services/weatherService";
import { generateICS } from "../../utils/icsGenerator";

export async function onRequest(context: any): Promise<Response> {
  const { request } = context;
  const url = new URL(request.url);

  const city = url.searchParams.get("city");
  if (!city) {
    return new Response("City parameter is required", { status: 400 });
  }

  try {
    const data = await fetchAQIForecast(city);
    const icsContent = generateICS(data);

    return new Response(icsContent, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="aqi-${city.replace(/\s+/g, '-')}.ics"`,
        "Cache-Control": "public, max-age=3600"
      },
    });
  } catch (error: any) {
    return new Response(`Error generating forecast: ${error.message}`, { status: 500 });
  }
}

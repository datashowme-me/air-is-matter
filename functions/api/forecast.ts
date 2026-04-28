import { fetchAQIForecastData } from "../../services/aqiService";

export async function onRequest(context: any): Promise<Response> {
  const { request } = context;
  const url = new URL(request.url);
  const city = url.searchParams.get("city");

  if (!city) {
    return Response.json({ error: "City parameter is required" }, { status: 400 });
  }

  try {
    const data = await fetchAQIForecastData(city);

    return Response.json(data, {
      headers: {
        "Cache-Control": "public, max-age=900",
      },
    });
  } catch (error: any) {
    return Response.json(
      { error: error.message || "The air quality service is currently unreachable." },
      { status: 500 },
    );
  }
}

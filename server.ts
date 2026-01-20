import { fetchAQIForecast } from "./services/weatherService";
import { generateICS } from "./utils/icsGenerator";

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);

    // Handle the dynamic ICS generation for calendar subscriptions
    if (url.pathname === "/api/ics") {
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

    // Otherwise, let Cloudflare serve the static assets (frontend)
    return env.ASSETS.fetch(request);
  },
};

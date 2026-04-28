import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fetchAQIForecastData } from './services/aqiService';
import { generateICS } from './utils/icsGenerator';

function localApiPlugin(): Plugin {
  const attachMiddleware = (middlewares: any) => {
    middlewares.use(async (req: any, res: any, next: () => void) => {
      if (!req.url) {
        next();
        return;
      }

      const url = new URL(req.url, 'http://localhost');
      const city = url.searchParams.get('city');

      if (url.pathname === '/api/forecast') {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');

        if (!city) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'City parameter is required' }));
          return;
        }

        try {
          const data = await fetchAQIForecastData(city);
          res.statusCode = 200;
          res.setHeader('Cache-Control', 'public, max-age=900');
          res.end(JSON.stringify(data));
        } catch (error: any) {
          res.statusCode = 500;
          res.end(
            JSON.stringify({
              error: error.message || 'The air quality service is currently unreachable.',
            }),
          );
        }
        return;
      }

      if (url.pathname === '/api/ics') {
        if (!city) {
          res.statusCode = 400;
          res.end('City parameter is required');
          return;
        }

        try {
          const data = await fetchAQIForecastData(city);
          const icsContent = generateICS(data);

          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
          res.setHeader(
            'Content-Disposition',
            `attachment; filename="aqi-${city.replace(/\s+/g, '-')}.ics"`,
          );
          res.setHeader('Cache-Control', 'public, max-age=3600');
          res.end(icsContent);
        } catch (error: any) {
          res.statusCode = 500;
          res.end(`Error generating forecast: ${error.message}`);
        }
        return;
      }

      next();
    });
  };

  return {
    name: 'local-api-plugin',
    configureServer(server) {
      attachMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      attachMiddleware(server.middlewares);
    },
  };
}

export default defineConfig({
  plugins: [react(), localApiPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('/react/')) return 'vendor-react';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('d3-') || id.includes('/d3/')) return 'vendor-d3';
            if (id.includes('lodash')) return 'vendor-lodash';
            if (id.includes('recharts')) return 'vendor-recharts';
          }
        },
      },
    },
  },
});

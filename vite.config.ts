import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // This is crucial: it replaces process.env.API_KEY in your code 
      // with the actual value from Cloudflare environment variables during build.
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});
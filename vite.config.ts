import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        // This proxy is for LOCAL DEVELOPMENT ONLY
        '/api/proxy': {
          target: env.BACKEND_API_URL, // Use the variable
          changeOrigin: true,
          // Rewrite the path to remove '/api/proxy' before sending to backend
          rewrite: (path) => path.replace(/^\/api\/proxy/, ''),
        },
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
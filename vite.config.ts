// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
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
        '/api': {
          target: env.BACKEND_API_URL, // Use the environment variable here
          changeOrigin: true,
          // If your backend doesn't expect the /api prefix, you can add this line:
          // rewrite: (path) => path.replace(/^\/api/, ''), 
        },
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
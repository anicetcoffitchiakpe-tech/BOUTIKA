import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Le front React tourne sur le port 5173 et proxifie les appels /api et /uploads
// vers l'API Boutika (port 5000). Cela évite les problèmes de CORS et de
// localhost côté navigateur (le preview passe par un hôte HTTPS).
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true, // autorise l'hôte du preview
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
});

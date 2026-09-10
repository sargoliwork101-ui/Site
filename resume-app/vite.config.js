import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // FIX (hosting): relative asset URLs (./assets/...) instead of absolute (/assets/...).
  // The built site then works unchanged at domain root, in any subdirectory,
  // on subdomains, and on any static host — no path editing needed.
  base: './',
  plugins: [react()],
  build: {
    // The admin panel + PDF libs are legitimately large; don't warn for them.
    chunkSizeWarningLimit: 1200,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    cors: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    cors: true,
  },
});

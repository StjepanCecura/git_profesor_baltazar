import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@engine': path.resolve(__dirname, 'src/engine'),
      '@scenes': path.resolve(__dirname, 'src/scenes'),
      '@task-file': path.resolve(__dirname, 'src/task-file'),
    }
  },
  server: {
    open: true,
    port: 3000,
    host: '0.0.0.0' // Allow access from local network (safe - only accessible on your WiFi)
  }
});
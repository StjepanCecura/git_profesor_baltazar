import { defineConfig } from 'vite'
import path from 'path';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  base: '/',
  resolve: {
    alias: {
      '@engine': path.resolve(__dirname, 'src/engine'),
      '@scenes': path.resolve(__dirname, 'src/scenes'),
      '@task-file': path.resolve(__dirname, 'src/task-file')
    }
  },
  optimizeDeps: {
    include: ['@mediapipe/camera_utils'] // Only include what you actually use
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    commonjsOptions: {
      include: [/@mediapipe\/camera_utils/, /node_modules/]
    }
  }
})
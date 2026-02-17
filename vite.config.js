import { defineConfig } from 'vite'
import path from 'path';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@engine': path.resolve(__dirname, 'src/engine'),
      '@scenes': path.resolve(__dirname, 'src/scenes'),
      '@task-file': path.resolve(__dirname, 'src/task-file')
    }
  }
})

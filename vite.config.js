import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        admin: path.resolve(rootDir, 'index.html'),
        aviatorGame: path.resolve(rootDir, 'aviator-game.html'),
      },
    },
  },
})

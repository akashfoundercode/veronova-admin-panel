import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

// Production Backend & Game API Target
const PROXY_TARGET = 'https://api.wingo4all.site'
// Local Development Target:
// const PROXY_TARGET = 'http://127.0.0.1:3010'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: PROXY_TARGET, changeOrigin: true, ws: true, secure: false },
      '/admin': { target: PROXY_TARGET, changeOrigin: true, ws: true, secure: false },
      '/bet': { target: PROXY_TARGET, changeOrigin: true, secure: false },
      '/betHistory': { target: PROXY_TARGET, changeOrigin: true, secure: false },
      '/bet_values': { target: PROXY_TARGET, changeOrigin: true, secure: false },
      '/history': { target: PROXY_TARGET, changeOrigin: true, secure: false },
      '/cashout': { target: PROXY_TARGET, changeOrigin: true, secure: false },
      '/multiplier': { target: PROXY_TARGET, changeOrigin: true, secure: false },
      '/getGameRules': { target: PROXY_TARGET, changeOrigin: true, secure: false },
      '/updateRoastMultiplier': { target: PROXY_TARGET, changeOrigin: true, secure: false },
      '/add_multiplier': { target: PROXY_TARGET, changeOrigin: true, secure: false },
      '/multiplier_update': { target: PROXY_TARGET, changeOrigin: true, secure: false },
      '/multiplier_delete': { target: PROXY_TARGET, changeOrigin: true, secure: false },
      '/updateGameRules': { target: PROXY_TARGET, changeOrigin: true, secure: false },
      '/updateBetValues': { target: PROXY_TARGET, changeOrigin: true, secure: false },
      '/fetch': { target: PROXY_TARGET, changeOrigin: true, secure: false },
      '/fetch_admin_set_Results': { target: PROXY_TARGET, changeOrigin: true, secure: false },
      '/colour_prediction-store': { target: PROXY_TARGET, changeOrigin: true, secure: false },
      '/future-result-store': { target: PROXY_TARGET, changeOrigin: true, secure: false },
      '/bets': { target: PROXY_TARGET, changeOrigin: true, secure: false },
      '/results': { target: PROXY_TARGET, changeOrigin: true, secure: false },
      '/last_five_result': { target: PROXY_TARGET, changeOrigin: true, secure: false },
      '/last_result': { target: PROXY_TARGET, changeOrigin: true, secure: false },
      '/win-amount': { target: PROXY_TARGET, changeOrigin: true, secure: false },
      '/bet_history': { target: PROXY_TARGET, changeOrigin: true, secure: false },
      '/getjilligame': { target: PROXY_TARGET, changeOrigin: true, secure: false },
      '/jilligame': { target: PROXY_TARGET, changeOrigin: true, secure: false },
      '/Aviator': { target: PROXY_TARGET, changeOrigin: true, secure: false },
      '/aviator': {
        target: PROXY_TARGET,
        changeOrigin: true,
        secure: false,
        bypass: (req) => {
          if (req.url && req.url.includes('aviator-game.html')) {
            return req.url
          }
        },
      },
      '/result_half_new.php': { target: 'http://127.0.0.1:3001', changeOrigin: true },
      '/result_insert_new.php': { target: 'http://127.0.0.1:3001', changeOrigin: true },
      '/socket.io': { target: PROXY_TARGET, changeOrigin: true, ws: true, secure: false },
    },
  },
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

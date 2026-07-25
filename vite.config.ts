import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      includeAssets: ['favicon.png', 'icons/apple-touch-icon.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,svg}'],
      },
      manifest: {
        name: '75 Hard Companion',
        short_name: '75 Hard',
        description:
          'Track your 75 Hard challenge — workouts, water, diet, reading, and progress photos, fully offline.',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        theme_color: '#030712',
        background_color: '#030712',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})

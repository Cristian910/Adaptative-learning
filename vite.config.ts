import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    // PWA: precachea todo el build (JS/CSS/HTML/lecciones ya están todas
    // bundleadas, así que no hace falta ninguna estrategia de red especial
    // para el contenido del curso) y agrega un manifest instalable. Las
    // llamadas a la IA (OpenAI) siguen necesitando red — offline, la app cae
    // a las explicaciones estáticas que ya tenía como fallback (ver
    // aiService.ts), así que no rompe nada, solo pierde el enriquecimiento.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon-32.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'JS Adaptive Learning',
        short_name: 'Adaptive',
        description:
          'Curso interactivo de JavaScript y TypeScript que se adapta en tiempo real a cómo vas aprendiendo.',
        theme_color: '#6366f1',
        background_color: '#0d0d1a',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Los chunks lazy más pesados (CodeMirror, recharts) superan el
        // límite default de precache de Workbox (2MB) — se sube el límite
        // en vez de excluirlos, porque justamente esos son los que más vale
        // la pena tener cacheados para que el editor de código y el
        // dashboard funcionen offline después de la primera visita.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  build: {
    rollupOptions: {
      output: {
        // Separa dependencias que cambian poco (vendors) del código propio
        // de la app: el navegador puede cachear ese chunk entre deploys
        // aunque el resto de la app se actualice seguido. CodeMirror NO va
        // acá a propósito — ya se carga aparte via React.lazy() en
        // AdaptiveLesson.tsx, y agruparlo con el resto de los vendors
        // volvería a meterlo en el chunk que se descarga siempre.
        manualChunks: {
          vendor: ['react', 'react-dom', 'zustand'],
          motion: ['framer-motion'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['**/node_modules/**', '**/e2e/**'],
  },
})

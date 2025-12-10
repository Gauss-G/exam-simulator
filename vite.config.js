import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['qrcode.jpg', 'questions/*.json'],
      manifest: {
        name: '模拟考试系统',
        short_name: '考试系统',
        description: '模拟考试、练习和学习系统，支持离线使用',
        theme_color: '#409eff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/exam-simulator/',
        scope: '/exam-simulator/',
        icons: [
          {
            src: '/exam-simulator/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/exam-simulator/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/exam-simulator/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,jpg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  base: '/exam-simulator/', // GitHub Pages 部署需要设置仓库名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
})

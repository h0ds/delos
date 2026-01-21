import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-recharts': ['recharts'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-ui': ['lucide-react'],
          // Feature chunks
          'chunk-markets': [
            './src/components/market/PolymarketCard.jsx',
            './src/components/market/KalshiCard.jsx',
            './src/components/charts/ProbabilityChart.jsx',
            './src/components/charts/VolumeChart.jsx'
          ],
          'chunk-analysis': [
            './src/components/charts/TrendAnalysisChart.jsx',
            './src/components/charts/CandlestickChart.jsx',
            './src/components/signals/SignalAnalyticsDashboard.jsx'
          ],
          'chunk-detail': [
            './src/components/pages/MarketDetailPage.jsx',
            './src/components/pages/MarketComparisonPage.jsx',
            './src/components/market/MarketFilterPanel.jsx'
          ],
          'chunk-skeletons': [
            './src/components/skeletons/MarketCardSkeleton.jsx',
            './src/components/skeletons/SignalListSkeleton.jsx',
            './src/components/skeletons/MarketDetailSkeleton.jsx'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 600,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false
      }
    }
  },
  ssr: {
    noExternal: []
  },
  server: {
    port: 5173
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    hmr: {
      overlay: true
    },
    watch: {
      usePolling: false
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  build: {
    // Forçar geração de hashes únicos para evitar cache
    rollupOptions: {
      output: {
        manualChunks: undefined,
        // Forçar hash em todos os arquivos para cache-busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Limpar diretório de build antes de cada build
    emptyOutDir: true,
    // Minificar para produção
    minify: 'terser',
    // CSS code splitting
    cssCodeSplit: true,
    // Forçar geração de sourcemaps (pode ajudar no debug)
    sourcemap: false,
    // Tamanho do chunk warning
    chunkSizeWarningLimit: 1000
  }
})


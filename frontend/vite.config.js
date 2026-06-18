import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy local para o backend durante dev
    proxy: {
      '/tile-url': 'http://localhost:8000',
      '/health':   'http://localhost:8000',
    }
  }
})

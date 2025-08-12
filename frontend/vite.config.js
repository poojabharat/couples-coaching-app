import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/health': 'http://localhost:8080',
      '/assessments': 'http://localhost:8080',
      '/submissions': 'http://localhost:8080',
      '/responses': 'http://localhost:8080',
      '/consents': 'http://localhost:8080',
      '/report': 'http://localhost:8080',
      '/plan': 'http://localhost:8080',
      '/export': 'http://localhost:8080',
      '/coach': 'http://localhost:8080'
    }
  }
})

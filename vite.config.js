import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // allow access from network & ngrok
    port: 5173,
    strictPort: true,
    cors: true,        // allow all origins for dev
    // disable host checking so ngrok is accepted
    allowedHosts: true
  },
})

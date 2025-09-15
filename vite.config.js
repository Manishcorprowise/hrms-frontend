import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',   // allow access from network & ngrok
      port: 5173,
      strictPort: true,
      cors: true,        // allow all origins for dev
      // disable host checking so ngrok is accepted
      allowedHosts: true
    },
    define: {
      // Make env variables available in the app
      __VITE_HRMS_KEY__: JSON.stringify(env.VITE_HRMS_KEY)
    }
  }
})

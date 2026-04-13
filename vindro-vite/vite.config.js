import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,
    },
    hmr: {
      // This forces the browser to connect to the correct HMR address
      host: 'localhost',
      protocol: 'ws',
      port: 5173,
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: 'localhost', // or use '0.0.0.0' to allow access on local network
    port: 5173         // optional: set custom port
  }
})

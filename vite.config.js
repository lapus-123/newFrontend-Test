import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    historyApiFallback: true, // ⬅️ This enables proper routing fallback in dev
  },
  build: {
    outDir: 'dist', // or whatever your output dir is
  }
})

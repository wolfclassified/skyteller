import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/skyteller/', // 👈 important for GitHub Pages
  server: {
    port: 3000
  }
})
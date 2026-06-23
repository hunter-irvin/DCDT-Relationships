import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { sites } from './build/sites-vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(), sites(), cloudflare()],
})

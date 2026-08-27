import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const page = (p) => fileURLToPath(new URL(p, import.meta.url))

// A multi-page build: every route is a real HTML file with its own React root,
// so there is no client-side router and no 404 rewrite needed on GitHub Pages.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/gel-rates/' : '/',
  plugins: [react()],
  server: { port: 5186 },
  build: {
    rollupOptions: {
      input: {
        dashboard: page('./index.html'),
        table: page('./table/index.html'),
        about: page('./about/index.html'),
      },
    },
  },
}))

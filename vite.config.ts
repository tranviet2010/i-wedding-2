import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from "vite-tsconfig-paths"
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), svgr({
    include: '**/src/assets/icons/*.svg?react',
    svgrOptions: {
      plugins: ["@svgr/plugin-jsx"]
    },
  }), tsconfigPaths()],
  server: {
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '192.168.1.100',
      '7e630e1b087f.ngrok-free.app'
    ]
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
})

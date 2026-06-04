import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import { createCcdUnoConfig } from '@ccd/unocss-preset'

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(createCcdUnoConfig({ root: import.meta.dirname, tsJsGlob: 'src/**/*.{js,ts}' })),
  ],
  clearScreen: false,
  server: {
    host: '127.0.0.1',
    port: 1420,
    strictPort: true,
  },
})

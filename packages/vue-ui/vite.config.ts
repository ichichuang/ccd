import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: [
        'vue',
        'vue-i18n',
        'primevue',
        'primevue/button',
        'primevue/config',
        'overlayscrollbars',
        'overlayscrollbars-vue',
        '@ccd/design-tokens',
      ],
    },
  },
})

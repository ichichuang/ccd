import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), vueJsx()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rolldownOptions: {
      external: [
        '@ccd/design-tokens',
        '@ccd/shared-utils',
        '@ccd/vue-hooks',
        'vue',
        'vue-i18n',
        'primevue',
        'overlayscrollbars',
        'overlayscrollbars-vue',
        /^primevue\/.+/,
      ],
    },
  },
})

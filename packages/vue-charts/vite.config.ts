import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const EXTERNAL_PACKAGES = [
  'vue',
  'vue-i18n',
  '@vueuse/core',
  'echarts',
  'vue-echarts',
  'zrender',
  '@ccd/design-tokens',
]

function isExternal(id: string): boolean {
  return EXTERNAL_PACKAGES.some(pkg => id === pkg || id.startsWith(`${pkg}/`))
}

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: isExternal,
      output: {
        chunkFileNames: '[name].js',
      },
    },
  },
})

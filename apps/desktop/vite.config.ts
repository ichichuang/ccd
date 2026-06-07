import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import { createCcdUnoConfig } from '@ccd/unocss-preset'
import {
  loadAppViteEnv,
  localViteHost,
  resolveAppRoot,
  resolveRepoRoot,
  resolveVitePort,
} from '../vite.shared'
import { createDesktopHtmlPlugin } from './build/html'

const desktopRoot = resolveAppRoot(import.meta.url)
const repoRoot = resolveRepoRoot(desktopRoot)

function resolveDesktopPort(mode: string): number {
  return resolveVitePort(loadAppViteEnv(mode, desktopRoot).VITE_DESKTOP_PORT, 'VITE_DESKTOP_PORT')
}

export default defineConfig(({ mode }) => {
  const desktopPort = resolveDesktopPort(mode)

  return {
    envDir: repoRoot,
    plugins: [
      createDesktopHtmlPlugin(),
      vue(),
      UnoCSS(createCcdUnoConfig({ root: desktopRoot, tsJsGlob: 'src/**/*.{js,ts}' })),
    ],
    clearScreen: false,
    server: {
      host: localViteHost,
      port: desktopPort,
      strictPort: true,
    },
  }
})

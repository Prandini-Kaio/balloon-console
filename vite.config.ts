import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const prodApiTarget = 'https://api.balloon.app.br'
const localApiTarget = 'http://localhost:8080'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = mode === 'proddev' ? prodApiTarget : localApiTarget
  const useProxy = mode === 'localdev' || mode === 'proddev'
  const base = env.VITE_BASE || '/'

  return {
    base,
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: useProxy
      ? {
          proxy: {
            '/api': {
              target: apiTarget,
              changeOrigin: true,
              secure: mode === 'proddev',
            },
          },
        }
      : undefined,
  }
})

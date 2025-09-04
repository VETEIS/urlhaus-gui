import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/urlhaus': {
        target: 'https://urlhaus-api.abuse.ch',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/urlhaus/, ''),
      },
    },
  },
})

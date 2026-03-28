import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },

  // vite代理服务器解决跨域响应问题
  server: {
    proxy: {
      // 将 /api 开头的请求代理到后端服务器
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,  // 修改请求头中的 Origin
        rewrite: (path) => path.replace(/^\/api/, '')  // 去掉 /api 前缀
      }
    }
  }
})

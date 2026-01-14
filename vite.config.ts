import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    open: true, // 在默认浏览器中打开
    proxy: {
      // 代理所有 API 请求到开发服务器
      // 可以根据实际需要调整匹配规则
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // 如果后端不需要 /user 前缀，可以取消注释下面的 rewrite
        // rewrite: (path) => path.replace(/^\/user/, ''),
      },
      // 如果所有 API 都走同一个网关，可以使用以下通用配置（取消注释即可）
      // '/api': {
      //   target: 'http://e-gw-dev.ycbg.com',
      //   changeOrigin: true,
      // },
    },
  },
})

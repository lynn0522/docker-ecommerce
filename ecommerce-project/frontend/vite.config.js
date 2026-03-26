// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       // ✅ 匹配所有/api开头的请求，转发到后端8084
//       '/api': {
//         target: 'http://localhost:8084', // 后端地址
//         changeOrigin: true, // 关键：模拟跨域请求头
//         secure: false, // 忽略HTTPS证书（开发环境）
//         // 可选：重写路径（如果后端接口有前缀）
//         // rewrite: (path) => path.replace(/^\/api/, '')
//       }
//     },
//     port: 5173, // React运行端口（保持不变）
//     open: true // 启动时自动打开浏览器
//   }
// });
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 1. 开发环境代理（保留，本地调试用）
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8084', 
        changeOrigin: true,
        secure: false,
      }
    },
    port: 5173,
    open: true
  },
  // 2. 生产构建配置（适配Nginx部署）
  base: './', // 核心：静态资源相对路径，解决404
  build: {
    outDir: 'dist', // 输出目录（默认）
    assetsDir: 'assets', // 静态资源目录
    rollupOptions: {
      // 确保路由匹配所有路径
      output: {
        manualChunks: undefined
      }
    }
  }
});
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  server: {
    open: '/src/html/index.html'
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'src/assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/html/index.html'),
        contact: resolve(__dirname, 'src/html/contact.html'),
        '404': resolve(__dirname, 'src/html/404.html'),
        'terms': resolve(__dirname, 'src/html/terms-and-conditions.html'),
        'privacy': resolve(__dirname, 'src/html/privacy-policy.html')
      }
    }
  }
});

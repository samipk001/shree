import { defineConfig } from 'vite';
import { resolve } from 'path';
import { promises as fs } from 'fs';

const copyStaticAssets = () => ({
  name: 'copy-static-assets',
  async closeBundle() {
    const outDir = resolve(__dirname, 'dist', 'assets');
    await fs.mkdir(outDir, { recursive: true });
    await fs.cp(resolve(__dirname, 'src', 'assets', 'libs'), resolve(outDir, 'libs'), { recursive: true });
    await fs.cp(resolve(__dirname, 'src', 'assets', 'js'), resolve(outDir, 'js'), { recursive: true });
    await fs.cp(resolve(__dirname, 'src', 'assets', 'data'), resolve(outDir, 'data'), { recursive: true });

    const htmlSrc = resolve(__dirname, 'dist', 'html');
    const htmlPages = [
      'index.html',
      'contact.html',
      'contact-preview.html',
      '404.html',
      'terms-and-conditions.html',
      'privacy-policy.html'
    ];

    for (const page of htmlPages) {
      await fs.copyFile(resolve(htmlSrc, page), resolve(__dirname, 'dist', page));
    }

    const publicFiles = ['robots.txt', 'sitemap.xml'];
    for (const file of publicFiles) {
      await fs.copyFile(resolve(__dirname, 'public', file), resolve(__dirname, 'dist', file));
    }
  }
});

export default defineConfig({
  root: 'src',
  publicDir: resolve(__dirname, 'public'),
  server: {
    open: '/html/index.html'
  },
  plugins: [copyStaticAssets()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/html/index.html'),
        contact: resolve(__dirname, 'src/html/contact.html'),
        '404': resolve(__dirname, 'src/html/404.html'),
        'terms': resolve(__dirname, 'src/html/terms-and-conditions.html'),
        'privacy': resolve(__dirname, 'src/html/privacy-policy.html'),
        'contact-preview': resolve(__dirname, 'src/html/contact-preview.html')
      }
    }
  }
});

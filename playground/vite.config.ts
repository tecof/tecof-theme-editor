import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname),
  plugins: [
    react({
      babel: {
        // Prevent browserslist from traversing up to home dir
        targets: 'defaults, not ie 11',
      },
    }),
  ],
  resolve: {
    alias: {
      '@tecof/theme-editor': path.resolve(__dirname, '../src/index.ts'),
    },
  },
  server: {
    port: 5555,
    open: true,
    hmr: {
      overlay: true,
    },
  },
});

import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    // Bundle visualizer — generates stats.html after `npm run build`
    visualizer({
      filename: 'dist/stats.html',
      open: false, // set to true to auto-open in browser after build
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    target: 'esnext',
    // Enable minification with esbuild (default) — fastest
    minify: 'esbuild',
    // Raise chunk-size warning to 600 kb so signal/noise stays useful
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Manual chunk splitting: keep heavy 3rd-party libs in dedicated chunks
        // so they are cached independently by the browser
        manualChunks: {
          'vendor-react':   ['react', 'react-dom', 'react-router-dom'],
          'vendor-query':   ['@tanstack/react-query'],
          'vendor-motion':  ['framer-motion'],
          'vendor-stripe':  ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          'vendor-recharts':['recharts'],
          'vendor-forms':   ['react-hook-form', 'zod', '@hookform/resolvers'],
        },
        // Content-hash asset file names for reliable cache-busting
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },

  // Optimise cold-start dependency pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      '@tanstack/react-query',
      'zustand',
      'axios',
    ],
  },
}));

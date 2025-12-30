import react from "@vitejs/plugin-react";
import tailwind from "tailwindcss";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  publicDir: "./static",
  base: "/",
  server: {
    port: 5173,
  },
  css: {
    postcss: {
      plugins: [tailwind()],
    },
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    include: ['buffer'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for better caching
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-radix';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            return 'vendor';
          }

          // Stable chunk names for critical screens
          if (id.includes('/screens/Notification/')) {
            return 'notification';
          }
          if (id.includes('/screens/Content/')) {
            return 'content';
          }
          if (id.includes('/screens/Treasury/')) {
            return 'treasury';
          }
          if (id.includes('/screens/Setting/')) {
            return 'setting';
          }
          if (id.includes('/screens/UserProfile/')) {
            return 'user-profile';
          }
          if (id.includes('/screens/Create/')) {
            return 'create';
          }
        },
        // More stable chunk file naming
        chunkFileNames: (chunkInfo) => {
          // Use consistent names for known chunks
          if (chunkInfo.name === 'notification') return 'assets/notification-[hash].js';
          if (chunkInfo.name === 'content') return 'assets/content-[hash].js';
          if (chunkInfo.name === 'treasury') return 'assets/treasury-[hash].js';
          if (chunkInfo.name === 'setting') return 'assets/setting-[hash].js';
          if (chunkInfo.name === 'user-profile') return 'assets/user-profile-[hash].js';
          if (chunkInfo.name === 'create') return 'assets/create-[hash].js';
          return 'assets/[name]-[hash].js';
        },
      },
    },
    // Enable source maps for production debugging (optional - can be disabled)
    sourcemap: false,
    // Minification settings
    minify: 'esbuild',
    // Target modern browsers for smaller bundle
    target: 'es2020',
    // Adjust chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
}));

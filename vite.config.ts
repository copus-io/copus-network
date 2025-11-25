import { screenGraphPlugin } from "@animaapp/vite-plugin-screen-graph";
import react from "@vitejs/plugin-react";
import tailwind from "tailwindcss";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  // Temporarily disabled screen-graph plugin due to parsing error
  plugins: [react()], // , mode === "development" && screenGraphPlugin()],
  publicDir: "./static",
  base: "/",
  server: {
    port: 5177,
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
}));

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    port: 3000,
    hmr: {
      host: 'localhost',
      protocol: 'ws',
      port: 3000,
      clientPort: 3000,
      path: '/ws',
      overlay: false,
    },
    strictPort: true,
    watch: {
      usePolling: false,
      interval: 1000,
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    viteCompression({ algorithm: 'gzip' }),
    viteCompression({ algorithm: 'brotliCompress' })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
}));

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: [
      '46f1-216-212-41-79.ngrok-free.app',
    ],
    hmr: {
      timeout: 120000,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('@radix-ui')) {
              return 'vendor-radix';
            }
            if (id.includes('@tiptap')) {
              return 'vendor-tiptap';
            }
            return 'vendor';
          }
        },
      },
    },
  },
  plugins: [
    react()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      '@tiptap/extension-image',
      '@tiptap/extension-link',
      '@tiptap/extension-text-align',
      '@tiptap/react',
      '@tiptap/starter-kit',
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
}));

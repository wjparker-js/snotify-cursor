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
      "a335-216-212-41-79.ngrok-free.app",
    ],
    hmr: {
      timeout: 120000,
    },
    headers: {
      'ngrok-skip-browser-warning': 'true',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, ngrok-skip-browser-warning',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        timeout: 5000,
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      },
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        timeout: 5000,
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 500,
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Separate large UI libraries
            if (id.includes('@radix-ui')) {
              return 'vendor-radix';
            }
            if (id.includes('@tiptap')) {
              return 'vendor-tiptap';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Group other vendor libraries
            return 'vendor';
          }
          // Separate our own components by feature
          if (id.includes('/components/ui/')) {
            return 'ui-components';
          }
          if (id.includes('/components/player/') || id.includes('/contexts/MediaPlayerContext')) {
            return 'player';
          }
          if (id.includes('/components/album/') || id.includes('/pages/Album')) {
            return 'album';
          }
        },
      },
    },
  },
  plugins: [
    react({
      // Enable React Fast Refresh for better dev experience
      fastRefresh: true,
    })
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
      'react',
      'react-dom',
      '@tanstack/react-query',
      'lucide-react',
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      target: 'esnext'
    }
  },
  esbuild: {
    // Enable tree shaking and dead code elimination
    treeShaking: true,
    // Optimize for speed in development
    ...(mode === 'development' && {
      target: 'esnext',
      format: 'esm'
    })
  }
}));

import { defineConfig } from 'vite';
import react       from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    chunkSizeWarningLimit: 400,
    // Vite 8 uses oxc minifier by default — don't override it
    sourcemap: false,
    target: 'es2020',

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/axios'))    return 'vendor-axios';
          if (id.includes('node_modules/react'))    return 'vendor-react';
        },
      },
    },
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'axios'],
  },
});

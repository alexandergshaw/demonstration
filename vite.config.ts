import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Cache the shared font pack independently of changes to the app's code.
        manualChunks: id => id.includes('portable-font-faces.css') ? 'fonts' : undefined,
      },
    },
  },
});

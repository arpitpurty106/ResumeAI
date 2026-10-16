
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/ResumeAI/',
  server: {
    port: 5173,
  },
  optimizeDeps: {
    include: ['pdfjs-dist/build/pdf'],
  },
});

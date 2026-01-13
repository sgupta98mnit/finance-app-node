import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/projects/fincore/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['sumit-gupta.cloud', 'www.sumit-gupta.cloud'],
  }
});

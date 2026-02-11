import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/projects/fincore/",
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: ["sumit-gupta.cloud", "www.sumit-gupta.cloud"],
  },
  preview: {
    host: true,
    port: 5173,
    strictPort: true,
  },
});


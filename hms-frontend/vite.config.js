import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    watch: {
      ignored: ["**/node_modules/**", "**/*.zip"],
    },
    proxy: {
      "/auth": {
        target: "http://localhost:7765",
        changeOrigin: true,
      },
    },
  },
});
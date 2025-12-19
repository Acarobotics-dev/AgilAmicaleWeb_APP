import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import strip from '@rollup/plugin-strip';

// vite.config.ts
export default defineConfig({
  server: {
    host: "localhost", // safe config
    port: 8080,
  },
  plugins: [react(),
    strip({
      include: ['**/*.(js|ts|jsx|tsx)'],
      functions: ['console.log', 'console.debug', 'console.warn', 'console.error'],
      debugger: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

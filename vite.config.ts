import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    ssr: true,
    minify: true,
    lib: {
      entry: "src/index.ts",
      name: "tswm",
      formats: ["es", "cjs"],
      fileName: (format) => `[name].${format}.js`,
    },
  },
});

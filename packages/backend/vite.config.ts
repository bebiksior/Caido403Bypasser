import { defineConfig } from "vite";
import { resolve } from "path";
import { builtinModules } from "module";
import ViteYaml from "@modyfi/vite-plugin-yaml";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "plugin-template-backend",
      fileName: (format) => "script.js",
      formats: ["es"],
    },
    outDir: "../../dist/backend",
    rollupOptions: {
      external: [/caido:.+/, ...builtinModules],
      output: {
        manualChunks: undefined,
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [ViteYaml()],
});
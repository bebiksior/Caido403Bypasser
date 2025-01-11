import { resolve } from "path";
import { mergeConfig } from "vite";
import baseConfig from "./vite.config.base";

export default mergeConfig(baseConfig, {
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.tsx"),
      name: "plugin-template-frontend",
      fileName: () => "script.js",
      formats: ["es"]
    },
    outDir: "../../dist/frontend",
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  define: {
    "process.env.NODE_ENV": '"production"'
  }
});

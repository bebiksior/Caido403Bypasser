import { defineConfig } from "@caido-community/dev";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import tailwindPrimeui from "tailwindcss-primeui";
import tailwindCaido from "@caido/tailwindcss";
import path from "path";
import prefixwrap from "postcss-prefixwrap";

const id = "bypasser";
export default defineConfig({
  id,
  name: "403Bypasser",
  description: "Bypass a 403 page with a set of templates",
  version: "1.4.0",
  author: {
    name: "bebiks",
    email: "bebiks@cvssadvisor.com",
    url: "https://github.com/bebiksior/Caido403Bypasser",
  },
  plugins: [
    {
      kind: "backend",
      id: "backend",
      root: "packages/backend",
    },
    {
      kind: "frontend",
      id: "frontend",
      root: "packages/frontend",
      backend: {
        id: "backend",
      },
      vite: {
        // @ts-expect-error
        plugins: [react()],
        build: {
          rollupOptions: {
            external: [
              "@caido/frontend-sdk",
              "@codemirror/autocomplete",
              "@codemirror/commands",
              "@codemirror/language",
              "@codemirror/lint",
              "@codemirror/search",
              "@codemirror/state",
              "@codemirror/view",
              "@lezer/common",
              "@lezer/highlight",
              "@lezer/lr",
            ],
          },
        },
        resolve: {
          alias: [
            {
              find: "@",
              replacement: path.resolve(__dirname, "packages/frontend/src"),
            },
          ],
        },
        css: {
          postcss: {
            plugins: [
              prefixwrap(`#plugin--${id}`),

              tailwindcss({
                corePlugins: {
                  preflight: false,
                },
                content: ["./packages/frontend/src/**/*.{ts,tsx}"],
                darkMode: ["selector", '[data-mode="dark"]'],
                plugins: [tailwindPrimeui, tailwindCaido],
              }),
            ],
          },
        },
      },
    },
  ],
});

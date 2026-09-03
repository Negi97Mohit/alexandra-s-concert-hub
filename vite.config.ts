import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      server: { entry: "server" },
      prerender: {
        routes: [
          "/",
          "/bio",
          "/season",
          "/gallery",
          "/media",
          "/press",
          "/contact",
        ],
      },
    }),
    nitro({
      preset: process.env.NITRO_PRESET || "netlify",
    }),
    viteReact(),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});

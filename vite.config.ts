import { o7Favicon } from "./src/lib/vite.ts";
import { sveltekit } from "@sveltejs/kit/vite";
import adapter from "@sveltejs/kit/adapter-static";
import { defineConfig } from "vite";
import PluginInspect from "vite-plugin-inspect";

export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter(),
    }),
    o7Favicon({ path: "./src/favicon.svg", webmanifest: { name: "test" } }),
    PluginInspect(),
  ],
});

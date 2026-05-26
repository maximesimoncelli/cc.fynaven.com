import { defineConfig } from "eslint/config";
import eslintPluginAstro from "eslint-plugin-astro";

export default defineConfig([
  ...eslintPluginAstro.configs.recommended,
  {
    rules: {},
  },
  {
    ignores: [
      "**/dist/**",
      "**/.astro/**",
      "**/.nx/**",
      "**/node_modules/**",
      "**/.wrangler/**",
    ],
  },
]);

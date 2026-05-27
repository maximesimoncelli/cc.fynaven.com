// @ts-check
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import vue from "@astrojs/vue";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField, fontProviders } from "astro/config";
import { loadEnv } from "vite";

const { PUBLIC_URL, PUBLIC_MEDIA_DOMAIN } = loadEnv(
  process.env.NODE_ENV ?? "development",
  process.cwd(),
  "",
);

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    server: {
      port: 4321,
      strictPort: true,
    },
  },
  env: {
    schema: {
      PUBLIC_URL: envField.string({ context: "client", access: "public" }),
      PUBLIC_MEDIA_URL: envField.string({
        context: "client",
        access: "public",
      }),
    },
  },
  image: {
    domains: [PUBLIC_MEDIA_DOMAIN],
  },
  site: PUBLIC_URL,
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Playfair Display",
      cssVariable: "--font-playfair",
      weights: [400, 600, 700],
    },
    {
      provider: fontProviders.adobe({
        id: "vkv3zwy",
      }),
      name: "Flegrei",
      cssVariable: "--font-flegrei",
      weights: [400],
    },
  ],
  adapter: cloudflare({
    imageService: "compile",
    remoteBindings: !!process.env.CI || process.env.NODE_ENV === "production",
  }),
  integrations: [sitemap(), vue()],
});

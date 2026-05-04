// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["nuxt-elysia", "@element-plus/nuxt", "@nuxtjs/tailwindcss"],
  nitro: {
    preset: "Bun",
  },
  vite: {
    optimizeDeps: {
      include: [
        "@vue/devtools-core",
        "@vue/devtools-kit",
        "@elysiajs/eden",
        "dayjs", // CJS
        "dayjs/plugin/*.js",
        "lodash-unified",
        "@lucide/vue",
      ],
    },
  },
});

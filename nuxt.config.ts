// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  devtools: { enabled: true },
  ui: {
    safelistColors: ['yellow', 'red', 'green', 'blue', 'gray'],
  },
  nitro: {
    preset: 'vercel',
  },
})

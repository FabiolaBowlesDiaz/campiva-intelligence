import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Al go-live (PER-29) cambiar a https://intelligence.campivacorp.com
  site: 'https://campiva-intelligence.pages.dev',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/styleguide'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});

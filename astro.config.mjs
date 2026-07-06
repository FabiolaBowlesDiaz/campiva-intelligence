import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://intelligence.campivacorp.com',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/styleguide'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});

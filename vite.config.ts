import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

function htmlMetaPlugin(): Plugin {
  return {
    name: 'html-meta-transform',
    transformIndexHtml(html) {
      try {
        const configPath = path.resolve(__dirname, 'src', 'store_config.json');
        if (fs.existsSync(configPath)) {
          const configRaw = fs.readFileSync(configPath, 'utf-8');
          const config = JSON.parse(configRaw);
          const settings = config.storeSettings || {};

          const heroTitle = settings.heroTitle || 'MONTE PORK';
          const heroSubtitle = settings.heroSubtitle || 'El Más Crujiente de la Región';
          const heroDescription =
            settings.heroDescription ||
            'Chicharrón de verdad, macerado por 24 horas y explotado al momento. Mofongos, combos del coro y las cervezas más frías de la comarca.';
          const fullTitle =
            settings.tabTitle && settings.tabTitle.trim() !== ''
              ? settings.tabTitle
              : `${heroTitle} | ${heroSubtitle}`;

          let updatedHtml = html;

          // Replace Title
          updatedHtml = updatedHtml.replace(
            /<title>(.*?)<\/title>/i,
            `<title>${fullTitle}</title>`
          );

          // Replace meta title
          updatedHtml = updatedHtml.replace(
            /<meta\s+name="title"\s+content="[^"]*"\s*\/?>/i,
            `<meta name="title" content="${fullTitle}" />`
          );

          // Replace meta description
          updatedHtml = updatedHtml.replace(
            /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
            `<meta name="description" content="${heroDescription}" />`
          );

          // Replace og:title
          updatedHtml = updatedHtml.replace(
            /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
            `<meta property="og:title" content="${fullTitle}" />`
          );

          // Replace og:description
          updatedHtml = updatedHtml.replace(
            /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
            `<meta property="og:description" content="${heroDescription}" />`
          );

          // Replace og:site_name
          updatedHtml = updatedHtml.replace(
            /<meta\s+property="og:site_name"\s+content="[^"]*"\s*\/?>/i,
            `<meta property="og:site_name" content="${heroTitle}" />`
          );

          // Replace twitter:title
          updatedHtml = updatedHtml.replace(
            /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
            `<meta name="twitter:title" content="${fullTitle}" />`
          );

          // Replace twitter:description
          updatedHtml = updatedHtml.replace(
            /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
            `<meta name="twitter:description" content="${heroDescription}" />`
          );

          return updatedHtml;
        }
      } catch (err) {
        console.warn('Could not inject dynamic metadata in HTML:', err);
      }
      return html;
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), htmlMetaPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

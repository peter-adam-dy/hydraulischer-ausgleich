import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { execSync } from 'child_process';

function gitInfo() {
  try {
    const hash = execSync('git rev-parse --short HEAD').toString().trim();
    const date = execSync('git log -1 --format=%cI').toString().trim();
    return { hash, date };
  } catch {
    return { hash: process.env.GIT_HASH ?? 'dev', date: process.env.GIT_DATE ?? new Date().toISOString() };
  }
}

const git = gitInfo();

export default defineConfig({
  define: {
    __GIT_HASH__: JSON.stringify(git.hash),
    __GIT_DATE__: JSON.stringify(git.date),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Hydraulischer Abgleich',
        short_name: 'HydAbgleich',
        description: 'DIY Berechnung der Ventilvoreinstellungen für den hydraulischen Abgleich',
        theme_color: '#228be6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
});

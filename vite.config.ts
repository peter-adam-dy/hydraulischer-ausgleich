import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';

function gitInfo() {
  // 1. Try reading .buildinfo.json (written by Dockerfile)
  try {
    if (existsSync('.buildinfo.json')) {
      const info = JSON.parse(readFileSync('.buildinfo.json', 'utf-8'));
      if (info.hash && info.hash !== 'unknown') return info;
    }
  } catch { /* ignore */ }

  // 2. Try git directly (works in local dev)
  try {
    const hash = execSync('git rev-parse --short HEAD').toString().trim();
    const date = execSync('git log -1 --format=%cI').toString().trim();
    return { hash, date };
  } catch { /* ignore */ }

  // 3. Fallback
  return { hash: 'prod', date: new Date().toISOString() };
}

const git = gitInfo();

const versionJson = JSON.stringify({ hash: git.hash, date: git.date });

function versionFilePlugin(): Plugin {
  return {
    name: 'version-file',
    configureServer(server) {
      server.middlewares.use('/version.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store');
        res.end(versionJson);
      });
    },
    writeBundle(options) {
      const dir = options.dir ?? 'dist';
      writeFileSync(`${dir}/version.json`, versionJson);
    },
  };
}

export default defineConfig({
  define: {
    __GIT_HASH__: JSON.stringify(git.hash),
    __GIT_DATE__: JSON.stringify(git.date),
  },
  plugins: [
    react(),
    versionFilePlugin(),
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
        navigateFallbackDenylist: [/^\/version\.json$/],
      },
    }),
  ],
});

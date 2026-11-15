import { defineConfig } from 'vite';

// Relative base: the built app works from any address (GitHub Pages sub-folder, Netlify, a USB stick…).
// Tests: the stitch-coverage tests walk tens of thousands of option combinations, so allow time.
export default defineConfig({ base: './', test: { testTimeout: 300000, hookTimeout: 120000, pool: 'forks', fileParallelism: false, teardownTimeout: 120000 } });

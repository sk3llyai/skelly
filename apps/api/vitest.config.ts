import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

// NestJS relies on decorator metadata (reflect-metadata). esbuild — Vitest's default
// transformer — does not emit it, so we transform with SWC, which does. This is the
// standard NestJS + Vitest setup and lets us test DI-wired providers and controllers.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});

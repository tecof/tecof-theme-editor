import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/email/index.ts'],
  outDir: 'dist/email',
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: false,
  treeshake: true,
  platform: 'neutral',
  target: 'es2020',
});

import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/components/UnderConstruction.tsx'],
  format: ['esm', 'cjs'],
  dts: true,
  // Enable code splitting so lazily-imported heavy fields (Monaco / TipTap /
  // FilePond) are emitted as separate on-demand chunks in the ESM output
  // instead of being inlined into the main bundle. (esbuild only splits ESM;
  // the CJS build stays monolithic by design.)
  splitting: true,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    '@tiptap/core',
    '@tiptap/pm',
    '@tiptap/react',
    'lucide-react',
    'lucide-react/dynamic',
    'lucide-react/dynamicIconImports',
  ],
  treeshake: true,
  injectStyle: true,
});

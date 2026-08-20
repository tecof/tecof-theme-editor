import { defineConfig } from 'tsup';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  entry: ['src/index.ts', 'src/components/UnderConstruction.tsx'],
  format: ['esm', 'cjs'],
  dts: true,
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
  /**
   * clsx / immer / zustand `dependencies`tedir ÇÜNKÜ public `dist/index.d.ts`
   * onların tiplerini sızdırır (`zustand.UseBoundStore<StoreApi<UiState>>`,
   * `immer.Patch`, `clsx.ClassValue`). devDependency oldukları sürece tüketici
   * onları KURMUYORDU ve tip çözümü yalnız tesadüfen (başka bir paketin
   * hoist'lediği kopya sayesinde) çalışıyordu — mova'da `@react-three/fiber`
   * kaldırılınca `useUiStore` sessizce `any`'ye düştü.
   *
   * `noExternal` ile runtime davranışı AYNEN korunur: bu üçü dist'e gömülü
   * kalır (tek store örneği garantisi), package.json kaydı yalnız tiplerin
   * çözülmesini sağlar.
   */
  noExternal: ['clsx', 'immer', 'zustand'],
  treeshake: true,
  injectStyle: true,
  async onSuccess() {
    const distDir = path.resolve(__dirname, 'dist');
    if (!fs.existsSync(distDir)) return;
    const getAllFiles = (dir: string): string[] => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const files: string[] = [];
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...getAllFiles(fullPath));
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }
      return files;
    };

    const files = getAllFiles(distDir);
    for (const filePath of files) {
      if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (!content.startsWith("'use client'") && !content.startsWith('"use client"')) {
          fs.writeFileSync(filePath, `'use client';\n${content}`);
        }
      }
    }
  },
});

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(root, 'playground/public');
const markdownDirectory = path.join(outputDirectory, 'ai');
const baseUrl = process.env.TECOF_DOCS_URL?.replace(/\/+$/, '') ?? '';

const pageLinks = [
  ['Genel bakış', 'giris', 'Paketin amacı, temel kavramlar ve mimari yaklaşım.'],
  ['Kurulum', 'kurulum', 'Gereksinimler, paket kurulumu, CSS ve provider yapılandırması.'],
  ['Hızlı başlangıç', 'hizli-baslangic', 'Config, editör ve public renderer ile ilk entegrasyon.'],
  ['Studio arayüzü', 'studio', 'Canvas, paneller, autosave, önizleme ve editör prop’ları.'],
  ['Bileşen config’i', 'bilesen-config', 'Component registry, dinamik alanlar ve drop kuralları.'],
  ['Alan bileşenleri', 'alanlar', 'Yerleşik ve gelişmiş field factory referansı.'],
  ['Slotlar ve şablonlar', 'slotlar-sablonlar', 'Zone modeli, yatay slot ve bölüm şablonları.'],
  ['Tailwind stil editörü', 'tailwind-stil', 'Token modeli, responsive varyantlar ve safelist.'],
  ['Canlı tema', 'tema', 'Renk, tipografi, spacing ve CSS değişkenleri.'],
  ['Public render', 'render', 'TecofRender, CMS data ve TecofPicture kullanımı.'],
  ['API Client', 'api-client', 'Sayfa, medya, merchant ve çeviri API metotları.'],
  ['iframe entegrasyonu', 'iframe', 'Güvenli postMessage protokolü ve hostOrigin.'],
  ['İzinler ve migration', 'izinler-migration', 'Node izinleri ve şema yükseltme akışı.'],
  ['Klavye kısayolları', 'kisayollar', 'Studio komutları, seçim ve clipboard.'],
  ['Sorun giderme', 'sorun-giderme', 'Production entegrasyon kontrol listesi.'],
];

const sourceDocs = [
  {
    slug: 'ai-guide',
    title: 'AI Entegrasyon Rehberi',
    file: 'docs/AI_GUIDE.md',
    description: 'AI asistanları için normatif özet, kurallar ve hızlı teşhis.',
  },
  {
    slug: 'package-reference',
    title: 'Tam Paket Referansı',
    file: 'README.md',
    description: 'Kurulum, bileşenler, alanlar, API ve Studio özelliklerinin tam referansı.',
  },
  {
    slug: 'tailwind',
    title: 'Tailwind Entegrasyonu',
    file: 'docs/TAILWIND.md',
    description: 'Token derleme, safelist, arbitrary değer ve breakpoint ayrıntıları.',
  },
  {
    slug: 'architecture',
    title: 'Teknik Mimari',
    file: 'ARCHITECTURE.md',
    description: 'Engine, state, drag-and-drop, canvas ve uygulanan modüller.',
  },
  {
    slug: 'permissions',
    title: 'İzinler ve Migration',
    file: 'docs/PERMISSIONS.md',
    description: 'Permissions izin katmanları, resolvePermissions ve MigrationConfig şema yükseltme akışı.',
  },
];

const link = (target) => (baseUrl ? `${baseUrl}${target}` : target);

const llmsIndex = `# Tecof Theme Editor

> React tabanlı Tecof görsel sayfa editörü, yayın renderer'ı, API istemcisi ve gelişmiş içerik alanları için Türkçe geliştirici dokümantasyonu.

Belgelenen paket: \`@tecof/theme-editor@0.0.45\`.
Editör ve public renderer aynı \`StudioConfig\` nesnesini kullanmalıdır.
Bilinmeyen API'ler varsayılmamalı; tam bağlam için önce AI rehberi veya ilgili referans okunmalıdır.

## Başlangıç ve temel kullanım

${pageLinks
  .slice(0, 3)
  .map(([title, slug, description]) => `- [${title}](${link(`/#/${slug}`)}): ${description}`)
  .join('\n')}

## Editör ve tasarım sistemi

${pageLinks
  .slice(3, 9)
  .map(([title, slug, description]) => `- [${title}](${link(`/#/${slug}`)}): ${description}`)
  .join('\n')}

## Yayınlama ve entegrasyon

${pageLinks
  .slice(9, 13)
  .map(([title, slug, description]) => `- [${title}](${link(`/#/${slug}`)}): ${description}`)
  .join('\n')}

## Referans

${pageLinks
  .slice(13)
  .map(([title, slug, description]) => `- [${title}](${link(`/#/${slug}`)}): ${description}`)
  .join('\n')}
- [Tam AI bağlamı](${link('/llms-full.txt')}): Tüm normatif rehber ve teknik referansların birleştirilmiş Markdown sürümü.

## Makine tarafından okunabilir kaynaklar

${sourceDocs
  .map(
    (doc) =>
      `- [${doc.title}](${link(`/ai/${doc.slug}.md`)}): ${doc.description}`,
  )
  .join('\n')}

## Optional

- [GitHub deposu](https://github.com/tecof/tecof-theme-editor): Kaynak kod, issue ve sürüm geçmişi.
`;

const fullParts = await Promise.all(
  sourceDocs.map(async (doc) => {
    const content = await readFile(path.join(root, doc.file), 'utf8');
    return `\n\n---\n\n<!-- Source: ${doc.file} -->\n\n${content.trim()}`;
  }),
);

const llmsFull = `# Tecof Theme Editor — Tam AI Bağlamı

> Bu dosya @tecof/theme-editor için AI odaklı rehberi ve repository teknik belgelerini tek bir Markdown bağlamında birleştirir.

- Sürüm: 0.0.45
- Dil: Türkçe
- Kaynak önceliği: AI_GUIDE.md → README.md → docs/TAILWIND.md → ARCHITECTURE.md
- Çelişki halinde kod ve exported TypeScript tipleri son doğruluk kaynağıdır.
${fullParts.join('')}
`;

const mcpManifest = {
  name: 'tecof-theme-editor-docs',
  version: '0.0.45',
  documents: sourceDocs,
};

await mkdir(markdownDirectory, { recursive: true });

const sourceCopies = sourceDocs.map(async (doc) => {
  const content = await readFile(path.join(root, doc.file), 'utf8');
  await writeFile(path.join(markdownDirectory, `${doc.slug}.md`), content, 'utf8');
});

await Promise.all([
  ...sourceCopies,
  writeFile(path.join(outputDirectory, 'llms.txt'), llmsIndex, 'utf8'),
  writeFile(path.join(outputDirectory, 'llms-full.txt'), llmsFull, 'utf8'),
  writeFile(
    path.join(outputDirectory, 'mcp-manifest.json'),
    `${JSON.stringify(mcpManifest, null, 2)}\n`,
    'utf8',
  ),
]);

process.stderr.write(
  `AI dokümanları oluşturuldu: ${path.relative(root, outputDirectory)}/llms.txt, llms-full.txt\n`,
);

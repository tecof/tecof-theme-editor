import type { ColorScheme } from '../../studio/theme/darkMode';

/**
 * "Powered by Tecof" bandının SAF çözümleyicileri.
 *
 * Kanca (usePoweredBy) DOM'a ve SWR'a, bileşen (PoweredBy) efektlere dokunur;
 * karar mantığı burada React'siz durur ki jsdom'suz vitest ile birebir test
 * edilsin ve sunucu/istemci aynı fonksiyondan aynı sonucu üretsin (hidrasyon
 * eşitliği). Öznitelik/sınıf adları core'un eski `PoweredByBand` bileşeniyle
 * ve backend testleriyle AYNI tutulur — admin şablon/stilleri değişmeden çalışır.
 */

/** Bandın açık/koyu modu — paketin dark-mode şemasıyla aynı tip. */
export type PoweredByMode = ColorScheme;

/**
 * Backend `poweredByBand.ts` çıktısı — dil × mod için DERLENMİŞ HTML; tema
 * yalnız basar. `GET /api/store/merchant-info` yanıtında `poweredBy` alanıdır.
 */
export interface PoweredByBandData {
  /** dil → { light, dark } derlenmiş HTML */
  html: Record<string, { light: string; dark: string }>;
  css: string | null;
  js: string | null;
  /** şablon+stil+script sha1(12) — CSS/JS enjeksiyonunun tekilleştirme anahtarı */
  version?: string;
}

/* ─── Sabitler (index'e çıkmaz) ─── */

/** Band varken body'ye eklenir; temanın sabit `[data-powered-by]` rozeti bununla gizlenir. */
export const POWERED_BAND_BODY_CLASS = 'has-powered-band';
export const POWERED_BAND_STYLE_ATTR = 'data-powered-band-style';
export const POWERED_BAND_SCRIPT_ATTR = 'data-powered-band-script';
/** merchant-info SWR tekilleştirme aralığı — backend'in 10 dk merchant-info cache'iyle hizalı. */
export const MERCHANT_INFO_DEDUPE_MS = 600_000;

/* ─── Dil ─── */

export interface PickLocaleInput {
  /** `locale` prop'u — her şeyi ezer. */
  prop?: string | null;
  /** Studio aktif dili (`useActiveLanguage`); boş string yok sayılır. */
  activeLanguage?: string | null;
  /** `document.documentElement.lang` — mount sonrası okunur. */
  documentLang?: string | null;
  /** merchant-info `defaultLanguage`. */
  defaultLanguage?: string | null;
  /** `band.html` anahtarları. */
  available: string[];
}

/**
 * Bir dil etiketinin band anahtarlarında karşılığı: önce birebir, sonra küçük
 * harf, sonra bölge eki atılmış hali (`tr-TR` → `tr-tr` → `tr`). Backend band
 * anahtarları merchant dil kodlarıdır (`tr`, `en`); `<html lang>` ise çoğu
 * temada bölgeli gelir — bu yüzden normalizasyon burada, tek yerde yapılır.
 */
function matchAvailable(raw: string | null | undefined, available: string[]): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  const base = lower.split(/[-_]/)[0];
  for (const candidate of [trimmed, lower, base]) {
    if (!candidate) continue;
    const exact = available.find((a) => a === candidate);
    if (exact) return exact;
    const loose = available.find((a) => a.toLowerCase() === candidate);
    if (loose) return loose;
  }
  return null;
}

/**
 * Dil seçimi: prop > Studio aktif dili > belge dili > varsayılan dil > ilk
 * anahtar. Aday `available` içinde yoksa sıradaki denenir; liste boşsa null.
 */
export function pickLocale(input: PickLocaleInput): string | null {
  const { available } = input;
  if (!available.length) return null;
  return (
    matchAvailable(input.prop, available) ??
    matchAvailable(input.activeLanguage, available) ??
    matchAvailable(input.documentLang, available) ??
    matchAvailable(input.defaultLanguage, available) ??
    available[0]
  );
}

/* ─── Mod ─── */

export interface PickModeInput {
  /** `mode` prop'u — her şeyi ezer (SSR'da flaşsız tek varyant için). */
  prop?: PoweredByMode | null;
  /** `<html class="dark">` var mı. */
  classDark: boolean;
  /** Sayfada `script[data-tecof-darkmode]` var mı (paketin class stratejisi aktif). */
  classStrategy: boolean;
  /** `prefers-color-scheme: dark` eşleşiyor mu. */
  prefersDark: boolean;
}

/**
 * Mod seçimi. Class stratejisi aktifken `.dark` yoksa ziyaretçi AÇIKÇA açık
 * modu seçmiştir (ya da temanın varsayılanı odur); OS tercihi bunu ezmemeli —
 * aksi halde sayfa açık, band koyu görünürdü.
 */
export function pickMode(input: PickModeInput): PoweredByMode {
  if (input.prop === 'light' || input.prop === 'dark') return input.prop;
  if (input.classDark) return 'dark';
  if (input.classStrategy) return 'light';
  return input.prefersDark ? 'dark' : 'light';
}

/* ─── Band ─── */

export interface ResolvedBand {
  /** Gerçekten seçilen anahtar (istenen dil yoksa düşülen dil). */
  locale: string;
  html: { light: string; dark: string };
}

/**
 * Core'un `band.html[locale] || band.html[defaultLanguage] || ilk` sırası
 * birebir. `band` yoksa ya da `html` boşsa null.
 */
export function resolveBand(
  band: PoweredByBandData | null | undefined,
  locale: string | null,
  defaultLanguage?: string | null,
): ResolvedBand | null {
  if (!band || !band.html || typeof band.html !== 'object') return null;
  const keys = Object.keys(band.html);
  if (!keys.length) return null;
  for (const key of [locale, defaultLanguage, keys[0]]) {
    if (!key) continue;
    const html = band.html[key];
    if (html && typeof html === 'object') {
      return { locale: key, html: { light: html.light ?? '', dark: html.dark ?? '' } };
    }
  }
  return null;
}

export interface BandVisibilityInput {
  band: PoweredByBandData | null | undefined;
  showPoweredBy?: boolean;
  isSuspended?: boolean;
  isUnderConstruction?: boolean;
}

/**
 * Gizleme koşulları tek yerde. Bayraklar `undefined` iken band görünür —
 * sunucu (`merchant-info`) hak/askı/yapım süzgecini zaten uygulamıştır;
 * eski backend bu alanları hiç döndürmez.
 */
export function isBandVisible(input: BandVisibilityInput): boolean {
  const { band } = input;
  if (!band || !band.html || !Object.keys(band.html).length) return false;
  if (input.showPoweredBy === false) return false;
  if (input.isSuspended === true) return false;
  if (input.isUnderConstruction === true) return false;
  return true;
}

/* ─── CSS / JS ─── */

/**
 * Temanın sabit "Powered by" rozeti (`[data-powered-by]`) band varken gizlenir.
 * `has-powered-band` body sınıfı yalnız efektte (hidrasyon sonrası) geldiği
 * için README'deki `.has-powered-band [data-powered-by]` kuralı ilk HTML'de
 * etkisizdi: SSR/JS'siz görünümde iki rozet üst üste basılıyordu. Bu kural
 * bandın kendi `<style>`'ında olduğundan yalnız band görünürken uygulanır.
 */
const HIDE_STATIC_BADGE_CSS = '[data-powered-by]{display:none}';

/**
 * Tek varyant: iki varyant da DOM'da durur, görünürlük `hidden` özniteliğiyle
 * seçilir (innerHTML yeniden basılmaz → admin JS'inin bağladığı dinleyiciler
 * yaşar). ÜÇ öznitelikli seçici core'un eski `globals.css` kuralından
 * (`[data-powered-band][data-mode="dark"]{display:none}`, iki öznitelik) daha
 * özgül — host eski kuralı silmese bile aktif band gizlenmez; `hidden` kuralı
 * aynı özgüllükte ve sonra geldiği için pasif varyant kesin gizlenir.
 */
const SINGLE_BASE_CSS =
  '[data-powered-band][data-single][data-mode]{display:block}' +
  '[data-powered-band][data-single][hidden]{display:none}';

/**
 * İki varyant: core `globals.css` paritesi — JS'siz/SSR'da ziyaretçinin OS
 * şemasına göre biri görünür, sıfır flaş.
 */
const BOTH_BASE_CSS =
  '[data-powered-band][data-mode="dark"]{display:none}' +
  '@media (prefers-color-scheme: dark){' +
  '[data-powered-band][data-mode="light"]{display:none}' +
  '[data-powered-band][data-mode="dark"]{display:block}' +
  '}';

/** Taban kural + sabit rozet gizleme + admin CSS'i; admin CSS'i yoksa yalnız taban. */
export function buildBandCss(css: string | null | undefined, renderBoth: boolean): string {
  const base = `${renderBoth ? BOTH_BASE_CSS : SINGLE_BASE_CSS}${HIDE_STATIC_BADGE_CSS}`;
  const admin = css?.trim();
  return admin ? `${base}\n${admin}` : base;
}

/** Script tekilleştirme anahtarı: `version` yoksa JS uzunluğu (eski backend). */
export function bandScriptVersion(version: string | null | undefined, js: string): string {
  return version || String(js.length);
}

/** Sürüm başına tek çalıştırma için aranan seçici. */
export function bandScriptSelector(version: string | null | undefined, js: string): string {
  const v = bandScriptVersion(version, js).replace(/["\\]/g, '\\$&');
  return `script[${POWERED_BAND_SCRIPT_ATTR}][data-version="${v}"]`;
}

import type { UploadedFile } from '../types';

/* ─── Çok dilli medya yardımcıları ───
 *
 * `createLocalizedUploadField` değeri `[{ code, value: UploadedFile[] }]`
 * biçimindedir. Bu modül React'siz, saf mantıktır: hem Inspector'daki alan
 * (normalize / dil başına yazma / Hızlı Doldur) hem TEMA render'ı
 * (`resolveLocalizedUpload`) aynı kuralları buradan alır; iki tarafın "boş dil"
 * yorumu ayrışamaz.
 *
 * Neden core `getL` yetmiyor: `getL` bir diziyi her zaman "dolu" sayar
 * (`[] !== ""`), oysa burada BOŞ DİZİ = "bu dilde dosya yok" demektir ve
 * varsayılan dile düşmelidir. Bu yüzden özel çözümleyici gerekir.
 */

/** Dil başına dosya listesi. Boş dizi = bu dilde dosya yok → yedek zinciri. */
export interface LocalizedUploadFieldValue {
  /** Dil kodu ("tr" | "en" | …) */
  code: string;
  /** O dilin dosyaları; odak noktası dosya nesnesinin içinde kalır. */
  value: UploadedFile[];
}

export interface LocalizedUploadLanguages {
  languages: string[];
  defaultLanguage: string;
}

/* ── İç yardımcılar ── */

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);

/** `{ code, value }` öğesi mi? Biçim kontrolüdür; `value`'nun tipi burada denetlenmez. */
const isLocalizedItem = (item: unknown): item is { code: string; value: unknown } =>
  isPlainObject(item) && typeof item.code === 'string' && 'value' in item;

/**
 * Eski kayıtlarda alan düz dosya adı (string) olabiliyordu; `UploadField.impl`
 * bunu aynı yedek nesneyle sarar. Aynı biçimi üretiyoruz ki iki alan arasında
 * geçiş yapan bir tema farklı kayıt görmesin.
 */
const legacyFile = (name: string): UploadedFile => ({
  _id: 'legacy',
  name,
  size: 0,
  type: 'image/jpeg',
});

/**
 * Tek bir dilin (ya da düz alanın) ham değerini dosya listesine çevirir.
 * Dizi olduğu gibi döner (kopyalanmaz — girdi hiçbir yerde mutasyona uğramaz,
 * kopya gereksiz); tek nesne sarılır; string eski kayıt; gerisi boş.
 */
const toFileList = (raw: unknown): UploadedFile[] => {
  if (Array.isArray(raw)) return raw as UploadedFile[];
  if (typeof raw === 'string') return raw ? [legacyFile(raw)] : [];
  if (isPlainObject(raw)) return [raw as unknown as UploadedFile];
  return [];
};

const filesOf = (values: LocalizedUploadFieldValue[], code: string): UploadedFile[] =>
  values.find(v => v.code === code)?.value ?? [];

/* ── Dışa açık API ── */

/**
 * Ham değer `[{code, value}]` biçiminde mi? En az bir `{code, value}` öğesi
 * yeterlidir; bozuk kardeş öğeleri `normalizeLocalizedUpload` düşürür.
 * `[]` → false: boş dizi belirsizdir (düz mü, dilli mi bilinemez) ama iki
 * yorum da aynı sonuca (tüm diller boş) çıktığı için ayrım gerekmez.
 */
export function isLocalizedUploadValue(value: unknown): value is LocalizedUploadFieldValue[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.some(isLocalizedItem);
}

/**
 * Her giriş biçimini `[{code, value: UploadedFile[]}]`'e çevirir.
 *
 * Sıra: önce merchant dilleri (hepsi mevcut; kayıtta yoksa `value: []`),
 * ardından kayıtta bulunan ama merchant listesinde olmayan kodlar. Bilinmeyen
 * kodlar bilinerek KORUNUR: merchant bir dili geçici kapatınca o dilin
 * görselleri kaybolmasın (`LinkField` bunları düşürür; buradaki fark bilinçli).
 *
 * Göç tembeldir: bu fonksiyon yalnız bellekte çevirir, kayda yazmaz. Düz
 * `UploadedFile[]` (eski alan / AI çıktısı) varsayılan dilin altına gider ve
 * kullanıcının ilk düzenlemesinde yeni biçimde kaydedilir.
 *
 * Aynı kod iki kez geçerse İLKİ kazanır: kayıt sırası kullanıcının gördüğü
 * sıradır, sonradan eklenen kopya sessizce öncekini ezmemeli.
 *
 * `langs` verilmezse yalnız kayıttaki kodlar döner (tema tarafı bunu kullanır;
 * render'da merchant dil listesi yoktur).
 */
export function normalizeLocalizedUpload(
  value: unknown,
  langs?: LocalizedUploadLanguages,
): LocalizedUploadFieldValue[] {
  const defaultLanguage = langs?.defaultLanguage || 'tr';
  const byCode = new Map<string, UploadedFile[]>();

  if (isLocalizedUploadValue(value)) {
    for (const item of value) {
      if (!isLocalizedItem(item)) continue; // code'suz / bozuk öğe düşer
      if (byCode.has(item.code)) continue; // ilki kazanır
      byCode.set(item.code, toFileList(item.value));
    }
  } else {
    const flat = toFileList(value);
    if (flat.length > 0) byCode.set(defaultLanguage, flat);
  }

  const ordered: LocalizedUploadFieldValue[] = [];
  const seen = new Set<string>();
  for (const code of langs?.languages ?? []) {
    if (seen.has(code)) continue;
    seen.add(code);
    ordered.push({ code, value: byCode.get(code) ?? [] });
  }
  for (const [code, files] of byCode) {
    if (seen.has(code)) continue;
    seen.add(code);
    ordered.push({ code, value: files });
  }
  return ordered;
}

/**
 * Tek dilin listesini değiştirir; kod yoksa sona ekler; diğer diller aynı
 * referansla kalır. Her zaman YENİ dış dizi döner (girdi mutasyona uğramaz)
 * — Puck/Zustand değişikliği referans karşılaştırmasıyla anlar.
 */
export function setLocalizedUploadFiles(
  values: LocalizedUploadFieldValue[],
  code: string,
  files: UploadedFile[],
): LocalizedUploadFieldValue[] {
  const idx = values.findIndex(v => v.code === code);
  if (idx < 0) return [...values, { code, value: files }];
  const next = values.slice();
  next[idx] = { ...next[idx], value: files };
  return next;
}

/**
 * Kopyalamanın hedef alacağı BOŞ dil kodları (merchant sırasıyla). Kayıtta hiç
 * olmayan dil de boş sayılır. `exceptCode` (genelde kaynak dil) listeden çıkar.
 * Düğmenin disabled hesabı ve ipucu satırı bunu kullanır.
 */
export function emptyLocalizedUploadCodes(
  values: LocalizedUploadFieldValue[],
  languages: string[],
  exceptCode?: string,
): string[] {
  return languages.filter(code => code !== exceptCode && filesOf(values, code).length === 0);
}

/**
 * Hızlı Doldur: kaynak dildeki dosyaları BOŞ dillere kopyalar. Dolu dillerin
 * üzerine YAZMAZ — dil başına farklı görsel çoğu zaman bilinçli bir seçimdir
 * ve sessiz üzerine yazma iş kaybettirir (`LanguageField`'ın "tümüne kopyala"
 * davranışından bilinçli fark).
 *
 * Dosya nesneleri `{...file}` ile sığ klonlanır: diller referans paylaşmasın
 * ki birinde odak noktası değişince diğeri etkilenmesin. `_id` aynı kalır —
 * aynı CDN dosyasıdır, sunucuda kopya yoktur.
 *
 * Kaynak boşsa ya da boş hedef yoksa AYNI referans döner; çağıran bunu
 * "değişiklik yok" sinyali olarak okur ve `onChange` çağırmaz.
 */
export function fastFillLocalizedUpload(
  values: LocalizedUploadFieldValue[],
  sourceCode: string,
  languages: string[],
): LocalizedUploadFieldValue[] {
  const source = filesOf(values, sourceCode);
  if (source.length === 0) return values;
  const targets = emptyLocalizedUploadCodes(values, languages, sourceCode);
  if (targets.length === 0) return values;

  let next = values;
  for (const code of targets) {
    next = setLocalizedUploadFiles(next, code, source.map(file => ({ ...file })));
  }
  return next;
}

/**
 * TEMA TARAFI. Dile göre dosya listesi:
 *   locale dolu → locale; değilse defaultLanguage dolu → o; değilse ilk dolu
 *   dil; hiçbiri yoksa `[]`.
 * Düz `UploadedFile[]` (eski kayıt / AI) olduğu gibi döner; tek nesne sarılır;
 * string eski kayıt; null → `[]`. Hiçbir zaman throw etmez: bir görsel alanı
 * yüzünden sayfa render'ı düşmemeli.
 */
export function resolveLocalizedUpload(
  value: unknown,
  locale: string,
  defaultLanguage = 'tr',
): UploadedFile[] {
  try {
    if (!isLocalizedUploadValue(value)) return toFileList(value);

    const entries = normalizeLocalizedUpload(value);
    const forLocale = filesOf(entries, locale);
    if (forLocale.length > 0) return forLocale;
    const forDefault = filesOf(entries, defaultLanguage);
    if (forDefault.length > 0) return forDefault;
    return entries.find(e => e.value.length > 0)?.value ?? [];
  } catch {
    return [];
  }
}

/**
 * `resolveLocalizedUpload(...)[0] ?? null` — `allowMultiple: false` alanları
 * için kısayol; temalar zaten `media[0]` deseniyle yazıyor.
 */
export function resolveLocalizedUploadFile(
  value: unknown,
  locale: string,
  defaultLanguage = 'tr',
): UploadedFile | null {
  return resolveLocalizedUpload(value, locale, defaultLanguage)[0] ?? null;
}

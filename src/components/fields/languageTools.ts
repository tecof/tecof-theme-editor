import type { ApiResponse } from '../../types';
import { isEmptyLocalizedValue } from '../../studio/language/translationCoverage';

/*
 * Çok dilli alanların ortak "Hızlı Doldur" ve "Çevir" mantığı.
 *
 * Bu dosya React'sız ve saf tutulur: LanguageField, EditorField ve LinkField
 * aynı kuralları paylaşsın, vitest'te jsdom/apiClient olmadan test edilsin.
 * Kayıtlı değer biçimleri (LanguageFieldValue[], LocalizedLinkFieldValue[])
 * değişmez; burada yalnız dizi üzerinde saf dönüşümler yapılır.
 */

/** Çok dilli alanın tek girdisi — LanguageFieldValue ve LocalizedLinkFieldValue bunun özel halleridir. */
export interface LocalizedEntry<T> {
  code: string;
  value: T;
}

export interface FillOptions<T> {
  /**
   * true: yalnız isEmpty(v) olan hedefler yazılır (LinkField — dolu URL'ler dile
   * göre bilinçli farklı olabilir, asla ezilmez);
   * false: tüm diller kaynağı alır (LanguageField paritesi). Varsayılan false.
   */
  onlyEmpty?: boolean;
  /** Boşluk tanımı; varsayılan (v) => v == null || v === '' */
  isEmpty?: (value: T) => boolean;
  /** Nesne değerlerde paylaşılan referansı önler; varsayılan: nesne → {...v}, dizi → [...v], ilkel → aynı */
  clone?: (value: T) => T;
}

export interface FillResult<T> {
  values: LocalizedEntry<T>[];
  /** Kaynağın kopyalandığı dil kodları (languages sırasıyla). */
  filled: string[];
}

/* ─── Boşluk yardımcıları — alanlar isEmpty olarak bunları geçer ─── */

/**
 * LanguageField birebir: ham `!text` kontrolü. Boşluk karakterleri dolu
 * sayılır; bu bilinçli, mevcut davranış korunuyor.
 */
export const isEmptyText = (v: unknown): boolean => v == null || v === '';

/** Metni olmayan ama içerik taşıyan medya etiketleri (TipTap Image, video, iframe, ayraç). */
const MEDIA_TAG_RE = /<(img|video|audio|iframe|hr)\b/i;

/**
 * EditorField: TipTap boş belgede `<p></p>` üretir; ham string kontrolü bunu
 * "dolu" sayardı. Etiketleri sıyıran ortak tanım kullanılır — ancak yalnız
 * görsel içeren belge (`<img class="tecof-editor-image">`) sıyrılınca boş
 * kalır ve Hızlı Doldur/Çevir pasif kalırdı; medya etiketi dolu sayılır.
 */
export const isEmptyHtml = (v: unknown): boolean => {
  if (typeof v === 'string' && MEDIA_TAG_RE.test(v)) return false;
  return isEmptyLocalizedValue(v);
};

/** LinkField: url'si olmayan bağlantı boştur. */
export const isEmptyLink = (v: { url?: string } | null | undefined): boolean => !v || !v.url;

/** sourceCode dışındaki diller (Çevir hedefleri). Kaynak listede yoksa liste aynen döner. */
export const targetLocales = (languages: string[], sourceCode: string): string[] =>
  languages.filter(code => code !== sourceCode);

const defaultIsEmpty = (v: unknown): boolean => v == null || v === '';

/*
 * Kopyalanan değer nesne/dizi ise sığ klon: aynı referans iki dile yazılırsa
 * birinde yapılan mutasyon diğerine sızar. İlkeller (string) aynen döner, bu
 * yüzden LanguageField için `languages.map(code => ({ code, value: text }))`
 * ile birebir aynı sonuç çıkar.
 */
const defaultClone = <T>(v: T): T => {
  if (Array.isArray(v)) return [...v] as T;
  if (typeof v === 'object' && v !== null) return { ...(v as object) } as T;
  return v;
};

/**
 * Bir alanın ham değerini merchant dil listesine göre normalize eder: dizi
 * değilse `[]` sayılır (AI'ın yazdığı çıplak string `.find`'ı çökertmesin), her
 * dil için mevcut girdi ya da `{ code, value: makeEmpty() }` döner. Üç alandaki
 * birebir tekrar eden `useMemo` gövdesi buraya alındı.
 */
export const normalizeLocalizedValues = <T>(
  raw: unknown,
  languages: string[],
  makeEmpty: () => T
): LocalizedEntry<T>[] => {
  const current: LocalizedEntry<T>[] = Array.isArray(raw) ? (raw as LocalizedEntry<T>[]) : [];
  return languages.map(code => {
    const existing = current.find(v => v && v.code === code);
    return existing || { code, value: makeEmpty() };
  });
};

/**
 * Kaynak dildeki değeri hedef dillere kopyalar.
 * - onlyEmpty=false: sonuç TAM OLARAK languages.map(code => ({code, value: src}))
 *   — listede olmayan kodlar düşer (LanguageField birebir).
 * - onlyEmpty=true: mevcut girdiler korunur; yalnız isEmpty olan hedeflere
 *   clone(src) yazılır; listede olmayan mevcut kodlar KORUNUR (yıkıcı olmasın).
 * Kaynak boşsa ya da (onlyEmpty iken) doldurulacak hedef yoksa null döner →
 * çağıran no-op yapar (düğme zaten disabled).
 */
export const fillLanguages = <T>(
  values: LocalizedEntry<T>[],
  languages: string[],
  sourceCode: string,
  options: FillOptions<T> = {}
): FillResult<T> | null => {
  const { onlyEmpty = false, isEmpty = defaultIsEmpty, clone = defaultClone } = options;
  const source = values.find(v => v.code === sourceCode);
  if (!source || isEmpty(source.value)) return null;

  if (!onlyEmpty) {
    // Kaynak dil kendi değerini aynen alır; diğerleri klon alır (string'de aynı şey).
    const next = languages.map(code => ({
      code,
      value: code === sourceCode ? source.value : clone(source.value),
    }));
    return { values: next, filled: languages.slice() };
  }

  const next = values.slice();
  const filled: string[] = [];
  for (const code of languages) {
    if (code === sourceCode) continue;
    const idx = next.findIndex(v => v.code === code);
    if (idx >= 0) {
      if (!isEmpty(next[idx].value)) continue; // dolu dil asla ezilmez
      next[idx] = { ...next[idx], value: clone(source.value) };
    } else {
      next.push({ code, value: clone(source.value) });
    }
    filled.push(code);
  }
  if (filled.length === 0) return null;
  return { values: next, filled };
};

/**
 * Çeviri sonuçlarını mevcut diziye uygular: eşleşen kodu günceller, bilinmeyen
 * kodu sona ekler (LanguageField birebir). Girdi dizisi mutasyona uğramaz.
 */
export const mergeTranslations = (
  values: LocalizedEntry<string>[],
  translations: { code: string; value: string }[]
): LocalizedEntry<string>[] => {
  const updated = values.slice();
  for (const t of translations) {
    const idx = updated.findIndex(v => v.code === t.code);
    if (idx >= 0) {
      updated[idx] = { ...updated[idx], value: t.value };
    } else {
      updated.push({ code: t.code, value: t.value });
    }
  }
  return updated;
};

export type TranslateFn = (
  text: string,
  from: string,
  to: string[],
  isHtml: boolean
) => Promise<ApiResponse<{ code: string; value: string }[]>>;

export type TranslateOutcome =
  | { ok: true; values: LocalizedEntry<string>[]; translations: { code: string; value: string }[] }
  | { ok: false; message: string };

/** Durum metinleri tek yerde (README/test bunları referans alır) */
export const LANGUAGE_TOOL_MESSAGES = {
  filledAll: 'Tüm dillere kopyalandı',
  filledEmpty: (codes: string[]) =>
    `Boş dillere kopyalandı: ${codes.map(c => c.toUpperCase()).join(', ')}`,
  translated: 'Çeviri tamamlandı',
  translateError: 'Çeviri hatası',
  nothingToTranslate: 'Çevrilecek metin yok',
} as const;

export interface TranslateLanguagesArgs {
  /**
   * Mevcut girdiler ya da onları döndüren bir getter. Alanlar getter geçer
   * (`() => valuesRef.current`): API cevabı gelene kadar kullanıcı aktif dilde
   * yazmaya devam etmiş olabilir; merge en güncel diziye yapılır ki o tuşlar
   * kaybolmasın (LanguageField'ın eski davranışı da buydu).
   */
  values: LocalizedEntry<string>[] | (() => LocalizedEntry<string>[]);
  languages: string[];
  sourceCode: string;
  translate: TranslateFn;
  isHtml?: boolean;
  isEmpty?: (v: string) => boolean;
}

const resolveValues = (
  values: LocalizedEntry<string>[] | (() => LocalizedEntry<string>[])
): LocalizedEntry<string>[] => (typeof values === 'function' ? values() : values);

/**
 * Kaynak dildeki metni diğer dillere çevirir ve merge eder. apiClient yerine
 * TranslateFn enjekte edilir ki vitest'te jsdom/apiClient olmadan test edilsin.
 * - kaynak boş ya da hedef yok → { ok:false, 'Çevrilecek metin yok' } ve API çağrılmaz
 *   (UI bunu göstermez, düğme zaten disabled)
 * - res.success && Array.isArray(res.data) → ok
 * - aksi → { ok:false, message: res.message || 'Çeviri hatası' }; throw → err.message || 'Çeviri hatası'
 */
export const translateLanguages = async ({
  values,
  languages,
  sourceCode,
  translate,
  isHtml = false,
  isEmpty = isEmptyText,
}: TranslateLanguagesArgs): Promise<TranslateOutcome> => {
  const text = resolveValues(values).find(v => v.code === sourceCode)?.value || '';
  const targets = targetLocales(languages, sourceCode);
  if (isEmpty(text) || targets.length === 0) {
    return { ok: false, message: LANGUAGE_TOOL_MESSAGES.nothingToTranslate };
  }

  try {
    const res = await translate(text, sourceCode, targets, isHtml);
    if (res.success && Array.isArray(res.data)) {
      // Cevap geldiğinde diziyi yeniden çöz: bekleme sırasında yazılanlar korunur.
      return {
        ok: true,
        values: mergeTranslations(resolveValues(values), res.data),
        translations: res.data,
      };
    }
    return { ok: false, message: res.message || LANGUAGE_TOOL_MESSAGES.translateError };
  } catch (err) {
    const message = err instanceof Error && err.message ? err.message : LANGUAGE_TOOL_MESSAGES.translateError;
    return { ok: false, message };
  }
};

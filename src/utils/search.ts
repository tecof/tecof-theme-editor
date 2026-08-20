/**
 * Türkçe-güvenli arama normalizasyonu.
 *
 * NEDEN: düz `toLowerCase()` Türkçe'de İKİ ayrı şekilde kırılır —
 *   1. Nokta: "HAKKIMIZDA".toLowerCase() → "hakkımızda" DEĞİL "hakkimizda"
 *      (I → i), "İletişim".toLowerCase() → "i̇letişim" (İ → i + birleşen nokta
 *      U+0307). Yani kullanıcının yazdığı "ı"/"i" ile etiketteki harf
 *      eşleşmiyordu: "Iletişim" arayan "İletişim"i bulamıyordu.
 *   2. Klavye: kullanıcılar aksansız yazar ("hakkimizda", "urunler", "sss").
 *
 * ÇÖZÜM: iki taraf da AYNI şekilde katlanır — önce `toLocaleLowerCase("tr-TR")`
 * (doğru küçültme), sonra Türkçe harfler ASCII karşılığına indirgenir ve
 * birleşen aksan işaretleri (NFD) atılır. Böylece "HAKKIMIZDA", "hakkımızda",
 * "Hakkimizda" ve "hakkImIzda" hepsi aynı anahtara düşer.
 *
 * Aramaya özeldir: görüntülenen metni ASLA bu fonksiyonla üretme (harfler bozulur).
 */

const TR_FOLD: Record<string, string> = {
  ı: 'i',
  i: 'i',
  ş: 's',
  ğ: 'g',
  ü: 'u',
  ö: 'o',
  ç: 'c',
  â: 'a',
  î: 'i',
  û: 'u',
};

/** Arama anahtarı: Türkçe-güvenli küçült + aksan katla. */
export const normalizeSearch = (value: unknown): string => {
  if (value == null) return '';
  return (
    String(value)
      .toLocaleLowerCase('tr-TR')
      // NFD: "i̇" gibi birleşik dizileri taban harf + aksana ayır, aksanı at.
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[ışğüöçâîû]/g, (ch) => TR_FOLD[ch] ?? ch)
      .trim()
  );
};

/**
 * `query` (kullanıcı girdisi) `text` içinde geçiyor mu — her iki taraf da
 * normalize edilir. Boş sorgu HER ZAMAN eşleşir (filtre uygulanmamış sayılır).
 */
export const matchesSearch = (text: unknown, query: string): boolean => {
  const q = normalizeSearch(query);
  if (!q) return true;
  return normalizeSearch(text).includes(q);
};

/**
 * Çok kelimeli sorgu: "hero mavi" → hem "hero" hem "mavi" geçmeli (sıra
 * önemsiz). Tek kelimede `matchesSearch` ile aynı davranır.
 */
export const matchesAllTerms = (text: unknown, query: string): boolean => {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const haystack = normalizeSearch(text);
  return terms.every((t) => haystack.includes(t));
};

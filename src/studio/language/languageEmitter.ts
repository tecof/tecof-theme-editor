/**
 * Aktif düzenleme dilini host'a bildiren küçük kapı (gate).
 *
 * NEDEN ayrı bir modül: bildirim kuralı ("boş string gitmez", "aynı kod iki kez
 * gitmez") React'e bağlı olmadan sınanabilsin diye. Editörde jsdom yok — testler
 * node ortamında koşuyor — ve bu mantığı bir efektin içine gömersek hiç test
 * edilemez hale gelirdi. React katmanı (LanguageProvider) yalnızca kabloyu çeker:
 * her render'da `setCallback`, dil değişince `emit`.
 */
export interface LanguageEmitter {
  /**
   * Host'un geri çağrımını tazeler. Her render'da çağrılır ki host inline bir
   * fonksiyon verse (her render yeni referans) bile ek bildirim doğmasın —
   * referans efekt bağımlılığı DEĞİL, ref'te tutulan bir değerdir.
   */
  setCallback: (cb?: (code: string) => void) => void;
  /**
   * Dili host'a bildirir. Bildirildiyse `true` döner.
   * Yok sayılan durumlar:
   *  - boş/whitespace kod: merchant-info henüz gelmedi, "" host'a ASLA gitmez;
   *  - son bildirilenle aynı kod: React 18 StrictMode'un çift mount'unda efekt
   *    yeniden koşar ama ref korunur; bu kapı oradaki tekrarı da yutar.
   */
  emit: (code: string) => boolean;
}

export const createLanguageEmitter = (): LanguageEmitter => {
  let callback: ((code: string) => void) | undefined;
  let last: string | null = null;

  return {
    setCallback: (cb) => {
      callback = cb;
    },
    emit: (code) => {
      if (typeof code !== 'string' || code.trim() === '') return false;
      if (code === last) return false;
      last = code;
      callback?.(code);
      return true;
    },
  };
};

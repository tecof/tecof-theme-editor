/**
 * Bekleyen (henüz store'a yazılmamış) düzenlemelerin kaydı.
 *
 * Kanvas içi metin düzenlemesi (useInlineEdit) yazım boyunca taslağı DOM'da
 * tutar ve store'a oturum bitince yazar: her tuşta commit etmek React'in
 * düzenlenen metni imlecin altında yeniden basmasına (imleç başa atlar) yol
 * açardı. Taslağın sessizce kaybolmaması ya da eski belgenin kaydedilmemesi
 * için belgeyi OKUYAN veya DEĞİŞTİREN her yol önce `flushPendingEdits()`
 * çağırır: kaydet/yayınla (`puck:save`/`puck:publish`, ⌘S, TopBar, autosave),
 * geri al/yinele, sunucudan yeniden yükleme (`puck:refetch`), sekme kapatma
 * (`beforeunload`) ve kanvas düzenleme katmanının unmount'u.
 *
 * Bir `flush` oturumu commit ederek kapatır; kayıt flush'tan ÖNCE düşürülür,
 * yani her bekleyen düzenleme en fazla bir kez boşaltılır.
 */

type Flush = () => void;

const pending = new Set<Flush>();

/** Bekleyen bir düzenleme kaydeder; döndürülen fonksiyon kaydı siler (idempotent). */
export function registerPendingEdit(flush: Flush): () => void {
  pending.add(flush);
  return () => {
    pending.delete(flush);
  };
}

/** Store'a henüz yazılmamış bir düzenleme var mı. */
export function hasPendingEdits(): boolean {
  return pending.size > 0;
}

/**
 * Bekleyen tüm düzenlemeleri store'a yazar (senkron). Biri hata verse bile
 * diğerleri boşaltılır — kayıt yolunu tek bir bozuk oturum kilitlememeli.
 */
export function flushPendingEdits(): void {
  for (const flush of Array.from(pending)) {
    pending.delete(flush);
    try {
      flush();
    } catch (err) {
      console.error('[TecofStudio] Bekleyen düzenleme yazılamadı:', err);
    }
  }
}

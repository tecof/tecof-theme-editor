// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { createLanguageEmitter } from '../languageEmitter';

/**
 * Bu testler `TecofEditor`'ün `onLanguageChange` sözleşmesini korur. Temalar
 * (EditorClient) bu davranışa göre yazıldığı için sapma tuvalin dilini bozar:
 * "" gelirse next-intl geçersiz locale ile render eder, tekrar eden çağrı ise
 * host'ta gereksiz state güncellemesi (ve tuval yeniden render'ı) doğurur.
 *
 * LanguageProvider yalnız kabloyu çeker: her render'da `setCallback`, aktif dil
 * değişince `emit`. Kural burada olduğu için jsdom'suz (node) sınanabiliyor.
 */
describe('createLanguageEmitter', () => {
  it('merchant-info gelene kadarki boş dil host\'a GİTMEZ', () => {
    const cb = vi.fn();
    const emitter = createLanguageEmitter();
    emitter.setCallback(cb);

    // useLanguages activeTab'i "" ile başlatır — ilk efekt turu budur.
    expect(emitter.emit('')).toBe(false);
    expect(emitter.emit('   ')).toBe(false);
    expect(cb).not.toHaveBeenCalled();
  });

  it('ilk gerçek çözümde tam bir kez çağrılır', () => {
    const cb = vi.fn();
    const emitter = createLanguageEmitter();
    emitter.setCallback(cb);

    emitter.emit('');
    expect(emitter.emit('tr')).toBe(true);

    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith('tr');
  });

  it('dil değişiminde yeni kodla çağrılır', () => {
    const cb = vi.fn();
    const emitter = createLanguageEmitter();
    emitter.setCallback(cb);

    emitter.emit('tr');
    emitter.emit('en');
    emitter.emit('de');

    expect(cb.mock.calls.map((c) => c[0])).toEqual(['tr', 'en', 'de']);
  });

  it('aynı kod ikinci kez gönderilmez (StrictMode çift mount dahil)', () => {
    const cb = vi.fn();
    const emitter = createLanguageEmitter();
    emitter.setCallback(cb);

    emitter.emit('tr');
    expect(emitter.emit('tr')).toBe(false);
    emitter.emit('en');
    expect(emitter.emit('en')).toBe(false);

    expect(cb).toHaveBeenCalledTimes(2);
  });

  it('geri dönülen dil yeniden bildirilir (son bildirilen ile karşılaştırılır)', () => {
    const cb = vi.fn();
    const emitter = createLanguageEmitter();
    emitter.setCallback(cb);

    emitter.emit('tr');
    emitter.emit('en');
    emitter.emit('tr');

    expect(cb.mock.calls.map((c) => c[0])).toEqual(['tr', 'en', 'tr']);
  });

  it('host inline fonksiyon verse de (her render yeni referans) EK çağrı doğmaz', () => {
    const seen: string[] = [];
    const emitter = createLanguageEmitter();

    // Her render'da taze bir fonksiyon — LanguageProvider'daki bağımlılıksız
    // efektin yaptığı şey. Dil değişmediği sürece hiçbir bildirim çıkmamalı.
    for (let i = 0; i < 5; i++) {
      emitter.setCallback((code) => seen.push(`${code}#${i}`));
      emitter.emit('tr');
    }

    expect(seen).toEqual(['tr#0']);
  });

  it('en güncel geri çağrım kullanılır (eski referans çağrılmaz)', () => {
    const first = vi.fn();
    const second = vi.fn();
    const emitter = createLanguageEmitter();

    emitter.setCallback(first);
    emitter.emit('tr');
    emitter.setCallback(second);
    emitter.emit('en');

    expect(first.mock.calls.map((c) => c[0])).toEqual(['tr']);
    expect(second.mock.calls.map((c) => c[0])).toEqual(['en']);
  });

  it('geri çağrım verilmemişse (opsiyonel prop) sessizce yutulur', () => {
    const emitter = createLanguageEmitter();

    // onLanguageChange opsiyonel: prop geçmeyen eski host'lar için davranış
    // birebir aynı kalmalı, hata fırlatmamalı.
    expect(() => emitter.emit('tr')).not.toThrow();
    expect(emitter.emit('tr')).toBe(false);

    emitter.setCallback(undefined);
    expect(() => emitter.emit('en')).not.toThrow();
  });
});

// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { normalizeSearch, matchesSearch, matchesAllTerms } from '../search';

/**
 * Türkçe arama sözleşmesi. Düz `toLowerCase()` iki ayrı şekilde kırılıyordu:
 * (1) "I"→"i" ve "İ"→"i̇" (birleşen nokta) yüzünden İ/ı eşleşmiyordu,
 * (2) kullanıcılar aksansız yazıyor ("hakkimizda", "urunler").
 * Bu testler her iki kırılmayı da sabitler.
 */

describe('normalizeSearch', () => {
  it('Türkçe büyük harfleri doğru küçültür (I/İ tuzağı)', () => {
    expect(normalizeSearch('HAKKIMIZDA')).toBe(normalizeSearch('Hakkımızda'));
    expect(normalizeSearch('İLETİŞİM')).toBe(normalizeSearch('İletişim'));
  });

  it('aksanları ASCII karşılığına katlar', () => {
    expect(normalizeSearch('Öne Çıkanlar')).toBe('one cikanlar');
    expect(normalizeSearch('Şablon Galerisi')).toBe('sablon galerisi');
    expect(normalizeSearch('Ürünler')).toBe('urunler');
  });

  it('birleşen nokta (U+0307) bırakmaz — "İ" düz "i" olur', () => {
    expect(normalizeSearch('İ')).toBe('i');
    expect(normalizeSearch('İ').length).toBe(1);
  });

  it('null/undefined güvenli', () => {
    expect(normalizeSearch(null)).toBe('');
    expect(normalizeSearch(undefined)).toBe('');
  });
});

describe('matchesSearch — gerçek editör etiketleri', () => {
  const cases: Array<[string, string]> = [
    ['Hakkımızda', 'HAKKIMIZDA'],
    ['Hakkımızda', 'hakkimizda'],
    ['Hakkımızda', 'hakkımızda'],
    ['İletişim', 'iletisim'],
    ['İletişim', 'İLETİŞİM'],
    ['İletişim', 'Iletisim'],
    ['Sıkça Sorulan Sorular', 'sikca'],
    ['Ürünler', 'URUNLER'],
    ['Öne Çıkan Projeler', 'one cikan'],
    ['Hero Görsel', 'gorsel'],
  ];
  it.each(cases)('"%s" ← "%s"', (label, query) => {
    expect(matchesSearch(label, query)).toBe(true);
  });

  it('alakasız sorgu eşleşmez', () => {
    expect(matchesSearch('Hakkımızda', 'iletisim')).toBe(false);
  });

  it('boş sorgu her şeyi geçirir (filtre yok sayılır)', () => {
    expect(matchesSearch('Herhangi', '')).toBe(true);
    expect(matchesSearch('Herhangi', '   ')).toBe(true);
  });
});

describe('matchesAllTerms — çok kelimeli, sıra bağımsız', () => {
  it('tüm kelimeler geçmeli', () => {
    expect(matchesAllTerms('Drone Hero (Ana Açılış)', 'hero ana')).toBe(true);
    expect(matchesAllTerms('Drone Hero (Ana Açılış)', 'ana hero')).toBe(true); // sıra bağımsız
    expect(matchesAllTerms('Drone Hero (Ana Açılış)', 'hero footer')).toBe(false);
  });

  it('aksansız çok kelimeli sorgu çalışır', () => {
    expect(matchesAllTerms('Sıkça Sorulan Sorular', 'sikca sorular')).toBe(true);
    expect(matchesAllTerms('Öne Çıkan Ürünler', 'one urunler')).toBe(true);
  });
});

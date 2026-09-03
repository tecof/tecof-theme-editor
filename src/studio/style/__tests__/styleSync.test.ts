// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  buildStyleMatch,
  buildStyleSyncFlag,
  isSharedNode,
  isStyleSourceNode,
  mergeStyleSyncPages,
  nodeStyleLabel,
  styleSyncFlagOf,
  styleSyncSummary,
} from '../styleSync';
import { STYLE_SYNC_PROP } from '../types';
import type { TecofNode } from '../../../types';

/**
 * Stil senkronu — saf kural testleri.
 *
 * Kritik nokta: bu kurallar BACKEND `app/src/nodeStyleSync.ts` ile birebir aynı
 * olmak zorunda. Modalde "3 eşleşme" yazıp 1 düğüm güncellenirse kullanıcı
 * editöre güvenmeyi bırakır — bu yüzden ad çözümü, ölçüt üretimi ve liste
 * birleştirme burada ayrı ayrı sabitlenir.
 */

const node = (type: string, props: Record<string, unknown> = {}): TecofNode =>
  ({ type, props: { id: 'n1', ...props } }) as TecofNode;

describe('nodeStyleLabel', () => {
  it('_layerName önceliklidir', () => {
    expect(nodeStyleLabel(node('Hero', { _layerName: 'Üst Bant', name: 'x' }))).toBe('Üst Bant');
  });

  it('_layerName yoksa props.name kullanılır', () => {
    expect(nodeStyleLabel(node('Hero', { name: 'Kampanya' }))).toBe('Kampanya');
  });

  it('çok dilli ([{code,value}]) name AD SAYILMAZ', () => {
    expect(nodeStyleLabel(node('Hero', { name: [{ code: 'tr', value: 'Ad' }] }))).toBeNull();
  });

  it('boşluk-only ad yok sayılır', () => {
    expect(nodeStyleLabel(node('Hero', { _layerName: '   ' }))).toBeNull();
  });
});

describe('buildStyleMatch', () => {
  it('varsayılan olarak yalnız tip — ad daraltması sessizce EKLENMEZ', () => {
    expect(buildStyleMatch(node('Hero', { _layerName: 'Üst Bant' }))).toEqual({ type: 'Hero' });
  });

  it('byName ile ad eklenir', () => {
    expect(buildStyleMatch(node('Hero', { _layerName: 'Üst Bant' }), { byName: true })).toEqual({
      type: 'Hero',
      name: 'Üst Bant',
    });
  });

  it('byName istense de ad yoksa ölçüt tipte kalır', () => {
    expect(buildStyleMatch(node('Hero'), { byName: true })).toEqual({ type: 'Hero' });
  });

  it('düğüm yoksa null', () => {
    expect(buildStyleMatch(null)).toBeNull();
  });
});

describe('styleSyncFlagOf / isStyleSourceNode', () => {
  it('bayraksız düğüm kaynak değildir', () => {
    expect(styleSyncFlagOf(node('Hero'))).toBeNull();
    expect(isStyleSourceNode(node('Hero'))).toBe(false);
  });

  it('bozuk (dizi/metin) bayrak yok sayılır', () => {
    expect(styleSyncFlagOf(node('Hero', { [STYLE_SYNC_PROP]: [1, 2] }))).toBeNull();
    expect(styleSyncFlagOf(node('Hero', { [STYLE_SYNC_PROP]: 'evet' }))).toBeNull();
  });

  it('bayrak normalize edilir (scope daima theme)', () => {
    const flag = styleSyncFlagOf(
      node('Hero', {
        [STYLE_SYNC_PROP]: { scope: 'sayfa', sourcePageId: 'p1', match: { type: 'Hero', name: 'A' } },
      })
    );
    expect(flag).toEqual({ scope: 'theme', sourcePageId: 'p1', match: { type: 'Hero', name: 'A' } });
  });

  it('match.type yoksa match alanı düşürülür (backend türetsin)', () => {
    const flag = styleSyncFlagOf(node('Hero', { [STYLE_SYNC_PROP]: { scope: 'theme' } }));
    expect(flag).toEqual({ scope: 'theme' });
    expect(isStyleSourceNode(node('Hero', { [STYLE_SYNC_PROP]: { scope: 'theme' } }))).toBe(true);
  });
});

describe('buildStyleSyncFlag', () => {
  it('match AÇIKÇA yazılır — katman adı sonradan değişse de hedef kümesi kaymaz', () => {
    expect(
      buildStyleSyncFlag(node('Hero', { _layerName: 'Üst Bant' }), { sourcePageId: 'p1', byName: true })
    ).toEqual({ scope: 'theme', sourcePageId: 'p1', match: { type: 'Hero', name: 'Üst Bant' } });
  });

  it('sourcePageId yoksa alan hiç yazılmaz', () => {
    expect(buildStyleSyncFlag(node('Hero'), {})).toEqual({ scope: 'theme', match: { type: 'Hero' } });
  });
});

describe('isSharedNode', () => {
  it('sharedComponentId taşıyan düğüm ortak sayılır', () => {
    expect(isSharedNode(node('Hero', { sharedComponentId: 'abc' }))).toBe(true);
    expect(isSharedNode(node('Hero'))).toBe(false);
  });
});

describe('mergeStyleSyncPages', () => {
  const pages = [
    { _id: 'p1', slug: 'hakkimizda', title: 'Hakkımızda', status: 'published' },
    { _id: 'p2', slug: 'iletisim', title: 'İletişim' },
    { _id: 'src', slug: 'anasayfa', title: 'Ana Sayfa' },
  ];

  it('eşleşmesi olmayan sayfa 0 eşleşmeyle listelenir (neden seçilemediği görünsün)', () => {
    const rows = mergeStyleSyncPages(pages, [{ pageId: 'p1', matches: 2, conflicts: 0 }], 'src');
    expect(rows.map((r) => r.pageId)).toEqual(['p1', 'p2']);
    expect(rows[0].matches).toBe(2);
    expect(rows[1].matches).toBe(0);
  });

  it('kaynak sayfa listeden DÜŞER', () => {
    const rows = mergeStyleSyncPages(pages, [], 'src');
    expect(rows.some((r) => r.pageId === 'src')).toBe(false);
  });

  it('listede olmayıp önizlemede eşleşen sayfa (şablon) satır olarak eklenir', () => {
    const rows = mergeStyleSyncPages(pages, [
      { pageId: 'tpl', title: 'Ürün Şablonu', slug: 'urun', matches: 1 },
    ], 'src');
    const tpl = rows.find((r) => r.pageId === 'tpl');
    expect(tpl).toBeTruthy();
    expect(tpl!.title).toBe('Ürün Şablonu');
    expect(tpl!.matches).toBe(1);
  });

  it('eşleşenler üste sıralanır', () => {
    const rows = mergeStyleSyncPages(pages, [{ pageId: 'p2', matches: 5 }], 'src');
    expect(rows[0].pageId).toBe('p2');
  });

  it('çakışma sayısı taşınır ve bozuk sayılar 0 olur', () => {
    const rows = mergeStyleSyncPages(pages, [
      { pageId: 'p1', matches: 1, conflicts: 3 },
      { pageId: 'p2', matches: 'x', conflicts: -4 },
    ], 'src');
    expect(rows.find((r) => r.pageId === 'p1')!.conflicts).toBe(3);
    expect(rows.find((r) => r.pageId === 'p2')!.matches).toBe(0);
    expect(rows.find((r) => r.pageId === 'p2')!.conflicts).toBe(0);
  });

  it('bozuk girdilerde çökmez', () => {
    expect(mergeStyleSyncPages(null, undefined, null)).toEqual([]);
  });
});

describe('styleSyncSummary', () => {
  it('hiç güncelleme yoksa dürüst mesaj', () => {
    expect(styleSyncSummary({ updatedPages: 0, updatedNodes: 0 })).toContain('bulunamadı');
  });

  it('yayın hatırlatması içerir', () => {
    expect(styleSyncSummary({ updatedPages: 5, updatedNodes: 7 })).toContain('5 sayfada 7 bileşen');
    expect(styleSyncSummary({ updatedPages: 5, updatedNodes: 7 })).toContain('yayınla');
  });

  it('çakışmalar ayrıca söylenir', () => {
    const text = styleSyncSummary({ updatedPages: 1, updatedNodes: 1, conflicts: [{}, {}] });
    expect(text).toContain('2 bileşen kendi stil kaynağı');
  });
});

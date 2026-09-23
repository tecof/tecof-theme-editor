// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  readRecent,
  pushRecent,
  readFormat,
  writeFormat,
  RECENT_COLORS_KEY,
  RECENT_MAX,
  COLOR_FORMAT_KEY,
  type StorageLike,
} from '../color/recentColors';

/** Sahte depo: kayıtlar bellek haritasında; istenirse okuma/yazma fırlatır. */
const makeStore = (init: Record<string, string> = {}, opts: { throwGet?: boolean; throwSet?: boolean } = {}) => {
  const map: Record<string, string> = { ...init };
  const store: StorageLike = {
    getItem: (k) => {
      if (opts.throwGet) throw new Error('blocked');
      return k in map ? map[k] : null;
    },
    setItem: (k, v) => {
      if (opts.throwSet) throw new Error('quota');
      map[k] = v;
    },
  };
  return { store, map };
};

describe('readRecent', () => {
  it('depo yok → []', () => {
    expect(readRecent(null)).toEqual([]);
  });
  it('kayıt yok / bozuk JSON / dizi değil / getItem fırlatır → []', () => {
    expect(readRecent(makeStore().store)).toEqual([]);
    expect(readRecent(makeStore({ [RECENT_COLORS_KEY]: '{oops' }).store)).toEqual([]);
    expect(readRecent(makeStore({ [RECENT_COLORS_KEY]: '{"a":1}' }).store)).toEqual([]);
    expect(readRecent(makeStore({}, { throwGet: true }).store)).toEqual([]);
  });
  it('eski liste okunur, küçük harfe çekilir, dize olmayanlar atılır', () => {
    const { store } = makeStore({ [RECENT_COLORS_KEY]: JSON.stringify(['#ABCDEF', 7, null, '#123456']) });
    expect(readRecent(store)).toEqual(['#abcdef', '#123456']);
  });
});

describe('pushRecent', () => {
  it('başa ekler ve büyük/küçük harf tekilleştirir', () => {
    const { store } = makeStore({ [RECENT_COLORS_KEY]: JSON.stringify(['#111111', '#222222']) });
    expect(pushRecent('#222222', store)).toEqual(['#222222', '#111111']);
    expect(pushRecent('#111111', store)).toEqual(['#111111', '#222222']);
    expect(pushRecent('#ABCDEF', store)).toEqual(['#abcdef', '#111111', '#222222']);
    expect(readRecent(store)).toEqual(['#abcdef', '#111111', '#222222']);
  });
  it('10 üstü kırpılır', () => {
    const { store } = makeStore();
    for (let i = 0; i < 14; i++) pushRecent(`#0000${i.toString(16).padStart(2, '0')}`, store);
    const list = readRecent(store);
    expect(list).toHaveLength(RECENT_MAX);
    expect(list[0]).toBe('#00000d');
  });
  it('hex8 saklanır; rgb() hex\'e çevrilir', () => {
    const { store } = makeStore();
    expect(pushRecent('#aabbcc80', store)[0]).toBe('#aabbcc80');
    expect(pushRecent('rgb(255, 0, 0)', store)[0]).toBe('#ff0000');
  });
  it('var() / geçersiz değer listeyi değiştirmez', () => {
    const { store, map } = makeStore({ [RECENT_COLORS_KEY]: JSON.stringify(['#111111']) });
    expect(pushRecent('var(--theme-color-primary)', store)).toEqual(['#111111']);
    expect(pushRecent('nope', store)).toEqual(['#111111']);
    expect(pushRecent('', store)).toEqual(['#111111']);
    expect(map[RECENT_COLORS_KEY]).toBe(JSON.stringify(['#111111']));
  });
  it('setItem fırlatırsa çökmez, hesaplanan liste döner', () => {
    const { store } = makeStore({ [RECENT_COLORS_KEY]: JSON.stringify(['#111111']) }, { throwSet: true });
    expect(() => pushRecent('#222222', store)).not.toThrow();
    expect(pushRecent('#222222', store)).toEqual(['#222222', '#111111']);
  });
  it('depo yokken bile geçerli listeyi döner', () => {
    expect(pushRecent('#222222', null)).toEqual(['#222222']);
  });
});

describe('format tercihi', () => {
  it('geçersiz/eksik → hex', () => {
    expect(readFormat(null)).toBe('hex');
    expect(readFormat(makeStore().store)).toBe('hex');
    expect(readFormat(makeStore({ [COLOR_FORMAT_KEY]: 'cmyk' }).store)).toBe('hex');
    expect(readFormat(makeStore({}, { throwGet: true }).store)).toBe('hex');
  });
  it('gidiş-dönüş', () => {
    const { store } = makeStore();
    writeFormat('rgb', store);
    expect(readFormat(store)).toBe('rgb');
    writeFormat('hsl', store);
    expect(readFormat(store)).toBe('hsl');
    expect(() => writeFormat('hex', makeStore({}, { throwSet: true }).store)).not.toThrow();
  });
});

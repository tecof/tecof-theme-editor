// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { THEME_COLOR_KEYS, toThemeCssKey } from '../colorKeys';
import { getDefaultTheme } from '../../../utils';

describe('THEME_COLOR_KEYS', () => {
  it('anahtar kümesi getDefaultTheme().colors ile birebir', () => {
    const keys = THEME_COLOR_KEYS.map((k) => k.key);
    expect(new Set(keys)).toEqual(new Set(Object.keys(getDefaultTheme().colors)));
    expect(keys).toHaveLength(11);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('etiketler boş değil ve tekil', () => {
    const labels = THEME_COLOR_KEYS.map((k) => k.label);
    for (const l of labels) expect(l.trim().length).toBeGreaterThan(0);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('cssKey === toThemeCssKey(key)', () => {
    for (const k of THEME_COLOR_KEYS) expect(k.cssKey).toBe(toThemeCssKey(k.key));
    expect(toThemeCssKey('mutedForeground')).toBe('muted-foreground');
    expect(toThemeCssKey('cardForeground')).toBe('card-foreground');
    expect(toThemeCssKey('primary')).toBe('primary');
  });
});

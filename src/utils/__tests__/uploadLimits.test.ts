import { describe, it, expect } from 'vitest';
import { resolveMaxFileSize, toMB, FALLBACK_MAX_FILE_SIZE } from '../uploadLimits';
import type { UploadLimitsData } from '../../api';

const limits: UploadLimitsData = {
  scopes: {
    'theme.asset': { maxBytes: 40 * 1024 * 1024, maxMB: 40 },
    'cms.file': { maxBytes: 120 * 1024 * 1024, maxMB: 120 },
  },
  defaultScope: 'theme.asset',
  maxFiles: 5,
};

describe('toMB', () => {
  it('FilePond boyut metnini MB\'a çevirir', () => {
    expect(toMB('100MB')).toBe(100);
    expect(toMB('512KB')).toBe(0.5);
    expect(toMB('1GB')).toBe(1024);
    expect(toMB(' 20 mb ')).toBe(20);
    expect(toMB('yirmi')).toBeNull();
    expect(toMB(undefined)).toBeNull();
  });
});

describe('resolveMaxFileSize', () => {
  it('sunucu değeri esas: "/" ve tanınmayan klasör varsayılan kapsama düşer', () => {
    expect(resolveMaxFileSize(limits, '/', undefined)).toBe('40MB');
    expect(resolveMaxFileSize(limits, 'fonts', undefined)).toBe('40MB');
    expect(resolveMaxFileSize(limits, 'cms.file', undefined)).toBe('120MB');
  });

  it('temanın verdiği daha küçük sınır kazanır, daha büyüğü sunucuya kırpılır', () => {
    expect(resolveMaxFileSize(limits, '/', '5MB')).toBe('5MB');
    expect(resolveMaxFileSize(limits, '/', '100MB')).toBe('40MB');
  });

  it('sunucu okunamazsa temanın değeri, o da yoksa theme.asset varsayılanı', () => {
    expect(resolveMaxFileSize(null, '/', '8MB')).toBe('8MB');
    expect(resolveMaxFileSize(null, '/', undefined)).toBe(FALLBACK_MAX_FILE_SIZE);
  });
});

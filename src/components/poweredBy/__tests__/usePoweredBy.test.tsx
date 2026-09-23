// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

/*
 * SWR kablolaması: jsdom yok, efekt yok — `useSWR`'a giden anahtar, fetcher ve
 * seçenekler sahte modülle yakalanır. Böylece "initialData yokken mount'ta
 * çek, null iken çekme, açık seçenek kazanır, istemci yoksa anahtar null"
 * kuralları ters yazılsa test kırmızıya döner (önce yalnız kapalı-durum
 * markup'ı kilitliydi).
 */

interface CapturedCall {
  key: string | null;
  fetcher: () => Promise<unknown>;
  options: { revalidateOnMount?: boolean; dedupingInterval?: number; keepPreviousData?: boolean };
}
const calls: CapturedCall[] = [];

vi.mock('swr', () => ({
  default: (key: string | null, fetcher: () => Promise<unknown>, options: CapturedCall['options']) => {
    calls.push({ key, fetcher, options });
    return { data: undefined, error: undefined, isLoading: false, mutate: async () => undefined };
  },
}));

const getMerchantInfo = vi.fn();
vi.mock('../../../api', () => ({
  TecofApiClient: class {
    constructor(public apiUrl: string, public secretKey: string) {}
    getMerchantInfo = getMerchantInfo;
  },
}));

import { PoweredBy } from '../PoweredBy';
import { buildMerchantInfoSwrKey, initialSource, shouldRevalidateOnMount } from '../usePoweredBy';
import type { PoweredByBandData } from '../resolve';

const band: PoweredByBandData = {
  html: { tr: { light: 'TR-ACIK', dark: 'TR-KOYU' } },
  css: null,
  js: null,
  version: 'v1',
};

beforeEach(() => {
  calls.length = 0;
  getMerchantInfo.mockReset();
});

describe('saf kararlar', () => {
  it('shouldRevalidateOnMount: açık seçenek kazanır, yoksa yalnız initialData verilmemişse', () => {
    expect(shouldRevalidateOnMount(undefined, undefined)).toBe(true);
    expect(shouldRevalidateOnMount(undefined, null)).toBe(false);
    expect(shouldRevalidateOnMount(undefined, band)).toBe(false);
    expect(shouldRevalidateOnMount(true, band)).toBe(true);
    expect(shouldRevalidateOnMount(false, undefined)).toBe(false);
  });

  it('buildMerchantInfoSwrKey: istemci yoksa null; aynı apiUrl+secretKey → aynı anahtar', () => {
    expect(buildMerchantInfoSwrKey(false, 'https://a', 'sk')).toBeNull();
    expect(buildMerchantInfoSwrKey(true, 'https://a', 'sk')).toBe('tecof:merchant-info:https://a:sk');
    expect(buildMerchantInfoSwrKey(true, 'https://a', 'sk')).toBe(buildMerchantInfoSwrKey(true, 'https://a', 'sk'));
    expect(buildMerchantInfoSwrKey(true, 'https://a', 'sk2')).not.toBe(buildMerchantInfoSwrKey(true, 'https://a', 'sk'));
  });

  it('initialSource: initialData yoksa undefined; defaultLanguage verilirse kaynağa işlenir', () => {
    expect(initialSource(undefined, 'tr')).toBeUndefined();
    expect(initialSource(null, undefined)).toEqual({ poweredBy: null });
    expect(initialSource(band, undefined)).toEqual({ poweredBy: band });
    expect(initialSource(band, 'en')).toEqual({ poweredBy: band, defaultLanguage: 'en' });
    expect(initialSource(band, '')).toEqual({ poweredBy: band });
  });
});

describe('usePoweredBy → useSWR kablolaması', () => {
  it('initialData yok + apiUrl/secretKey → anahtar dolu, revalidateOnMount true, fetcher getMerchantInfo çağırır', async () => {
    getMerchantInfo.mockResolvedValue({ success: true, data: { languages: ['tr'], defaultLanguage: 'tr', poweredBy: band } });
    renderToStaticMarkup(<PoweredBy apiUrl="https://api.test" secretKey="sk_1" />);
    expect(calls).toHaveLength(1);
    expect(calls[0].key).toBe('tecof:merchant-info:https://api.test:sk_1');
    expect(calls[0].options.revalidateOnMount).toBe(true);
    expect(calls[0].options.dedupingInterval).toBe(600_000);
    expect(calls[0].options.keepPreviousData).toBe(true);

    const data = (await calls[0].fetcher()) as { poweredBy?: PoweredByBandData };
    expect(getMerchantInfo).toHaveBeenCalledTimes(1);
    expect(data.poweredBy).toBe(band);
  });

  it('initialData={null} → mount\'ta çekilmez (revalidateOnMount false)', () => {
    renderToStaticMarkup(<PoweredBy initialData={null} apiUrl="https://api.test" secretKey="sk_1" />);
    expect(calls).toHaveLength(1);
    expect(calls[0].options.revalidateOnMount).toBe(false);
  });

  it('initialData dolu → mount\'ta çekilmez; revalidateOnMount ezmesi kazanır', () => {
    renderToStaticMarkup(<PoweredBy initialData={band} apiUrl="https://api.test" secretKey="sk_1" />);
    expect(calls[0].options.revalidateOnMount).toBe(false);
    renderToStaticMarkup(<PoweredBy initialData={band} apiUrl="https://api.test" secretKey="sk_1" revalidateOnMount />);
    expect(calls[1].options.revalidateOnMount).toBe(true);
  });

  it('provider yok + apiUrl/secretKey yok → anahtar null (fetch yok); fetcher yine de güvenli hata verir', async () => {
    renderToStaticMarkup(<PoweredBy initialData={band} />);
    expect(calls).toHaveLength(1);
    expect(calls[0].key).toBeNull();
    await expect(calls[0].fetcher()).rejects.toThrow('API istemcisi yok');
    expect(getMerchantInfo).not.toHaveBeenCalled();
  });

  it('fetcher: success=false → hata fırlatır (SWR önceki veriyi korur)', async () => {
    getMerchantInfo.mockResolvedValue({ success: false, message: 'Yetkisiz' });
    renderToStaticMarkup(<PoweredBy apiUrl="https://api.test" secretKey="sk_1" />);
    await expect(calls[0].fetcher()).rejects.toThrow('Yetkisiz');
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Sol/sağ panel görünürlüğünün localStorage aynası (stil panosu aynasıyla aynı
 * desen). Kritik sözleşme: store BAŞLATILIRKEN depolama okunmaz — ilk render
 * daima varsayılandır (SSR/hydration), kayıtlı tercih `hydratePanelLayout` ile
 * mount sonrası uygulanır. Her senaryo shim'i kurup vi.resetModules() ile TAZE
 * bir modül kaydı alır.
 */

const KEY = 'tecof:panel-layout:v1';

const installLocalStorageShim = () => {
  const backing = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (k: string) => backing.get(k) ?? null,
    setItem: (k: string, v: string) => void backing.set(k, String(v)),
    removeItem: (k: string) => void backing.delete(k),
  };
  return backing;
};

const freshUiStore = async () => (await import('../uiStore')).useUiStore;

beforeEach(() => {
  vi.resetModules();
});

describe('panel görünürlüğü — localStorage aynası', () => {
  it('ilk ziyarette İKİ PANEL DE AÇIK gelir', async () => {
    installLocalStorageShim();
    const useUiStore = await freshUiStore();

    expect(useUiStore.getState().leftPanelOpen).toBe(true);
    expect(useUiStore.getState().rightPanelOpen).toBe(true);
  });

  it('kullanıcı kapatınca tercih depolamaya yazılır', async () => {
    const backing = installLocalStorageShim();
    const useUiStore = await freshUiStore();

    useUiStore.getState().toggleLeftPanel();
    expect(JSON.parse(backing.get(KEY)!)).toEqual({ left: false, right: true });

    useUiStore.getState().setRightPanelOpen(false);
    expect(JSON.parse(backing.get(KEY)!)).toEqual({ left: false, right: false });
  });

  it('store başlatılırken depolama OKUNMAZ; tercih yalnız hydrate ile gelir', async () => {
    const backing = installLocalStorageShim();
    backing.set(KEY, JSON.stringify({ left: false, right: false }));

    const useUiStore = await freshUiStore();
    // İlk render sunucu ile aynı olmalı → varsayılan.
    expect(useUiStore.getState().leftPanelOpen).toBe(true);
    expect(useUiStore.getState().rightPanelOpen).toBe(true);

    useUiStore.getState().hydratePanelLayout();
    expect(useUiStore.getState().leftPanelOpen).toBe(false);
    expect(useUiStore.getState().rightPanelOpen).toBe(false);
  });

  it('kayıt yoksa hydrate varsayılanı bozmaz', async () => {
    installLocalStorageShim();
    const useUiStore = await freshUiStore();

    useUiStore.getState().hydratePanelLayout();
    expect(useUiStore.getState().leftPanelOpen).toBe(true);
    expect(useUiStore.getState().rightPanelOpen).toBe(true);
  });

  it('bozuk/eksik kayıt uygulamayı kırmaz, varsayılana düşer', async () => {
    const backing = installLocalStorageShim();
    backing.set(KEY, '{not json');
    let useUiStore = await freshUiStore();
    useUiStore.getState().hydratePanelLayout();
    expect(useUiStore.getState().leftPanelOpen).toBe(true);
    expect(useUiStore.getState().rightPanelOpen).toBe(true);

    // Yanlış tipler: yalnız gerçek boolean kullanıcı kararı sayılır.
    vi.resetModules();
    backing.set(KEY, JSON.stringify({ left: 'kapali', right: false }));
    useUiStore = await freshUiStore();
    useUiStore.getState().hydratePanelLayout();
    expect(useUiStore.getState().leftPanelOpen).toBe(true);
    expect(useUiStore.getState().rightPanelOpen).toBe(false);
  });

  it('localStorage hiç yokken (SSR) toggle ve hydrate patlamaz', async () => {
    delete (globalThis as any).localStorage;
    const useUiStore = await freshUiStore();

    expect(() => useUiStore.getState().hydratePanelLayout()).not.toThrow();
    expect(() => useUiStore.getState().toggleRightPanel()).not.toThrow();
    expect(useUiStore.getState().rightPanelOpen).toBe(false);
  });

  it('sistemin sağ paneli açması (odak isteği) kullanıcının KAPALI tercihini silmez', async () => {
    // Kullanıcı sağ paneli kapatmış; kanvasta bir elemente tıklayınca Inspector
    // `revealRightPanel` ile paneli GEÇİCİ açar. Ayna dokunulmadan kalmalı,
    // yoksa bir sonraki açılışta panel yine açık gelirdi.
    const backing = installLocalStorageShim();
    backing.set(KEY, JSON.stringify({ left: true, right: false }));
    const useUiStore = await freshUiStore();
    useUiStore.getState().hydratePanelLayout();
    expect(useUiStore.getState().rightPanelOpen).toBe(false);

    useUiStore.getState().revealRightPanel();
    expect(useUiStore.getState().rightPanelOpen).toBe(true);
    expect(JSON.parse(backing.get(KEY)!)).toEqual({ left: true, right: false });

    // Sonraki açılış (yeniden mount) tercihi geri uygular.
    useUiStore.getState().hydratePanelLayout();
    expect(useUiStore.getState().rightPanelOpen).toBe(false);
  });

  it('bir tarafın toggle\'ı KARŞI tarafın kayıtlı tercihini ezmez', async () => {
    // Sağ panel kullanıcı tarafından kapatılmış, sonra sistem geçici açmış.
    // Sol paneli kapatmak, sağın kayıtlı "kapalı" tercihini korumalı.
    const backing = installLocalStorageShim();
    backing.set(KEY, JSON.stringify({ left: true, right: false }));
    const useUiStore = await freshUiStore();
    useUiStore.getState().hydratePanelLayout();
    useUiStore.getState().revealRightPanel();

    useUiStore.getState().toggleLeftPanel();
    expect(JSON.parse(backing.get(KEY)!)).toEqual({ left: false, right: false });
  });

  it('atan localStorage (private mod) yazmayı yutar, durum bellekte döner', async () => {
    (globalThis as any).localStorage = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {
        throw new Error('SecurityError');
      },
      removeItem: () => {},
    };
    const useUiStore = await freshUiStore();

    expect(() => useUiStore.getState().hydratePanelLayout()).not.toThrow();
    useUiStore.getState().toggleLeftPanel();
    expect(useUiStore.getState().leftPanelOpen).toBe(false);
  });
});

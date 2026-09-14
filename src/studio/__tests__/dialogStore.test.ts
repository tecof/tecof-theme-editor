// @vitest-environment node
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useDialogStore, studioDialog } from '../ui/dialogStore';

/**
 * dialogStore — confirm/alert kuyruğu (2026-09 drawer sözleşmesi).
 * DialogHost mount edilmiş varsayılır (hostCount 1); host yok senaryosu ayrı.
 */
describe('dialogStore — confirm/alert kuyruğu', () => {
  beforeEach(() => {
    useDialogStore.setState({ queue: [], hostCount: 1 });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('confirm: settle(true) → true, kuyruk boşalır', async () => {
    const p = studioDialog.confirm({ title: 'Silinsin mi?', danger: true });
    const head = useDialogStore.getState().queue[0];
    expect(head.kind).toBe('confirm');
    expect(head.title).toBe('Silinsin mi?');
    useDialogStore.getState().settle(head.id, true);
    await expect(p).resolves.toBe(true);
    expect(useDialogStore.getState().queue).toHaveLength(0);
  });

  it('confirm: settle(false) → false (ESC / dış tıklama / İptal)', async () => {
    const p = studioDialog.confirm({ title: 'Devam?' });
    const head = useDialogStore.getState().queue[0];
    useDialogStore.getState().settle(head.id, false);
    await expect(p).resolves.toBe(false);
  });

  it('alert: settle → void; okLabel ve kind taşınır', async () => {
    const p = studioDialog.alert({ title: 'Başarısız', description: 'Dosya okunamadı.', okLabel: 'Anladım' });
    const head = useDialogStore.getState().queue[0];
    expect(head.kind).toBe('alert');
    if (head.kind === 'alert') expect(head.okLabel).toBe('Anladım');
    // alert'te sonuç anlamsız — kapanış yolu false ile de gelir, yine çözülür
    useDialogStore.getState().settle(head.id, false);
    await expect(p).resolves.toBeUndefined();
    expect(useDialogStore.getState().queue).toHaveLength(0);
  });

  it('kuyruk sırası FIFO: ikinci istek ilki bitene dek başta değil', async () => {
    const p1 = studioDialog.confirm({ title: 'Birinci' });
    const p2 = studioDialog.alert({ title: 'İkinci' });
    const p3 = studioDialog.confirm({ title: 'Üçüncü' });
    const q = () => useDialogStore.getState().queue;
    expect(q().map((r) => r.title)).toEqual(['Birinci', 'İkinci', 'Üçüncü']);
    expect(q()[0].id).toBeLessThan(q()[1].id);

    useDialogStore.getState().settle(q()[0].id, true);
    await expect(p1).resolves.toBe(true);
    expect(q()[0].title).toBe('İkinci');

    useDialogStore.getState().settle(q()[0].id, true);
    await expect(p2).resolves.toBeUndefined();
    expect(q()[0].title).toBe('Üçüncü');

    useDialogStore.getState().settle(q()[0].id, false);
    await expect(p3).resolves.toBe(false);
    expect(q()).toHaveLength(0);
  });

  it('bilinmeyen id settle yok sayılır, kuyruk bozulmaz', () => {
    void studioDialog.confirm({ title: 'A' });
    useDialogStore.getState().settle(999999, true);
    expect(useDialogStore.getState().queue).toHaveLength(1);
  });

  it('host mount edilmemişse confirm false, alert hemen çözülür; kuyruğa girmez', async () => {
    useDialogStore.setState({ hostCount: 0 });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(studioDialog.confirm({ title: 'Sil?' })).resolves.toBe(false);
    await expect(studioDialog.alert({ title: 'Uyarı' })).resolves.toBeUndefined();
    expect(useDialogStore.getState().queue).toHaveLength(0);
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('registerHost sayaç: mount/unmount simetrik', () => {
    useDialogStore.setState({ hostCount: 0 });
    const off = useDialogStore.getState().registerHost();
    expect(useDialogStore.getState().hostCount).toBe(1);
    off();
    expect(useDialogStore.getState().hostCount).toBe(0);
  });
});

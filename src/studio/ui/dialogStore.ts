import type { ReactNode } from 'react';
import { create } from 'zustand';

/**
 * dialogStore — window.confirm/alert'in editör içi karşılığı.
 *
 * İstekler bir KUYRUKTA bekler; `DialogHost` (TecofStudio'da bir kez mount)
 * sıradakini ConfirmDrawer ile çizer. `confirm` Promise<boolean>, `alert`
 * Promise<void> döner; ESC/dış tıklama confirm'i false ile, alert'i düz
 * çözer. Hook dışı (event handler, async akış) kullanım için modül düzeyinde
 * `studioDialog.confirm/alert` vardır.
 *
 * Host mount edilmemişse (`hostCount === 0`) istek sonsuza dek beklemesin:
 * console'a uyarı yazılır ve GÜVENLİ varsayılanla çözülür (confirm → false,
 * alert → hemen). Tarayıcının kendi pencereleri bilerek kullanılmaz.
 */

export interface DialogConfirmOptions {
  title: ReactNode;
  description?: ReactNode;
  /** Varsayılan "Onayla". */
  confirmLabel?: string;
  /** Varsayılan "İptal". */
  cancelLabel?: string;
  /** Kırmızı onay düğmesi + uyarı ikonu. */
  danger?: boolean;
}

export interface DialogAlertOptions {
  title: ReactNode;
  description?: ReactNode;
  /** Varsayılan "Tamam". */
  okLabel?: string;
}

export type DialogRequest =
  | ({ kind: 'confirm'; id: number; resolve: (ok: boolean) => void } & DialogConfirmOptions)
  | ({ kind: 'alert'; id: number; resolve: () => void } & DialogAlertOptions);

export interface DialogState {
  /** Bekleyen istekler; ilk eleman ekranda. */
  queue: DialogRequest[];
  /** Mount edilmiş DialogHost sayısı (0 → istekler güvenli varsayılanla çözülür). */
  hostCount: number;
  confirm: (options: DialogConfirmOptions) => Promise<boolean>;
  alert: (options: DialogAlertOptions) => Promise<void>;
  /** Sıradaki isteği sonuçlandırır ve kuyruktan düşürür. Bilinmeyen id yok sayılır. */
  settle: (id: number, result: boolean) => void;
  /** DialogHost mount/unmount sayacı. */
  registerHost: () => () => void;
}

let nextId = 1;

export const useDialogStore = create<DialogState>((set, get) => ({
  queue: [],
  hostCount: 0,

  confirm: (options) => {
    if (get().hostCount === 0) {
      console.warn('[tecof-editor] DialogHost mount edilmemiş; confirm() false döndü.', options.title);
      return Promise.resolve(false);
    }
    return new Promise<boolean>((resolve) => {
      const request: DialogRequest = { kind: 'confirm', id: nextId++, resolve, ...options };
      set((s) => ({ queue: [...s.queue, request] }));
    });
  },

  alert: (options) => {
    if (get().hostCount === 0) {
      console.warn('[tecof-editor] DialogHost mount edilmemiş; alert() atlandı.', options.title);
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      const request: DialogRequest = { kind: 'alert', id: nextId++, resolve, ...options };
      set((s) => ({ queue: [...s.queue, request] }));
    });
  },

  settle: (id, result) => {
    const request = get().queue.find((r) => r.id === id);
    if (!request) return;
    set((s) => ({ queue: s.queue.filter((r) => r.id !== id) }));
    if (request.kind === 'confirm') request.resolve(result);
    else request.resolve();
  },

  registerHost: () => {
    set((s) => ({ hostCount: s.hostCount + 1 }));
    return () => set((s) => ({ hostCount: Math.max(0, s.hostCount - 1) }));
  },
}));

/** Hook dışı kullanım: `await studioDialog.confirm({ title: '…' })`. */
export const studioDialog = {
  confirm: (options: DialogConfirmOptions) => useDialogStore.getState().confirm(options),
  alert: (options: DialogAlertOptions) => useDialogStore.getState().alert(options),
};

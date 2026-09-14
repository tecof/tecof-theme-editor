import React, { useEffect, useState } from 'react';
import { ConfirmDrawer } from './ConfirmDrawer';
import { useDialogStore, type DialogRequest } from './dialogStore';

/**
 * DialogHost — dialogStore kuyruğunun ilk isteğini ConfirmDrawer ile çizer.
 * TecofStudio'da BİR kez mount edilir; aynı anda tek pencere görünür, sonra
 * gelenler sırada bekler.
 *
 * Çıkış animasyonu: istek sonuçlanınca kuyruktan hemen düşer (Promise anında
 * çözülür) ama drawer `open=false` ile ekranda kalır; Radix Presence'ın kapanış
 * geçişi (0.5s) bitince sıradaki istek yeni bir drawer (yeni key) olarak açılır.
 */
const EXIT_MS = 520;

export const DialogHost = () => {
  const head = useDialogStore((s) => s.queue[0] ?? null);
  const settle = useDialogStore((s) => s.settle);
  const registerHost = useDialogStore((s) => s.registerHost);
  const [visible, setVisible] = useState<DialogRequest | null>(null);

  useEffect(() => registerHost(), [registerHost]);

  useEffect(() => {
    if (visible && head?.id !== visible.id) {
      // Görünen istek bitti: kapanış animasyonundan sonra sıradakine geç.
      const t = setTimeout(() => setVisible(head), EXIT_MS);
      return () => clearTimeout(t);
    }
    if (head && !visible) setVisible(head);
    return undefined;
  }, [head, visible]);

  if (!visible) return null;

  const open = head?.id === visible.id;
  const isAlert = visible.kind === 'alert';

  return (
    <ConfirmDrawer
      key={visible.id}
      open={open}
      title={visible.title}
      description={visible.description}
      confirmLabel={isAlert ? visible.okLabel ?? 'Tamam' : visible.confirmLabel}
      cancelLabel={isAlert ? undefined : visible.cancelLabel}
      danger={isAlert ? false : !!visible.danger}
      hideCancel={isAlert}
      onConfirm={() => settle(visible.id, true)}
      onClose={() => settle(visible.id, false)}
    />
  );
};

export default DialogHost;

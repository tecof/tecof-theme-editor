import React from 'react';
import { AlertCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { StudioDrawer } from './StudioDrawer';

/**
 * ConfirmDrawer — tek soruluk onay/uyarı penceresi (StudioDrawer size 'sm').
 *
 * `danger` kırmızı onay düğmesi + AlertTriangle; değilse AlertCircle + accent.
 * `hideCancel` ile tek "Tamam" düğmeli uyarı (alert) hâline döner.
 * Dış tıklama / ESC → `onClose` (çağıran bunu "hayır" sayar).
 * `loading` sürerken kapatma yolları kapalıdır, onay düğmesi döner.
 */
export interface ConfirmDrawerProps {
  open: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Varsayılan "Onayla". */
  confirmLabel?: string;
  /** Varsayılan "İptal". */
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  /** Rozet ikonu; verilmezse danger'a göre AlertTriangle/AlertCircle. */
  icon?: React.ReactNode;
  /** İptal düğmesini gizle (tek düğmeli uyarı). */
  hideCancel?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  /** Açıklamanın altında ek içerik (liste, uyarı notu…). */
  children?: React.ReactNode;
}

export const ConfirmDrawer = ({
  open,
  title,
  description,
  confirmLabel = 'Onayla',
  cancelLabel = 'İptal',
  danger = false,
  loading = false,
  icon,
  hideCancel = false,
  onConfirm,
  onClose,
  children,
}: ConfirmDrawerProps) => {
  const tone = danger ? 'danger' : 'primary';
  const badge = icon ?? (danger ? <AlertTriangle size={22} /> : <AlertCircle size={22} />);

  return (
    <StudioDrawer
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      size="sm"
      tone={tone}
      icon={badge}
      title={title}
      description={description}
      busy={loading}
      hideClose
      className="tecof-confirm-drawer"
      footer={
        <>
          {!hideCancel && (
            <button
              type="button"
              className="tecof-drawer-btn tecof-drawer-btn--secondary"
              onClick={onClose}
              disabled={loading}
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            className={`tecof-drawer-btn ${danger ? 'tecof-drawer-btn--danger' : 'tecof-drawer-btn--primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Loader2 size={15} className="tecof-upload-spin" aria-hidden="true" />}
            {confirmLabel}
          </button>
        </>
      }
    >
      {children}
    </StudioDrawer>
  );
};

export default ConfirmDrawer;

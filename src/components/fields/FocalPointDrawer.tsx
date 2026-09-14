import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Crosshair, LocateFixed } from 'lucide-react';
import { StudioDrawer } from '../../studio/ui/StudioDrawer';
import { useTecof } from '../TecofProvider';
import { cdnFileUrl } from '../../utils';
import {
  DEFAULT_FOCAL_POINT,
  clampFocalPoint,
  focalPointToObjectPosition,
  isDefaultFocalPoint,
} from '../../utils/focalPoint';
import type { FocalPoint, UploadedFile } from '../../types';

/**
 * FocalPointDrawer — bir görselin kırpma odak noktasını seçtirir.
 *
 * Solda görsel: tıkla/sürükle (pointer) ya da ok tuşları (1'er, Shift ile
 * 10'ar) nişangâhı taşır. Sağda üç canlı kırpma önizlemesi (16:9, 1:1, 9:16)
 * aynı `object-position` ile ne göründüğünü anında gösterir. Kaydet, seçilen
 * noktayı `onSave` ile döner; çağıran (UploadField) dosya nesnesine yazar.
 *
 * Görsel için boyut varyantları (thumbnail/medium/large) KULLANILMAZ: onlar
 * kare kırpmadır, odak yüzdesi orijinal orana göre hesaplanmalı. Bu yüzden
 * tam boy `meta.webp` (yoksa orijinal ad), harici/stok dosyada `url` çizilir.
 */
export interface FocalPointDrawerProps {
  open: boolean;
  /** Odak seçilecek dosya. Kapanış animasyonunda null olabilir; son dosya gösterilmeye devam eder. */
  file: UploadedFile | null | undefined;
  onClose: () => void;
  /** Kaydet: sıkıştırılmış odak noktası (merkez seçildiyse de 50/50 gelir). */
  onSave: (focalPoint: FocalPoint) => void;
}

/** Odak seçicide gösterilecek TAM BOY adres (kare varyantlar değil). */
const fullSizeUrl = (cdnUrl: string, file: UploadedFile): string => {
  if (file.type === 'external' || file.provider === 'external') return file.url || '';
  return cdnFileUrl(cdnUrl, file, file.meta?.webp || file.name);
};

const PREVIEWS: { key: string; label: string; ratio: string }[] = [
  { key: 'wide', label: '16:9', ratio: '16 / 9' },
  { key: 'square', label: '1:1', ratio: '1 / 1' },
  { key: 'tall', label: '9:16', ratio: '9 / 16' },
];

export const FocalPointDrawer = ({ open, file, onClose, onSave }: FocalPointDrawerProps) => {
  const { apiClient } = useTecof();
  const cdnUrl = apiClient.cdnUrl;

  /* Kapanış animasyonu sırasında `file` null'a düşse de son görsel kalsın. */
  const lastFileRef = useRef<UploadedFile | null>(null);
  if (file) lastFileRef.current = file;
  const shownFile = file ?? lastFileRef.current;

  const [fp, setFp] = useState<FocalPoint>(DEFAULT_FOCAL_POINT);
  const [loaded, setLoaded] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  /* Her açılışta dosyadaki kayıtlı odaktan başla. */
  useEffect(() => {
    if (!open) return;
    setFp(clampFocalPoint(file?.focalPoint));
    setLoaded(false);
  }, [open, file]);

  const url = shownFile ? fullSizeUrl(cdnUrl, shownFile) : '';
  const displayName = shownFile?.meta?.originalName || shownFile?.name || '';
  const objectPosition = focalPointToObjectPosition(fp) ?? '50% 50%';
  const isDefault = isDefaultFocalPoint(fp);

  /** Pointer konumunu sahne kutusuna göre yüzdeye çevirir. */
  const pointToFocal = useCallback((clientX: number, clientY: number): FocalPoint | null => {
    const el = stageRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    return clampFocalPoint({
      x: Math.round(((clientX - rect.left) / rect.width) * 100),
      y: Math.round(((clientY - rect.top) / rect.height) * 100),
    });
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.preventDefault();
    draggingRef.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* eski tarayıcı: yakalama olmadan da tıklama çalışır */
    }
    const next = pointToFocal(e.clientX, e.clientY);
    if (next) setFp(next);
    e.currentTarget.focus({ preventScroll: true });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const next = pointToFocal(e.clientX, e.clientY);
    if (next) setFp(next);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* yakalanmamıştı */
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 1;
    let dx = 0;
    let dy = 0;
    switch (e.key) {
      case 'ArrowLeft': dx = -step; break;
      case 'ArrowRight': dx = step; break;
      case 'ArrowUp': dy = -step; break;
      case 'ArrowDown': dy = step; break;
      case 'Home': setFp(DEFAULT_FOCAL_POINT); e.preventDefault(); return;
      default: return;
    }
    e.preventDefault();
    setFp((prev) => clampFocalPoint({ x: prev.x + dx, y: prev.y + dy }));
  };

  const handleSave = () => {
    onSave(clampFocalPoint(fp));
  };

  return (
    <StudioDrawer
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      size="lg"
      tone="primary"
      icon={<Crosshair size={22} />}
      title="Odak noktası"
      description="Görselin kırpıldığı her yerde bu nokta görünür kalır."
      className="tecof-focal-drawer"
      bodyClassName="tecof-focal-drawer-body"
      footer={
        <>
          <span className="tecof-drawer-footer-note">{displayName}</span>
          <button type="button" className="tecof-drawer-btn tecof-drawer-btn--secondary" onClick={onClose}>
            İptal
          </button>
          <button type="button" className="tecof-drawer-btn tecof-drawer-btn--primary" onClick={handleSave}>
            Kaydet
          </button>
        </>
      }
    >
      <div className="tecof-focal-layout">
        {/* Sol: görsel + nişangâh. Sarmalayıcı inline-block olduğundan görselle
            aynı boyuttadır; yüzdeler doğrudan görsel yüzeyine karşılık gelir. */}
        <div className="tecof-focal-stage-wrap">
          <div
            ref={stageRef}
            className={`tecof-focal-stage${loaded ? ' is-loaded' : ''}`}
            role="application"
            tabIndex={0}
            aria-label={`Odak noktası seçici — ok tuşlarıyla taşı (Shift ile 10'ar), Home ile merkeze al. Şu an X %${fp.x}, Y %${fp.y}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={handleKeyDown}
          >
            {url && (
              <img
                src={url}
                alt={displayName || 'Görsel'}
                className="tecof-focal-image"
                draggable={false}
                onLoad={() => setLoaded(true)}
              />
            )}
            <span
              className="tecof-focal-marker"
              style={{ left: `${fp.x}%`, top: `${fp.y}%` }}
              aria-hidden="true"
            />
          </div>
          <p className="tecof-focal-hint">
            {"Tıkla ya da sürükle. Klavye: ok tuşları 1'er, Shift ile 10'ar."}
          </p>
        </div>

        {/* Sağ: canlı kırpma önizlemeleri + değerler. */}
        <div className="tecof-focal-side">
          <div className="tecof-focal-previews">
            {PREVIEWS.map((p) => (
              <figure key={p.key} className={`tecof-focal-preview is-${p.key}`}>
                <div className="tecof-focal-preview-box" style={{ aspectRatio: p.ratio }}>
                  {url && (
                    <img
                      src={url}
                      alt=""
                      aria-hidden="true"
                      draggable={false}
                      style={{ objectPosition }}
                    />
                  )}
                </div>
                <figcaption>{p.label}</figcaption>
              </figure>
            ))}
          </div>

          <div className="tecof-focal-values" aria-live="polite">
            <span className="tecof-focal-value">
              <small>X</small> %{fp.x}
            </span>
            <span className="tecof-focal-value">
              <small>Y</small> %{fp.y}
            </span>
            <button
              type="button"
              className="tecof-focal-center-btn"
              onClick={() => setFp(DEFAULT_FOCAL_POINT)}
              disabled={isDefault}
              title="Odağı merkeze al"
            >
              <LocateFixed size={13} />
              Merkeze al
            </button>
          </div>
        </div>
      </div>
    </StudioDrawer>
  );
};

export default FocalPointDrawer;

import React, { useCallback, useEffect, useRef } from 'react';
import { Drawer } from 'vaul';
import { X } from 'lucide-react';

/**
 * StudioDrawer — editördeki TÜM pencere/modal kabuğu (2026-09 sözleşmesi).
 *
 * Panelin ConfirmModal/SheetModal'ıyla aynı his: alttan yükselen, köşeleri
 * yuvarlak, tutamaklı bir kart; ESC / dış tıklama / tutamaktan sürükleme
 * kapatır. Görünüm `src/styles.css` sonundaki "Studio — Drawer kabuğu"
 * bloğundadır (`tecof-drawer-*`), token'lar editör chrome'unun kendi
 * :root değişkenleridir.
 *
 * ── Neden `modal={false}`? ──────────────────────────────────────────────
 * vaul (Radix Dialog) modal modda odağı içeride KİLİTLER ve `body`'ye
 * `pointer-events:none` yazar. Editörün alan bileşenleri (renk/ikon/CMS
 * bağlama popover'ları) `document.body`'ye portallanır — modal modda bu
 * popover'lar hem tıklanamaz hem de içlerine odaklanınca odak drawer'a geri
 * çekilir (hex girişi yazılamaz). Bu yüzden drawer modal DEĞİLDİR; karartma
 * (scrim) ve dış tıklamayla kapanma buradaki kendi overlay'imizle sağlanır,
 * ESC ve tutamaktan sürükleme vaul/Radix'ten gelir. Odak dönüşü (kapanınca
 * tetikleyen öğeye) elle yapılır çünkü Radix non-modal'da bunu atlar.
 *
 * ── Katman sırası ───────────────────────────────────────────────────────
 * overlay 99998 / kart 99999: eski `.tecof-modal-overlay` bandıyla aynı.
 * Böylece drawer içinden açılan her şey (popover'lar 100000+, MediaDrawer /
 * LinkPickerDrawer 999999+, komut paleti 1000000) drawer'ın ÜSTÜNDE kalır.
 * Aynı bantta üst üste iki drawer (ör. ekleme drawer'ı üstünde onay) için
 * DOM sırası yeter: sonra açılan portal sonra eklenir, üstte durur.
 *
 * ── Kısayol koruması ────────────────────────────────────────────────────
 * Açık bir drawer'ın kart öğesinde vaul'un `data-vaul-drawer` niteliği
 * bulunur (vaul 1.1.2 `Content` — node_modules/vaul/dist/index.mjs).
 * `isStudioDrawerOpen()` bunu sorgular; TecofStudio'nun global klavye
 * işleyicisi (ESC → seçim kaldırma, Delete, G/R/B, ⌘Z…) drawer açıkken
 * bununla susturulur. MediaDrawer/LinkPickerDrawer da vaul olduğundan aynı
 * korumadan yararlanır.
 */

export type StudioDrawerTone = 'default' | 'primary' | 'danger';
export type StudioDrawerSize = 'sm' | 'md' | 'lg' | 'xl';

export interface StudioDrawerProps {
  open: boolean;
  /** Kapatma isteği (ESC, dış tıklama, kapat düğmesi, sürükleme) `false` ile gelir. */
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  /** Başlık altı açıklama. Verilmezse başlık metni ekran okuyucu için tekrarlanır. */
  description?: React.ReactNode;
  /** Baş satırındaki ikon rozeti (lucide ikonu). Yoksa rozet çizilmez. */
  icon?: React.ReactNode;
  /** Rozet tonu: default = nötr, primary = accent, danger = kırmızı. */
  tone?: StudioDrawerTone;
  /** sm 400 · md 560 · lg 820 · xl 1180px (xl sabit yükseklik alır). Varsayılan md. */
  size?: StudioDrawerSize;
  /** İş sürüyor: kapatma yolları (ESC/dış tıklama/kapat) devre dışı, aria-busy. */
  busy?: boolean;
  /** Alt eylem satırı — `.tecof-drawer-btn` düğmeleri buraya. */
  footer?: React.ReactNode;
  /** Baş satırında kapat düğmesinin solundaki ek eylemler (arama kutusu, yenile…). */
  headerActions?: React.ReactNode;
  /** Kart öğesine ek sınıf. */
  className?: string;
  /** Gövde öğesine ek sınıf (ör. flex sütun düzeni gerektiren içerik için). */
  bodyClassName?: string;
  children?: React.ReactNode;
  /**
   * Açılışta odak yönetimi. `e.preventDefault()` çağrılırsa varsayılan
   * (gövdedeki ilk odaklanabilir → footer → kart) atlanır; çağıran kendi
   * öğesini odaklar.
   */
  onOpenAutoFocus?: (e: Event) => void;
  /** Kapanışta odak yönetimi; preventDefault ile tetikleyene dönüş atlanır. */
  onCloseAutoFocus?: (e: Event) => void;
  /** Baş satırındaki kapat düğmesini gizle (kendi kapatma eylemi olan içerik). */
  hideClose?: boolean;
}

/**
 * DOM'da açık (ya da kapanış animasyonundaki) bir vaul drawer'ı var mı?
 * Stüdyonun global kısayol işleyicileri drawer açıkken tetiklenmesin diye
 * kullanılır. SSR/test ortamında (document yok) her zaman false.
 */
export const isStudioDrawerOpen = (): boolean =>
  typeof document !== 'undefined' && !!document.querySelector('[data-vaul-drawer]');

/**
 * `document.body`'ye portallanan editör popover'ları. Bunlardan biri açıkken
 * ESC drawer'ı DEĞİL popover'ı kapatmalı (bir ESC = bir katman). Popover'lar
 * ESC'yi window'da (bubble) dinler; Radix ise document'te CAPTURE ile daha
 * önce yakalar — bu yüzden liste burada tutulup Radix'in kapatması engellenir.
 */
const PORTALED_POPOVERS =
  '.tecof-color-popover, .tecof-icon-dropdown, .tecof-bind-popover, .tecof-font-menu, .tecof-info-popover';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const StudioDrawer = ({
  open,
  onOpenChange,
  title,
  description,
  icon,
  tone = 'default',
  size = 'md',
  busy = false,
  footer,
  headerActions,
  className,
  bodyClassName,
  children,
  onOpenAutoFocus,
  onCloseAutoFocus,
  hideClose = false,
}: StudioDrawerProps) => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  /* Kapanınca odak buraya döner (Radix non-modal'da tetikleyiciye dönüş yok). */
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const dismissible = !busy;

  useEffect(() => {
    if (open && typeof document !== 'undefined') {
      returnFocusRef.current = (document.activeElement as HTMLElement | null) ?? null;
    }
  }, [open]);

  const requestClose = useCallback(() => {
    if (!dismissible) return;
    onOpenChange(false);
  }, [dismissible, onOpenChange]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next && !dismissible) return;
      onOpenChange(next);
    },
    [dismissible, onOpenChange]
  );

  const handleOpenAutoFocus = (e: Event) => {
    onOpenAutoFocus?.(e);
    if (e.defaultPrevented) return;
    e.preventDefault();
    const target =
      bodyRef.current?.querySelector<HTMLElement>(FOCUSABLE) ??
      footerRef.current?.querySelector<HTMLElement>(FOCUSABLE) ??
      contentRef.current;
    target?.focus({ preventScroll: true });
  };

  const handleCloseAutoFocus = (e: Event) => {
    onCloseAutoFocus?.(e);
    if (e.defaultPrevented) return;
    e.preventDefault();
    const el = returnFocusRef.current;
    returnFocusRef.current = null;
    if (el && el.isConnected && typeof el.focus === 'function') el.focus({ preventScroll: true });
  };

  const handleEscapeKeyDown = (e: KeyboardEvent) => {
    if (typeof document === 'undefined') return;
    const target = e.target as Node | null;
    // Odak portallı bir popover'daysa ya da böyle bir popover açıksa ESC onundur.
    const outside = !!target && !!contentRef.current && !contentRef.current.contains(target);
    if (outside || document.querySelector(PORTALED_POPOVERS)) e.preventDefault();
  };

  const classes = ['tecof-drawer', `is-${size}`, `is-${tone}`, className].filter(Boolean).join(' ');
  const bodyClasses = ['tecof-drawer-body', bodyClassName].filter(Boolean).join(' ');

  return (
    <Drawer.Root
      open={open}
      onOpenChange={handleOpenChange}
      modal={false}
      dismissible={dismissible}
      shouldScaleBackground={false}
      handleOnly
    >
      <Drawer.Portal>
        {/* Kendi scrim'imiz: vaul non-modal'da Overlay çizmez. data-state, Radix
            Presence'ın kapanış animasyonunu beklemesi için (fade-out). */}
        <div
          className="tecof-drawer-overlay"
          data-state={open ? 'open' : 'closed'}
          data-tecof-drawer-overlay=""
          aria-hidden="true"
          onClick={requestClose}
        />
        <Drawer.Content
          ref={contentRef}
          className={classes}
          tabIndex={-1}
          aria-modal="true"
          aria-busy={busy || undefined}
          onOpenAutoFocus={handleOpenAutoFocus}
          onCloseAutoFocus={handleCloseAutoFocus}
          onEscapeKeyDown={handleEscapeKeyDown}
        >
          <Drawer.Handle className="tecof-drawer-handle" />

          <div className="tecof-drawer-head">
            {icon && (
              <span className={`tecof-drawer-icon is-${tone}`} aria-hidden="true">
                {icon}
              </span>
            )}
            <div className="tecof-drawer-head-text">
              <Drawer.Title className="tecof-drawer-title">{title}</Drawer.Title>
              {description ? (
                <Drawer.Description className="tecof-drawer-desc">{description}</Drawer.Description>
              ) : (
                <Drawer.Description className="tecof-sr-only">{title}</Drawer.Description>
              )}
            </div>
            {headerActions && <div className="tecof-drawer-head-actions">{headerActions}</div>}
            {!hideClose && (
              <button
                type="button"
                className="tecof-drawer-close"
                onClick={requestClose}
                disabled={busy}
                aria-label="Kapat"
                title="Kapat"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Gövde yalnız içerik varsa çizilir (tek sorulu onay/uyarıda boş
              boşluk kalmasın). */}
          {children != null && children !== false && (
            <div ref={bodyRef} className={bodyClasses}>
              {children}
            </div>
          )}

          {footer && (
            <div ref={footerRef} className="tecof-drawer-footer">
              {footer}
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default StudioDrawer;

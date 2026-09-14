import React, { useCallback, useEffect, useRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

/**
 * StudioDrawer — editördeki TÜM pencere/modal kabuğu (2026-09 sözleşmesi).
 *
 * Panelin ConfirmModal/SheetModal'ıyla aynı his: alttan yükselen, köşeleri
 * yuvarlak, tutamaklı bir kart; ESC / dış tıklama / kapat düğmesi kapatır.
 * Görünüm `src/styles.css` sonundaki "Studio — Drawer kabuğu" bloğundadır
 * (`tecof-drawer-*`), token'lar editör chrome'unun kendi :root değişkenleridir.
 *
 * ── Neden vaul DEĞİL, doğrudan Radix Dialog `modal={false}`? ─────────────
 * vaul 1.1.2 `Drawer.Root`, aldığı `modal` prop'unu `DialogPrimitive.Root`'a
 * GEÇİRMEZ (node_modules/vaul/dist/index.mjs — createElement(DialogPrimitive.
 * Root, { defaultOpen, onOpenChange, open })). Radix'in varsayılanı `modal:
 * true` olduğu için `DialogContentModal` seçilir ve bu dal `{...props}`'u
 * yaydıktan SONRA `trapFocus: context.open` + `disableOutsidePointerEvents:
 * true` yazar; yani Content'e prop geçerek geri alınamaz. Sonuçları editörde
 * iki somut hataydı:
 *   1. DismissableLayer `body`'ye `pointer-events:none` yazıp `auto`'yu YALNIZ
 *      kart düğümüne verdiğinden bizim scrim'imiz tıklanamıyordu — hiçbir
 *      drawer dış tıklamayla kapanmıyordu (vaul'un rAF telafisi yalnız kendi
 *      iç setValue'sundan geçen açılışlarda ve Root mount'unda koşuyor;
 *      `open` kontrollü prop olduğu için hiç tetiklenmiyordu).
 *   2. FocusScope kart dışına giden odağı geri çektiğinden `document.body`'ye
 *      portallanan alan popover'ları (renk/ikon/CMS bağlama) kullanılamıyordu:
 *      hex kutusuna yazılamıyor, ikon araması odaklanamıyordu.
 * Radix Dialog'u `modal={false}` ile doğrudan kullanınca `DialogContentNonModal`
 * seçilir: `trapFocus: false`, `disableOutsidePointerEvents: false`. Karartma,
 * dış tıklamayla kapanma ve slayt animasyonu artık bizim overlay'imiz ve
 * `src/styles.css`'teki `tecof-drawer-slide-*` keyframe'leridir.
 * Kaybedilen tek şey vaul'un tutamaktan SÜRÜKLEYEREK kapatması; tutamak
 * görsel olarak kalır (kabuk kimliği), kapatma ESC / scrim / X ile yapılır.
 *
 * ── Katman sırası ───────────────────────────────────────────────────────
 * overlay 99998 / kart 99999: eski `.tecof-modal-overlay` bandıyla aynı.
 * Drawer içinden açılan portallı popover'lar (`.tecof-color-popover`,
 * `.tecof-icon-dropdown`, `.tecof-bind-popover`, `.tecof-font-menu` — hepsi
 * 1000000), MediaDrawer/LinkPickerDrawer (999999+) ve komut paleti (1000000)
 * drawer'ın ÜSTÜNDE kalır.
 * Üst üste iki drawer için DOM sırası YETMEZ: alttaki kart (99999) sonra
 * açılan drawer'ın scrim'inden (99998) yüksektir, yani karartma altta kalır.
 * Bu yüzden üstteki drawer `elevated` ile açılır (`is-elevated`: overlay
 * 100002 / kart 100003) ve alttaki `inert` ile tıklama+odak dışına alınır.
 *
 * ── Kısayol koruması ────────────────────────────────────────────────────
 * Açık kartta `data-tecof-drawer` (MediaDrawer/LinkPickerDrawer'da vaul'un
 * `data-vaul-drawer`'ı) bulunur. `isStudioDrawerOpen()` bunları `data-state=
 * "open"` ŞARTIYLA sorgular: Radix Presence kapanan kartı çıkış animasyonu
 * bitene kadar (~0.5sn) mount tuttuğu için yalnız varlığa bakmak, kapanıştan
 * sonra yarım saniyelik bir kısayol ölü bölgesi yaratıyordu (Cmd+Z yutuluyordu).
 */

export type StudioDrawerTone = 'default' | 'primary' | 'danger';
export type StudioDrawerSize = 'sm' | 'md' | 'lg' | 'xl';

export interface StudioDrawerProps {
  open: boolean;
  /** Kapatma isteği (ESC, dış tıklama, kapat düğmesi) `false` ile gelir. */
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
  /**
   * BAŞKA bir drawer'ın üstünde açılıyor: overlay + kart bir üst katmana
   * (100002/100003) çıkar ki karartma alttaki kartı da örtsün. Yalnız gerçek
   * üst üste binmede ver — tek başına açılan drawer'da gereksiz.
   */
  elevated?: boolean;
  /**
   * Kart tıklama ve odak dışına alınır (`inert`). Üstünde bir onay drawer'ı
   * açıkken alttaki drawer'ın kartı için kullanılır: arkadaki katalogdan
   * ONAYSIZ bir eylem tetiklenemesin, Tab da içine girmesin.
   */
  inert?: boolean;
}

/**
 * DOM'da AÇIK bir drawer var mı? (`data-state="open"` şartı zorunlu: Radix
 * Presence kapanan kartı çıkış animasyonu boyunca mount tutar; onu da "açık"
 * saymak kapanıştan sonra ~0.5sn kısayolları yutuyordu.)
 * Stüdyonun global kısayol işleyicileri drawer açıkken tetiklenmesin diye
 * kullanılır. SSR/test ortamında (document yok) her zaman false.
 */
export const isStudioDrawerOpen = (): boolean =>
  typeof document !== 'undefined' &&
  !!document.querySelector('[data-tecof-drawer][data-state="open"], [data-vaul-drawer][data-state="open"]');

/**
 * `document.body`'ye portallanan editör popover'ları. Bunlardan biri açıkken
 * ESC drawer'ı DEĞİL popover'ı kapatmalı (bir ESC = bir katman). Popover'lar
 * ESC'yi window'da (bubble) dinler; Radix ise document'te CAPTURE ile daha
 * önce yakalar — bu yüzden liste burada tutulup Radix'in kapatması engellenir.
 */
const PORTALED_POPOVERS =
  '.tecof-color-popover, .tecof-icon-dropdown, .tecof-bind-popover, .tecof-font-menu, .tecof-info-popover';

/**
 * Drawer AÇIKKEN odağın gidebileceği katmanlar. Radix non-modal'da FocusScope
 * yoktur (bilinçli: popover'lar çalışsın diye); ama `aria-modal` bir pencerede
 * Tab'ın arkadaki tuvale/panele kaçması da yanlış. Bu yüzden odak elle kapta
 * tutulur — yalnız BU listedeki katmanlar serbesttir:
 * kendi kartı ve diğer drawer'lar, portallı popover'lar, komut paleti ve
 * Radix'in kendi odak bekçileri.
 */
const ALLOWED_FOCUS_LAYERS = `[data-tecof-drawer], [data-vaul-drawer], [data-radix-focus-guard], .tecof-cmdk-overlay, ${PORTALED_POPOVERS}`;

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
  elevated = false,
  inert = false,
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

  /**
   * Odak kabı. `focusin` belge düzeyinde dinlenir; izinli katmanların dışına
   * çıkan odak kartın kendisine (tabIndex -1) çekilir, böylece Tab pencerenin
   * içinde döner. Kart `inert` ise (üstünde onay drawer'ı var) karışılmaz —
   * odak zaten üstteki drawer'ındır.
   */
  useEffect(() => {
    if (!open || typeof document === 'undefined') return;
    const handleFocusIn = (e: FocusEvent) => {
      const card = contentRef.current;
      if (!card || card.hasAttribute('inert')) return;
      const target = e.target as HTMLElement | null;
      /* body'ye düşen odak (öğe kaldırıldı) bir kaçış değil; dokunma. */
      if (!target || target === document.body || typeof target.closest !== 'function') return;
      if (target.closest(ALLOWED_FOCUS_LAYERS)) return;
      card.focus({ preventScroll: true });
    };
    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
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
    /* İş sürüyor: ESC kapatmasın (vaul'un `dismissible`ının yerine). */
    if (!dismissible) {
      e.preventDefault();
      return;
    }
    if (typeof document === 'undefined') return;
    /* Portallı bir popover AÇIKSA ESC onundur (bir ESC = bir katman).
       Odağın nerede olduğuna bakmak yetmez/yanıltır: popover kapandıktan
       sonra odak `document.body`'ye düşebiliyor ve "kart dışında" sayılan
       her ESC yutuluyordu. */
    if (document.querySelector(PORTALED_POPOVERS)) e.preventDefault();
  };

  /**
   * Kart DIŞINDAKİ her etkileşim Radix'in kendi kapatma yolunu tetiklemesin:
   * kapanma TEK yoldan, scrim'in `onClick`'inden geçsin. Aksi hâlde body'ye
   * portallanan popover'lara (renk/ikon/CMS) yapılan tıklama ya da odak
   * drawer'ı kapatırdı ve `busy` iken de kapanma engellenemezdi.
   */
  const preventOutsideDismiss = (e: { preventDefault: () => void }) => e.preventDefault();

  const classes = ['tecof-drawer', `is-${size}`, `is-${tone}`, elevated && 'is-elevated', className]
    .filter(Boolean)
    .join(' ');
  const overlayClasses = ['tecof-drawer-overlay', elevated && 'is-elevated'].filter(Boolean).join(' ');
  const bodyClasses = ['tecof-drawer-body', bodyClassName].filter(Boolean).join(' ');

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange} modal={false}>
      <DialogPrimitive.Portal>
        {/* Kendi scrim'imiz: Radix'in Overlay'i yalnız modal modda anlamlı
            (body scroll kilidi + pointer-events kapatma). `data-state`, Radix
            Presence'ın kapanış animasyonunu beklemesi için (fade-out). */}
        <div
          className={overlayClasses}
          data-state={open ? 'open' : 'closed'}
          data-tecof-drawer-overlay=""
          aria-hidden="true"
          onClick={requestClose}
        />
        <DialogPrimitive.Content
          ref={contentRef}
          className={classes}
          data-tecof-drawer=""
          tabIndex={-1}
          inert={inert || undefined}
          aria-modal="true"
          aria-busy={busy || undefined}
          onOpenAutoFocus={handleOpenAutoFocus}
          onCloseAutoFocus={handleCloseAutoFocus}
          onEscapeKeyDown={handleEscapeKeyDown}
          onPointerDownOutside={preventOutsideDismiss}
          onFocusOutside={preventOutsideDismiss}
          onInteractOutside={preventOutsideDismiss}
        >
          <span className="tecof-drawer-handle" aria-hidden="true" />

          <div className="tecof-drawer-head">
            {icon && (
              <span className={`tecof-drawer-icon is-${tone}`} aria-hidden="true">
                {icon}
              </span>
            )}
            <div className="tecof-drawer-head-text">
              <DialogPrimitive.Title className="tecof-drawer-title">{title}</DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="tecof-drawer-desc">
                  {description}
                </DialogPrimitive.Description>
              ) : (
                <DialogPrimitive.Description className="tecof-sr-only">
                  {title}
                </DialogPrimitive.Description>
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
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default StudioDrawer;

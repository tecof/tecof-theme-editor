import React, { useEffect, useRef, useState } from 'react';
import { FileStack } from 'lucide-react';
import type { PageTemplate, StudioConfig } from '../../types';
import { StudioDrawer } from '../ui/StudioDrawer';
import { LiveBlockPreview } from './LivePreview';
import {
  TEMPLATE_PREVIEW_REFERENCE_WIDTH,
  buildInsertHint,
  computeFrameHeight,
  computePreviewBoxHeight,
  computePreviewScale,
  formatSectionCount,
  summarizeTemplateSections,
} from './pageTemplatePreview';

/**
 * Sayfa şablonu onay drawer'ı (2026-09 sözleşmesi, madde 5).
 *
 * Şablon tıklaması ARTIK doğrudan eklemez: önce bu drawer açılır, kullanıcı
 * ne ekleyeceğini görür. Onaydan sonra çağıranın MEVCUT ekleme yolu
 * (`insertPageTemplate` / `onSelectPageTemplate`) aynen çalışır — ekleme tek
 * commit'tir, tek Geri Al ile geri alınır.
 *
 * Önizleme iki yoldan biriyle çizilir:
 * - `previewUrl` (tema `/preview-template/<id>` rotasını sunuyorsa): gerçek
 *   sayfa iframe'de, 1280px referans genişlikte render edilip kutuya
 *   `transform: scale()` ile sığdırılır. En doğru sonuç budur; tema kendi
 *   CSS/fontlarıyla çizer.
 * - `previewUrl` yoksa: bölümlerin `LiveBlockPreview` (mode 'section') ile üst
 *   üste yığını. Host belgesinde render edildiği için tema stilleri kısmi
 *   olabilir, yine de düzen fikri verir.
 */

/** iframe'in çizileceği kutuyu ölçen küçük kanca (ResizeObserver). */
const useBoxSize = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const update = () => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      if (width > 0 && height > 0) setSize({ width, height });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
};

const TemplateIframePreview = ({ url, title }: { url: string; title: string }) => {
  const { ref, size } = useBoxSize();
  const [loaded, setLoaded] = useState(false);
  /* Şablon değişince (aynı drawer yeniden kullanılıyorsa) iskelet geri gelsin. */
  useEffect(() => setLoaded(false), [url]);

  const boxHeight = computePreviewBoxHeight(
    typeof window !== 'undefined' ? window.innerHeight : 0,
  );
  const scale = computePreviewScale(size?.width ?? 0);
  const frameHeight = computeFrameHeight(size?.height ?? boxHeight, scale);

  return (
    <div className="tecof-tpl-confirm-stage" ref={ref} style={{ height: boxHeight }}>
      <iframe
        className={`tecof-tpl-confirm-frame${loaded ? ' is-loaded' : ''}`}
        src={url}
        title={title}
        loading="lazy"
        /* Şablon önizlemesi salt görüntüdür: içindeki bağlantılar editörün
           üstünde gezinmeye başlamasın, script'ler host'a erişmesin. */
        sandbox="allow-scripts allow-same-origin"
        style={{
          width: TEMPLATE_PREVIEW_REFERENCE_WIDTH,
          height: frameHeight || undefined,
          transform: `scale(${scale})`,
        }}
        onLoad={() => setLoaded(true)}
      />
      {!loaded && (
        <div className="tecof-tpl-confirm-skeleton" aria-hidden="true">
          <span className="tecof-tpl-confirm-skeleton-bar" />
          <span className="tecof-tpl-confirm-skeleton-bar" />
          <span className="tecof-tpl-confirm-skeleton-bar" />
        </div>
      )}
    </div>
  );
};

const TemplateSectionStack = ({
  config,
  template,
}: {
  config: StudioConfig;
  template: PageTemplate;
}) => (
  <div className="tecof-tpl-confirm-stack">
    {template.sections.map((section, index) => (
      <div
        key={(section?.node?.props?.id as string | undefined) ?? `s-${index}`}
        className="tecof-tpl-confirm-stack-item"
      >
        <LiveBlockPreview
          config={config}
          type={section?.node?.type ?? ''}
          props={section?.node?.props as Record<string, unknown> | undefined}
          mode="section"
        />
      </div>
    ))}
  </div>
);

export interface PageTemplateConfirmDrawerProps {
  /** Onaylanacak şablon; `null` iken drawer kapalıdır. */
  template: PageTemplate | null;
  config: StudioConfig;
  /** "Şablonu Ekle" — çağıran kendi ekleme yolunu çalıştırır. */
  onConfirm: (template: PageTemplate) => void;
  /** Vazgeç / ESC / dış tıklama. */
  onClose: () => void;
  /** Bilgi notundaki hedef adı ("sayfanın sonuna" varsayılan). */
  targetLabel?: string;
}

export const PageTemplateConfirmDrawer = ({
  template,
  config,
  onConfirm,
  onClose,
  targetLabel,
}: PageTemplateConfirmDrawerProps) => {
  const sections = summarizeTemplateSections(config, template?.sections);
  const countText = formatSectionCount(sections.length);

  return (
    <StudioDrawer
      open={!!template}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      size="lg"
      tone="primary"
      icon={<FileStack size={22} strokeWidth={1.9} />}
      title={template?.label ?? 'Sayfa şablonu'}
      description={
        template?.description ? `${template.description} · ${countText}` : countText
      }
      className="tecof-tpl-confirm-drawer"
      bodyClassName="tecof-tpl-confirm-body"
      footer={
        <>
          <button
            type="button"
            className="tecof-drawer-btn tecof-drawer-btn--secondary"
            onClick={onClose}
          >
            Vazgeç
          </button>
          <button
            type="button"
            className="tecof-drawer-btn tecof-drawer-btn--primary"
            onClick={() => template && onConfirm(template)}
          >
            Şablonu Ekle
          </button>
        </>
      }
    >
      {template && (
        <>
          {template.previewUrl ? (
            <TemplateIframePreview
              url={template.previewUrl}
              title={`${template.label} şablonu önizlemesi`}
            />
          ) : (
            <TemplateSectionStack config={config} template={template} />
          )}

          <div className="tecof-tpl-confirm-sections">
            <span className="tecof-tpl-confirm-sections-title">Eklenecek bölümler</span>
            <ol className="tecof-tpl-confirm-chips">
              {sections.map((section) => (
                <li key={section.key} className="tecof-tpl-confirm-chip">
                  <span className="tecof-tpl-confirm-chip-order">{section.order}</span>
                  <span className="tecof-tpl-confirm-chip-label">{section.label}</span>
                </li>
              ))}
            </ol>
          </div>

          <p className="tecof-tpl-confirm-note">{buildInsertHint(targetLabel)}</p>
        </>
      )}
    </StudioDrawer>
  );
};

export default PageTemplateConfirmDrawer;

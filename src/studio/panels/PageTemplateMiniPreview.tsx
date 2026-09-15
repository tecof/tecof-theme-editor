import React from 'react';
import type { PageTemplate, StudioConfig } from '../../types';
import { LiveBlockPreview } from './LivePreview';
import { MINI_PREVIEW_SECTION_COUNT } from './pageTemplatePreview';

/**
 * Sol paneldeki sayfa şablonu kartının minik canlı yığını: şablonun İLK
 * birkaç bölümü (bkz. MINI_PREVIEW_SECTION_COUNT) 16:9 bir kutuda üst üste
 * çizilir, taşan kısım kırpılır.
 *
 * Neden `LiveBlockPreview`? Blok kataloğundaki kartlarla AYNI render yolu
 * kullanılır — kullanıcı kartta ne görüyorsa ekleyince onu alır. Her bölüm
 * kendi kutusunda `mode="section"` ile 1280px referans genişlikten
 * ölçeklenir (bkz. AutoScalePreview).
 */
export const PageTemplateMiniPreview = ({
  config,
  template,
  /** `true`: kendi 16:9 kutusunu ÇİZMEZ, kapsayıcı çerçeveyi doldurur —
   *  "Bölüm Ekle" kartının `.tecof-modal-preview-frame`'i zaten 1280/500
   *  oranında ve `position:relative` (2026-09-14). */
  fill = false,
  /** Kaç bölüm çizilsin (kart büyüdükçe artırılabilir). */
  sectionCount = MINI_PREVIEW_SECTION_COUNT,
}: {
  config: StudioConfig;
  template: PageTemplate;
  fill?: boolean;
  sectionCount?: number;
}) => {
  const sections = (template.sections ?? []).slice(0, Math.max(1, sectionCount));
  if (sections.length === 0) return null;

  const stack = (
    <span className="tecof-page-tpl-preview-stack">
      {sections.map((section, index) => (
        <span
          key={(section?.node?.props?.id as string | undefined) ?? `s-${index}`}
          className="tecof-page-tpl-preview-item"
        >
          <LiveBlockPreview
            config={config}
            type={section?.node?.type ?? ''}
            props={section?.node?.props as Record<string, unknown> | undefined}
            mode="section"
          />
        </span>
      ))}
    </span>
  );

  if (fill) {
    return (
      <span className="tecof-tpl-card-preview" aria-hidden="true" inert>
        {stack}
      </span>
    );
  }

  return (
    /* `inert`: canlı önizleme temanın gerçek <button>/<a href> öğelerini
       çiziyor. `pointer-events:none` fareyi yutuyor ama odak sırasını
       etkilemiyordu — Tab ile görünmez bir bağlantıya odaklanıp Enter'la
       editörden çıkılabiliyordu. */
    <span className="tecof-page-tpl-preview" aria-hidden="true" inert>
      {stack}
    </span>
  );
};

export default PageTemplateMiniPreview;

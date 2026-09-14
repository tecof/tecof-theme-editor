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
}: {
  config: StudioConfig;
  template: PageTemplate;
}) => {
  const sections = (template.sections ?? []).slice(0, MINI_PREVIEW_SECTION_COUNT);
  if (sections.length === 0) return null;

  return (
    <span className="tecof-page-tpl-preview" aria-hidden="true">
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
    </span>
  );
};

export default PageTemplateMiniPreview;

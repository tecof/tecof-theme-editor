import React, { useEffect, useRef, useState } from 'react';
import type { ComponentConfig, StudioConfig } from '../../types';
import { compileStyles, collectStyleClasses, mergeClassName } from '../style/compileStyles';
import { generateStyleCss } from '../style/cssGenerator';
import { STYLES_PROP } from '../style/types';
import type { NodeStyles } from '../style/types';

/**
 * Reference desktop width previews are rendered at before being scaled down to
 * fit their box. Full-width website sections are designed for a desktop
 * viewport, so rendering at a real desktop width (then scaling) keeps their
 * layout intact instead of squishing them into the box's narrow physical width.
 */
export const PREVIEW_REFERENCE_WIDTH = 1280;

/**
 * Sections are force-clamped to this height inside preview stages (see the
 * `.tecof-modal-preview-stage` CSS). Boxes with `aspect-ratio:
 * PREVIEW_REFERENCE_WIDTH / PREVIEW_REFERENCE_HEIGHT` are therefore filled
 * edge-to-edge by a width-fitted section preview.
 */
export const PREVIEW_REFERENCE_HEIGHT = 500;

/** Max nesting depth when rendering default slot children inside previews. */
const MAX_PREVIEW_DEPTH = 4;

export type PreviewMode = 'section' | 'element';

export const DummySlot = () => <div className="tecof-modal-dummy-slot">İçerik Alanı</div>;

export class PreviewErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    console.error('Preview render failed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="tecof-modal-preview-fallback">Önizleme Yüklenemedi</div>
      );
    }
    return this.props.children;
  }
}

/**
 * Calls a config `render` function inside a real component so any hooks it
 * uses get a stable owner (one instance per rendered child).
 */
const RenderFn = ({
  renderFn,
  props,
}: {
  renderFn: ComponentConfig['render'];
  props: Record<string, unknown>;
}) => <>{renderFn(props)}</>;

/**
 * True when a prop value is a slot's child-node descriptor list:
 * `[{ type: 'ArchitectureTitle', props: {...} }, ...]`. Registered-component
 * check keeps upload/language arrays (which also carry a `type` string) out.
 */
const isChildNodeArray = (
  value: unknown,
  config: StudioConfig,
): value is Array<{ type: string; props?: Record<string, unknown> }> =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every(
    (child) =>
      !!child &&
      typeof child === 'object' &&
      typeof (child as { type?: unknown }).type === 'string' &&
      (child as { type: string }).type in (config.components ?? {}),
  );

const ChildPreview = ({
  config,
  type,
  props,
  depth,
}: {
  config: StudioConfig;
  type: string;
  props?: Record<string, unknown>;
  depth: number;
}) => {
  const compConfig = config.components?.[type];
  if (!compConfig?.render) return <DummySlot />;
  return (
    <PreviewErrorBoundary fallback={<DummySlot />}>
      <RenderFn
        renderFn={compConfig.render}
        props={buildPreviewProps(config, compConfig, props ?? {}, depth)}
      />
    </PreviewErrorBoundary>
  );
};

/**
 * Build the props a component preview is rendered with: the given props plus
 * editor stubs. Slot fields whose value is a child-descriptor list (the shape
 * defaultProps and saved documents use) are rendered as REAL nested previews,
 * so cards show the component's actual default content instead of an
 * "İçerik Alanı" placeholder. Empty/unknown slots keep the placeholder.
 */
export const buildPreviewProps = (
  config: StudioConfig,
  compConfig: ComponentConfig | undefined,
  props: Record<string, unknown>,
  depth = 0,
): Record<string, unknown> => {
  const renderProps: Record<string, unknown> = {
    ...props,
    // Compile the node's `_tecofStyles` into `className` exactly like the canvas
    // (NodeRenderer) and published page (TecofRender) do, so editor-applied styles
    // show in the preview too. The CSS for these classes is injected by
    // LiveBlockPreview (see collectPreviewClasses).
    className: mergeClassName(
      props.className as string | undefined,
      compileStyles(props[STYLES_PROP] as NodeStyles | undefined),
    ),
    puck: {
      renderDropZone: () => <DummySlot />,
      isEditing: false,
      metadata: {},
    },
    editMode: false,
  };

  for (const [fieldName, fieldDef] of Object.entries(compConfig?.fields ?? {})) {
    if (fieldDef?.type !== 'slot') continue;
    const value = renderProps[fieldName];

    if (depth < MAX_PREVIEW_DEPTH && isChildNodeArray(value, config)) {
      const children = value;
      renderProps[fieldName] = (slotProps?: { className?: string }) => (
        <div className={slotProps?.className}>
          {children.map((child, index) => (
            <ChildPreview
              key={(child.props?.id as string | undefined) ?? index}
              config={config}
              type={child.type}
              props={child.props}
              depth={depth + 1}
            />
          ))}
        </div>
      );
    } else {
      renderProps[fieldName] = () => <DummySlot />;
    }
  }

  return renderProps;
};

/**
 * Collects every `_tecofStyles` class used across a preview tree (root + real
 * nested slot children, mirroring buildPreviewProps' recursion). Feeds
 * generateStyleCss so the self-hosted style classes actually have CSS inside the
 * modal (which lives in the host document, not the canvas iframe).
 */
export const collectPreviewClasses = (
  config: StudioConfig,
  compConfig: ComponentConfig | undefined,
  props: Record<string, unknown>,
  depth = 0,
): string[] => {
  const out = new Set<string>(collectStyleClasses(props[STYLES_PROP] as NodeStyles | undefined));
  for (const [fieldName, fieldDef] of Object.entries(compConfig?.fields ?? {})) {
    if (fieldDef?.type !== 'slot') continue;
    const value = props[fieldName];
    if (depth < MAX_PREVIEW_DEPTH && isChildNodeArray(value, config)) {
      for (const child of value) {
        for (const cls of collectPreviewClasses(
          config,
          config.components?.[child.type],
          child.props ?? {},
          depth + 1,
        )) {
          out.add(cls);
        }
      }
    }
  }
  return Array.from(out);
};

/**
 * Renders a live component preview and scales it to fit the box, measuring the
 * available space with a ResizeObserver instead of a hard-coded scale factor.
 *
 * - `section`: content renders at {@link PREVIEW_REFERENCE_WIDTH} and is
 *   uniformly scaled down to the box width, top-aligned — full-bleed sections
 *   keep their intended desktop layout.
 * - `element`: small/inline components are measured at their natural size and
 *   scaled to *fit* (never upscaled past 1×), centered in the box.
 */
export const AutoScalePreview = ({ mode, children }: { mode: PreviewMode; children: React.ReactNode }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(mode === 'section' ? 0.2 : 1);

  useEffect(() => {
    const box = boxRef.current;
    const stage = stageRef.current;
    if (!box || !stage) return;

    const update = () => {
      const boxWidth = box.clientWidth;
      const boxHeight = box.clientHeight;
      if (boxWidth <= 0 || boxHeight <= 0) return;

      if (mode === 'section') {
        setScale(boxWidth / PREVIEW_REFERENCE_WIDTH);
        return;
      }

      // element: fit the content's natural size into the box (with a little padding)
      const naturalWidth = stage.scrollWidth || 1;
      const naturalHeight = stage.scrollHeight || 1;
      const pad = 28;
      const next = Math.min(
        1,
        (boxWidth - pad) / naturalWidth,
        (boxHeight - pad) / naturalHeight,
      );
      setScale(next > 0 ? next : 1);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(box);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [mode]);

  return (
    <div ref={boxRef} className={`tecof-modal-preview-box mode-${mode}`}>
      <div
        ref={stageRef}
        className="tecof-modal-preview-stage"
        style={
          mode === 'section'
            ? { width: PREVIEW_REFERENCE_WIDTH, transform: `scale(${scale})` }
            : { transform: `translate(-50%, -50%) scale(${scale})` }
        }
      >
        {children}
      </div>
    </div>
  );
};

/**
 * One-stop live preview for a registered component type: resolves the config,
 * builds preview props (rendering real default slot content), auto-scales and
 * guards render errors. Used by the Add Section modal and the block palette.
 */
export const LiveBlockPreview = ({
  config,
  type,
  props,
  mode,
}: {
  config: StudioConfig;
  type: string;
  /** Props to render with; falls back to the component's defaultProps. */
  props?: Record<string, unknown>;
  mode: PreviewMode;
}) => {
  const compConfig = config.components?.[type];
  if (!compConfig?.render) {
    return <div className="tecof-modal-preview-fallback">Önizleme Yok</div>;
  }
  const renderProps = props ?? compConfig.defaultProps ?? {};
  // `_tecofStyles` classes are self-hosted (host Tailwind never emits them), and
  // the modal renders in the host document — not the canvas iframe — so their CSS
  // must be injected here for editor-applied styles to actually show.
  const styleCss = generateStyleCss(collectPreviewClasses(config, compConfig, renderProps));
  return (
    <AutoScalePreview mode={mode}>
      {styleCss && <style>{styleCss}</style>}
      <PreviewErrorBoundary>
        <RenderFn
          renderFn={compConfig.render}
          props={buildPreviewProps(config, compConfig, renderProps)}
        />
      </PreviewErrorBoundary>
    </AutoScalePreview>
  );
};

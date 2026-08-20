import React, { createContext, useContext, useEffect } from 'react';
import type { TecofRenderProps, TecofNode } from '../types';
import { compileStyles, mergeClassName } from '../studio/style/compileStyles';
import { STYLES_PROP } from '../studio/style/types';
import { ANIMATION_CSS } from '../studio/style/animationCss';
import { collectDocumentClasses } from '../studio/style/compileStyles';
import { generateStyleCss } from '../studio/style/cssGenerator';
import { resolveTheme } from '../studio/theme/theme';
import { themeGoogleFontsHref, themeFontFaceCss } from '../studio/theme/fonts';
import { initScrollEffects } from '../studio/style/scrollEffects';
import { initInteractions } from '../studio/interactions/runtime';
import { initDarkMode } from '../studio/theme/darkMode';
import { collectInteractionRegistry, interactionNodeClasses } from '../studio/interactions/registry';
import { INTERACTIONS_CSS } from '../studio/interactions/css';
import { generateCSSVariables } from '../utils';
import { migrateDocument } from '../engine/migrate';
import { RepeatItemContext } from './RepeatItemContext';
import { resolveItemTokens } from '../utils/itemTokens';
import { useRepeatRows, type RepeatSourceFieldDef } from './useRepeatRows';

const RenderContext = createContext<{
  zones: Record<string, TecofNode[]>;
  config: any;
  cmsData: any;
} | null>(null);

const ParentNodeContext = createContext<string | null>(null);

interface DropZoneProps {
  zone: string;
  className?: string;
  style?: React.CSSProperties;
  /** Lay children out side-by-side (row) instead of stacked. Mirrors the editor. */
  orientation?: 'vertical' | 'horizontal';
  /**
   * `<Slot>` bunu true geçer: motor VARSAYILAN yerleşimi (yatay slot'a inline
   * flex/gap) BASMAZ; yerleşim tamamen çağıranın className'inden gelir. Böylece
   * tema `className="gap-x-10 flex-col …"` yazınca çalışır (inline stil artık
   * onu ezmez). `renderSlot`'un düz çağrıları bu bayrağı geçmez → eski davranış
   * (BC) korunur.
   */
  managedLayout?: boolean;
  /**
   * Repeat rows: when an array, the zone's children (the item template) render
   * once per row, each pass scoped to that row via RepeatItemContext so
   * `{{ item.* }}` prop tokens resolve against it. An empty array renders an
   * empty zone. Set automatically for slot fields declared with `repeatSource`;
   * components can pass runtime data (API results) here themselves.
   */
  repeatItems?: any[];
}

const RenderDropZone = ({ zone, className, style, orientation = 'vertical', repeatItems, managedLayout }: DropZoneProps) => {
  const parentId = useContext(ParentNodeContext);
  const zoneKey = parentId ? `${parentId}:${zone}` : zone;
  const context = useContext(RenderContext);
  if (!context) return null;

  const items = context.zones[zoneKey] || [];

  // Horizontal slots render side-by-side on the published site too, so the
  // layout matches what the editor shows. Author styles still override via
  // `style` (applied last) or a `className`.
  // managedLayout (`<Slot>`): yerleşim className'den gelir; motor default basmaz.
  const orientationStyle: React.CSSProperties | undefined =
    !managedLayout && orientation === 'horizontal'
      ? { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px' }
      : undefined;

  const children = Array.isArray(repeatItems)
    ? repeatItems.map((row, rowIndex) => (
        <RepeatItemContext.Provider
          key={rowIndex}
          value={{ item: row, index: rowIndex, count: repeatItems.length }}
        >
          {items.map((item, index) => (
            <RenderNode key={`${rowIndex}:${item.props.id || index}`} node={item} index={index} />
          ))}
        </RepeatItemContext.Provider>
      ))
    : items.map((item, index) => (
        <RenderNode key={item.props.id || index} node={item} index={index} />
      ));

  return (
    <div className={className} style={{ ...orientationStyle, ...style }}>
      {children}
    </div>
  );
};

/**
 * Repeat slot with a DYNAMIC source: rows may be a plain array (used as-is) or
 * resolved asynchronously (api-list `fetchList`, CMS collection binding) via
 * `useRepeatRows` — a component so the hook has a stable mount per slot.
 */
const RepeatSlotZone = ({
  zone,
  orientation,
  value,
  sourceFieldDef,
}: {
  zone: string;
  orientation?: 'vertical' | 'horizontal';
  value: unknown;
  sourceFieldDef?: RepeatSourceFieldDef;
}) => {
  const rows = useRepeatRows(value, sourceFieldDef);
  return <RenderDropZone zone={zone} orientation={orientation} repeatItems={rows as any[]} />;
};

const RenderNode = ({ node, index }: { node: any; index: number }) => {
  const context = useContext(RenderContext);
  // Inside a repeat template every pass renders against its own row: resolve
  // `{{ item.* }}` tokens in the node's props before they reach the component.
  const repeatCtx = useContext(RepeatItemContext);
  if (!context) return null;

  // Nodes hidden from the Layers panel are omitted from the published page (they
  // stay in the document so they can be re-enabled in the editor).
  if (node.props?._hidden) return null;

  const componentConfig = context.config.components[node.type];
  if (!componentConfig) return null;

  const nodeProps = repeatCtx
    ? resolveItemTokens(node.props, repeatCtx.item, repeatCtx.index)
    : node.props;

  // Compile the node's structured Tailwind styles into `className` exactly as the
  // editor's NodeRenderer does, so the visual style editor's output renders on the
  // published site too (not only inside the editor canvas).
  const styleClassName = compileStyles(nodeProps[STYLES_PROP]);

  // Interaction markers ride the className channel (published pages have no
  // per-node DOM wrapper, so this is the only hook that reaches the element).
  const ixClasses = interactionNodeClasses(nodeProps, { editing: false });

  const componentProps = {
    ...nodeProps,
    className: mergeClassName(nodeProps.className, `${styleClassName} ${ixClasses}`.trim()),
    puck: {
      renderDropZone: RenderDropZone,
      isEditing: false,
      metadata: {
        cmsData: context.cmsData || null,
        ...(componentConfig.metadata || {}),
      },
    },
    editMode: false,
  } as any;

  if (componentConfig.fields) {
    Object.entries(componentConfig.fields).forEach(([fieldName, fieldDef]: [string, any]) => {
      if (fieldDef && fieldDef.type === 'slot') {
        // A `repeatSource` slot ALWAYS renders in repeat mode on publish: rows
        // come from the named prop — a plain array, or an async source
        // (api-list / CMS collection) resolved by RepeatSlotZone. No data means
        // no output (never raw `{{ item.* }}` tokens on the live site).
        componentProps[fieldName] = fieldDef.repeatSource ? (
          <RepeatSlotZone
            zone={fieldName}
            orientation={fieldDef.orientation}
            value={nodeProps[fieldDef.repeatSource]}
            sourceFieldDef={componentConfig.fields?.[fieldDef.repeatSource]}
          />
        ) : (
          <RenderDropZone zone={fieldName} orientation={fieldDef.orientation} />
        );
      }
    });
  }

  return (
    <ParentNodeContext.Provider value={node.props.id || null}>
      {componentConfig.render(componentProps)}
    </ParentNodeContext.Provider>
  );
};

/**
 * TecofRender — Puck-compatible native page renderer.
 *
 * Pass `data` (PuckPageData-compatible page data) and Tecof component `config` directly.
 * Optionally pass `cmsData` to make CMS item data available to all
 * components via `puck.metadata.cmsData`.
 *
 * No API fetch, no provider required, zero @puckeditor/core dependency.
 */
export const TecofRender = ({ data, config, className, cmsData }: TecofRenderProps) => {
  // Dark mode is opt-in per host (`config.darkMode`); when absent, no runtime, no
  // `<script>`, no `:root.dark` CSS. Normalise `true` → default options.
  const darkModeEnabled = !!config.darkMode;

  // Runtime effects (reveal-on-scroll + parallax + when-then interactions + dark
  // mode) — client only, mounted once. Each watches/delegates for late-added
  // nodes and reads its config from the matching `<script data-tecof-*>` rendered
  // below. Declared before any early return so hook order stays stable.
  useEffect(() => {
    const root = typeof document !== 'undefined' ? document : null;
    const scroll = initScrollEffects(root);
    const interactions = initInteractions(root);
    // initDarkMode reads the `<script data-tecof-darkmode>` config emitted below.
    const dark = darkModeEnabled ? initDarkMode(root) : null;
    return () => {
      scroll.destroy();
      interactions.destroy();
      dark?.destroy();
    };
  }, [darkModeEnabled]);

  if (!data) return null;

  // Upgrade old saved data to the current schema so published pages render
  // correctly (no-op unless the host declares `config.migrations`).
  const doc = migrateDocument(
    {
      root: data.root ?? { props: {} },
      // PuckContentItem/TecofNode share a shape; nodes always carry an id at runtime.
      content: (data.content ?? []) as TecofNode[],
      zones: data.zones ?? {},
    },
    config.migrations
  );

  const contextValue = {
    zones: doc.zones || {},
    config,
    cmsData: cmsData || null,
  };

  const renderedContent = doc.content.map((item, index) => (
    <RenderNode key={item.props.id || index} node={item} index={index} />
  ));

  const rootProps = doc.root?.props || {};
  const rootConfig = config.root;
  const contentWithLayout = rootConfig?.render
    ? rootConfig.render({
        ...rootProps,
        children: renderedContent,
        editMode: false,
      })
    : renderedContent;

  // Self-contained CSS for every editor style class the document uses. This
  // removes any dependency on the host's Tailwind build/safelist — the classes
  // in `_tecofStyles` get their CSS generated right here (see cssGenerator.ts).
  const styleCss = generateStyleCss(collectDocumentClasses(doc));

  // When-then interaction config, serialised for the runtime. `<` is escaped so a
  // string value can never break out of the <script> tag.
  const interactionRegistry = collectInteractionRegistry(doc);
  const interactionRegistryJson =
    Object.keys(interactionRegistry).length > 0
      ? JSON.stringify(interactionRegistry).replace(/</g, '\\u003c')
      : '';

  // Published-page counterpart of the studio's ThemeVars: the `--theme-*`
  // variables (Tema panel + config.theme defaults) must exist here too, or
  // every `var(--theme-color-*)` reference — theme swatches picked in the
  // style editor, components reading the central theme — resolves to nothing.
  const resolvedTheme = resolveTheme(rootProps, config.theme);
  // The `:root.dark {}` override block ships only when the host enables dark mode.
  const themeCss = generateCSSVariables(resolvedTheme, { dark: darkModeEnabled });

  // Dark-mode runtime config, serialised for `initDarkMode` (same channel as the
  // interactions registry). `<` escaped so a string value can't break the tag.
  const darkModeJson = darkModeEnabled
    ? JSON.stringify(
        typeof config.darkMode === 'object' && config.darkMode
          ? { defaultMode: config.darkMode.defaultMode ?? 'system', storageKey: config.darkMode.storageKey }
          : { defaultMode: 'system' },
      ).replace(/</g, '\\u003c')
    : '';
  // Fonts: the Google Fonts stylesheet link + `@font-face` rules for uploaded
  // custom fonts, so the published page loads exactly the fonts the theme uses.
  const googleFontsHref = themeGoogleFontsHref(resolvedTheme);
  const fontFaceCss = themeFontFaceCss(resolvedTheme);

  return (
    <RenderContext.Provider value={contextValue}>
      {googleFontsHref && <link rel="stylesheet" href={googleFontsHref} />}
      {fontFaceCss && <style data-tecof-font-faces>{fontFaceCss}</style>}
      <style data-tecof-theme>{themeCss}</style>
      {/* Entrance-animation keyframes for the `anim` style control (ThemeVars-style
          <style> injection). Emitted once per page; harmless when unused. */}
      <style data-tecof-animations>{ANIMATION_CSS}</style>
      {styleCss && <style data-tecof-styles>{styleCss}</style>}
      {/* Interaction runtime CSS (the hidden state) + the source→actions registry
          the runtime reads on mount. Omitted entirely when nothing uses it. */}
      <style data-tecof-interactions-css>{INTERACTIONS_CSS}</style>
      {interactionRegistryJson && (
        <script
          type="application/json"
          data-tecof-interactions
          dangerouslySetInnerHTML={{ __html: interactionRegistryJson }}
        />
      )}
      {/* Dark-mode config for the runtime (initDarkMode reads this). Only emitted
          when the host enables config.darkMode. For zero flash-of-wrong-theme,
          hosts also inline `darkModeHeadScript()` in their <head>. */}
      {darkModeJson && (
        <script
          type="application/json"
          data-tecof-darkmode
          dangerouslySetInnerHTML={{ __html: darkModeJson }}
        />
      )}
      <div className={className}>
        {contentWithLayout}
      </div>
    </RenderContext.Provider>
  );
};

export default TecofRender;
